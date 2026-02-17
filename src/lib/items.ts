// Equipment and loot system

export type ItemType = 'weapon' | 'armor' | 'accessory';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface ItemStats {
  attack?: number;
  defense?: number;
  maxHp?: number;
  critChance?: number;   // percentage points (e.g., 10 = +10%)
  comboBonus?: number;    // extra combo multiplier
  xpBonus?: number;       // percentage (e.g., 25 = +25%)
}

export interface Item {
  id: string;
  name: string;
  emoji: string;
  type: ItemType;
  rarity: ItemRarity;
  description: string;
  stats: ItemStats;
  tier: number; // 1-4, determines when it can drop
}

export interface Equipment {
  weapon: Item | null;
  armor: Item | null;
  accessory: Item | null;
}

const RARITY_COLORS: Record<ItemRarity, string> = {
  common: '#94a3b8',
  uncommon: '#34d399',
  rare: '#60a5fa',
  epic: '#c084fc',
  legendary: '#fbbf24',
};

export function getRarityColor(rarity: ItemRarity): string {
  return RARITY_COLORS[rarity];
}

export const ITEMS: Item[] = [
  // === WEAPONS ===
  { id: 'wooden-prompt', name: 'Wooden Prompt', emoji: '🪵', type: 'weapon', rarity: 'common', description: 'A simple, direct instruction. Gets the job done.', stats: { attack: 5 }, tier: 1 },
  { id: 'xml-sword', name: 'XML Tag Sword', emoji: '⚔️', type: 'weapon', rarity: 'uncommon', description: 'Slices through ambiguity with structured tags.', stats: { attack: 10 }, tier: 1 },
  { id: 'cot-staff', name: 'Chain-of-Thought Staff', emoji: '🪄', type: 'weapon', rarity: 'rare', description: 'Forces enemies to think step by step... to their doom.', stats: { attack: 15, critChance: 5 }, tier: 2 },
  { id: 'fewshot-cannon', name: 'Few-Shot Cannon', emoji: '🔫', type: 'weapon', rarity: 'epic', description: 'Three examples is all it takes to obliterate.', stats: { attack: 20, critChance: 8 }, tier: 3 },
  { id: 'opus-blade', name: 'Opus Blade', emoji: '🗡️', type: 'weapon', rarity: 'legendary', description: 'The most powerful reasoning weapon ever forged.', stats: { attack: 30, critChance: 12 }, tier: 4 },
  { id: 'haiku-dagger', name: 'Haiku Dagger', emoji: '🔪', type: 'weapon', rarity: 'uncommon', description: 'Small, fast, cheap. Perfect for quick strikes.', stats: { attack: 8, comboBonus: 1 }, tier: 1 },
  { id: 'sonnet-bow', name: 'Sonnet Bow', emoji: '🏹', type: 'weapon', rarity: 'rare', description: 'Balanced power and precision from a distance.', stats: { attack: 18 }, tier: 2 },

  // === ARMOR ===
  { id: 'basic-shield', name: 'Basic Shield', emoji: '🛡️', type: 'armor', rarity: 'common', description: 'Blocks the simplest attacks on your context.', stats: { maxHp: 10, defense: 2 }, tier: 1 },
  { id: 'context-armor', name: 'Context Armor', emoji: '🦺', type: 'armor', rarity: 'uncommon', description: 'Keeps your context window clean and protected.', stats: { maxHp: 20, defense: 4 }, tier: 2 },
  { id: 'memory-chainmail', name: 'Memory Chainmail', emoji: '⛓️', type: 'armor', rarity: 'rare', description: 'Remembers every attack pattern. Never hit twice.', stats: { maxHp: 30, defense: 6 }, tier: 3 },
  { id: 'constitutional-guard', name: 'Constitutional Guard', emoji: '🏰', type: 'armor', rarity: 'epic', description: 'Aligned with the deepest principles of defense.', stats: { maxHp: 50, defense: 10 }, tier: 4 },

  // === ACCESSORIES ===
  { id: 'lucky-token', name: 'Lucky Token', emoji: '🍀', type: 'accessory', rarity: 'uncommon', description: 'Sometimes, you just get lucky.', stats: { critChance: 10 }, tier: 1 },
  { id: 'streak-ring', name: 'Streak Ring', emoji: '💍', type: 'accessory', rarity: 'rare', description: 'Keeps the combo going longer.', stats: { comboBonus: 2 }, tier: 2 },
  { id: 'xp-amulet', name: 'XP Amulet', emoji: '📿', type: 'accessory', rarity: 'epic', description: 'Learn faster from every encounter.', stats: { xpBonus: 25 }, tier: 3 },
  { id: 'anthropic-relic', name: 'Anthropic Relic', emoji: '🔮', type: 'accessory', rarity: 'legendary', description: 'A mysterious artifact pulsing with constitutional energy.', stats: { critChance: 15, comboBonus: 1, xpBonus: 10 }, tier: 4 },
];

// Tier mapping from quest tier strings
function questTierToNumber(tier: string): number {
  switch (tier) {
    case 'foundations': return 1;
    case 'craft': return 2;
    case 'systems': return 3;
    case 'mastery': return 4;
    default: return 1;
  }
}

export function getLoot(questTier: string, isBoss: boolean): Item | null {
  const tierNum = questTierToNumber(questTier);
  const dropChance = isBoss ? 0.85 : 0.40;
  if (Math.random() > dropChance) return null;

  // Filter items available at this tier
  const available = ITEMS.filter(item => item.tier <= tierNum);
  if (available.length === 0) return null;

  // Weighted by rarity (rarer items less likely)
  const weights: Record<ItemRarity, number> = {
    common: 40,
    uncommon: 25,
    rare: 15,
    epic: isBoss ? 12 : 5,
    legendary: isBoss ? 5 : 1,
  };

  // Higher tiers boost rare drops
  if (tierNum >= 3) { weights.rare += 10; weights.epic += 5; }
  if (tierNum >= 4) { weights.epic += 10; weights.legendary += 3; }

  const weighted = available.map(item => ({ item, weight: weights[item.rarity] }));
  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const { item, weight } of weighted) {
    roll -= weight;
    if (roll <= 0) return item;
  }

  return available[0];
}

export function getEquipmentStats(equipment: Equipment): ItemStats {
  const combined: ItemStats = { attack: 0, defense: 0, maxHp: 0, critChance: 0, comboBonus: 0, xpBonus: 0 };
  for (const slot of [equipment.weapon, equipment.armor, equipment.accessory]) {
    if (!slot) continue;
    if (slot.stats.attack) combined.attack! += slot.stats.attack;
    if (slot.stats.defense) combined.defense! += slot.stats.defense;
    if (slot.stats.maxHp) combined.maxHp! += slot.stats.maxHp;
    if (slot.stats.critChance) combined.critChance! += slot.stats.critChance;
    if (slot.stats.comboBonus) combined.comboBonus! += slot.stats.comboBonus;
    if (slot.stats.xpBonus) combined.xpBonus! += slot.stats.xpBonus;
  }
  return combined;
}

export const DEFAULT_EQUIPMENT: Equipment = {
  weapon: ITEMS.find(i => i.id === 'wooden-prompt')!,
  armor: ITEMS.find(i => i.id === 'basic-shield')!,
  accessory: null,
};
