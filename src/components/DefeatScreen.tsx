'use client';
import { motion } from 'framer-motion';
import type { Enemy } from '@/lib/enemies';

interface Props {
  quest: { title: string };
  enemy: Enemy;
  onRetry: () => void;
  onFlee: () => void;
}

export default function DefeatScreen({ quest, enemy, onRetry, onFlee }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at center, rgba(248,113,113,0.08) 0%, rgba(0,0,0,0.95) 70%)' }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-sm w-full text-center"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-6xl mb-4"
        >
          💀
        </motion.div>

        <h1 className="text-3xl font-black text-red mb-1">DEFEATED</h1>
        <p className="text-text-dim text-sm mb-2">{quest.title}</p>

        {/* Enemy taunt */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-red/5 border border-red/20 rounded-xl p-4 mb-6"
        >
          <div className="text-3xl mb-2">{enemy.emoji}</div>
          <div className="text-sm font-bold text-red mb-1">{enemy.name}</div>
          <p className="text-xs text-text-dim italic">{enemy.taunt}</p>
        </motion.div>

        <p className="text-xs text-text-faint mb-6">Equip better gear or study the material before trying again.</p>

        <div className="grid gap-2">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={onRetry}
            className="w-full py-3 bg-accent/20 text-accent rounded-xl font-bold hover:bg-accent/30 border border-accent/20"
          >
            ⚔️ Try Again
          </motion.button>
          <button
            onClick={onFlee}
            className="w-full py-2 text-text-faint hover:text-text text-sm transition-colors"
          >
            Back to Map
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
