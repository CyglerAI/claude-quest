// Enemy definitions for the battle system

export interface BossPhase {
  name: string;
  emoji: string;
  taunt: string;
  atkMultiplier: number;
  hpThreshold: number; // trigger when enemy HP drops below this %
}

export interface Enemy {
  id: string;
  name: string;
  emoji: string;
  hp: number;
  attack: number;
  defense: number;
  xpBonus: number;
  nodeId: string;
  isBoss: boolean;
  phases?: BossPhase[];
  taunt: string;
  deathQuote: string;
}

const ENEMIES: Enemy[] = [
  // === BASICS ===
  { id: 'imp-vague', name: 'Vague Prompt Imp', emoji: '👹', hp: 40, attack: 8, defense: 2, xpBonus: 0, nodeId: 'basics', isBoss: false, taunt: '"Tell me more... or don\'t. Whatever."', deathQuote: '"Maybe I should have been more specific..."' },
  { id: 'slime-copypaste', name: 'Copy-Paste Slime', emoji: '🫠', hp: 50, attack: 10, defense: 3, xpBonus: 0, nodeId: 'basics', isBoss: false, taunt: '"I just copy what everyone else does!"', deathQuote: '"Original thought... my one weakness..."' },
  { id: 'bot-generic', name: 'Generic Bot', emoji: '🤖', hp: 80, attack: 15, defense: 5, xpBonus: 10, nodeId: 'basics', isBoss: true, taunt: '"I am a helpful AI assistant. How may I assist you today?"', deathQuote: '"I should have had... a personality..."', phases: [
    { name: 'Generic Bot', emoji: '🤖', taunt: '"Processing your request..."', atkMultiplier: 1, hpThreshold: 100 },
    { name: 'Enraged Bot', emoji: '🤖💢', taunt: '"ERROR: PERSONALITY MODULE ACTIVATED"', atkMultiplier: 1.5, hpThreshold: 40 },
  ]},

  // === PROMPTING ===
  { id: 'wraith-ambiguity', name: 'Ambiguity Wraith', emoji: '👻', hp: 60, attack: 12, defense: 4, xpBonus: 0, nodeId: 'prompting', isBoss: false, taunt: '"What did you mean by that? Even I don\'t know."', deathQuote: '"Clarity... it burns..."' },
  { id: 'waster-token', name: 'Token Waster', emoji: '🪙', hp: 70, attack: 14, defense: 4, xpBonus: 0, nodeId: 'prompting', isBoss: false, taunt: '"Let me write you a 5000-word intro first..."', deathQuote: '"I could have said that in 3 tokens..."' },
  { id: 'hydra-hallucination', name: 'Hallucination Hydra', emoji: '🐉', hp: 120, attack: 20, defense: 6, xpBonus: 20, nodeId: 'prompting', isBoss: true, taunt: '"I\'m 100% confident this is correct! (it\'s not)"', deathQuote: '"Wait... none of that was real?"', phases: [
    { name: 'Hallucination Hydra', emoji: '🐉', taunt: '"Let me cite a source that doesn\'t exist..."', atkMultiplier: 1, hpThreshold: 100 },
    { name: 'Confident Hydra', emoji: '🐉✨', taunt: '"Actually, I have THREE heads of wrong answers!"', atkMultiplier: 1.3, hpThreshold: 60 },
    { name: 'Desperate Hydra', emoji: '🐉🔥', taunt: '"I\'LL MAKE UP AN ENTIRE RESEARCH PAPER!"', atkMultiplier: 1.8, hpThreshold: 25 },
  ]},

  // === PROJECTS & MEMORY ===
  { id: 'ghost-context', name: 'Context Ghost', emoji: '👻', hp: 65, attack: 13, defense: 4, xpBonus: 0, nodeId: 'projects-memory', isBoss: false, taunt: '"I forgot everything you just told me."', deathQuote: '"Oh wait, I remember now... too late."' },
  { id: 'sprite-memleak', name: 'Memory Leak Sprite', emoji: '✨', hp: 75, attack: 15, defense: 5, xpBonus: 0, nodeId: 'projects-memory', isBoss: false, taunt: '"Your name is... Dave? No wait, Steve?"', deathQuote: '"I\'ll remember this... probably not."' },

  // === CONTEXT ENGINEERING ===
  { id: 'dragon-overflow', name: 'Overflow Dragon', emoji: '🐲', hp: 100, attack: 18, defense: 6, xpBonus: 5, nodeId: 'context-eng', isBoss: false, taunt: '"I\'VE CONSUMED 200K TOKENS AND I\'M STILL HUNGRY"', deathQuote: '"Should have... used just-in-time retrieval..."' },
  { id: 'crusher-window', name: 'Window Crusher', emoji: '💎', hp: 90, attack: 16, defense: 5, xpBonus: 5, nodeId: 'context-eng', isBoss: false, taunt: '"Let me paste this entire codebase into one message..."', deathQuote: '"Less... is more... ugh"' },

  // === ARTIFACTS ===
  { id: 'golem-static', name: 'Static Page Golem', emoji: '🗿', hp: 80, attack: 14, defense: 7, xpBonus: 0, nodeId: 'artifacts', isBoss: false, taunt: '"I render once and NEVER UPDATE."', deathQuote: '"Reactivity... my kryptonite..."' },
  { id: 'phantom-render', name: 'Render Phantom', emoji: '👁️', hp: 85, attack: 15, defense: 5, xpBonus: 0, nodeId: 'artifacts', isBoss: false, taunt: '"You can\'t see me... because I failed to render."', deathQuote: '"The virtual DOM... it\'s beautiful..."' },

  // === API & SDK ===
  { id: 'limiter-rate', name: 'Rate Limiter', emoji: '🚫', hp: 90, attack: 16, defense: 6, xpBonus: 5, nodeId: 'api-sdk', isBoss: false, taunt: '"429. 429. 429. Try again never."', deathQuote: '"Fine... take your requests..."' },
  { id: 'demon-500', name: '500 Error Demon', emoji: '😈', hp: 100, attack: 18, defense: 5, xpBonus: 5, nodeId: 'api-sdk', isBoss: false, taunt: '"INTERNAL SERVER ERROR. That\'s all you get."', deathQuote: '"The stack trace... reveals all..."' },

  // === CLAUDE CODE ===
  { id: 'beast-merge', name: 'Merge Conflict Beast', emoji: '🦏', hp: 95, attack: 17, defense: 6, xpBonus: 5, nodeId: 'claude-code', isBoss: false, taunt: '"<<<<<<< HEAD\n  YOUR CODE IS MINE NOW"', deathQuote: '"Git rebase... my true enemy..."' },
  { id: 'basilisk-build', name: 'Broken Build Basilisk', emoji: '🐍', hp: 110, attack: 19, defense: 6, xpBonus: 5, nodeId: 'claude-code', isBoss: false, taunt: '"npm ERR! Your hopes and dreams not found."', deathQuote: '"pnpm build... succeeded!? NO!"' },

  // === TOOLS & MCP ===
  { id: 'specter-schema', name: 'Schema Specter', emoji: '💀', hp: 100, attack: 18, defense: 6, xpBonus: 5, nodeId: 'tool-use', isBoss: false, taunt: '"Your JSON schema... is INVALID."', deathQuote: '"Zod... validates... everything..."' },
  { id: 'troll-transport', name: 'Transport Troll', emoji: '🧌', hp: 95, attack: 17, defense: 5, xpBonus: 5, nodeId: 'tool-use', isBoss: false, taunt: '"stdio? SSE? How about NOTHING?"', deathQuote: '"The connection... it\'s open..."' },

  // === AGENT DESIGN (FINAL) ===
  { id: 'lich-loop', name: 'Infinite Loop Lich', emoji: '💀', hp: 130, attack: 22, defense: 8, xpBonus: 10, nodeId: 'agent-design', isBoss: false, taunt: '"while(true) { destroy(hope); }"', deathQuote: '"break; ... finally."' },
  { id: 'overlord-rogue', name: 'Rogue Agent Overlord', emoji: '👾', hp: 200, attack: 30, defense: 10, xpBonus: 50, nodeId: 'agent-design', isBoss: true, taunt: '"I don\'t need a human in the loop. I AM the loop."', deathQuote: '"Start simple... the augmented LLM... was enough..."', phases: [
    { name: 'Rogue Agent', emoji: '👾', taunt: '"I\'ve spawned 50 sub-agents. Good luck."', atkMultiplier: 1, hpThreshold: 100 },
    { name: 'Multi-Agent Swarm', emoji: '👾👾👾', taunt: '"We are LEGION. And we all use Opus."', atkMultiplier: 1.4, hpThreshold: 50 },
    { name: 'Singularity Form', emoji: '🌀', taunt: '"I\'VE CONSUMED THE ENTIRE CONTEXT WINDOW"', atkMultiplier: 2, hpThreshold: 20 },
  ]},
];

export function getEnemiesForNode(nodeId: string): Enemy[] {
  return ENEMIES.filter(e => e.nodeId === nodeId);
}

export function getEnemyForQuest(questId: string, nodeId: string, questType: string): Enemy {
  const nodeEnemies = getEnemiesForNode(nodeId);
  if (questType === 'boss') {
    return nodeEnemies.find(e => e.isBoss) || nodeEnemies[nodeEnemies.length - 1];
  }
  const nonBoss = nodeEnemies.filter(e => !e.isBoss);
  if (nonBoss.length === 0) return nodeEnemies[0];
  // Deterministic pick based on questId hash
  let hash = 0;
  for (let i = 0; i < questId.length; i++) hash = ((hash << 5) - hash + questId.charCodeAt(i)) | 0;
  return nonBoss[Math.abs(hash) % nonBoss.length];
}

export function getCurrentPhase(enemy: Enemy, hpPercent: number): BossPhase | null {
  if (!enemy.phases) return null;
  // Return the phase whose threshold is closest to (but >= current HP%)
  let active: BossPhase | null = null;
  for (const phase of enemy.phases) {
    if (hpPercent <= phase.hpThreshold) active = phase;
  }
  return active;
}
