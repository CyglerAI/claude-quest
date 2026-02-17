// Battle engine — turn-based combat driven by quiz answers

import type { Enemy } from './enemies';
import { getCurrentPhase } from './enemies';
import type { Equipment } from './items';
import { getEquipmentStats } from './items';

export interface PlayerStats {
  attack: number;
  defense: number;
  maxHp: number;
  critChance: number;  // 0-100
  comboBonus: number;
}

export interface BattleState {
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  combo: number;
  maxCombo: number;
  turnCount: number;
  status: 'fighting' | 'victory' | 'defeat';
  lastAction: BattleAction | null;
  currentPhaseIdx: number;
  shakeScreen: boolean;
  flashColor: string | null; // 'red' | 'green' | null
}

export interface BattleAction {
  type: 'player-attack' | 'enemy-attack' | 'crit' | 'combo-break' | 'phase-change' | 'victory' | 'defeat';
  damage: number;
  description: string;
  isCrit: boolean;
  comboCount: number;
}

export function getPlayerStats(equipment: Equipment, level: number): PlayerStats {
  const eqStats = getEquipmentStats(equipment);
  return {
    attack: 10 + (eqStats.attack || 0) + Math.floor(level * 2),
    defense: 3 + (eqStats.defense || 0) + Math.floor(level * 0.5),
    maxHp: 100 + (eqStats.maxHp || 0) + Math.floor(level * 5),
    critChance: 5 + (eqStats.critChance || 0),
    comboBonus: (eqStats.comboBonus || 0),
  };
}

export function initBattle(stats: PlayerStats, enemy: Enemy): BattleState {
  return {
    playerHp: stats.maxHp,
    playerMaxHp: stats.maxHp,
    enemyHp: enemy.hp,
    enemyMaxHp: enemy.hp,
    combo: 0,
    maxCombo: 0,
    turnCount: 0,
    status: 'fighting',
    lastAction: null,
    currentPhaseIdx: 0,
    shakeScreen: false,
    flashColor: null,
  };
}

export function resolveAnswer(
  state: BattleState,
  correct: boolean,
  stats: PlayerStats,
  enemy: Enemy
): { newState: BattleState; action: BattleAction } {
  const turnCount = state.turnCount + 1;

  if (correct) {
    // Player attacks enemy
    const combo = state.combo + 1;
    const maxCombo = Math.max(state.maxCombo, combo);
    const comboMultiplier = 1 + (combo - 1) * 0.15 + stats.comboBonus * 0.05;

    // Crit check
    const isCrit = Math.random() * 100 < stats.critChance;
    const critMultiplier = isCrit ? 2 : 1;

    // Calculate damage
    const baseDmg = stats.attack * comboMultiplier * critMultiplier;
    const defense = enemy.defense * (enemy.phases ? getCurrentPhaseAtkMultiplier(enemy, state) * 0.5 : 1);
    const damage = Math.max(1, Math.round(baseDmg - defense * 0.3));

    const newEnemyHp = Math.max(0, state.enemyHp - damage);
    const isVictory = newEnemyHp <= 0;

    // Check boss phase transitions
    let phaseIdx = state.currentPhaseIdx;
    if (enemy.phases && !isVictory) {
      const hpPercent = (newEnemyHp / state.enemyMaxHp) * 100;
      for (let i = enemy.phases.length - 1; i >= 0; i--) {
        if (hpPercent <= enemy.phases[i].hpThreshold && i > phaseIdx) {
          phaseIdx = i;
          break;
        }
      }
    }

    const action: BattleAction = {
      type: isVictory ? 'victory' : isCrit ? 'crit' : 'player-attack',
      damage,
      description: isVictory ? 'VICTORY!' : isCrit ? `CRITICAL HIT! ${damage} damage!` : `${damage} damage!`,
      isCrit,
      comboCount: combo,
    };

    return {
      newState: {
        ...state,
        enemyHp: newEnemyHp,
        combo,
        maxCombo,
        turnCount,
        status: isVictory ? 'victory' : 'fighting',
        lastAction: action,
        currentPhaseIdx: phaseIdx,
        shakeScreen: true,
        flashColor: 'green',
      },
      action,
    };
  } else {
    // Enemy attacks player
    const phaseMultiplier = getCurrentPhaseAtkMultiplier(enemy, state);
    const rawDmg = enemy.attack * phaseMultiplier;
    const damage = Math.max(1, Math.round(rawDmg - stats.defense * 0.4));
    const newPlayerHp = Math.max(0, state.playerHp - damage);
    const isDefeat = newPlayerHp <= 0;

    const action: BattleAction = {
      type: isDefeat ? 'defeat' : 'enemy-attack',
      damage,
      description: isDefeat ? 'DEFEATED!' : `Enemy strikes for ${damage}!`,
      isCrit: false,
      comboCount: 0,
    };

    return {
      newState: {
        ...state,
        playerHp: newPlayerHp,
        combo: 0, // combo breaks
        turnCount,
        status: isDefeat ? 'defeat' : 'fighting',
        lastAction: action,
        currentPhaseIdx: state.currentPhaseIdx,
        shakeScreen: true,
        flashColor: 'red',
      },
      action,
    };
  }
}

function getCurrentPhaseAtkMultiplier(enemy: Enemy, state: BattleState): number {
  if (!enemy.phases || enemy.phases.length === 0) return 1;
  return enemy.phases[state.currentPhaseIdx]?.atkMultiplier || 1;
}

// Calculate score as percentage based on remaining HP and combos
export function calculateScore(state: BattleState): number {
  if (state.status !== 'victory') return 0;
  const hpPercent = (state.playerHp / state.playerMaxHp) * 100;
  const comboBonus = Math.min(20, state.maxCombo * 3);
  return Math.min(100, Math.round(hpPercent * 0.7 + comboBonus + 10));
}
