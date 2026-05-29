// Nervous system regulation audio engine
// Frequencies anchored in 500Hz–4kHz safety range (prosodic voice band)
// Binaural beats, warm pad synthesis, algorithmic reverb, filtered noise

export type AudioMode = "calm" | "ground" | "drift";

// Shared breath rhythm — all modulation entrains to this rate
// ~5.7 breaths/min, matches visual-canvas.tsx for cross-modal coherence
const BREATH_HZ = 0.095;

interface ModeConfig {
  carrierFreq: number;
  binauralOffset: number;
  droneFreqs: number[];
  padFreqs: number[];
  noiseGain: number;
  lfoRate: number;
  filterBrightness: number;
  reverbWet: number;
  label: string;
  description: string;
}

export const MODES: Record<AudioMode, ModeConfig> = {
  calm: {
    carrierFreq: 580,
    binauralOffset: 4,
    droneFreqs: [580, 870, 1160],
    padFreqs: [580, 597, 1160, 1195], // ~3% detune (was ~6%)
    noiseGain: 0.021, // ×0.7 for softer air texture
    lfoRate: BREATH_HZ,
    filterBrightness: 2200, // slightly open
    reverbWet: 0.30,
    label: "Calm",
    description: "Theta waves for deep relaxation",
  },
  ground: {
    carrierFreq: 520,
    binauralOffset: 7.83,
    droneFreqs: [520, 780, 1040],
    padFreqs: [520, 536, 1040, 1072],
    noiseGain: 0.028,
    lfoRate: BREATH_HZ,
    filterBrightness: 1800, // darker, thicker
    reverbWet: 0.25, // dryer, more present
    label: "Ground",
    description: "Earth frequency for grounding",
  },
  drift: {
    carrierFreq: 660,
    binauralOffset: 2.5,
    droneFreqs: [660, 990, 1320],
    padFreqs: [660, 680, 1320, 1360],
    noiseGain: 0.0175,
    lfoRate: BREATH_HZ,
    filterBrightness: 2400, // airier, more spacious
    reverbWet: 0.40, // most reverberant
    label: "Drift",
    description: "Deep delta for spacing out",
  },
};

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private masterHighpass: BiquadFilterNode | null = null;
  private masterLowpass: BiquadFilterNode | null = null;
  private nodes: AudioNode[] = [];
  private oscillators: OscillatorNode[] = [];
  private isPlaying = false;
  private currentMode: AudioMode = "calm";
  private analyser: AnalyserNode | null = null;
  private frequencyData: Uint8Array = new Uint8Array(0);
  private volumeLevel = 0.7;

  async start(mode: AudioMode = "calm") {
    if (this.isPlaying) {
      await this.stop();
    }

    this.currentMode = mode;
    this.ctx = new AudioContext();
    const config = MODES[mode];

    const targetGain = this.volumeLevel * 0.5;

    // Master gain with slow fade in (5s exponential ramp)
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(
      targetGain,
      this.ctx.currentTime + 5,
    );

    // Master EQ: remove threatening rumble and harsh brightness
    this.masterHighpass = this.ctx.createBiquadFilter();
    this.masterHighpass.type = "highpass";
    this.masterHighpass.frequency.value = 100;
    this.masterHighpass.Q.value = 0.7;

    this.masterLowpass = this.ctx.createBiquadFilter();
    this.masterLowpass.type = "lowpass";
    this.masterLowpass.frequency.value = 4000;
    this.masterLowpass.Q.value = 0.7;

    // Signal chain: masterGain → highpass → lowpass → [dry/wet split]
    this.masterGain.connect(this.masterHighpass);
    this.masterHighpass.connect(this.masterLowpass);

    // Reverb: mode-specific wet/dry split
    const { dry, wet } = this.createReverb(config.reverbWet);
    this.masterLowpass.connect(dry);
    this.masterLowpass.connect(wet);

    // Analyser for visual reactivity (taps EQ'd signal)
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.masterLowpass.connect(this.analyser);

    this.nodes.push(this.masterHighpass, this.masterLowpass);

    // Binaural beat pair (stereo separation) — subtle background texture
    this.createBinauralBeat(config.carrierFreq, config.binauralOffset);

    // Warm drone layers (triangle + gentle chorusing)
    for (const freq of config.droneFreqs) {
      this.createDrone(freq);
    }

    // Warm pad (detuned pairs for richness)
    this.createWarmPad(config.padFreqs, config.filterBrightness);

    // Filtered noise (air/breath texture)
    this.createFilteredNoise(config.noiseGain);

    // Breath-paced master volume modulation
    this.createMasterBreathing(targetGain);

    this.isPlaying = true;
  }

  private createReverb(reverbWet: number): { dry: GainNode; wet: GainNode } {
    if (!this.ctx) throw new Error("No AudioContext");

    // Generate impulse response: 0.8s decay
    const length = Math.floor(this.ctx.sampleRate * 0.8);
    const impulse = this.ctx.createBuffer(2, length, this.ctx.sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        const decay = Math.pow(1 - i / length, 2.5);
        data[i] = (Math.random() * 2 - 1) * decay;
        // Simple high-frequency rolloff: average with previous sample
        if (i > 0) {
          data[i] = data[i] * 0.6 + data[i - 1] * 0.4;
        }
      }
    }

    const convolver = this.ctx.createConvolver();
    convolver.buffer = impulse;

    // Dry path (mode-specific)
    const dry = this.ctx.createGain();
    dry.gain.value = 1 - reverbWet;
    dry.connect(this.ctx.destination);

    // Wet path (mode-specific)
    const wetGain = this.ctx.createGain();
    wetGain.gain.value = reverbWet;
    wetGain.connect(convolver);
    convolver.connect(this.ctx.destination);

    this.nodes.push(dry, wetGain, convolver);
    return { dry, wet: wetGain };
  }

  private createBinauralBeat(carrier: number, offset: number) {
    if (!this.ctx || !this.masterGain) return;

    const merger = this.ctx.createChannelMerger(2);
    const gainL = this.ctx.createGain();
    const gainR = this.ctx.createGain();
    gainL.gain.value = 0.06; // subtle, not dominant (was 0.12)
    gainR.gain.value = 0.06;

    // Left ear — sine keeps binaural beat clean
    const oscL = this.ctx.createOscillator();
    oscL.type = "sine";
    oscL.frequency.value = carrier;
    oscL.connect(gainL);
    gainL.connect(merger, 0, 0);

    // Right ear (offset for binaural beat)
    const oscR = this.ctx.createOscillator();
    oscR.type = "sine";
    oscR.frequency.value = carrier + offset;
    oscR.connect(gainR);
    gainR.connect(merger, 0, 1);

    merger.connect(this.masterGain);

    oscL.start();
    oscR.start();
    this.oscillators.push(oscL, oscR);
    this.nodes.push(gainL, gainR, merger);
  }

  private createDrone(freq: number) {
    if (!this.ctx || !this.masterGain) return;

    // Primary: triangle wave for richer harmonics
    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;

    // Chorus: second oscillator gently detuned (was +3Hz, now +1.2Hz)
    const osc2 = this.ctx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.value = freq + 1.2;

    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.value = 0.5; // gentler chorus blend (was 0.6)

    // Breath-paced amplitude modulation (shared rate, no random jitter)
    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = BREATH_HZ;

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.02; // was 0.03

    const droneGain = this.ctx.createGain();
    droneGain.gain.value = 0.05; // warmer presence (was 0.04)

    // Lowpass lets warmth through
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = freq * 3;
    filter.Q.value = 0.7;

    lfo.connect(lfoGain);
    lfoGain.connect(droneGain.gain);

    osc.connect(filter);
    osc2.connect(osc2Gain);
    osc2Gain.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(this.masterGain);

    osc.start();
    osc2.start();
    lfo.start();
    this.oscillators.push(osc, osc2, lfo);
    this.nodes.push(osc2Gain, lfoGain, droneGain, filter);
  }

  private createWarmPad(padFreqs: number[], filterBrightness: number) {
    if (!this.ctx || !this.masterGain) return;

    // Pairs of detuned triangle oscillators through a warm lowpass
    for (let i = 0; i < padFreqs.length; i += 2) {
      const f1 = padFreqs[i];
      const f2 = padFreqs[i + 1];
      if (f2 === undefined) break;

      const osc1 = this.ctx.createOscillator();
      osc1.type = "triangle";
      osc1.frequency.value = f1;

      const osc2 = this.ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.value = f2;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = filterBrightness; // mode-specific (was 2000)
      filter.Q.value = 0.7;

      // Breath-paced LFO (shared rate, no random jitter)
      const lfo = this.ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = BREATH_HZ;

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 0.012; // was 0.015

      const padGain = this.ctx.createGain();
      padGain.gain.value = 0.045; // warmer dominance (was 0.03)

      lfo.connect(lfoGain);
      lfoGain.connect(padGain.gain);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(padGain);
      padGain.connect(this.masterGain);

      osc1.start();
      osc2.start();
      lfo.start();
      this.oscillators.push(osc1, osc2, lfo);
      this.nodes.push(filter, lfoGain, padGain);
    }
  }

  private createFilteredNoise(gain: number) {
    if (!this.ctx || !this.masterGain) return;

    // Generate pink-ish noise buffer
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Lowpass for air/breath texture (was bandpass @ 800Hz — too hissy)
    const bp = this.ctx.createBiquadFilter();
    bp.type = "lowpass";
    bp.frequency.value = 1200;
    bp.Q.value = 0.6;

    // Breath-paced filter modulation (gentler sweep)
    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = BREATH_HZ;

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 60; // was 150 — much smaller sweep

    lfo.connect(lfoGain);
    lfoGain.connect(bp.frequency);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = gain;

    noise.connect(bp);
    bp.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start();
    lfo.start();
    this.oscillators.push(lfo);
    this.nodes.push(noise as unknown as AudioNode, bp, lfoGain, noiseGain);
  }

  private createMasterBreathing(targetGain: number) {
    if (!this.ctx || !this.masterGain) return;

    // Breath-paced LFO (~5.7 bpm) modulates master volume
    // 20% depth creates natural micro-pauses at breath troughs
    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = BREATH_HZ; // was 0.015

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = targetGain * 0.20; // was 0.15

    lfo.connect(lfoGain);
    lfoGain.connect(this.masterGain.gain);

    lfo.start();
    this.oscillators.push(lfo);
    this.nodes.push(lfoGain);
  }

  // Smooth crossfade to new mode (no silence gap)
  async crossfadeTo(newMode: AudioMode) {
    if (!this.isPlaying || !this.ctx || !this.masterGain) {
      return this.start(newMode);
    }

    const oldCtx = this.ctx;
    const oldMasterGain = this.masterGain;
    const oldOscillators = this.oscillators;
    const oldNodes = this.nodes;
    const oldAnalyser = this.analyser;

    // Fade old out over 4s (was 1.5s) with exponential curve
    oldMasterGain.gain.exponentialRampToValueAtTime(
      0.001,
      oldCtx.currentTime + 4,
    );

    // Reset instance state for new context
    this.ctx = null;
    this.masterGain = null;
    this.masterHighpass = null;
    this.masterLowpass = null;
    this.oscillators = [];
    this.nodes = [];
    this.analyser = null;
    this.isPlaying = false;

    // Start new mode (builds new context, fades in)
    await this.start(newMode);

    // Clean up old context after crossfade completes
    setTimeout(async () => {
      for (const osc of oldOscillators) {
        try {
          osc.stop();
        } catch {}
      }
      for (const node of oldNodes) {
        try {
          node.disconnect();
        } catch {}
      }
      if (oldAnalyser) {
        try {
          oldAnalyser.disconnect();
        } catch {}
      }
      try {
        await oldCtx.close();
      } catch {}
    }, 4200); // was 1600
  }

  setVolume(level: number) {
    this.volumeLevel = Math.max(0, Math.min(1, level));
    if (this.ctx && this.masterGain) {
      const target = this.volumeLevel * 0.5;
      if (target < 0.001) {
        this.masterGain.gain.linearRampToValueAtTime(
          0,
          this.ctx.currentTime + 0.3,
        );
      } else {
        this.masterGain.gain.exponentialRampToValueAtTime(
          target,
          this.ctx.currentTime + 0.3,
        );
      }
    }
  }

  getFrequencyData(): Uint8Array {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(this.frequencyData);
    }
    return this.frequencyData;
  }

  getAverageFrequency(): number {
    const data = this.getFrequencyData();
    if (data.length === 0) return 0;
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    return sum / data.length / 255;
  }

  async stop() {
    if (!this.ctx) return;

    // Fade out over 4s (was 2s) with exponential curve
    if (this.masterGain) {
      this.masterGain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + 4,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 4200)); // was 2100

    for (const osc of this.oscillators) {
      try {
        osc.stop();
      } catch {}
    }
    for (const node of this.nodes) {
      try {
        node.disconnect();
      } catch {}
    }

    this.oscillators = [];
    this.nodes = [];

    await this.ctx.close();
    this.ctx = null;
    this.masterGain = null;
    this.masterHighpass = null;
    this.masterLowpass = null;
    this.analyser = null;
    this.isPlaying = false;
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  getMode() {
    return this.currentMode;
  }
}
