// Nervous system regulation audio engine
// Uses Web Audio API to generate binaural beats, ambient drones, and filtered noise

export type AudioMode = "calm" | "ground" | "drift";

interface ModeConfig {
  carrierFreq: number;
  binauralOffset: number;
  droneFreqs: number[];
  noiseGain: number;
  lfoRate: number;
  label: string;
  description: string;
}

export const MODES: Record<AudioMode, ModeConfig> = {
  calm: {
    carrierFreq: 180,
    binauralOffset: 4, // 4Hz theta - deep relaxation
    droneFreqs: [90, 135, 270],
    noiseGain: 0.03,
    lfoRate: 0.08,
    label: "Calm",
    description: "Theta waves for deep relaxation",
  },
  ground: {
    carrierFreq: 140,
    binauralOffset: 7.83, // Schumann resonance
    droneFreqs: [70, 105, 210],
    noiseGain: 0.05,
    lfoRate: 0.05,
    label: "Ground",
    description: "Earth frequency for grounding",
  },
  drift: {
    carrierFreq: 220,
    binauralOffset: 2.5, // Delta border - deep spacey state
    droneFreqs: [110, 165, 330],
    noiseGain: 0.02,
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

  async start(mode: AudioMode = "calm") {
    if (this.isPlaying) {
      await this.stop();
    }

    this.currentMode = mode;
    this.ctx = new AudioContext();
    const config = MODES[mode];

    // Master gain with slow fade in
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0.35, this.ctx.currentTime + 3);
    this.masterGain.connect(this.ctx.destination);

    // Analyser for visual reactivity
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.masterGain.connect(this.analyser);

    // Binaural beat pair (needs stereo separation)
    this.createBinauralBeat(config.carrierFreq, config.binauralOffset);

    // Ambient drone layers
    for (const freq of config.droneFreqs) {
      this.createDrone(freq, config.lfoRate);
    }

    // Filtered noise (ocean/breath texture)
    this.createFilteredNoise(config.noiseGain, config.lfoRate);

    // Sub bass pulse
    this.createSubPulse(config.droneFreqs[0] / 2, config.lfoRate);

    this.isPlaying = true;
  }

  private createBinauralBeat(carrier: number, offset: number) {
    if (!this.ctx || !this.masterGain) return;

    const merger = this.ctx.createChannelMerger(2);
    const gainL = this.ctx.createGain();
    const gainR = this.ctx.createGain();
    gainL.gain.value = 0.15;
    gainR.gain.value = 0.15;

    // Left ear
    const oscL = this.ctx.createOscillator();
    oscL.type = "sine";
    oscL.frequency.value = carrier;
    oscL.connect(gainL);
    gainL.connect(merger, 0, 0);

    // Right ear (slightly offset for binaural beat)
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

    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    // Slow amplitude modulation for breathing feel
    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = lfoRate + Math.random() * 0.02;

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.04;

    const droneGain = this.ctx.createGain();
    droneGain.gain.value = 0.06;

    // Gentle filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = freq * 2.5;
    filter.Q.value = 1;

    lfo.connect(lfoGain);
    lfoGain.connect(droneGain.gain);

    osc.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(this.masterGain);

    osc.start();
    lfo.start();
    this.oscillators.push(osc, lfo);
    this.nodes.push(lfoGain, droneGain, filter);
  }

  private createFilteredNoise(gain: number, lfoRate: number) {
    if (!this.ctx || !this.masterGain) return;

    // Generate pink-ish noise buffer
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Bandpass for ocean/wind texture
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 500;
    bp.Q.value = 0.5;

    // LFO on filter frequency for wave-like movement
    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = lfoRate * 0.7;

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 300;

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

  private createSubPulse(freq: number, lfoRate: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = lfoRate * 0.5;

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.03;

    const subGain = this.ctx.createGain();
    subGain.gain.value = 0.08;

    lfo.connect(lfoGain);
    lfoGain.connect(subGain.gain);

    osc.connect(subGain);
    subGain.connect(this.masterGain);

    osc.start();
    lfo.start();
    this.oscillators.push(osc, lfo);
    this.nodes.push(lfoGain, subGain);
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

    // Fade out
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2);
    }

    await new Promise((resolve) => setTimeout(resolve, 2100));

    for (const osc of this.oscillators) {
      try { osc.stop(); } catch {}
    }
    for (const node of this.nodes) {
      try { node.disconnect(); } catch {}
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
