'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Onboarding from '@/components/Onboarding';
import SkillTree from '@/components/SkillTree';
import QuestPanel from '@/components/QuestPanel';
import PlayerHUD from '@/components/PlayerHUD';
import Achievements from '@/components/Achievements';
import Confetti from '@/components/Confetti';
import { loadState, saveState, resetState, updateStreak, getLevelInfo, checkAchievements, ACHIEVEMENT_DEFS, playSound, type GameState, type PlayerProfile } from '@/lib/gameState';
import { skillNodes, type SkillNode } from '@/data/quests';

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [levelUpMsg, setLevelUpMsg] = useState<string | null>(null);
  const [achievementMsg, setAchievementMsg] = useState<string | null>(null);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const s = loadState();
    setGameState(s);
    setLoaded(true);
  }, []);

  const persist = useCallback((newState: GameState) => {
    setGameState(newState);
    saveState(newState);
  }, []);

  function handleOnboard(profile: PlayerProfile) {
    const baseUnlocks = ['basics'];
    if (profile.userClass === 'practitioner') {
      baseUnlocks.push('prompting', 'projects-memory');
    } else if (profile.userClass === 'builder') {
      baseUnlocks.push('prompting', 'projects-memory', 'context-eng', 'artifacts', 'api-sdk', 'claude-code');
    } else if (profile.userClass === 'architect') {
      baseUnlocks.push('prompting', 'projects-memory', 'context-eng', 'artifacts', 'api-sdk', 'claude-code', 'tool-use');
    }

    const newState: GameState = {
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
    };
    persist(newState);
  }

  function handleCompleteQuest(questId: string, score: number, xp: number) {
    if (!gameState) return;

    const oldLevel = getLevelInfo(gameState.xp).level;
    let newState = updateStreak(gameState);

    const streakBonus = newState.streak >= 3 ? 25 : 0;
    const totalXp = xp + streakBonus;

    newState = {
      ...newState,
      xp: newState.xp + totalXp,
      totalQuestAttempts: newState.totalQuestAttempts + 1,
      perfectQuests: score === 100 ? newState.perfectQuests + 1 : newState.perfectQuests,
      completedQuests: {
        ...newState.completedQuests,
        [questId]: { questId, completed: true, score, completedAt: Date.now() },
      },
    };

    // Check node unlocks
    for (const node of skillNodes) {
      if (newState.unlockedNodes.includes(node.id)) continue;
      const allReqsMet = node.requires.every(reqId => {
        const reqNode = skillNodes.find(n => n.id === reqId);
        if (!reqNode) return false;
        const completedCount = reqNode.quests.filter(q => newState.completedQuests[q.id]?.completed).length;
        return completedCount >= Math.ceil(reqNode.quests.length / 2);
      });
      if (allReqsMet) {
        newState = { ...newState, unlockedNodes: [...newState.unlockedNodes, node.id] };
      }
    }

    // Check level up
    const newLevel = getLevelInfo(newState.xp).level;
    if (newLevel > oldLevel) {
      const info = getLevelInfo(newState.xp);
      setLevelUpMsg(`${info.emoji} Level Up! You're now ${info.title}`);
      setShowConfetti(true);
      if (newState.soundEnabled) playSound('levelup');
      setTimeout(() => { setLevelUpMsg(null); setShowConfetti(false); }, 4000);
    }

    // Check achievements
    const newAchievements = checkAchievements(newState);
    if (newAchievements.length > 0) {
      const achievements = { ...newState.achievements };
      for (const id of newAchievements) {
        const def = ACHIEVEMENT_DEFS.find(a => a.id === id);
        if (def) {
          achievements[id] = { ...def, unlockedAt: Date.now() };
        }
      }
      newState = { ...newState, achievements };

      // Show first new achievement
      const first = ACHIEVEMENT_DEFS.find(a => a.id === newAchievements[0]);
      if (first) {
        setTimeout(() => {
          setAchievementMsg(`${first.emoji} ${first.title}`);
          if (newState.soundEnabled) playSound('achievement');
          setTimeout(() => setAchievementMsg(null), 3000);
        }, newLevel > oldLevel ? 2500 : 500);
      }
    }

    persist(newState);
  }

  function handleToggleSound() {
    if (!gameState) return;
    persist({ ...gameState, soundEnabled: !gameState.soundEnabled });
  }

  function handleReset() {
    if (confirm('Reset all progress? This cannot be undone.')) {
      resetState();
      setGameState(loadState());
      setSelectedNode(null);
    }
  }

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-3xl"
        >
          ⚔️
        </motion.div>
      </div>
    );
  }

  if (!gameState?.profile) {
    return <Onboarding onComplete={handleOnboard} />;
  }

  return (
    <div className="min-h-screen relative">
      <div className="grid-bg" />
      <Confetti active={showConfetti} />

      <PlayerHUD
        gameState={gameState}
        onReset={handleReset}
        onToggleSound={handleToggleSound}
        onShowAchievements={() => setShowAchievements(true)}
      />

      {/* Level up toast */}
      <AnimatePresence>
        {levelUpMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-accent-dim to-accent text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-accent/30"
          >
            {levelUpMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement toast */}
      <AnimatePresence>
        {achievementMsg && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-20 right-4 z-50 bg-surface border border-gold/30 px-5 py-3 rounded-xl shadow-lg glow-gold"
          >
            <div className="text-xs text-gold uppercase tracking-wider mb-0.5">Achievement Unlocked</div>
            <div className="font-bold text-sm">{achievementMsg}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-1 bg-gradient-to-r from-accent to-purple bg-clip-text text-transparent inline-block">
            Skill Tree
          </h1>
          <p className="text-sm text-text-dim">
            Complete quests to unlock new paths
          </p>
        </div>

        <SkillTree gameState={gameState} onSelectNode={setSelectedNode} />

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-border/50">
          <p className="text-xs text-text-faint">
            Content sourced from{' '}
            <a href="https://sara-kukovec.github.io/Learn-Claude/" target="_blank" rel="noopener noreferrer" className="text-accent/70 hover:text-accent transition-colors">
              Learn Claude
            </a>{' '}
            by Sara Kukovec
          </p>
          <p className="text-xs text-text-faint mt-1">
            Built by{' '}
            <a href="https://imjustbob.com" target="_blank" rel="noopener noreferrer" className="text-accent/70 hover:text-accent transition-colors">
              Bob
            </a>
            {' '}· Open source on{' '}
            <a href="https://github.com/CyglerAI/claude-quest" target="_blank" rel="noopener noreferrer" className="text-accent/70 hover:text-accent transition-colors">
              GitHub
            </a>
          </p>
        </div>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {selectedNode && (
          <QuestPanel
            node={selectedNode}
            gameState={gameState}
            onCompleteQuest={handleCompleteQuest}
            onClose={() => setSelectedNode(null)}
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
    </div>
  );
}
