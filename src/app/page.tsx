'use client';
import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Onboarding from '@/components/Onboarding';
import WorldMap from '@/components/WorldMap';
import BattleArena from '@/components/BattleArena';
import GameHUD from '@/components/GameHUD';
import CharacterPanel from '@/components/CharacterPanel';
import VictoryScreen from '@/components/VictoryScreen';
import DefeatScreen from '@/components/DefeatScreen';
import Achievements from '@/components/Achievements';
import { loadState, saveState, resetState, updateStreak, getLevelInfo, checkAchievements, ACHIEVEMENT_DEFS, type GameState, type PlayerProfile } from '@/lib/gameState';
import { skillNodes, type SkillNode, type Quest } from '@/data/quests';
import { getEnemyForQuest, type Enemy } from '@/lib/enemies';
import { getPlayerStats, type BattleState } from '@/lib/battleEngine';
import { getLoot, type Item, type Equipment, DEFAULT_EQUIPMENT } from '@/lib/items';
import { playSound } from '@/lib/sounds';

type Screen = 'map' | 'battle' | 'victory' | 'defeat';

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [screen, setScreen] = useState<Screen>('map');
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [activeNode, setActiveNode] = useState<SkillNode | null>(null);
  const [activeEnemy, setActiveEnemy] = useState<Enemy | null>(null);
  const [lastBattleState, setLastBattleState] = useState<BattleState | null>(null);
  const [lastXpEarned, setLastXpEarned] = useState(0);
  const [lastXpBonus, setLastXpBonus] = useState(0);
  const [lastLoot, setLastLoot] = useState<Item | null>(null);
  const [showCharacter, setShowCharacter] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [levelUpMsg, setLevelUpMsg] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const s = loadState();
    // Migrate old save data
    if (s.profile && !s.equipment) {
      s.equipment = DEFAULT_EQUIPMENT;
      s.inventory = [];
      s.gold = 0;
      s.totalKills = 0;
      s.maxComboEver = 0;
    }
    setGameState(s);
    setLoaded(true);
  }, []);

  const persist = useCallback((newState: GameState) => {
    setGameState(newState);
    saveState(newState);
  }, []);

  function handleOnboard(profile: PlayerProfile) {
    const baseUnlocks = ['basics'];
    if (profile.userClass === 'practitioner') baseUnlocks.push('prompting', 'projects-memory');
    else if (profile.userClass === 'builder') baseUnlocks.push('prompting', 'projects-memory', 'context-eng', 'artifacts', 'api-sdk', 'claude-code');
    else if (profile.userClass === 'architect') baseUnlocks.push('prompting', 'projects-memory', 'context-eng', 'artifacts', 'api-sdk', 'claude-code', 'tool-use');

    persist({
      profile,
      xp: 0,
      level: 1,
      streak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      completedQuests: {},
      unlockedNodes: baseUnlocks,
      currentNodeId: null,
      achievements: {},
      soundEnabled: true,
      totalQuestAttempts: 0,
      perfectQuests: 0,
      equipment: DEFAULT_EQUIPMENT,
      inventory: [],
      gold: 0,
      totalKills: 0,
      maxComboEver: 0,
    });
  }

  function handleSelectQuest(quest: Quest, node: SkillNode) {
    const enemy = getEnemyForQuest(quest.id, node.id, quest.type);
    setActiveQuest(quest);
    setActiveNode(node);
    setActiveEnemy(enemy);
    setScreen('battle');
    playSound('questEnter');
  }

  function handleBattleComplete(score: number, xp: number, battleState: BattleState) {
    if (!gameState || !activeQuest || !activeNode) return;

    setLastBattleState(battleState);

    if (battleState.status === 'victory' && score > 0) {
      // Calculate XP with bonuses
      const oldLevel = getLevelInfo(gameState.xp).level;
      let newState = updateStreak(gameState);

      const streakBonus = newState.streak >= 3 ? 25 : 0;
      const eqXpBonus = Math.round(xp * ((newState.equipment?.weapon?.stats?.xpBonus || 0) + (newState.equipment?.armor?.stats?.xpBonus || 0) + (newState.equipment?.accessory?.stats?.xpBonus || 0)) / 100);
      const totalXp = xp + streakBonus + eqXpBonus;

      setLastXpEarned(totalXp);
      setLastXpBonus(streakBonus + eqXpBonus);

      // Loot
      const loot = getLoot(activeNode.tier, activeQuest.type === 'boss');
      setLastLoot(loot);

      newState = {
        ...newState,
        xp: newState.xp + totalXp,
        totalQuestAttempts: newState.totalQuestAttempts + 1,
        perfectQuests: score === 100 ? newState.perfectQuests + 1 : newState.perfectQuests,
        totalKills: newState.totalKills + 1,
        maxComboEver: Math.max(newState.maxComboEver, battleState.maxCombo),
        completedQuests: {
          ...newState.completedQuests,
          [activeQuest.id]: { questId: activeQuest.id, completed: true, score, completedAt: Date.now() },
        },
      };

      // Add loot to inventory
      if (loot) {
        newState = { ...newState, inventory: [...(newState.inventory || []), loot] };
        playSound('itemDrop');
      }

      // Gold from quest
      const goldEarned = Math.round(xp * 0.5) + (activeQuest.type === 'boss' ? 50 : 10);
      newState = { ...newState, gold: (newState.gold || 0) + goldEarned };

      // Unlock nodes
      for (const node of skillNodes) {
        if (newState.unlockedNodes.includes(node.id)) continue;
        const allReqsMet = node.requires.every(reqId => {
          const reqNode = skillNodes.find(n => n.id === reqId);
          if (!reqNode) return false;
          const completedCount = reqNode.quests.filter(q => newState.completedQuests[q.id]?.completed).length;
          return completedCount >= Math.ceil(reqNode.quests.length / 2);
        });
        if (allReqsMet) newState = { ...newState, unlockedNodes: [...newState.unlockedNodes, node.id] };
      }

      // Level up check
      const newLevel = getLevelInfo(newState.xp).level;
      if (newLevel > oldLevel) {
        const info = getLevelInfo(newState.xp);
        setLevelUpMsg(`${info.emoji} Level Up! ${info.title}`);
        playSound('levelup');
        setTimeout(() => setLevelUpMsg(null), 4000);
      }

      // Achievements
      const newAchs = checkAchievements(newState);
      if (newAchs.length > 0) {
        const achievements = { ...newState.achievements };
        for (const id of newAchs) {
          const def = ACHIEVEMENT_DEFS.find(a => a.id === id);
          if (def) achievements[id] = { ...def, unlockedAt: Date.now() };
        }
        newState = { ...newState, achievements };
      }

      persist(newState);
      setScreen('victory');
      playSound('victory');
    } else {
      setLastXpEarned(0);
      setLastXpBonus(0);
      setLastLoot(null);
      setScreen('defeat');
      playSound('defeat');
    }
  }

  function handleEquip(item: Item) {
    if (!gameState) return;
    const equipment: Equipment = { ...(gameState.equipment || DEFAULT_EQUIPMENT) };
    equipment[item.type] = item;
    persist({ ...gameState, equipment });
  }

  function handleRetry() {
    if (activeQuest && activeNode) {
      const enemy = getEnemyForQuest(activeQuest.id, activeNode.id, activeQuest.type);
      setActiveEnemy(enemy);
      setScreen('battle');
      playSound('questEnter');
    }
  }

  function handleBackToMap() {
    setScreen('map');
    setActiveQuest(null);
    setActiveNode(null);
    setActiveEnemy(null);
  }

  function handleReset() {
    if (confirm('Reset ALL progress? Equipment, inventory, everything. Cannot be undone.')) {
      resetState();
      setGameState(loadState());
      setScreen('map');
      setActiveQuest(null);
    }
  }

  function handleToggleSound() {
    if (!gameState) return;
    persist({ ...gameState, soundEnabled: !gameState.soundEnabled });
  }

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-3xl animate-pulse">⚔️</div>
      </div>
    );
  }

  if (!gameState?.profile) {
    return <Onboarding onComplete={handleOnboard} />;
  }

  const playerStats = getPlayerStats(gameState.equipment || DEFAULT_EQUIPMENT, getLevelInfo(gameState.xp).level);

  return (
    <div className="min-h-screen bg-bg relative">
      <div className="grid-bg" />

      {/* HUD — always visible on map */}
      {screen === 'map' && (
        <GameHUD
          gameState={gameState}
          onOpenCharacter={() => setShowCharacter(true)}
          onShowAchievements={() => setShowAchievements(true)}
          onToggleSound={handleToggleSound}
          onReset={handleReset}
        />
      )}

      {/* Level up toast */}
      <AnimatePresence>
        {levelUpMsg && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[80] bg-gradient-to-r from-accent-dim to-accent text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-accent/30 animate-bounce-in">
            {levelUpMsg}
          </div>
        )}
      </AnimatePresence>

      {/* Main screens */}
      {screen === 'map' && (
        <WorldMap
          gameState={gameState}
          onSelectQuest={handleSelectQuest}
          onOpenCharacter={() => setShowCharacter(true)}
        />
      )}

      {screen === 'battle' && activeQuest && activeEnemy && (
        <BattleArena
          quest={activeQuest}
          enemy={activeEnemy}
          playerStats={playerStats}
          soundEnabled={gameState.soundEnabled}
          onComplete={handleBattleComplete}
          onFlee={handleBackToMap}
        />
      )}

      {screen === 'victory' && activeQuest && lastBattleState && (
        <VictoryScreen
          quest={activeQuest}
          battleState={lastBattleState}
          xpEarned={lastXpEarned}
          xpBonus={lastXpBonus}
          loot={lastLoot}
          onContinue={handleBackToMap}
        />
      )}

      {screen === 'defeat' && activeQuest && activeEnemy && (
        <DefeatScreen
          quest={activeQuest}
          enemy={activeEnemy}
          onRetry={handleRetry}
          onFlee={handleBackToMap}
        />
      )}

      {/* Overlays */}
      <AnimatePresence>
        {showCharacter && (
          <CharacterPanel
            gameState={gameState}
            onEquip={handleEquip}
            onClose={() => setShowCharacter(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAchievements && (
          <Achievements
            gameState={gameState}
            onClose={() => setShowAchievements(false)}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      {screen === 'map' && (
        <div className="text-center py-8 border-t border-border/20">
          <p className="text-[10px] text-text-faint">
            Content from{' '}
            <a href="https://sara-kukovec.github.io/Learn-Claude/" target="_blank" rel="noopener noreferrer" className="text-accent/50 hover:text-accent">Learn Claude</a>
            {' '}by Sara Kukovec · Built by{' '}
            <a href="https://imjustbob.com" target="_blank" rel="noopener noreferrer" className="text-accent/50 hover:text-accent">Bob</a>
          </p>
        </div>
      )}
    </div>
  );
}
