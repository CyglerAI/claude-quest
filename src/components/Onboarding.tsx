'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserClass, TargetLevel, DailyTime, TimeFrame, PlayerProfile } from '@/lib/gameState';

const classes: { id: UserClass; emoji: string; title: string; desc: string }[] = [
  { id: 'beginner', emoji: '🌱', title: 'Beginner', desc: 'Never used AI tools before' },
  { id: 'practitioner', emoji: '⚡', title: 'Practitioner', desc: 'ChatGPT user, new to Claude' },
  { id: 'builder', emoji: '🔧', title: 'Builder', desc: 'Developer, wants API & Claude Code' },
  { id: 'architect', emoji: '🧠', title: 'Architect', desc: 'Wants multi-agent systems' },
];

const targets: { id: TargetLevel; title: string; desc: string }[] = [
  { id: 'casual', title: 'Casual User', desc: 'Productive daily use' },
  { id: 'power', title: 'Power User', desc: 'Projects, Memory, advanced prompting' },
  { id: 'developer', title: 'Developer', desc: 'API, Claude Code, tool use' },
  { id: 'agent-designer', title: 'Agent Designer', desc: 'MCP, Skills, multi-agent orchestration' },
];

const times: { value: DailyTime; label: string }[] = [
  { value: 15, label: '15 min/day' },
  { value: 30, label: '30 min/day' },
  { value: 60, label: '1 hour/day' },
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[0,1,2,3].map(i => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === step ? 'bg-accent' : i < step ? 'bg-accent-dim' : 'bg-border'}`} />
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
                <div className="text-5xl mb-4">⚔️</div>
                <h1 className="text-3xl font-bold mb-2">Claude Quest</h1>
                <p className="text-text-dim mb-8">Master Claude through interactive quests</p>
                <div className="mb-6">
                  <label className="block text-sm text-text-dim mb-2">What should we call you?</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && canNext && handleNext()}
                    placeholder="Your name"
                    className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-center text-lg focus:outline-none focus:border-accent"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-center mb-2">Who are you?</h2>
                <p className="text-text-dim text-center mb-6">Pick your starting class</p>
                <div className="grid gap-3">
                  {classes.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setUserClass(c.id)}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${
                        userClass === c.id
                          ? 'border-accent bg-accent/10 node-glow'
                          : 'border-border bg-surface hover:border-accent-dim'
                      }`}
                    >
                      <span className="text-3xl">{c.emoji}</span>
                      <div>
                        <div className="font-semibold">{c.title}</div>
                        <div className="text-sm text-text-dim">{c.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-center mb-2">Where do you want to go?</h2>
                <p className="text-text-dim text-center mb-6">Pick your target mastery level</p>
                <div className="grid gap-3">
                  {targets.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTarget(t.id)}
                      className={`p-4 rounded-lg border transition-all text-left ${
                        target === t.id
                          ? 'border-accent bg-accent/10 node-glow'
                          : 'border-border bg-surface hover:border-accent-dim'
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
                <h2 className="text-2xl font-bold text-center mb-2">How much time?</h2>
                <p className="text-text-dim text-center mb-6">Set your pace</p>
                <div className="mb-6">
                  <label className="block text-sm text-text-dim mb-3">Daily commitment</label>
                  <div className="grid grid-cols-3 gap-2">
                    {times.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setDaily(t.value)}
                        className={`py-3 px-2 rounded-lg border text-sm font-medium transition-all ${
                          daily === t.value
                            ? 'border-accent bg-accent/10'
                            : 'border-border bg-surface hover:border-accent-dim'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-text-dim mb-3">Target timeline</label>
                  <div className="grid grid-cols-3 gap-2">
                    {frames.map(f => (
                      <button
                        key={f.value}
                        onClick={() => setFrame(f.value)}
                        className={`py-3 px-2 rounded-lg border text-sm font-medium transition-all ${
                          frame === f.value
                            ? 'border-accent bg-accent/10'
                            : 'border-border bg-surface hover:border-accent-dim'
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
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          disabled={!canNext}
          className={`w-full mt-8 py-3 rounded-lg font-semibold text-lg transition-all ${
            canNext
              ? 'bg-accent text-black hover:bg-accent/90'
              : 'bg-border text-text-dim cursor-not-allowed'
          }`}
        >
          {step < 3 ? 'Continue' : 'Begin Your Quest →'}
        </motion.button>

        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="w-full mt-3 py-2 text-text-dim hover:text-text text-sm">
            ← Back
          </button>
        )}
      </motion.div>
    </div>
  );
}
