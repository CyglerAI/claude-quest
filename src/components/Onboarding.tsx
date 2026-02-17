'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserClass, TargetLevel, DailyTime, TimeFrame, PlayerProfile } from '@/lib/gameState';

const classes: { id: UserClass; emoji: string; title: string; desc: string; flavor: string }[] = [
  { id: 'beginner', emoji: '🌱', title: 'Newcomer', desc: 'Never used AI tools before', flavor: 'Everyone starts somewhere. You\'ll be dangerous in no time.' },
  { id: 'practitioner', emoji: '⚡', title: 'Practitioner', desc: 'ChatGPT user, new to Claude', flavor: 'You know AI. Now learn what Claude does differently.' },
  { id: 'builder', emoji: '🔧', title: 'Builder', desc: 'Developer, wants API & Claude Code', flavor: 'Skip the basics. Go straight to building things.' },
  { id: 'architect', emoji: '🧠', title: 'Architect', desc: 'Wants multi-agent systems', flavor: 'You want the deep end. Respect.' },
];

const targets: { id: TargetLevel; title: string; desc: string }[] = [
  { id: 'casual', title: 'Productive Daily Use', desc: 'Get more done with Claude every day' },
  { id: 'power', title: 'Power User', desc: 'Projects, Memory, advanced prompting' },
  { id: 'developer', title: 'Developer Integration', desc: 'API, Claude Code, tool use' },
  { id: 'agent-designer', title: 'Agent Architect', desc: 'MCP, multi-agent orchestration' },
];

const times: { value: DailyTime; label: string }[] = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
];

const frames: { value: TimeFrame; label: string }[] = [
  { value: '2weeks', label: '2 weeks' },
  { value: '1month', label: '1 month' },
  { value: '3months', label: '3 months' },
];

interface Props {
  onComplete: (profile: PlayerProfile) => void;
}

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [userClass, setUserClass] = useState<UserClass | null>(null);
  const [target, setTarget] = useState<TargetLevel | null>(null);
  const [daily, setDaily] = useState<DailyTime>(30);
  const [frame, setFrame] = useState<TimeFrame>('1month');

  const canNext = step === 0 ? name.trim().length > 0 :
                  step === 1 ? userClass !== null :
                  step === 2 ? target !== null : true;

  function handleNext() {
    if (step < 3) setStep(step + 1);
    else {
      onComplete({
        name: name.trim(),
        userClass: userClass!,
        targetLevel: target!,
        dailyMinutes: daily,
        timeFrame: frame,
        createdAt: Date.now(),
      });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="grid-bg" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full relative z-10"
      >
        {/* Progress */}
        <div className="flex justify-center gap-2 mb-8">
          {[0,1,2,3].map(i => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${
              i === step ? 'w-8 bg-accent' : i < step ? 'w-8 bg-accent-dim' : 'w-8 bg-border'
            }`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && (
              <div className="text-center">
                <motion.div
                  className="text-6xl mb-6"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  ⚔️
                </motion.div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-accent to-purple bg-clip-text text-transparent">
                  Claude Quest
                </h1>
                <p className="text-text-dim mb-1">Master Claude through interactive challenges</p>
                <p className="text-xs text-text-faint mb-8">Not just quizzes. Build prompts, spot errors, compare approaches.</p>
                <div className="mb-6">
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && canNext && handleNext()}
                    placeholder="What should we call you?"
                    className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3.5 text-center text-lg focus:outline-none focus:border-accent transition-colors"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-center mb-1">Choose your class</h2>
                <p className="text-text-dim text-center mb-6 text-sm">This unlocks different starting nodes</p>
                <div className="grid gap-3">
                  {classes.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setUserClass(c.id)}
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${
                        userClass === c.id
                          ? 'border-accent bg-accent/5 glow-accent'
                          : 'border-border bg-surface hover:border-border-active'
                      }`}
                    >
                      <span className="text-3xl mt-0.5">{c.emoji}</span>
                      <div>
                        <div className="font-semibold">{c.title}</div>
                        <div className="text-sm text-text-dim">{c.desc}</div>
                        {userClass === c.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-xs text-accent mt-1 italic"
                          >
                            {c.flavor}
                          </motion.div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-center mb-1">Where are you headed?</h2>
                <p className="text-text-dim text-center mb-6 text-sm">Pick your target mastery level</p>
                <div className="grid gap-3">
                  {targets.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTarget(t.id)}
                      className={`p-4 rounded-xl border transition-all text-left ${
                        target === t.id
                          ? 'border-accent bg-accent/5 glow-accent'
                          : 'border-border bg-surface hover:border-border-active'
                      }`}
                    >
                      <div className="font-semibold">{t.title}</div>
                      <div className="text-sm text-text-dim">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-center mb-1">Set your pace</h2>
                <p className="text-text-dim text-center mb-6 text-sm">No pressure. You can always change this.</p>
                <div className="mb-6">
                  <label className="block text-xs text-text-faint uppercase tracking-wider mb-3">Daily time</label>
                  <div className="grid grid-cols-3 gap-2">
                    {times.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setDaily(t.value)}
                        className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                          daily === t.value
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border bg-surface hover:border-border-active text-text-dim'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-text-faint uppercase tracking-wider mb-3">Timeline</label>
                  <div className="grid grid-cols-3 gap-2">
                    {frames.map(f => (
                      <button
                        key={f.value}
                        onClick={() => setFrame(f.value)}
                        className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                          frame === f.value
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border bg-surface hover:border-border-active text-text-dim'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleNext}
          disabled={!canNext}
          className={`w-full mt-8 py-3.5 rounded-xl font-semibold text-lg transition-all ${
            canNext
              ? 'bg-accent text-black hover:bg-accent-bright'
              : 'bg-border text-text-faint cursor-not-allowed'
          }`}
        >
          {step < 3 ? 'Continue' : 'Begin Your Quest →'}
        </motion.button>

        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="w-full mt-3 py-2 text-text-dim hover:text-text text-sm transition-colors">
            ← Back
          </button>
        )}
      </motion.div>
    </div>
  );
}
