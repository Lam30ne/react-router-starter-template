// Nervous system regulation audio engine
// Frequencies anchored in 500Hz–4kHz safety range (prosodic voice band)
// Binaural beats, warm pad synthesis, algorithmic reverb, filtered noise
// Single AudioContext reused across modes via suspend/resume

export type AudioMode = "calm" | "ground" | "drift";

interface ModeConfig {
  carrierFreq: number;
  binauralOffset: number;
  droneFreqs: number[];
  padFreqs: number[]; // Detuned pairs for warm chorusing
  noiseGain: number;
  lfoRate: number;
  label: string;
  description: string;
}

export const MODES: Record<AudioMode, ModeConfig> = {
  calm: {
    carrierFreq: 580, // Prosodic speech range
    binauralOffset: 4, // 4Hz theta — deep relaxation
    droneFreqs: [580, 870, 1160],
    padFreqs: [580, 614, 1160, 1228], // ~6% detuned pairs
    noiseGain: 0.03,
    lfoRate: 0.08,
    label: "Calm",
    description: "Theta waves for deep relaxation",
  },
  ground: {
    carrierFreq: 520,
    binauralOffset: 7.83, // Schumann resonance
    droneFreqs: [520, 780, 1040],
    padFreqs: [520, 550, 1040, 1100],
    noiseGain: 0.04,
    lfoRate: 0.05,
    label: "Ground",
    description: "Earth frequency for grounding",
  },
  drift: {
    carrierFreq: 660,
    binauralOffset: 2.5, // Delta border — spacey state
    droneFreqs: [660, 990, 1320],
    padFreqs: [660, 698, 1320, 1395],
    noiseGain: 0.025,
    lfoRate: 0.03,
    label: "Drift",
    description: "Deep delta for spacing out",
  },
};

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private nodes: AudioNode[] = [];
  private oscillators: OscillatorNode[] = [];
  private isPlaying = false;
  private currentMode: AudioMode = "calm";
  private analyser: AnalyserNode | null = null;
  private frequencyData: Uint8Array = new Uint8Array(0);
  private volumeLevel = 0.7;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  async start(mode: AudioMode = "calm") {
    if (this.isPlaying) {
      this.teardownNodes();
    }

    this.currentMode = mode;
    const ctx = this.ensureContext();

    // Resume if suspended (iOS requires user gesture)
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    const config = MODES[mode];
    const targetGain = this.volumeLevel * 0.5;

    // Master gain with slow fade in
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(
      targetGain,
      ctx.currentTime + 3,
    );

    // Reverb: wet/dry split
    const { dry, wet } = this.createReverb();
    this.masterGain.connect(dry);
    this.masterGain.connect(wet);

    // Analyser for visual reactivity
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.masterGain.connect(this.analyser);

    this.createBinauralBeat(config.carrierFreq, config.binauralOffset);
    for (const freq of config.droneFreqs) {
      this.createDrone(freq, config.lfoRate);
    }
    this.createWarmPad(config.padFreqs, config.lfoRate);
    this.createFilteredNoise(config.noiseGain, config.lfoRate);
    this.createMasterBreathing(targetGain);

    this.isPlaying = true;
  }

  private teardownNodes() {
    for (const osc of this.oscillators) {
      try { osc.stop(); } catch {}
    }
    for (const node of this.nodes) {
      try { node.disconnect(); } catch {}
    }
    if (this.analyser) {
      try { this.analyser.disconnect(); } catch {}
    }
    if (this.masterGain) {
      try { this.masterGain.disconnect(); } catch {}
    }
    this.oscillators = [];
    this.nodes = [];
    this.analyser = null;
    this.masterGain = null;
  }

  private createReverb(): { dry: GainNode; wet: GainNode } {
    const ctx = this.ensureContext();

    const length = Math.floor(ctx.sampleRate * 0.8);
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        const decay = Math.pow(1 - i / length, 2.5);
        data[i] = (Math.random() * 2 - 1) * decay;
        if (i > 0) {
          data[i] = data[i] * 0.6 + data[i - 1] * 0.4;
        }
      }
    }

    const convolver = ctx.createConvolver();
    convolver.buffer = impulse;

    const dry = ctx.createGain();
    dry.gain.value = 0.7;
    dry.connect(ctx.destination);

    const wetGain = ctx.createGain();
    wetGain.gain.value = 0.3;
    wetGain.connect(convolver);
    convolver.connect(ctx.destination);

    this.nodes.push(dry, wetGain, convolver);
    return { dry, wet: wetGain };
  }

  private createBinauralBeat(carrier: number, offset: number) {
    const ctx = this.ensureContext();
    if (!this.masterGain) return;

    const merger = ctx.createChannelMerger(2);
    const gainL = ctx.createGain();
    const gainR = ctx.createGain();
    gainL.gain.value = 0.12;
    gainR.gain.value = 0.12;

    const oscL = ctx.createOscillator();
    oscL.type = "sine";
    oscL.frequency.value = carrier;
    oscL.connect(gainL);
    gainL.connect(merger, 0, 0);

    const oscR = ctx.createOscillator();
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

  private createDrone(freq: number, lfoRate: number) {
    const ctx = this.ensureContext();
    if (!this.masterGain) return;

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;

    const osc2 = ctx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.value = freq + 3;

    const osc2Gain = ctx.createGain();
    osc2Gain.gain.value = 0.6;

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = lfoRate + Math.random() * 0.02;

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.03;

    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.04;

    const filter = ctx.createBiquadFilter();
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

  private createWarmPad(padFreqs: number[], lfoRate: number) {
    const ctx = this.ensureContext();
    if (!this.masterGain) return;

    for (let i = 0; i < padFreqs.length; i += 2) {
      const f1 = padFreqs[i];
      const f2 = padFreqs[i + 1];
      if (f2 === undefined) break;

      const osc1 = ctx.createOscillator();
      osc1.type = "triangle";
      osc1.frequency.value = f1;

      const osc2 = ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.value = f2;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 2000;
      filter.Q.value = 0.7;

      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = lfoRate * 0.8 + Math.random() * 0.01;

      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.015;

      const padGain = ctx.createGain();
      padGain.gain.value = 0.03;

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

  private createFilteredNoise(gain: number, lfoRate: number) {
    const ctx = this.ensureContext();
    if (!this.masterGain) return;

    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
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

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 800;
    bp.Q.value = 0.6;

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = lfoRate * 0.7;

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 150;

    lfo.connect(lfoGain);
    lfoGain.connect(bp.frequency);

    const noiseGain = ctx.createGain();
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
    const ctx = this.ensureContext();
    if (!this.masterGain) return;

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.015;

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = targetGain * 0.15;

    lfo.connect(lfoGain);
    lfoGain.connect(this.masterGain.gain);

    lfo.start();
    this.oscillators.push(lfo);
    this.nodes.push(lfoGain);
  }

  async crossfadeTo(newMode: AudioMode) {
    if (!this.isPlaying || !this.ctx || !this.masterGain) {
      return this.start(newMode);
    }

    const oldMasterGain = this.masterGain;
    const oldOscillators = this.oscillators;
    const oldNodes = this.nodes;
    const oldAnalyser = this.analyser;

    // Fade old out over 1.5s
    oldMasterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);

    // Reset instance state but keep the same AudioContext
    this.masterGain = null;
    this.oscillators = [];
    this.nodes = [];
    this.analyser = null;
    this.isPlaying = false;

    // Start new mode (reuses existing context)
    await this.start(newMode);

    // Clean up old nodes after crossfade completes
    setTimeout(() => {
      for (const osc of oldOscillators) {
        try { osc.stop(); } catch {}
      }
      for (const node of oldNodes) {
        try { node.disconnect(); } catch {}
      }
      if (oldAnalyser) {
        try { oldAnalyser.disconnect(); } catch {}
      }
      try { oldMasterGain.disconnect(); } catch {}
    }, 1600);
  }

  setVolume(level: number) {
    this.volumeLevel = Math.max(0, Math.min(1, level));
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(
        this.volumeLevel * 0.5,
        this.ctx.currentTime + 0.3,
      );
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

    // Fade out over 2s
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2);
    }

    // Schedule cleanup after fade-out (non-blocking)
    const cleanup = () => {
      this.teardownNodes();
      // Suspend instead of close — reuse on next play
      if (this.ctx) {
        this.ctx.suspend().catch(() => {});
      }
    };

    setTimeout(cleanup, 2100);
    this.isPlaying = false;
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  getMode() {
    return this.currentMode;
  }

  dispose() {
    this.teardownNodes();
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}
