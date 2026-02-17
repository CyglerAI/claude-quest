'use client';
import { motion } from 'framer-motion';

interface Props {
  current: number;
  max: number;
  label: string;
  side: 'left' | 'right';
  emoji?: string;
  showValue?: boolean;
}

function getBarColor(percent: number): string {
  if (percent > 60) return '#34d399';
  if (percent > 30) return '#fbbf24';
  return '#f87171';
}

export default function HPBar({ current, max, label, side, emoji = '❤️', showValue = true }: Props) {
  const percent = Math.max(0, (current / max) * 100);
  const color = getBarColor(percent);

  return (
    <div className={`flex flex-col ${side === 'right' ? 'items-end' : 'items-start'}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm">{emoji}</span>
        <span className="text-xs font-bold uppercase tracking-wider text-text-dim">{label}</span>
        {showValue && (
          <span className="text-xs font-mono text-text-faint ml-1">{current}/{max}</span>
        )}
      </div>
      <div className="w-full h-3 bg-surface-2 rounded-full overflow-hidden border border-border/50" style={{ minWidth: '120px' }}>
        <motion.div
          className="h-full rounded-full relative"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{ background: `linear-gradient(90deg, ${color}cc, ${color})`, boxShadow: `0 0 8px ${color}40` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </motion.div>
      </div>
    </div>
  );
}
