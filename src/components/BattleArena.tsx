'use client';
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Quest, Question, MCQQuestion, PromptBuildQuestion, SpotErrorQuestion, PromptBattleQuestion } from '@/data/quests';
import type { Enemy } from '@/lib/enemies';
import { getCurrentPhase } from '@/lib/enemies';
import type { BattleState, BattleAction, PlayerStats } from '@/lib/battleEngine';
import { initBattle, resolveAnswer, calculateScore } from '@/lib/battleEngine';
import { playSound } from '@/lib/sounds';
import HPBar from './HPBar';
import DamageNumber from './DamageNumber';

interface Props {
  quest: Quest;
  enemy: Enemy;
  playerStats: PlayerStats;
  soundEnabled: boolean;
  onComplete: (score: number, xp: number, state: BattleState) => void;
  onFlee: () => void;
}

// ====== QUESTION RENDERERS ======
// (Same logic as before but battle-styled)

function MCQ({ q, onAnswer, disabled }: { q: MCQQuestion; onAnswer: (correct: boolean) => void; disabled: boolean }) {
  const [selected, setSelected] = useState<number | null>(null);
  function pick(i: number) {
    if (selected !== null || disabled) return;
    setSelected(i);
    setTimeout(() => onAnswer(i === q.correctIndex), 800);
  }
  return (
    <div>
      <p className="text-sm font-medium mb-3 text-text leading-relaxed">{q.question}</p>
      <div className="grid gap-2">
        {q.options.map((opt, i) => {
          let cls = 'w-full text-left p-3 rounded-lg border text-sm transition-all ';
          if (selected === null) cls += 'border-border/50 bg-surface-2/50 hover:border-accent/50 hover:bg-surface-3/50 cursor-pointer';
          else if (i === q.correctIndex) cls += 'border-green bg-green/10';
          else if (i === selected) cls += 'border-red bg-red/10 animate-shake';
          else cls += 'border-border/20 bg-surface-2/30 opacity-40';
          return (
            <button key={i} onClick={() => pick(i)} disabled={selected !== null} className={cls}>
              <span className="font-mono text-text-faint mr-2 text-xs">{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs text-text-dim bg-surface-2/50 p-2 rounded-lg">
          {q.explanation}
        </motion.p>
      )}
    </div>
  );
}

function PromptBuild({ q, onAnswer, disabled }: { q: PromptBuildQuestion; onAnswer: (correct: boolean) => void; disabled: boolean }) {
  const [order, setOrder] = useState<number[]>(() => {
    const idx = q.components.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    return idx;
  });
  const [submitted, setSubmitted] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  function move(from: number, to: number) {
    if (submitted || disabled) return;
    const n = [...order]; const [item] = n.splice(from, 1); n.splice(to, 0, item); setOrder(n);
  }
  function submit() {
    setSubmitted(true);
    const correct = q.correctOrder.every((c, i) => order[i] === c);
    setTimeout(() => onAnswer(correct), 600);
  }
  return (
    <div>
      <p className="text-sm font-medium mb-2 text-text">{q.question}</p>
      <p className="text-[10px] text-text-faint mb-2">Drag or use arrows to reorder:</p>
      <div className="grid gap-1.5">
        {order.map((ci, pos) => (
          <div key={ci} draggable={!submitted} onDragStart={() => setDragIdx(pos)} onDragOver={e => e.preventDefault()} onDrop={() => { if (dragIdx !== null) move(dragIdx, pos); setDragIdx(null); }}
            className={`flex items-center gap-2 p-2 rounded-lg border text-xs ${submitted ? (q.correctOrder[pos] === ci ? 'border-green/50 bg-green/5' : 'border-red/50 bg-red/5') : 'border-border/50 bg-surface-2/50'}`}>
            <span className="font-mono text-text-faint w-4">{pos + 1}</span>
            <code className="flex-1 text-text-dim break-all leading-relaxed">{q.components[ci]}</code>
            {!submitted && <div className="flex flex-col text-[10px] text-text-faint">
              <button onClick={() => pos > 0 && move(pos, pos - 1)} disabled={pos === 0} className="hover:text-text disabled:opacity-20">▲</button>
              <button onClick={() => pos < order.length - 1 && move(pos, pos + 1)} disabled={pos === order.length - 1} className="hover:text-text disabled:opacity-20">▼</button>
            </div>}
          </div>
        ))}
      </div>
      {!submitted && <button onClick={submit} className="w-full mt-2 py-2 bg-accent/20 text-accent rounded-lg text-sm font-medium hover:bg-accent/30 border border-accent/20">Lock In</button>}
      {submitted && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs text-text-dim bg-surface-2/50 p-2 rounded-lg">{q.explanation}</motion.p>}
    </div>
  );
}

function SpotError({ q, onAnswer, disabled }: { q: SpotErrorQuestion; onAnswer: (correct: boolean) => void; disabled: boolean }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  function toggle(i: number) { if (submitted || disabled) return; const n = new Set(checked); if (n.has(i)) n.delete(i); else n.add(i); setChecked(n); }
  function submit() {
    setSubmitted(true);
    const correct = q.issues.every((issue, i) => issue.isIssue ? checked.has(i) : !checked.has(i));
    setTimeout(() => onAnswer(correct), 600);
  }
  return (
    <div>
      <p className="text-sm font-medium mb-2 text-text">{q.question}</p>
      <div className="bg-surface-2/50 border border-border/30 rounded-lg p-2 mb-2 text-xs font-mono text-text-dim whitespace-pre-wrap">{q.prompt}</div>
      <p className="text-[10px] text-text-faint mb-2">Select all real issues:</p>
      <div className="grid gap-1.5">
        {q.issues.map((issue, i) => (
          <div key={i} onClick={() => toggle(i)} className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
            submitted ? (issue.isIssue ? (checked.has(i) ? 'border-green/50 bg-green/5' : 'border-gold/50 bg-gold/5') : (checked.has(i) ? 'border-red/50 bg-red/5' : 'border-border/20 opacity-40')) : (checked.has(i) ? 'border-accent/50 bg-accent/5' : 'border-border/30 bg-surface-2/30 hover:border-border')
          }`}>
            <input type="checkbox" checked={checked.has(i)} readOnly className="w-3 h-3 accent-accent" />
            <span className="flex-1">{issue.text}</span>
            {submitted && <span className="text-[10px]">{issue.isIssue ? (checked.has(i) ? '✓' : '⚠') : (checked.has(i) ? '✗' : '')}</span>}
          </div>
        ))}
      </div>
      {!submitted && <button onClick={submit} disabled={checked.size === 0} className="w-full mt-2 py-2 bg-accent/20 text-accent rounded-lg text-sm font-medium hover:bg-accent/30 border border-accent/20 disabled:opacity-30">Submit</button>}
      {submitted && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs text-text-dim bg-surface-2/50 p-2 rounded-lg">{q.explanation}</motion.p>}
    </div>
  );
}

function PromptBattle({ q, onAnswer, disabled }: { q: PromptBattleQuestion; onAnswer: (correct: boolean) => void; disabled: boolean }) {
  const [picked, setPicked] = useState<'A' | 'B' | null>(null);
  const [reasons, setReasons] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  function toggleReason(i: number) { if (submitted || disabled) return; const n = new Set(reasons); if (n.has(i)) n.delete(i); else n.add(i); setReasons(n); }
  function submit() {
    setSubmitted(true);
    const promptOk = picked === q.correctPrompt;
    const reasonsOk = q.reasons.every((r, i) => r.isCorrect ? reasons.has(i) : !reasons.has(i));
    setTimeout(() => onAnswer(promptOk && reasonsOk), 600);
  }
  return (
    <div>
      <p className="text-sm font-medium mb-2 text-text">{q.question}</p>
      <div className="grid gap-2 mb-2">
        {(['A', 'B'] as const).map(label => (
          <button key={label} onClick={() => !submitted && !disabled && setPicked(label)} disabled={submitted}
            className={`text-left rounded-lg border p-3 transition-all ${submitted ? (label === q.correctPrompt ? 'border-green/50 bg-green/5' : picked === label ? 'border-red/50 bg-red/5' : 'border-border/20 opacity-40') : (picked === label ? 'border-accent bg-accent/5' : 'border-border/30 bg-surface-2/30 hover:border-border')}`}>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${picked === label ? 'bg-accent/20 text-accent' : 'bg-surface text-text-dim'}`}>Prompt {label}</span>
            <pre className="text-xs text-text-dim font-mono whitespace-pre-wrap mt-1.5 leading-relaxed">{label === 'A' ? q.promptA : q.promptB}</pre>
          </button>
        ))}
      </div>
      {picked && !submitted && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <p className="text-[10px] text-text-faint mb-1.5">Why is Prompt {picked} better?</p>
          <div className="grid gap-1.5 mb-2">
            {q.reasons.map((r, i) => (
              <div key={i} onClick={() => toggleReason(i)} className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer ${reasons.has(i) ? 'border-accent/50 bg-accent/5' : 'border-border/30 bg-surface-2/30'}`}>
                <input type="checkbox" checked={reasons.has(i)} readOnly className="w-3 h-3 accent-accent" />
                <span>{r.text}</span>
              </div>
            ))}
          </div>
          <button onClick={submit} disabled={reasons.size === 0} className="w-full py-2 bg-accent/20 text-accent rounded-lg text-sm font-medium hover:bg-accent/30 border border-accent/20 disabled:opacity-30">Submit</button>
        </motion.div>
      )}
      {submitted && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs text-text-dim bg-surface-2/50 p-2 rounded-lg">{q.explanation}</motion.p>}
    </div>
  );
}

// ====== MAIN BATTLE ARENA ======

export default function BattleArena({ quest, enemy, playerStats, soundEnabled, onComplete, onFlee }: Props) {
  const [battle, setBattle] = useState<BattleState>(() => initBattle(playerStats, enemy));
  const [currentQ, setCurrentQ] = useState(0);
  const [damageNumbers, setDamageNumbers] = useState<{ id: number; value: number; type: 'damage' | 'heal' | 'crit' | 'combo'; x: number; y: number }[]>([]);
  const [answered, setAnswered] = useState(false);
  const [showPhaseTransition, setShowPhaseTransition] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [flashColor, setFlashColor] = useState<string | null>(null);
  const [comboPopup, setComboPopup] = useState<number | null>(null);
  const [lastPhaseIdx, setLastPhaseIdx] = useState(0);
  let dmgIdCounter = 0;

  const phase = enemy.phases ? getCurrentPhase(enemy, (battle.enemyHp / battle.enemyMaxHp) * 100) : null;

  // Clear effects after delay
  useEffect(() => {
    if (shaking) { const t = setTimeout(() => setShaking(false), 300); return () => clearTimeout(t); }
  }, [shaking]);
  useEffect(() => {
    if (flashColor) { const t = setTimeout(() => setFlashColor(null), 200); return () => clearTimeout(t); }
  }, [flashColor]);
  useEffect(() => {
    if (comboPopup) { const t = setTimeout(() => setComboPopup(null), 1200); return () => clearTimeout(t); }
  }, [comboPopup]);

  const handleAnswer = useCallback((correct: boolean) => {
    if (answered) return;
    setAnswered(true);

    const { newState, action } = resolveAnswer(battle, correct, playerStats, enemy);

    // Sound
    if (soundEnabled) {
      if (action.type === 'crit') playSound('crit');
      else if (action.type === 'player-attack') playSound('playerAttack');
      else if (action.type === 'enemy-attack' || action.type === 'defeat') playSound('enemyAttack');
      else if (action.type === 'victory') playSound('victory');
    }

    // Visual effects
    setShaking(true);
    setFlashColor(correct ? 'green' : 'red');

    // Damage numbers
    const newDmg = {
      id: Date.now() + dmgIdCounter++,
      value: action.damage,
      type: action.isCrit ? 'crit' as const : correct ? 'damage' as const : 'damage' as const,
      x: correct ? 70 : 30,
      y: correct ? 25 : 35,
    };
    setDamageNumbers(prev => [...prev, newDmg]);
    setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== newDmg.id)), 1200);

    // Combo popup
    if (correct && action.comboCount >= 2) {
      setComboPopup(action.comboCount);
      if (soundEnabled) playSound('combo');
    }
    if (!correct && battle.combo > 0) {
      if (soundEnabled) playSound('comboBreak');
    }

    // Phase transition
    if (newState.currentPhaseIdx > lastPhaseIdx && enemy.phases) {
      setShowPhaseTransition(true);
      setLastPhaseIdx(newState.currentPhaseIdx);
      if (soundEnabled) playSound('bossPhase');
      setTimeout(() => setShowPhaseTransition(false), 2000);
    }

    setBattle(newState);
  }, [battle, answered, playerStats, enemy, soundEnabled, lastPhaseIdx, dmgIdCounter]);

  function nextTurn() {
    if (battle.status === 'victory') {
      const score = calculateScore(battle);
      onComplete(score, quest.xpReward, battle);
      return;
    }
    if (battle.status === 'defeat') {
      onComplete(0, 0, battle);
      return;
    }
    if (currentQ < quest.questions.length - 1) {
      setCurrentQ(q => q + 1);
      setAnswered(false);
    } else {
      // Ran out of questions — calculate based on remaining HP
      if (battle.enemyHp <= 0) {
        const score = calculateScore(battle);
        onComplete(score, quest.xpReward, battle);
      } else {
        // Didn't kill enemy, partial victory if enemy is damaged enough
        const enemyHpPercent = battle.enemyHp / battle.enemyMaxHp;
        if (enemyHpPercent < 0.3) {
          const score = calculateScore({ ...battle, status: 'victory' });
          onComplete(score, Math.round(quest.xpReward * 0.6), { ...battle, status: 'victory' });
        } else {
          onComplete(0, 0, { ...battle, status: 'defeat' });
        }
      }
    }
  }

  function renderQuestion(q: Question) {
    const key = `q-${currentQ}`;
    const disabled = answered;
    switch (q.type) {
      case 'mcq': return <MCQ key={key} q={q} onAnswer={handleAnswer} disabled={disabled} />;
      case 'prompt-build': return <PromptBuild key={key} q={q} onAnswer={handleAnswer} disabled={disabled} />;
      case 'spot-error': return <SpotError key={key} q={q} onAnswer={handleAnswer} disabled={disabled} />;
      case 'prompt-battle': return <PromptBattle key={key} q={q} onAnswer={handleAnswer} disabled={disabled} />;
    }
  }

  const q = quest.questions[currentQ];
  const enemyEmoji = phase?.emoji || enemy.emoji;
  const enemyName = phase?.name || enemy.name;
  const enemyHpPercent = (battle.enemyHp / battle.enemyMaxHp) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col"
    >
      {/* Flash overlay */}
      <AnimatePresence>
        {flashColor && (
          <motion.div
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] pointer-events-none"
            style={{ background: flashColor === 'red' ? 'rgba(248,113,113,0.15)' : 'rgba(52,211,153,0.15)' }}
          />
        )}
      </AnimatePresence>

      {/* Phase transition overlay */}
      <AnimatePresence>
        {showPhaseTransition && phase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-center"
            >
              <div className="text-6xl mb-3">{phase.emoji}</div>
              <div className="text-2xl font-black text-red uppercase tracking-wider">{phase.name}</div>
              <div className="text-sm text-text-dim mt-2 italic">{phase.taunt}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Combo popup */}
      <AnimatePresence>
        {comboPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="fixed top-1/3 left-1/2 -translate-x-1/2 z-[55] text-center pointer-events-none"
          >
            <div className="text-4xl font-black" style={{ color: '#c084fc', textShadow: '0 0 20px rgba(192,132,252,0.5)' }}>
              🔥 COMBO x{comboPopup}!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Battle scene */}
      <div className={`flex-1 flex flex-col bg-gradient-to-b from-[#0a0a1a] via-[#0d0d20] to-[#080815] ${shaking ? 'animate-battle-shake' : ''}`}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
          <button onClick={onFlee} className="text-xs text-text-faint hover:text-red transition-colors">🏃 Flee</button>
          <span className="text-xs text-text-faint font-mono">Turn {battle.turnCount + 1} · {currentQ + 1}/{quest.questions.length}</span>
          {battle.combo > 0 && <span className="text-xs font-bold text-purple">🔥 x{battle.combo}</span>}
        </div>

        {/* Battle field */}
        <div className="flex-1 relative flex items-stretch overflow-hidden">
          {/* Damage numbers layer */}
          {damageNumbers.map(d => (
            <DamageNumber key={d.id} value={d.value} type={d.type} x={d.x} y={d.y} />
          ))}

          {/* Arena background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-accent/20"
                animate={{
                  x: [Math.random() * 400, Math.random() * 400],
                  y: [Math.random() * 300, Math.random() * 300],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, repeatType: 'reverse' }}
                style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              />
            ))}
          </div>

          {/* Left: Player */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <HPBar current={battle.playerHp} max={battle.playerMaxHp} label="YOU" side="left" />
            <motion.div
              className="text-5xl mt-4"
              animate={battle.lastAction?.type === 'enemy-attack' || battle.lastAction?.type === 'defeat'
                ? { x: [0, -8, 8, -4, 0], transition: { duration: 0.3 } }
                : battle.lastAction?.type === 'player-attack' || battle.lastAction?.type === 'crit'
                  ? { x: [0, 15, 0], transition: { duration: 0.2 } }
                  : {}
              }
            >
              ⚔️
            </motion.div>
            <span className="text-xs text-text-dim mt-2 font-medium">{quest.title}</span>
          </div>

          {/* VS divider */}
          <div className="flex items-center px-2">
            <motion.span
              className="text-lg font-black text-text-faint"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              VS
            </motion.span>
          </div>

          {/* Right: Enemy */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <HPBar current={battle.enemyHp} max={battle.enemyMaxHp} label={enemyName} side="right" emoji={enemyEmoji} />
            <motion.div
              className="text-5xl mt-4"
              animate={battle.lastAction?.type === 'player-attack' || battle.lastAction?.type === 'crit'
                ? { x: [0, 8, -8, 4, 0], opacity: [1, 0.5, 1], transition: { duration: 0.3 } }
                : battle.lastAction?.type === 'enemy-attack'
                  ? { scale: [1, 1.15, 1], transition: { duration: 0.3 } }
                  : { y: [0, -3, 0], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }
              }
            >
              {enemyEmoji}
            </motion.div>
            <span className="text-[10px] text-text-faint mt-2 italic max-w-[150px] text-center leading-tight">{enemy.taunt}</span>
          </div>
        </div>

        {/* Question panel */}
        <div className="border-t border-border/30 bg-surface/80 backdrop-blur-md max-h-[55vh] overflow-y-auto">
          <div className="max-w-2xl mx-auto p-4">
            {/* Question type indicator */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-widest text-text-faint font-mono">
                {q.type === 'mcq' && '📝 Knowledge Check'}
                {q.type === 'prompt-build' && '🏗️ Build Attack'}
                {q.type === 'spot-error' && '🔍 Find Weakness'}
                {q.type === 'prompt-battle' && '⚔️ Choose Weapon'}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {renderQuestion(q)}
              </motion.div>
            </AnimatePresence>

            {/* Next turn button */}
            {answered && battle.status === 'fighting' && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={nextTurn}
                className="w-full mt-3 py-2.5 bg-accent/20 text-accent rounded-lg text-sm font-semibold hover:bg-accent/30 border border-accent/20"
              >
                {currentQ < quest.questions.length - 1 ? 'Next Attack →' : 'Finish Battle'}
              </motion.button>
            )}

            {/* Victory/Defeat in-battle */}
            {(battle.status === 'victory' || battle.status === 'defeat') && answered && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={nextTurn}
                className={`w-full mt-3 py-3 rounded-lg text-sm font-bold ${
                  battle.status === 'victory'
                    ? 'bg-green/20 text-green border border-green/30 hover:bg-green/30'
                    : 'bg-red/20 text-red border border-red/30 hover:bg-red/30'
                }`}
              >
                {battle.status === 'victory' ? '🎉 Claim Victory!' : '💀 Accept Defeat'}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
