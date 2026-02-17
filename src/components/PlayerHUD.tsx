'use client';
import { motion } from 'framer-motion';
import { getLevelInfo, type GameState } from '@/lib/gameState';
import { getQuestStats } from '@/data/quests';

interface Props {
  gameState: GameState;
  onReset: () => void;
}

export default function PlayerHUD({ gameState, onReset }: Props) {
  const { title, emoji, nextLevelXp, progress } = getLevelInfo(gameState.xp);
  const { total, completed } = getQuestStats(gameState.completedQuests);

  return (
    <div className="bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: player info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{emoji}</span>
            <div>
              <div className="font-semibold text-sm">{gameState.profile?.name}</div>
              <div className="text-xs text-text-dim">{title}</div>
            </div>
          </div>

          {/* XP bar */}
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-surface-2 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent-dim to-accent rounded-full xp-bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-text-dim">{gameState.xp} XP</span>
            </div>
          </div>
        </div>

        {/* Right: stats */}
        <div className="flex items-center gap-4 text-sm">
          {gameState.streak > 0 && (
            <div className="flex items-center gap-1 text-gold">
              <span>🔥</span>
              <span className="font-medium">{gameState.streak}</span>
            </div>
          )}
          <div className="text-text-dim">
            {completed}/{total} quests
          </div>
          <button onClick={onReset} className="text-xs text-text-dim hover:text-red transition-colors" title="Reset progress">
            ↺
          </button>
        </div>
      </div>
    </div>
  );
}
