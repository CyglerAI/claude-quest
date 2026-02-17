'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { skillNodes, type SkillNode, type Quest } from '@/data/quests';
import type { GameState } from '@/lib/gameState';
import { playSound } from '@/lib/sounds';

interface Props {
  gameState: GameState;
  onSelectQuest: (quest: Quest, node: SkillNode) => void;
  onOpenCharacter: () => void;
}

// Map regions with visual themes
const REGIONS: Record<string, { name: string; gradient: string; icon: string; fogColor: string }> = {
  foundations: { name: 'Starter Meadow', gradient: 'from-green/5 to-emerald-900/10', icon: '🌱', fogColor: 'rgba(52,211,153,0.08)' },
  craft: { name: 'The Forge', gradient: 'from-amber-900/10 to-orange-900/10', icon: '🔨', fogColor: 'rgba(251,191,36,0.08)' },
  systems: { name: 'Crystal Caverns', gradient: 'from-blue-900/10 to-cyan-900/10', icon: '💎', fogColor: 'rgba(96,165,250,0.08)' },
  mastery: { name: 'Dark Tower', gradient: 'from-purple-900/15 to-red-900/10', icon: '🏰', fogColor: 'rgba(192,132,252,0.08)' },
};

const TIER_ORDER = ['foundations', 'craft', 'systems', 'mastery'];

export default function WorldMap({ gameState, onSelectQuest, onOpenCharacter }: Props) {
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);

  function isUnlocked(nodeId: string): boolean {
    return gameState.unlockedNodes.includes(nodeId);
  }

  function getNodeProgress(node: SkillNode): { completed: number; total: number } {
    const completed = node.quests.filter(q => gameState.completedQuests[q.id]?.completed).length;
    return { completed, total: node.quests.length };
  }

  function isTierUnlocked(tier: string): boolean {
    return skillNodes.filter(n => n.tier === tier).some(n => isUnlocked(n.id));
  }

  function selectNode(node: SkillNode) {
    if (!isUnlocked(node.id)) return;
    playSound('click');
    setSelectedNode(node);
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Scrollable map */}
      <div className="relative">
        {TIER_ORDER.map((tier, tierIdx) => {
          const region = REGIONS[tier];
          const nodes = skillNodes.filter(n => n.tier === tier);
          const unlocked = isTierUnlocked(tier);

          return (
            <div key={tier} className={`relative border-b border-border/20 bg-gradient-to-br ${region.gradient}`}>
              {/* Fog overlay for locked regions */}
              {!unlocked && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2 opacity-50">🔒</div>
                    <div className="text-sm text-text-faint font-medium">{region.name}</div>
                    <div className="text-xs text-text-faint/60 mt-1">Complete previous quests to unlock</div>
                  </div>
                </div>
              )}

              {/* Region header */}
              <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                <span className="text-xl">{region.icon}</span>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-text-dim">{region.name}</h2>
                  <p className="text-[10px] text-text-faint uppercase tracking-widest">{tier}</p>
                </div>
              </div>

              {/* Ambient particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {unlocked && [...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full"
                    style={{ background: region.fogColor, left: `${10 + Math.random() * 80}%`, top: `${10 + Math.random() * 80}%` }}
                    animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
                  />
                ))}
              </div>

              {/* Location cards (nodes) */}
              <div className="grid grid-cols-2 gap-3 p-4 relative z-20">
                {nodes.map((node, i) => {
                  const nodeUnlocked = isUnlocked(node.id);
                  const { completed, total } = getNodeProgress(node);
                  const isComplete = completed === total;
                  const hasProgress = completed > 0;

                  return (
                    <motion.button
                      key={node.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: tierIdx * 0.1 + i * 0.05 }}
                      onClick={() => selectNode(node)}
                      disabled={!nodeUnlocked}
                      className={`relative text-left p-4 rounded-xl border transition-all ${
                        isComplete
                          ? 'border-green/30 bg-green/5 hover:border-green/50'
                          : nodeUnlocked
                            ? 'border-border/50 bg-surface/50 hover:border-accent/50 hover:bg-surface-2/50'
                            : 'border-border/20 bg-surface/20 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      {/* Complete badge */}
                      {isComplete && (
                        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-green rounded-full flex items-center justify-center text-[10px] shadow-lg shadow-green/30">
                          ✓
                        </div>
                      )}

                      <div className="text-2xl mb-2">{isComplete ? '✅' : node.emoji}</div>
                      <h3 className="text-sm font-bold mb-0.5">{node.title}</h3>
                      <p className="text-[10px] text-text-dim leading-tight mb-2">{node.description}</p>

                      {/* Progress bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${total > 0 ? (completed / total) * 100 : 0}%`,
                              background: isComplete ? '#34d399' : hasProgress ? '#a78bfa' : '#252545',
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-text-faint">{completed}/{total}</span>
                      </div>

                      {/* Quest count badges */}
                      <div className="flex items-center gap-1 mt-2">
                        {node.quests.map(q => {
                          const done = gameState.completedQuests[q.id]?.completed;
                          return (
                            <div key={q.id} className={`w-2 h-2 rounded-full ${done ? 'bg-green' : 'bg-border'}`} />
                          );
                        })}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Path connectors between tiers */}
              {tierIdx < TIER_ORDER.length - 1 && (
                <div className="flex justify-center py-2">
                  <div className={`w-0.5 h-8 ${unlocked ? 'bg-accent/30' : 'bg-border/20'}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quest selection overlay */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
            onClick={e => e.target === e.currentTarget && setSelectedNode(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-surface border border-border rounded-t-2xl sm:rounded-2xl max-w-lg w-full p-5 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">{selectedNode.emoji}</span>
                  <div>
                    <h2 className="text-lg font-bold">{selectedNode.title}</h2>
                    <p className="text-xs text-text-dim">{selectedNode.description}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedNode(null)} className="text-text-dim hover:text-text text-xl p-1">✕</button>
              </div>

              {/* Dungeon list */}
              <div className="grid gap-2.5">
                {selectedNode.quests.map(quest => {
                  const done = gameState.completedQuests[quest.id]?.completed;
                  const score = gameState.completedQuests[quest.id]?.score;
                  const typeLabel = { learn: '📖 Study', lab: '🧪 Lab', challenge: '⚔️ Battle', boss: '🐉 Boss' }[quest.type];
                  const typeBg = { learn: 'bg-blue/10 border-blue/20', lab: 'bg-green/10 border-green/20', challenge: 'bg-gold/10 border-gold/20', boss: 'bg-red/10 border-red/20' }[quest.type];

                  return (
                    <button
                      key={quest.id}
                      onClick={() => { setSelectedNode(null); onSelectQuest(quest, selectedNode); }}
                      className={`w-full text-left p-4 rounded-xl border transition-all hover:scale-[1.01] active:scale-[0.99] ${
                        done ? 'border-green/20 bg-green/5' : 'border-border/50 bg-surface-2/50 hover:border-accent/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${typeBg}`}>{typeLabel}</span>
                          {done && <span className="text-xs text-green">✓ {score}%</span>}
                        </div>
                        <span className="text-xs text-gold font-mono">+{quest.xpReward} XP</span>
                      </div>
                      <h3 className="font-semibold text-sm">{quest.title}</h3>
                      <p className="text-xs text-text-dim mt-0.5">{quest.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-text-faint">{quest.questions.length} rounds</span>
                        <span className="text-[10px] text-text-faint">~{quest.timeMinutes} min</span>
                        {quest.resource && (
                          <span className="text-[10px] text-accent/70 ml-auto">📚 {quest.resource.source}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
