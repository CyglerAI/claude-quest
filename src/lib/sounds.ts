// Enhanced Web Audio API sound system

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

function ctx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

export function toggleSound(): boolean {
  soundEnabled = !soundEnabled;
  return soundEnabled;
}

export function isSoundOn(): boolean {
  return soundEnabled;
}

function note(freq: number, start: number, duration: number, type: OscillatorType = 'sine', volume = 0.12) {
  const c = ctx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + start);
  gain.gain.setValueAtTime(volume, c.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + duration);
}

function noise(start: number, duration: number, volume = 0.05) {
  const c = ctx();
  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const gain = c.createGain();
  const filter = c.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 2000;
  gain.gain.setValueAtTime(volume, c.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + duration);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  src.start(c.currentTime + start);
  src.stop(c.currentTime + start + duration);
}

export type SoundType =
  | 'playerAttack' | 'enemyAttack' | 'crit' | 'combo'
  | 'victory' | 'defeat' | 'bossPhase' | 'levelup'
  | 'itemDrop' | 'click' | 'questEnter' | 'correct' | 'wrong'
  | 'comboBreak' | 'equip' | 'mapMove';

export function playSound(type: SoundType) {
  if (!soundEnabled) return;
  try {
    switch (type) {
      case 'playerAttack':
        // Quick rising hit
        note(220, 0, 0.08, 'sawtooth', 0.08);
        note(440, 0.02, 0.1, 'square', 0.06);
        noise(0, 0.06, 0.08);
        break;

      case 'crit':
        // Dramatic chord with shimmer
        note(330, 0, 0.3, 'sawtooth', 0.1);
        note(440, 0.03, 0.3, 'square', 0.08);
        note(660, 0.06, 0.35, 'sine', 0.1);
        note(880, 0.1, 0.3, 'sine', 0.08);
        noise(0, 0.08, 0.12);
        break;

      case 'enemyAttack':
        // Low menacing thud
        note(100, 0, 0.2, 'sawtooth', 0.12);
        note(60, 0.05, 0.25, 'triangle', 0.1);
        noise(0, 0.1, 0.1);
        break;

      case 'combo':
        // Escalating ping
        note(523, 0, 0.1, 'sine', 0.1);
        note(659, 0.05, 0.1, 'sine', 0.1);
        note(784, 0.1, 0.15, 'sine', 0.12);
        break;

      case 'comboBreak':
        // Descending wobble
        note(400, 0, 0.15, 'sawtooth', 0.08);
        note(250, 0.08, 0.2, 'sawtooth', 0.06);
        break;

      case 'victory':
        // Triumphant fanfare
        note(392, 0, 0.2, 'square', 0.1);
        note(494, 0.15, 0.2, 'square', 0.1);
        note(587, 0.3, 0.2, 'square', 0.1);
        note(784, 0.45, 0.4, 'sine', 0.15);
        note(659, 0.45, 0.4, 'sine', 0.08);
        note(523, 0.45, 0.4, 'sine', 0.06);
        break;

      case 'defeat':
        // Somber minor descend
        note(440, 0, 0.3, 'sine', 0.1);
        note(370, 0.2, 0.3, 'sine', 0.1);
        note(311, 0.4, 0.3, 'sine', 0.1);
        note(262, 0.6, 0.5, 'sine', 0.12);
        break;

      case 'bossPhase':
        // Dramatic transition
        note(150, 0, 0.3, 'sawtooth', 0.12);
        note(200, 0.1, 0.3, 'sawtooth', 0.1);
        note(300, 0.2, 0.3, 'square', 0.1);
        noise(0, 0.15, 0.12);
        break;

      case 'levelup':
        // Ascending triumph
        note(392, 0, 0.15, 'sine', 0.12);
        note(523, 0.12, 0.15, 'sine', 0.12);
        note(659, 0.24, 0.15, 'sine', 0.12);
        note(784, 0.36, 0.3, 'sine', 0.15);
        break;

      case 'itemDrop':
        // Sparkly treasure
        note(800, 0, 0.1, 'sine', 0.08);
        note(1000, 0.08, 0.1, 'sine', 0.08);
        note(1200, 0.16, 0.15, 'sine', 0.1);
        note(1600, 0.24, 0.2, 'sine', 0.08);
        break;

      case 'click':
        note(800, 0, 0.04, 'sine', 0.04);
        break;

      case 'correct':
        note(523, 0, 0.12, 'sine', 0.1);
        note(659, 0.08, 0.15, 'sine', 0.1);
        break;

      case 'wrong':
        note(200, 0, 0.15, 'sawtooth', 0.08);
        note(150, 0.1, 0.2, 'sawtooth', 0.06);
        break;

      case 'questEnter':
        // Dungeon door opening
        note(150, 0, 0.3, 'triangle', 0.08);
        note(200, 0.15, 0.3, 'triangle', 0.08);
        note(300, 0.3, 0.2, 'sine', 0.1);
        noise(0, 0.2, 0.06);
        break;

      case 'equip':
        note(500, 0, 0.08, 'sine', 0.08);
        note(700, 0.06, 0.12, 'sine', 0.1);
        break;

      case 'mapMove':
        note(600, 0, 0.06, 'sine', 0.04);
        break;
    }
  } catch {
    // Audio not available
  }
}
