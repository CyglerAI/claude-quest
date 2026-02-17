'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { ACHIEVEMENT_DEFS, type GameState } from '@/lib/gameState';

interface Props {
  gameState: GameState;
  onClose: () => void;
}

export default function Achievements({ gameState, onClose }: Props) {
  const unlocked = Object.keys(gameState.achievements || {});

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Achievements</h2>
            <p className="text-sm text-text-dim">{unlocked.length}/{ACHIEVEMENT_DEFS.length} unlocked</p>
          </div>
          <button onClick={onClose} className="text-text-dim hover:text-text text-xl">✕</button>
        </div>

        <div className="grid gap-3">
          {ACHIEVEMENT_DEFS.map(ach => {
            const isUnlocked = !!gameState.achievements?.[ach.id];
            return (
              <div
                key={ach.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isUnlocked
                    ? 'border-gold/30 bg-gold-dim'
                    : 'border-border bg-surface-2 opacity-50'
                }`}
              >
                <div className={`text-2xl ${isUnlocked ? '' : 'grayscale'}`}>
                  {isUnlocked ? ach.emoji : '🔒'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm ${isUnlocked ? 'text-text' : 'text-text-dim'}`}>
                    {ach.title}
                  </div>
                  <div className="text-xs text-text-dim truncate">{ach.description}</div>
                </div>
                {isUnlocked && (
                  <span className="text-xs text-gold">✓</span>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
