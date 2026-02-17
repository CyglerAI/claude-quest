'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameState } from '@/lib/gameState';
import { getLevelInfo, LEVELS } from '@/lib/gameState';
import type { Equipment, Item } from '@/lib/items';
import { getRarityColor, ITEMS } from '@/lib/items';
import { getPlayerStats } from '@/lib/battleEngine';
import { playSound } from '@/lib/sounds';

interface Props {
  gameState: GameState;
  onEquip: (item: Item) => void;
  onClose: () => void;
}

export default function CharacterPanel({ gameState, onEquip, onClose }: Props) {
  const level = getLevelInfo(gameState.xp);
  const equipment: Equipment = gameState.equipment || { weapon: null, armor: null, accessory: null };
  const inventory: Item[] = gameState.inventory || [];
  const stats = getPlayerStats(equipment, level.level);

  function handleEquip(item: Item) {
    playSound('equip');
    onEquip(item);
  }

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
        exit={{ scale: 0.95, y: 20 }}
        className="bg-surface border border-border rounded-2xl max-w-md w-full p-5 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Character</h2>
          <button onClick={onClose} className="text-text-dim hover:text-text text-xl">✕</button>
        </div>

        {/* Character display */}
        <div className="text-center mb-5">
          <div className="text-5xl mb-2">{level.emoji}</div>
          <div className="font-bold text-lg">{gameState.profile?.name}</div>
          <div className="text-sm font-medium" style={{ color: level.color }}>{level.title}</div>
          <div className="text-xs text-text-faint font-mono mt-1">Level {level.level} · {gameState.xp} XP</div>

          {/* XP to next */}
          <div className="w-48 mx-auto mt-2">
            <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: level.color }}
                initial={false}
                animate={{ width: `${level.progress}%` }}
              />
            </div>
            <div className="text-[10px] text-text-faint mt-0.5">{Math.round(level.progress)}% to next level</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {[
            { label: 'Attack', value: stats.attack, emoji: '⚔️', color: '#f87171' },
            { label: 'Defense', value: stats.defense, emoji: '🛡️', color: '#60a5fa' },
            { label: 'Max HP', value: stats.maxHp, emoji: '❤️', color: '#34d399' },
            { label: 'Crit %', value: `${stats.critChance}%`, emoji: '💥', color: '#fbbf24' },
          ].map(s => (
            <div key={s.label} className="bg-surface-2/50 border border-border/30 rounded-lg p-3 text-center">
              <span className="text-lg">{s.emoji}</span>
              <div className="text-sm font-bold mt-0.5" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px] text-text-faint">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Equipment slots */}
        <div className="mb-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-dim mb-2">Equipment</h3>
          <div className="grid gap-2">
            {(['weapon', 'armor', 'accessory'] as const).map(slot => {
              const item = equipment[slot];
              return (
                <div key={slot} className="flex items-center gap-3 bg-surface-2/50 border border-border/30 rounded-lg p-3">
                  <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-xl border border-border/50">
                    {item ? item.emoji : { weapon: '⚔️', armor: '🛡️', accessory: '💍' }[slot]}
                  </div>
                  <div className="flex-1 min-w-0">
                    {item ? (
                      <>
                        <div className="text-sm font-medium" style={{ color: getRarityColor(item.rarity) }}>{item.name}</div>
                        <div className="text-[10px] text-text-faint">{item.description}</div>
                      </>
                    ) : (
                      <div className="text-xs text-text-faint capitalize">Empty {slot} slot</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventory */}
        {inventory.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-dim mb-2">
              Inventory ({inventory.length})
            </h3>
            <div className="grid gap-1.5">
              {inventory.map((item, idx) => {
                const equipped = equipment[item.type]?.id === item.id;
                return (
                  <div key={`${item.id}-${idx}`} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${equipped ? 'border-accent/30 bg-accent/5' : 'border-border/30 bg-surface-2/30'}`}>
                    <span className="text-xl">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium" style={{ color: getRarityColor(item.rarity) }}>{item.name}</div>
                      <div className="text-[10px] text-text-faint">
                        {Object.entries(item.stats).filter(([, v]) => v).map(([k, v]) => `+${v} ${k}`).join(', ')}
                      </div>
                    </div>
                    {!equipped && (
                      <button
                        onClick={() => handleEquip(item)}
                        className="text-[10px] px-2 py-1 rounded bg-accent/20 text-accent hover:bg-accent/30 border border-accent/20"
                      >
                        Equip
                      </button>
                    )}
                    {equipped && <span className="text-[10px] text-accent">Equipped</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {inventory.length === 0 && (
          <div className="text-center py-4 text-text-faint text-sm">
            <div className="text-2xl mb-1">🎒</div>
            No items yet. Complete quests to earn loot!
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
