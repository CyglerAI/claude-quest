'use client';
import { motion } from 'framer-motion';
import { getLevelInfo, type GameState } from '@/lib/gameState';
import { getQuestStats } from '@/data/quests';

interface Props {
  gameState: GameState;
  onReset: () => void;
  onToggleSound: () => void;
  onShowAchievements: () => void;
}

export default function PlayerHUD({ gameState, onReset, onToggleSound, onShowAchievements }: Props) {
  const { title, emoji, progress, currentThreshold, color } = getLevelInfo(gameState.xp);
  const nextLevel = getLevelInfo(gameState.xp + 1); // peek
  const { total, completed } = getQuestStats(gameState.completedQuests);
  const achievementCount = Object.keys(gameState.achievements || {}).length;

  return (
    <div className="glass border-b border-border sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Left: player */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">{emoji}</span>
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate">{gameState.profile?.name}</div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color }}>{title}</div>
            </div>
          </div>

          {/* XP bar - desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-28 h-1.5 bg-surface-2 rounded-full overflow-hidden">
              <motion.div
                className="h-full xp-bar rounded-full"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-[10px] text-text-faint font-mono">{gameState.xp} XP</span>
          </div>
        </div>

        {/* Right: stats & actions */}
        <div className="flex items-center gap-3 text-sm flex-shrink-0">
          {gameState.streak > 0 && (
            <div className="flex items-center gap-1 text-gold text-xs">
              <span>🔥</span>
              <span className="font-mono font-medium">{gameState.streak}</span>
            </div>
          )}

          <span className="text-xs text-text-faint font-mono hidden sm:inline">
            {completed}/{total}
          </span>

          <button
            onClick={onShowAchievements}
            className="relative text-lg hover:scale-110 transition-transform"
            title="Achievements"
          >
            🏆
            {achievementCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gold rounded-full text-[8px] text-black font-bold flex items-center justify-center">
                {achievementCount}
              </span>
            )}
          </button>

          <button
            onClick={onToggleSound}
            className="text-sm hover:scale-110 transition-transform"
            title={gameState.soundEnabled ? 'Sound on' : 'Sound off'}
          >
            {gameState.soundEnabled ? '🔊' : '🔇'}
          </button>

          <button
            onClick={onReset}
            className="text-xs text-text-faint hover:text-red transition-colors"
            title="Reset"
          >
            ↺
          </button>
        </div>
      </div>
    </div>
  );
}
