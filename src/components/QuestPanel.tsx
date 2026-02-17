'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SkillNode, Quest, Question } from '@/data/quests';
import type { GameState, QuestProgress } from '@/lib/gameState';

interface Props {
  node: SkillNode;
  gameState: GameState;
  onCompleteQuest: (questId: string, score: number, xp: number) => void;
  onClose: () => void;
}

const typeColors: Record<string, { bg: string; text: string; label: string }> = {
  learn: { bg: 'bg-blue/10', text: 'text-blue', label: '📖 Learn' },
  lab: { bg: 'bg-green/10', text: 'text-green', label: '🧪 Lab' },
  challenge: { bg: 'bg-gold/10', text: 'text-gold', label: '⚔️ Challenge' },
  boss: { bg: 'bg-red/10', text: 'text-red', label: '🏆 Boss' },
};

export default function QuestPanel({ node, gameState, onCompleteQuest, onClose }: Props) {
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResults, setShowResults] = useState(false);

  function startQuest(quest: Quest) {
    setActiveQuest(quest);
    setCurrentQ(0);
    setSelected(null);
    setShowExplanation(false);
    setCorrectCount(0);
    setShowResults(false);
  }

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    setShowExplanation(true);
    if (idx === activeQuest!.questions[currentQ].correctIndex) {
      setCorrectCount(c => c + 1);
    }
  }

  function handleNext() {
    if (currentQ < activeQuest!.questions.length - 1) {
      setCurrentQ(q => q + 1);
      setSelected(null);
      setShowExplanation(false);
    } else {
      setShowResults(true);
    }
  }

  function handleFinish() {
    const total = activeQuest!.questions.length;
    const score = Math.round((correctCount / total) * 100);
    const passed = score >= 60;
    if (passed) {
      onCompleteQuest(activeQuest!.id, score, activeQuest!.xpReward);
    }
    setActiveQuest(null);
  }

  // Quest in progress
  if (activeQuest && !showResults) {
    const q = activeQuest.questions[currentQ];
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-surface border border-border rounded-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${typeColors[activeQuest.type].bg} ${typeColors[activeQuest.type].text}`}>
                {typeColors[activeQuest.type].label}
              </span>
              <span className="text-sm text-text-dim">
                {currentQ + 1}/{activeQuest.questions.length}
              </span>
            </div>
            <span className="text-sm text-gold font-medium">+{activeQuest.xpReward} XP</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-surface-2 rounded-full mb-6">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${((currentQ + 1) / activeQuest.questions.length) * 100}%` }}
            />
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-lg font-semibold mb-5">{q.question}</h3>

              <div className="grid gap-3 mb-5">
                {q.options.map((opt, i) => {
                  const isCorrect = i === q.correctIndex;
                  const isSelected = i === selected;
                  let borderClass = 'border-border hover:border-accent-dim';
                  if (selected !== null) {
                    if (isCorrect) borderClass = 'border-green bg-green/10';
                    else if (isSelected) borderClass = 'border-red bg-red/10';
                    else borderClass = 'border-border opacity-50';
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(i)}
                      disabled={selected !== null}
                      className={`p-4 rounded-lg border text-left transition-all ${borderClass}`}
                    >
                      <span className="text-sm">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-5"
                >
                  <div className={`p-4 rounded-lg border ${selected === q.correctIndex ? 'bg-green/5 border-green/30' : 'bg-red/5 border-red/30'}`}>
                    <div className="text-sm font-medium mb-1">
                      {selected === q.correctIndex ? '✅ Correct!' : '❌ Not quite'}
                    </div>
                    <div className="text-sm text-text-dim">{q.explanation}</div>
                  </div>
                </motion.div>
              )}

              {selected !== null && (
                <button
                  onClick={handleNext}
                  className="w-full py-3 bg-accent text-black rounded-lg font-semibold hover:bg-accent/90 transition-colors"
                >
                  {currentQ < activeQuest.questions.length - 1 ? 'Next Question →' : 'See Results'}
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    );
  }

  // Results screen
  if (activeQuest && showResults) {
    const total = activeQuest.questions.length;
    const score = Math.round((correctCount / total) * 100);
    const passed = score >= 60;
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-surface border border-border rounded-2xl max-w-md w-full p-8 text-center"
        >
          <div className="text-6xl mb-4 score-pop">
            {passed ? '🎉' : '💪'}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {passed ? 'Quest Complete!' : 'Not This Time'}
          </h2>
          <p className="text-text-dim mb-6">
            {correctCount}/{total} correct ({score}%)
          </p>

          {passed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gold text-xl font-bold mb-6"
            >
              +{activeQuest.xpReward} XP ⚡
            </motion.div>
          )}

          {!passed && (
            <p className="text-sm text-text-dim mb-6">
              You need 60% to pass. Review the material and try again!
            </p>
          )}

          <button
            onClick={handleFinish}
            className="w-full py-3 bg-accent text-black rounded-lg font-semibold hover:bg-accent/90"
          >
            {passed ? 'Claim Rewards' : 'Back to Quests'}
          </button>
        </motion.div>
      </motion.div>
    );
  }

  // Quest list for this node
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-surface border border-border rounded-2xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{node.emoji}</span>
              <h2 className="text-xl font-bold">{node.title}</h2>
            </div>
            <p className="text-sm text-text-dim">{node.description}</p>
          </div>
          <button onClick={onClose} className="text-text-dim hover:text-text text-xl">✕</button>
        </div>

        <div className="grid gap-3">
          {node.quests.map(quest => {
            const done = gameState.completedQuests[quest.id]?.completed;
            const tc = typeColors[quest.type];
            return (
              <div
                key={quest.id}
                className={`quest-card p-4 rounded-xl border ${done ? 'border-green/30 bg-green/5' : 'border-border bg-surface-2'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${tc.bg} ${tc.text}`}>{tc.label}</span>
                    {done && <span className="text-xs text-green">✅ Done</span>}
                  </div>
                  <span className="text-xs text-gold">+{quest.xpReward} XP</span>
                </div>
                <h3 className="font-semibold mb-1">{quest.title}</h3>
                <p className="text-sm text-text-dim mb-3">{quest.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-dim">~{quest.timeMinutes} min • {quest.questions.length} questions</span>
                  {quest.resource && (
                    <a
                      href={quest.resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline"
                    >
                      📚 {quest.resource.source}
                    </a>
                  )}
                </div>

                <button
                  onClick={() => startQuest(quest)}
                  className={`w-full mt-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    done
                      ? 'bg-surface border border-border text-text-dim hover:text-text'
                      : 'bg-accent/20 text-accent hover:bg-accent/30'
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
