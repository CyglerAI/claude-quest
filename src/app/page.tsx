'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Onboarding from '@/components/Onboarding';
import SkillTree from '@/components/SkillTree';
import QuestPanel from '@/components/QuestPanel';
import PlayerHUD from '@/components/PlayerHUD';
import { loadState, saveState, resetState, updateStreak, getLevelInfo, type GameState, type PlayerProfile } from '@/lib/gameState';
import { skillNodes, type SkillNode } from '@/data/quests';

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [levelUpMsg, setLevelUpMsg] = useState<string | null>(null);
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
    // Determine starting unlocks based on class
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
    };
    persist(newState);
  }

  function handleCompleteQuest(questId: string, score: number, xp: number) {
    if (!gameState) return;

    const oldLevel = getLevelInfo(gameState.xp).level;
    let newState = updateStreak(gameState);

    // Add streak bonus
    const streakBonus = newState.streak >= 3 ? 25 : 0;
    const totalXp = xp + streakBonus;

    newState = {
      ...newState,
      xp: newState.xp + totalXp,
      completedQuests: {
        ...newState.completedQuests,
        [questId]: { questId, completed: true, score, completedAt: Date.now() },
      },
    };

    // Check if any new nodes should unlock
    for (const node of skillNodes) {
      if (newState.unlockedNodes.includes(node.id)) continue;
      const allReqsMet = node.requires.every(reqId => {
        const reqNode = skillNodes.find(n => n.id === reqId);
        if (!reqNode) return false;
        // Unlock when at least half the quests in the required node are done
        const completedCount = reqNode.quests.filter(q => newState.completedQuests[q.id]?.completed).length;
        return completedCount >= Math.ceil(reqNode.quests.length / 2);
      });
      if (allReqsMet) {
        newState = { ...newState, unlockedNodes: [...newState.unlockedNodes, node.id] };
      }
    }

    const newLevel = getLevelInfo(newState.xp).level;
    if (newLevel > oldLevel) {
      const info = getLevelInfo(newState.xp);
      setLevelUpMsg(`${info.emoji} Level Up! You're now a ${info.title}!`);
      setTimeout(() => setLevelUpMsg(null), 3000);
    }

    persist(newState);
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
        <div className="text-2xl">⚔️</div>
      </div>
    );
  }

  // No profile = onboarding
  if (!gameState?.profile) {
    return <Onboarding onComplete={handleOnboard} />;
  }

  return (
    <div className="min-h-screen">
      <PlayerHUD gameState={gameState} onReset={handleReset} />

      {/* Level up toast */}
      {levelUpMsg && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-accent text-black px-6 py-3 rounded-xl font-bold shadow-lg shadow-accent/30 score-pop"
        >
          {levelUpMsg}
        </motion.div>
      )}

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-1">Skill Tree</h1>
          <p className="text-sm text-text-dim">
            Complete quests to unlock new paths. Click a node to start.
          </p>
        </div>

        <SkillTree gameState={gameState} onSelectNode={setSelectedNode} />

        {/* Attribution */}
        <div className="text-center mt-12 pt-8 border-t border-border">
          <p className="text-xs text-text-dim">
            Content sourced from{' '}
            <a href="https://sara-kukovec.github.io/Learn-Claude/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              Learn Claude
            </a>{' '}
            by Sara Kukovec. Gamified by{' '}
            <a href="https://imjustbob.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              Bob
            </a>.
          </p>
        </div>
      </div>

      {/* Quest panel overlay */}
      {selectedNode && (
        <QuestPanel
          node={selectedNode}
          gameState={gameState}
          onCompleteQuest={handleCompleteQuest}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}
