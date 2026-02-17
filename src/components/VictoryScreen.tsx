'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { BattleState } from '@/lib/battleEngine';
import type { Item } from '@/lib/items';
import { getRarityColor } from '@/lib/items';
import Confetti from './Confetti';

interface Props {
  quest: { title: string; xpReward: number };
  battleState: BattleState;
  xpEarned: number;
  xpBonus: number;
  loot: Item | null;
  onContinue: () => void;
}

export default function VictoryScreen({ quest, battleState, xpEarned, xpBonus, loot, onContinue }: Props) {
  const [showLoot, setShowLoot] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const hpPercent = Math.round((battleState.playerHp / battleState.playerMaxHp) * 100);

  useEffect(() => {
    if (loot) {
      const t = setTimeout(() => setShowLoot(true), 1500);
      return () => clearTimeout(t);
    }
  }, [loot]);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
    >
      <Confetti active={showConfetti} />

      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="max-w-sm w-full text-center"
      >
        {/* Trophy */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, -10, 10, -5, 0] }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="text-7xl mb-4"
        >
          {hpPercent === 100 ? '💎' : hpPercent > 60 ? '🏆' : '⭐'}
        </motion.div>

        <h1 className="text-3xl font-black mb-1 bg-gradient-to-r from-gold to-amber-300 bg-clip-text text-transparent">
          VICTORY!
        </h1>
        <p className="text-text-dim text-sm mb-6">{quest.title} conquered</p>

        {/* Stats */}
        <div className="bg-surface/50 border border-border/30 rounded-xl p-4 mb-4 text-left">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] text-text-faint uppercase">HP Remaining</div>
              <div className="text-lg font-bold text-green">{hpPercent}%</div>
            </div>
            <div>
              <div className="text-[10px] text-text-faint uppercase">Max Combo</div>
              <div className="text-lg font-bold text-purple">{battleState.maxCombo}x</div>
            </div>
            <div>
              <div className="text-[10px] text-text-faint uppercase">Turns</div>
              <div className="text-lg font-bold text-text">{battleState.turnCount}</div>
            </div>
            <div>
              <div className="text-[10px] text-text-faint uppercase">XP Earned</div>
              <div className="text-lg font-bold text-gold">
                +{xpEarned}
                {xpBonus > 0 && <span className="text-xs text-accent ml-1">(+{xpBonus})</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Loot drop */}
        {loot && showLoot && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-surface/50 border rounded-xl p-4 mb-4"
            style={{ borderColor: getRarityColor(loot.rarity) + '40' }}
          >
            <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: getRarityColor(loot.rarity) }}>
              ✨ Loot Drop!
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{loot.emoji}</span>
              <div className="text-left">
                <div className="font-bold text-sm" style={{ color: getRarityColor(loot.rarity) }}>{loot.name}</div>
                <div className="text-[10px] text-text-dim">{loot.description}</div>
                <div className="text-[10px] text-text-faint mt-0.5">
                  {Object.entries(loot.stats).filter(([, v]) => v).map(([k, v]) => `+${v} ${k}`).join(' · ')}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: loot ? 2.5 : 1 }}
          onClick={onContinue}
          className="w-full py-3 bg-gold/20 text-gold rounded-xl font-bold hover:bg-gold/30 border border-gold/20 transition-all"
        >
          Continue →
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
