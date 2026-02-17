'use client';
import { motion } from 'framer-motion';

interface Props {
  value: number;
  type: 'damage' | 'heal' | 'crit' | 'combo';
  x?: number;
  y?: number;
}

const colors = {
  damage: '#f87171',
  heal: '#34d399',
  crit: '#fbbf24',
  combo: '#c084fc',
};

export default function DamageNumber({ value, type, x = 50, y = 30 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: type === 'crit' ? 1.5 : 1, x: (Math.random() - 0.5) * 40 }}
      animate={{ opacity: 0, y: -80, scale: type === 'crit' ? 2 : 1.2 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      className="absolute pointer-events-none z-50 font-black text-center"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        color: colors[type],
        fontSize: type === 'crit' ? '2.5rem' : '1.8rem',
        textShadow: `0 0 10px ${colors[type]}80, 0 2px 4px rgba(0,0,0,0.5)`,
        fontFamily: 'var(--font-mono)',
      }}
    >
      {type === 'crit' && '💥 '}
      {type === 'combo' && '🔥 '}
      {value}
      {type === 'crit' && '!'}
    </motion.div>
  );
}
