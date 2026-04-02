// Nervous system regulation audio engine
// Frequencies anchored in 500Hz–4kHz safety range (prosodic voice band)
// Binaural beats, warm pad synthesis, algorithmic reverb, filtered noise

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

  async start(mode: AudioMode = "calm") {
    if (this.isPlaying) {
      await this.stop();
    }

    this.currentMode = mode;
    this.ctx = new AudioContext();
    const config = MODES[mode];

    const targetGain = this.volumeLevel * 0.5;

    // Master gain with slow fade in
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(
      targetGain,
      this.ctx.currentTime + 3,
    );

    // Reverb: wet/dry split
    const { dry, wet } = this.createReverb();
    this.masterGain.connect(dry);
    this.masterGain.connect(wet);

    // Analyser for visual reactivity
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.masterGain.connect(this.analyser);

    // Binaural beat pair (stereo separation)
    this.createBinauralBeat(config.carrierFreq, config.binauralOffset);

    // Warm drone layers (triangle + chorusing)
    for (const freq of config.droneFreqs) {
      this.createDrone(freq, config.lfoRate);
    }

    // Warm pad (detuned pairs for richness)
    this.createWarmPad(config.padFreqs, config.lfoRate);

    // Filtered noise (ocean/breath texture)
    this.createFilteredNoise(config.noiseGain, config.lfoRate);

    // Strategic silence: ultra-slow master volume breathing
    this.createMasterBreathing(targetGain);

    this.isPlaying = true;
  }

  private createReverb(): { dry: GainNode; wet: GainNode } {
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

    // Dry path (70%)
    const dry = this.ctx.createGain();
    dry.gain.value = 0.7;
    dry.connect(this.ctx.destination);

    // Wet path (30%)
    const wetGain = this.ctx.createGain();
    wetGain.gain.value = 0.3;
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
    gainL.gain.value = 0.12;
    gainR.gain.value = 0.12;

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

  private createDrone(freq: number, lfoRate: number) {
    if (!this.ctx || !this.masterGain) return;

    // Primary: triangle wave for richer harmonics
    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;

    // Chorus: second oscillator detuned +3Hz
    const osc2 = this.ctx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.value = freq + 3;

    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.value = 0.6; // 60% of primary

    // Slow amplitude modulation for breathing feel
    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = lfoRate + Math.random() * 0.02;

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.03;

    const droneGain = this.ctx.createGain();
    droneGain.gain.value = 0.04;

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

  private createWarmPad(padFreqs: number[], lfoRate: number) {
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
      filter.frequency.value = 2000;
      filter.Q.value = 0.7;

      // Slow LFO for amplitude breathing
      const lfo = this.ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = lfoRate * 0.8 + Math.random() * 0.01;

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 0.015;

      const padGain = this.ctx.createGain();
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

    // Bandpass centered at safe frequency range
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 800;
    bp.Q.value = 0.6;

    // LFO on filter frequency — tighter modulation to stay in safe range
    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = lfoRate * 0.7;

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 150; // Tighter sweep (was 300)

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

    // Ultra-slow LFO (~0.015Hz, ~67s cycle) modulates master volume
    // Creates periodic "breath" moments without full silence
    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.015;

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = targetGain * 0.15; // ±15% volume sway

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

    // Fade old out over 1.5s
    oldMasterGain.gain.linearRampToValueAtTime(0, oldCtx.currentTime + 1.5);

    // Reset instance state for new context
    this.ctx = null;
    this.masterGain = null;
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

    await new Promise((resolve) => setTimeout(resolve, 2100));

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
