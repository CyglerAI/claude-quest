'use client';
import { motion } from 'framer-motion';
import { getLevelInfo, type GameState } from '@/lib/gameState';
import { getQuestStats } from '@/data/quests';
import { getPlayerStats } from '@/lib/battleEngine';
import type { Equipment } from '@/lib/items';

interface Props {
  gameState: GameState;
  onOpenCharacter: () => void;
  onShowAchievements: () => void;
  onToggleSound: () => void;
  onReset: () => void;
}

export default function GameHUD({ gameState, onOpenCharacter, onShowAchievements, onToggleSound, onReset }: Props) {
  const level = getLevelInfo(gameState.xp);
  const { total, completed } = getQuestStats(gameState.completedQuests);
  const achievementCount = Object.keys(gameState.achievements || {}).length;
  const equipment: Equipment = gameState.equipment || { weapon: null, armor: null, accessory: null };
  const stats = getPlayerStats(equipment, level.level);

  return (
    <div className="sticky top-0 z-40 border-b border-border/30 bg-surface/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-3 py-2 flex items-center justify-between gap-2">
        {/* Left: Character button + level */}
        <button onClick={onOpenCharacter} className="flex items-center gap-2 hover:bg-surface-2/50 rounded-lg px-2 py-1 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border/50 flex items-center justify-center text-lg">
            {level.emoji}
          </div>
          <div className="min-w-0 text-left">
            <div className="text-xs font-bold truncate">{gameState.profile?.name}</div>
            <div className="text-[10px] font-mono" style={{ color: level.color }}>Lv{level.level} {level.title}</div>
          </div>
        </button>

        {/* Center: XP bar */}
        <div className="flex-1 max-w-[200px] hidden sm:block">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: level.color }}
                initial={false}
                animate={{ width: `${level.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-[10px] text-text-faint font-mono">{gameState.xp} XP</span>
          </div>
        </div>

        {/* Right: Quick stats + buttons */}
        <div className="flex items-center gap-2">
          {/* Streak */}
          {gameState.streak > 0 && (
            <div className="flex items-center gap-0.5 text-xs text-gold">
              🔥<span className="font-mono font-bold">{gameState.streak}</span>
            </div>
          )}

          {/* HP */}
          <div className="flex items-center gap-0.5 text-xs text-green">
            ❤️<span className="font-mono">{stats.maxHp}</span>
          </div>

          {/* Weapon */}
          {equipment.weapon && (
            <span className="text-sm" title={equipment.weapon.name}>{equipment.weapon.emoji}</span>
          )}

          {/* Quests */}
          <span className="text-[10px] text-text-faint font-mono hidden sm:inline">{completed}/{total}</span>

          {/* Achievements */}
          <button onClick={onShowAchievements} className="relative text-sm hover:scale-110 transition-transform" title="Achievements">
            🏆
            {achievementCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-gold rounded-full text-[7px] text-black font-bold flex items-center justify-center">
                {achievementCount}
              </span>
            )}
          </button>

          <button onClick={onToggleSound} className="text-sm hover:scale-110 transition-transform" title="Sound">
            {gameState.soundEnabled ? '🔊' : '🔇'}
          </button>

          <button onClick={onReset} className="text-[10px] text-text-faint hover:text-red transition-colors" title="Reset">↺</button>
        </div>
      </div>
    </div>
  );
}
