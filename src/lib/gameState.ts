// Game state management — all localStorage, no backend needed

export type UserClass = 'beginner' | 'practitioner' | 'builder' | 'architect';
export type TargetLevel = 'casual' | 'power' | 'developer' | 'agent-designer';
export type DailyTime = 15 | 30 | 60;
export type TimeFrame = '2weeks' | '1month' | '3months';

export interface QuestProgress {
  questId: string;
  completed: boolean;
  score: number; // 0-100
  completedAt?: number;
}

export interface PlayerProfile {
  name: string;
  userClass: UserClass;
  targetLevel: TargetLevel;
  dailyMinutes: DailyTime;
  timeFrame: TimeFrame;
  createdAt: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlockedAt?: number;
}

export interface GameState {
  profile: PlayerProfile | null;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  completedQuests: Record<string, QuestProgress>;
  unlockedNodes: string[];
  currentNodeId: string | null;
  achievements: Record<string, Achievement>;
  soundEnabled: boolean;
  totalQuestAttempts: number;
  perfectQuests: number; // 100% score
}

const STORAGE_KEY = 'claude-quest-state';

const DEFAULT_STATE: GameState = {
  profile: null,
  xp: 0,
  level: 1,
  streak: 0,
  lastActiveDate: '',
  completedQuests: {},
  unlockedNodes: ['basics'],
  currentNodeId: null,
  achievements: {},
  soundEnabled: true,
  totalQuestAttempts: 0,
  perfectQuests: 0,
};

export function loadState(): GameState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    // Merge with defaults for forward compatibility
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: GameState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export const LEVELS = [
  { threshold: 0, title: 'Novice', emoji: '🌱', color: '#94a3b8' },
  { threshold: 300, title: 'Apprentice', emoji: '⚡', color: '#60a5fa' },
  { threshold: 800, title: 'Practitioner', emoji: '🔧', color: '#34d399' },
  { threshold: 1800, title: 'Engineer', emoji: '🏗️', color: '#c084fc' },
  { threshold: 3500, title: 'Architect', emoji: '🧠', color: '#f59e0b' },
  { threshold: 5500, title: 'Master', emoji: '👑', color: '#f87171' },
  { threshold: 8000, title: 'Legend', emoji: '✨', color: '#e879f9' },
];

export function getLevelInfo(xp: number): { level: number; title: string; emoji: string; color: string; nextLevelXp: number; progress: number; currentThreshold: number } {
  let currentIdx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].threshold) {
      currentIdx = i;
      break;
    }
  }
  const current = LEVELS[currentIdx];
  const next = LEVELS[currentIdx + 1] || { threshold: current.threshold + 3000 };
  const progress = Math.min(100, ((xp - current.threshold) / (next.threshold - current.threshold)) * 100);
  return {
    level: currentIdx + 1,
    title: current.title,
    emoji: current.emoji,
    color: current.color,
    nextLevelXp: next.threshold,
    progress,
    currentThreshold: current.threshold,
  };
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function updateStreak(state: GameState): GameState {
  const today = getToday();
  if (state.lastActiveDate === today) return state;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  return {
    ...state,
    streak: state.lastActiveDate === yesterdayStr ? state.streak + 1 : 1,
    lastActiveDate: today,
  };
}

// Achievement definitions
export const ACHIEVEMENT_DEFS: Achievement[] = [
  { id: 'first-quest', title: 'First Steps', description: 'Complete your first quest', emoji: '🎯' },
  { id: 'perfect-score', title: 'Flawless', description: 'Score 100% on any quest', emoji: '💎' },
  { id: 'streak-3', title: 'On Fire', description: 'Maintain a 3-day streak', emoji: '🔥' },
  { id: 'streak-7', title: 'Unstoppable', description: 'Maintain a 7-day streak', emoji: '⚡' },
  { id: 'five-quests', title: 'Quest Hunter', description: 'Complete 5 quests', emoji: '🗡️' },
  { id: 'ten-quests', title: 'Veteran', description: 'Complete 10 quests', emoji: '🛡️' },
  { id: 'all-quests', title: 'Completionist', description: 'Complete every quest', emoji: '👑' },
  { id: 'boss-slayer', title: 'Boss Slayer', description: 'Complete a Boss quest', emoji: '🐉' },
  { id: 'speed-demon', title: 'Speed Demon', description: 'Complete 3 quests in one session', emoji: '💨' },
  { id: 'prompt-master', title: 'Prompt Architect', description: 'Complete all Prompt Engineering quests', emoji: '✍️' },
  { id: 'agent-master', title: 'Agent Smith', description: 'Complete Agent Design quests', emoji: '🤖' },
  { id: 'level-5', title: 'Ascended', description: 'Reach Architect level', emoji: '🌟' },
];

export function checkAchievements(state: GameState): string[] {
  const newAchievements: string[] = [];
  const completed = Object.values(state.completedQuests).filter(q => q.completed);

  function tryUnlock(id: string) {
    if (!state.achievements[id]) newAchievements.push(id);
  }

  if (completed.length >= 1) tryUnlock('first-quest');
  if (completed.length >= 5) tryUnlock('five-quests');
  if (completed.length >= 10) tryUnlock('ten-quests');
  if (state.perfectQuests >= 1) tryUnlock('perfect-score');
  if (state.streak >= 3) tryUnlock('streak-3');
  if (state.streak >= 7) tryUnlock('streak-7');
  if (getLevelInfo(state.xp).level >= 5) tryUnlock('level-5');

  // Boss quest
  const bossIds = ['agent-2']; // boss quest ids
  if (bossIds.some(id => state.completedQuests[id]?.completed)) tryUnlock('boss-slayer');

  // Prompt master
  const promptQuestIds = ['prompt-1', 'prompt-2', 'prompt-3', 'prompt-4'];
  if (promptQuestIds.every(id => state.completedQuests[id]?.completed)) tryUnlock('prompt-master');

  // Agent master
  const agentQuestIds = ['agent-1', 'agent-2'];
  if (agentQuestIds.every(id => state.completedQuests[id]?.completed)) tryUnlock('agent-master');

  return newAchievements;
}

// Sound effects using Web Audio API
let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

export function playSound(type: 'correct' | 'wrong' | 'levelup' | 'achievement' | 'click' | 'complete') {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
      case 'correct':
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
        break;
      case 'wrong':
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.setValueAtTime(150, ctx.currentTime + 0.15);
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
        break;
      case 'levelup':
        osc.frequency.setValueAtTime(392, ctx.currentTime);
        osc.frequency.setValueAtTime(523, ctx.currentTime + 0.15);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.3);
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.45);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.7);
        break;
      case 'achievement':
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(554, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.2);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.6);
        break;
      case 'click':
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
        break;
      case 'complete':
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.12);
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.24);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
        break;
    }
  } catch {
    // Audio not available, silently ignore
  }
}
