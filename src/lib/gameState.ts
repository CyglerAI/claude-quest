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

export interface GameState {
  profile: PlayerProfile | null;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  completedQuests: Record<string, QuestProgress>;
  unlockedNodes: string[];
  currentNodeId: string | null;
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
};

export function loadState(): GameState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return JSON.parse(raw);
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

export function getLevelInfo(xp: number): { level: number; title: string; emoji: string; nextLevelXp: number; progress: number } {
  const levels = [
    { threshold: 0, title: 'Novice', emoji: '🌱' },
    { threshold: 500, title: 'Apprentice', emoji: '⚡' },
    { threshold: 1500, title: 'Builder', emoji: '🔧' },
    { threshold: 3500, title: 'Engineer', emoji: '🏗' },
    { threshold: 6000, title: 'Architect', emoji: '🧠' },
    { threshold: 10000, title: 'Master', emoji: '👑' },
  ];
  let current = levels[0];
  let next = levels[1];
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].threshold) {
      current = levels[i];
      next = levels[i + 1] || { threshold: levels[i].threshold + 5000, title: 'Legend', emoji: '✨' };
      break;
    }
  }
  const progress = next ? Math.min(100, ((xp - current.threshold) / (next.threshold - current.threshold)) * 100) : 100;
  return {
    level: levels.indexOf(current) + 1,
    title: current.title,
    emoji: current.emoji,
    nextLevelXp: next?.threshold || current.threshold,
    progress,
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
