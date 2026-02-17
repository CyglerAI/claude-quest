'use client';
import { motion } from 'framer-motion';
import { skillNodes, type SkillNode } from '@/data/quests';
import type { GameState } from '@/lib/gameState';
import { playSound } from '@/lib/gameState';

interface Props {
  gameState: GameState;
  onSelectNode: (node: SkillNode) => void;
}

const tierLabels: Record<string, { label: string; y: number }> = {
  foundations: { label: 'FOUNDATIONS', y: 2 },
  craft: { label: 'CRAFT', y: 22 },
  systems: { label: 'SYSTEMS', y: 42 },
  mastery: { label: 'MASTERY', y: 58 },
};

function getConnections(): { from: string; to: string }[] {
  const conns: { from: string; to: string }[] = [];
  for (const node of skillNodes) {
    for (const req of node.requires) {
      conns.push({ from: req, to: node.id });
    }
  }
  return conns;
}

export default function SkillTree({ gameState, onSelectNode }: Props) {
  const connections = getConnections();

  function isUnlocked(nodeId: string): boolean {
    return gameState.unlockedNodes.includes(nodeId);
  }

  function getNodeCompletion(node: SkillNode): number {
    const completed = node.quests.filter(q => gameState.completedQuests[q.id]?.completed).length;
    return node.quests.length > 0 ? completed / node.quests.length : 0;
  }

  function isNodeComplete(node: SkillNode): boolean {
    return getNodeCompletion(node) === 1;
  }

  // Unique tiers in order
  const tiers = ['foundations', 'craft', 'systems', 'mastery'];

  return (
    <div className="relative w-full max-w-2xl mx-auto" style={{ minHeight: '750px' }}>
      {/* Tier labels */}
      {tiers.map(tier => {
        const info = tierLabels[tier];
        if (!info) return null;
        return (
          <div
            key={tier}
            className="absolute left-0 text-[10px] uppercase tracking-[0.2em] text-text-faint font-mono"
            style={{ top: `${info.y}%` }}
          >
            {info.label}
          </div>
        );
      })}

      {/* SVG connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: '750px' }}>
        <defs>
          <linearGradient id="line-active" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="line-locked" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#252545" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#252545" stopOpacity="0.2" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {connections.map(({ from, to }) => {
          const fromNode = skillNodes.find(n => n.id === from)!;
          const toNode = skillNodes.find(n => n.id === to)!;
          const unlocked = isUnlocked(to);
          return (
            <line
              key={`${from}-${to}`}
              x1={`${fromNode.position.x}%`}
              y1={`${fromNode.position.y + 4}%`}
              x2={`${toNode.position.x}%`}
              y2={`${toNode.position.y - 2}%`}
              stroke={unlocked ? 'url(#line-active)' : 'url(#line-locked)'}
              strokeWidth={unlocked ? 2 : 1}
              strokeDasharray={unlocked ? 'none' : '4 6'}
              filter={unlocked ? 'url(#glow)' : undefined}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {skillNodes.map((node, i) => {
        const unlocked = isUnlocked(node.id);
        const complete = isNodeComplete(node);
        const completion = getNodeCompletion(node);
        const completedCount = node.quests.filter(q => gameState.completedQuests[q.id]?.completed).length;

        return (
          <motion.button
            key={node.id}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 200 }}
            onClick={() => {
              if (unlocked) {
                if (gameState.soundEnabled) playSound('click');
                onSelectNode(node);
              }
            }}
            disabled={!unlocked}
            className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 group ${!unlocked ? 'node-locked cursor-not-allowed' : 'cursor-pointer'}`}
            style={{ left: `${node.position.x}%`, top: `${node.position.y}%` }}
          >
            {/* Node circle */}
            <div className={`node-circle w-[60px] h-[60px] rounded-2xl flex items-center justify-center text-2xl border-2 ${
              complete
                ? 'bg-green/10 border-green glow-green node-complete'
                : unlocked
                  ? 'bg-surface-2 border-accent/50 hover:border-accent glow-accent'
                  : 'bg-surface border-border'
            }`}>
              {complete ? '✅' : node.emoji}

              {/* Progress ring overlay */}
              {unlocked && !complete && completion > 0 && (
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 60 60">
                  <circle
                    cx="30" cy="30" r="27"
                    fill="none"
                    stroke="rgba(167, 139, 250, 0.3)"
                    strokeWidth="2"
                    strokeDasharray={`${completion * 170} 170`}
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>

            {/* Label */}
            <span className={`text-[11px] font-medium whitespace-nowrap ${unlocked ? 'text-text' : 'text-text-faint'}`}>
              {node.title}
            </span>

            {/* Quest count */}
            <span className="text-[10px] text-text-faint font-mono">
              {completedCount}/{node.quests.length}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
