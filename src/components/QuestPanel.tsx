'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SkillNode, Quest, Question, MCQQuestion, PromptBuildQuestion, SpotErrorQuestion, PromptBattleQuestion } from '@/data/quests';
import type { GameState } from '@/lib/gameState';
import { playSound } from '@/lib/gameState';
import Confetti from './Confetti';

interface Props {
  node: SkillNode;
  gameState: GameState;
  onCompleteQuest: (questId: string, score: number, xp: number) => void;
  onClose: () => void;
}

const typeStyles: Record<string, { bg: string; text: string; label: string; border: string }> = {
  learn: { bg: 'bg-blue-dim', text: 'text-blue', label: '📖 Learn', border: 'border-blue/30' },
  lab: { bg: 'bg-green-dim', text: 'text-green', label: '🧪 Lab', border: 'border-green/30' },
  challenge: { bg: 'bg-gold-dim', text: 'text-gold', label: '⚔️ Challenge', border: 'border-gold/30' },
  boss: { bg: 'bg-red-dim', text: 'text-red', label: '🐉 Boss', border: 'border-red/30' },
};

// === MCQ Component ===
function MCQChallenge({ q, onAnswer, soundEnabled }: { q: MCQQuestion; onAnswer: (correct: boolean) => void; soundEnabled: boolean }) {
  const [selected, setSelected] = useState<number | null>(null);

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === q.correctIndex;
    if (soundEnabled) playSound(correct ? 'correct' : 'wrong');
    setTimeout(() => onAnswer(correct), 1200);
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-5 leading-relaxed">{q.question}</h3>
      <div className="grid gap-2.5">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correctIndex;
          const isSelected = i === selected;
          let cls = 'option-btn';
          if (selected !== null) {
            if (isCorrect) cls += ' correct';
            else if (isSelected) cls += ' wrong';
            else cls += ' faded';
          }
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selected !== null}
              className={`${cls} p-4 rounded-xl text-left text-sm ${isSelected && !isCorrect ? 'animate-shake' : ''}`}
            >
              <span className="text-text-faint mr-2 font-mono text-xs">{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <div className={`p-4 rounded-xl text-sm ${selected === q.correctIndex ? 'bg-green-dim border border-green/20' : 'bg-red-dim border border-red/20'}`}>
            <span className="font-medium">{selected === q.correctIndex ? '✓ Correct' : '✗ Not quite'}</span>
            <p className="mt-1 text-text-dim">{q.explanation}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// === Prompt Build Component ===
function PromptBuildChallenge({ q, onAnswer, soundEnabled }: { q: PromptBuildQuestion; onAnswer: (correct: boolean) => void; soundEnabled: boolean }) {
  const [order, setOrder] = useState<number[]>(() => {
    // Start with shuffled indices
    const indices = q.components.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  });
  const [submitted, setSubmitted] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  function moveItem(fromIdx: number, toIdx: number) {
    if (submitted) return;
    const newOrder = [...order];
    const [item] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, item);
    setOrder(newOrder);
    if (soundEnabled) playSound('click');
  }

  function handleSubmit() {
    setSubmitted(true);
    const isCorrect = q.correctOrder.every((correctIdx, pos) => order[pos] === correctIdx);
    if (soundEnabled) playSound(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => onAnswer(isCorrect), 1500);
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2 leading-relaxed">{q.question}</h3>
      <p className="text-xs text-text-dim mb-4">Drag to reorder, or use the arrows. Position 1 = first in prompt.</p>

      <div className="grid gap-2">
        {order.map((compIdx, pos) => {
          let borderColor = 'border-border';
          if (submitted) {
            borderColor = q.correctOrder[pos] === compIdx ? 'border-green' : 'border-red';
          }
          return (
            <div
              key={compIdx}
              draggable={!submitted}
              onDragStart={() => setDragIdx(pos)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => { if (dragIdx !== null) moveItem(dragIdx, pos); setDragIdx(null); }}
              className={`drag-item flex items-center gap-2 p-3 rounded-xl border ${borderColor} bg-surface-2 ${dragIdx === pos ? 'dragging' : ''}`}
            >
              <span className="text-xs font-mono text-text-faint w-5 text-center">{pos + 1}</span>
              <code className="flex-1 text-xs text-text-dim leading-relaxed break-all">{q.components[compIdx]}</code>
              {!submitted && (
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => pos > 0 && moveItem(pos, pos - 1)} disabled={pos === 0} className="text-text-faint hover:text-text text-xs disabled:opacity-20">▲</button>
                  <button onClick={() => pos < order.length - 1 && moveItem(pos, pos + 1)} disabled={pos === order.length - 1} className="text-text-faint hover:text-text text-xs disabled:opacity-20">▼</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <button onClick={handleSubmit} className="w-full mt-4 py-3 bg-accent text-black rounded-xl font-semibold hover:bg-accent-bright transition-colors">
          Lock In Order
        </button>
      )}

      {submitted && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <div className={`p-4 rounded-xl text-sm ${q.correctOrder.every((c, i) => order[i] === c) ? 'bg-green-dim border border-green/20' : 'bg-red-dim border border-red/20'}`}>
            <span className="font-medium">{q.correctOrder.every((c, i) => order[i] === c) ? '✓ Perfect order!' : '✗ Not quite right'}</span>
            <p className="mt-1 text-text-dim">{q.explanation}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// === Spot the Error Component ===
function SpotErrorChallenge({ q, onAnswer, soundEnabled }: { q: SpotErrorQuestion; onAnswer: (correct: boolean) => void; soundEnabled: boolean }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  function toggle(idx: number) {
    if (submitted) return;
    const next = new Set(checked);
    if (next.has(idx)) next.delete(idx); else next.add(idx);
    setChecked(next);
    if (soundEnabled) playSound('click');
  }

  function handleSubmit() {
    setSubmitted(true);
    // Score: correct if all real issues are checked and no false positives
    const correct = q.issues.every((issue, i) =>
      issue.isIssue ? checked.has(i) : !checked.has(i)
    );
    if (soundEnabled) playSound(correct ? 'correct' : 'wrong');
    setTimeout(() => onAnswer(correct), 1500);
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 leading-relaxed">{q.question}</h3>

      <div className="prompt-display mb-4">{q.prompt}</div>

      <p className="text-xs text-text-dim mb-3">Select all the real issues (some options are distractors):</p>

      <div className="grid gap-2">
        {q.issues.map((issue, i) => {
          let cls = 'flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all';
          if (!submitted) {
            cls += checked.has(i) ? ' border-accent bg-accent/5' : ' border-border bg-surface-2 hover:border-border-active';
          } else {
            if (issue.isIssue && checked.has(i)) cls += ' border-green bg-green-dim';
            else if (issue.isIssue && !checked.has(i)) cls += ' border-gold bg-gold-dim';
            else if (!issue.isIssue && checked.has(i)) cls += ' border-red bg-red-dim';
            else cls += ' border-border bg-surface-2 opacity-50';
          }
          return (
            <div key={i} onClick={() => toggle(i)} className={cls}>
              <input type="checkbox" checked={checked.has(i)} readOnly className="issue-check mt-0.5" />
              <span className="text-sm flex-1">{issue.text}</span>
              {submitted && (
                <span className="text-xs">
                  {issue.isIssue ? (checked.has(i) ? '✓' : '⚠ missed') : (checked.has(i) ? '✗ not an issue' : '')}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <button onClick={handleSubmit} disabled={checked.size === 0} className="w-full mt-4 py-3 bg-accent text-black rounded-xl font-semibold hover:bg-accent-bright transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          Submit Analysis
        </button>
      )}

      {submitted && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <div className="p-4 rounded-xl text-sm bg-surface-3 border border-border">
            <p className="text-text-dim">{q.explanation}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// === Prompt Battle Component ===
function PromptBattleChallenge({ q, onAnswer, soundEnabled }: { q: PromptBattleQuestion; onAnswer: (correct: boolean) => void; soundEnabled: boolean }) {
  const [picked, setPicked] = useState<'A' | 'B' | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  function pickPrompt(choice: 'A' | 'B') {
    if (submitted) return;
    setPicked(choice);
    if (soundEnabled) playSound('click');
  }

  function toggleReason(idx: number) {
    if (submitted) return;
    const next = new Set(selectedReasons);
    if (next.has(idx)) next.delete(idx); else next.add(idx);
    setSelectedReasons(next);
  }

  function handleSubmit() {
    setSubmitted(true);
    const promptCorrect = picked === q.correctPrompt;
    const reasonsCorrect = q.reasons.every((r, i) =>
      r.isCorrect ? selectedReasons.has(i) : !selectedReasons.has(i)
    );
    const correct = promptCorrect && reasonsCorrect;
    if (soundEnabled) playSound(promptCorrect ? 'correct' : 'wrong');
    setTimeout(() => onAnswer(correct), 1500);
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 leading-relaxed">{q.question}</h3>

      <div className="grid gap-3 mb-4">
        {(['A', 'B'] as const).map(label => {
          const prompt = label === 'A' ? q.promptA : q.promptB;
          let borderCls = 'border-border';
          if (!submitted && picked === label) borderCls = 'border-accent';
          if (submitted) {
            if (label === q.correctPrompt) borderCls = 'border-green';
            else if (picked === label) borderCls = 'border-red';
          }
          return (
            <button
              key={label}
              onClick={() => pickPrompt(label)}
              disabled={submitted}
              className={`text-left rounded-xl border-2 p-4 transition-all ${borderCls} ${picked === label ? 'bg-surface-3' : 'bg-surface-2'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-mono px-2 py-0.5 rounded-md ${picked === label ? 'bg-accent/20 text-accent' : 'bg-surface text-text-dim'}`}>
                  Prompt {label}
                </span>
                {submitted && label === q.correctPrompt && <span className="text-green text-xs">✓ Better</span>}
              </div>
              <pre className="text-xs text-text-dim font-mono whitespace-pre-wrap leading-relaxed">{prompt}</pre>
            </button>
          );
        })}
      </div>

      {picked && !submitted && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <p className="text-sm text-text-dim mb-3">Why is Prompt {picked} better? Select all valid reasons:</p>
          <div className="grid gap-2 mb-4">
            {q.reasons.map((r, i) => (
              <div
                key={i}
                onClick={() => toggleReason(i)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedReasons.has(i) ? 'border-accent bg-accent/5' : 'border-border bg-surface-2 hover:border-border-active'
                }`}
              >
                <input type="checkbox" checked={selectedReasons.has(i)} readOnly className="issue-check" />
                <span className="text-sm">{r.text}</span>
              </div>
            ))}
          </div>
          <button onClick={handleSubmit} disabled={selectedReasons.size === 0} className="w-full py-3 bg-accent text-black rounded-xl font-semibold hover:bg-accent-bright transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Submit Answer
          </button>
        </motion.div>
      )}

      {submitted && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <div className={`p-4 rounded-xl text-sm ${picked === q.correctPrompt ? 'bg-green-dim border border-green/20' : 'bg-red-dim border border-red/20'}`}>
            <span className="font-medium">
              {picked === q.correctPrompt ? '✓ Right choice!' : `✗ Prompt ${q.correctPrompt} was better`}
            </span>
            <p className="mt-1 text-text-dim">{q.explanation}</p>
            {/* Show correct reasons */}
            <div className="mt-2 flex flex-wrap gap-1">
              {q.reasons.filter(r => r.isCorrect).map((r, i) => (
                <span key={i} className="text-xs bg-surface px-2 py-0.5 rounded-full text-text-dim">✓ {r.text}</span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// === Main QuestPanel ===
export default function QuestPanel({ node, gameState, onCompleteQuest, onClose }: Props) {
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [answered, setAnswered] = useState(false);

  function startQuest(quest: Quest) {
    setActiveQuest(quest);
    setCurrentQ(0);
    setCorrectCount(0);
    setShowResults(false);
    setAnswered(false);
    if (gameState.soundEnabled) playSound('click');
  }

  const handleAnswer = useCallback((correct: boolean) => {
    if (correct) setCorrectCount(c => c + 1);
    setAnswered(true);
  }, []);

  function handleNext() {
    if (currentQ < activeQuest!.questions.length - 1) {
      setCurrentQ(q => q + 1);
      setAnswered(false);
    } else {
      setShowResults(true);
      const total = activeQuest!.questions.length;
      const score = Math.round((correctCount / total) * 100);
      if (score >= 60) {
        setShowConfetti(true);
        if (gameState.soundEnabled) playSound('complete');
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
  }

  function handleFinish() {
    const total = activeQuest!.questions.length;
    const score = Math.round((correctCount / total) * 100);
    if (score >= 60) {
      onCompleteQuest(activeQuest!.id, score, activeQuest!.xpReward);
    }
    setActiveQuest(null);
    setShowConfetti(false);
  }

  function renderQuestion(q: Question) {
    const key = `${q.id}-${currentQ}`;
    switch (q.type) {
      case 'mcq':
        return <MCQChallenge key={key} q={q} onAnswer={handleAnswer} soundEnabled={gameState.soundEnabled} />;
      case 'prompt-build':
        return <PromptBuildChallenge key={key} q={q} onAnswer={handleAnswer} soundEnabled={gameState.soundEnabled} />;
      case 'spot-error':
        return <SpotErrorChallenge key={key} q={q} onAnswer={handleAnswer} soundEnabled={gameState.soundEnabled} />;
      case 'prompt-battle':
        return <PromptBattleChallenge key={key} q={q} onAnswer={handleAnswer} soundEnabled={gameState.soundEnabled} />;
    }
  }

  // Active quest - question view
  if (activeQuest && !showResults) {
    const q = activeQuest.questions[currentQ];
    const ts = typeStyles[activeQuest.type];
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-surface border border-border rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full ${ts.bg} ${ts.text}`}>{ts.label}</span>
              <span className="text-sm text-text-dim font-mono">{currentQ + 1}/{activeQuest.questions.length}</span>
            </div>
            <span className="text-sm text-gold font-medium">+{activeQuest.xpReward} XP</span>
          </div>

          {/* Progress */}
          <div className="w-full h-1 bg-surface-2 rounded-full mb-6">
            <div className="h-full xp-bar rounded-full transition-all duration-500" style={{ width: `${((currentQ + 1) / activeQuest.questions.length) * 100}%` }} />
          </div>

          {/* Question type indicator */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] uppercase tracking-widest text-text-faint font-mono">
              {q.type === 'mcq' && '📝 Multiple Choice'}
              {q.type === 'prompt-build' && '🏗️ Build the Prompt'}
              {q.type === 'spot-error' && '🔍 Spot the Error'}
              {q.type === 'prompt-battle' && '⚔️ Prompt Battle'}
            </span>
          </div>

          {/* Question content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderQuestion(q)}
            </motion.div>
          </AnimatePresence>

          {/* Next button */}
          {answered && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleNext}
              className="w-full mt-4 py-3 bg-accent/20 text-accent rounded-xl font-semibold hover:bg-accent/30 transition-colors border border-accent/20"
            >
              {currentQ < activeQuest.questions.length - 1 ? 'Next →' : 'See Results'}
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    );
  }

  // Results screen
  if (activeQuest && showResults) {
    const total = activeQuest.questions.length;
    const score = Math.round((correctCount / total) * 100);
    const passed = score >= 60;
    const perfect = score === 100;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <Confetti active={showConfetti} />
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-surface border border-border rounded-2xl max-w-md w-full p-8 text-center"
        >
          <div className="text-6xl mb-4 animate-score-pop">
            {perfect ? '💎' : passed ? '🎉' : '💪'}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {perfect ? 'Flawless Victory!' : passed ? 'Quest Complete!' : 'Not This Time'}
          </h2>
          <p className="text-text-dim mb-2">{correctCount}/{total} correct ({score}%)</p>

          {/* Score bar */}
          <div className="w-full h-2 bg-surface-2 rounded-full mb-6 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className={`h-full rounded-full ${passed ? 'bg-green' : 'bg-red'}`}
            />
          </div>

          {passed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gold text-xl font-bold mb-6"
            >
              +{activeQuest.xpReward} XP ⚡
              {gameState.streak >= 3 && <span className="text-sm ml-2">(+25 streak bonus)</span>}
            </motion.div>
          )}

          {!passed && (
            <p className="text-sm text-text-dim mb-6">
              Need 60% to pass. You got this.
            </p>
          )}

          <button
            onClick={handleFinish}
            className={`w-full py-3 rounded-xl font-semibold transition-colors ${
              passed ? 'bg-accent text-black hover:bg-accent-bright' : 'bg-surface-2 text-text border border-border hover:border-border-active'
            }`}
          >
            {passed ? 'Claim Rewards →' : 'Back to Quests'}
          </button>
        </motion.div>
      </motion.div>
    );
  }

  // Quest list
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-surface border border-border rounded-2xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto"
      >
        {/* Node header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-3xl">{node.emoji}</span>
              <h2 className="text-xl font-bold">{node.title}</h2>
            </div>
            <p className="text-sm text-text-dim">{node.description}</p>
          </div>
          <button onClick={onClose} className="text-text-dim hover:text-text text-xl p-1">✕</button>
        </div>

        {/* Quest cards */}
        <div className="grid gap-3">
          {node.quests.map(quest => {
            const done = gameState.completedQuests[quest.id]?.completed;
            const prevScore = gameState.completedQuests[quest.id]?.score;
            const ts = typeStyles[quest.type];
            const challengeTypes = new Set(quest.questions.map(q => q.type));

            return (
              <div key={quest.id} className={`quest-card rounded-xl p-4 ${done ? 'border-green/20' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${ts.bg} ${ts.text}`}>{ts.label}</span>
                    {done && <span className="text-xs text-green font-medium">✓ {prevScore}%</span>}
                  </div>
                  <span className="text-xs text-gold font-mono">+{quest.xpReward} XP</span>
                </div>

                <h3 className="font-semibold mb-1">{quest.title}</h3>
                <p className="text-sm text-text-dim mb-3">{quest.description}</p>

                {/* Challenge type badges */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-[10px] text-text-faint">{quest.questions.length} challenges:</span>
                  {challengeTypes.has('mcq') && <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-text-dim">📝 MCQ</span>}
                  {challengeTypes.has('prompt-build') && <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-text-dim">🏗️ Build</span>}
                  {challengeTypes.has('spot-error') && <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-text-dim">🔍 Error</span>}
                  {challengeTypes.has('prompt-battle') && <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-text-dim">⚔️ Battle</span>}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-faint">~{quest.timeMinutes} min</span>
                  {quest.resource && (
                    <a href={quest.resource.url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:text-accent-bright transition-colors">
                      📚 {quest.resource.source}
                    </a>
                  )}
                </div>

                <button
                  onClick={() => startQuest(quest)}
                  className={`w-full mt-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    done
                      ? 'bg-surface-2 border border-border text-text-dim hover:text-text hover:border-border-active'
                      : 'bg-accent/15 text-accent hover:bg-accent/25 border border-accent/20'
                  }`}
                >
                  {done ? 'Replay' : 'Start Quest'}
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
