'use client';
import { motion } from 'framer-motion';
import { skillNodes, type SkillNode } from '@/data/quests';
import type { GameState } from '@/lib/gameState';

interface Props {
  gameState: GameState;
  onSelectNode: (node: SkillNode) => void;
}

// Connection lines between nodes
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

  return (
    <div className="relative w-full max-w-2xl mx-auto" style={{ minHeight: '800px' }}>
      {/* SVG connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: '800px' }}>
        {connections.map(({ from, to }) => {
          const fromNode = skillNodes.find(n => n.id === from)!;
          const toNode = skillNodes.find(n => n.id === to)!;
          const unlocked = isUnlocked(to);
          return (
            <line
              key={`${from}-${to}`}
              x1={`${fromNode.position.x}%`}
              y1={`${fromNode.position.y + 3}%`}
              x2={`${toNode.position.x}%`}
              y2={`${toNode.position.y - 1}%`}
              stroke={unlocked ? '#7c3aed' : '#2a2a3e'}
              strokeWidth={unlocked ? 2 : 1}
              strokeDasharray={unlocked ? 'none' : '6 4'}
              opacity={unlocked ? 0.8 : 0.4}
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
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => unlocked && onSelectNode(node)}
            disabled={!unlocked}
            className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group ${!unlocked ? 'node-locked cursor-not-allowed' : 'cursor-pointer'}`}
            style={{
              left: `${node.position.x}%`,
              top: `${node.position.y}%`,
            }}
          >
            {/* Node circle */}
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl border-2 transition-all ${
              complete
                ? 'bg-green/20 border-green node-glow'
                : unlocked
                  ? 'bg-surface-2 border-accent hover:border-accent hover:bg-accent/10 node-glow'
                  : 'bg-surface border-border'
            }`}>
              {complete ? '✅' : node.emoji}
            </div>

            {/* Progress ring */}
            {unlocked && !complete && completion > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-dim flex items-center justify-center text-[10px] font-bold">
                {completedCount}
              </div>
            )}

            {/* Label */}
            <span className={`text-xs font-medium whitespace-nowrap max-w-[100px] truncate ${
              unlocked ? 'text-text' : 'text-text-dim'
            }`}>
              {node.title}
            </span>

            {/* Quest count */}
            <span className="text-[10px] text-text-dim">
              {completedCount}/{node.quests.length}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
