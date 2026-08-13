# Regulate — Technical & Design Review Document

**App URL**: https://lam30ne.github.io/react-router-starter-template/
**Stack**: React 19 + React Router 7 + Tailwind CSS 4 + Web Audio API + Canvas 2D
**Deployment**: GitHub Pages (static SPA, client-side only)

---

## What This App Does

Regulate is a full-screen ambient environment that combines generative audio synthesis with procedural visuals, designed for nervous system regulation. The user picks one of three modes, presses play, and the app produces a continuous audiovisual experience with:

- **Binaural beats** (stereo-separated sine waves creating a frequency difference perceived in the brain)
- **Warm harmonic drones** (triangle oscillators in musical intervals)
- **Filtered pink noise** (shaped to sound like breath/air)
- **Flowing particle visuals** with a breathing circle, aurora-like bands, and fog
- **Everything breathing together** at ~5.7 breaths per minute

The UI auto-hides after 5 seconds of inactivity. The user can adjust volume, visual brightness, and switch modes. The entire palette shifts warmer at night for circadian alignment.

---

## Architecture Overview

```
home.tsx (state owner)
├── VisualCanvas (Canvas 2D, requestAnimationFrame loop)
│   ├── Particle system (Gaussian-centered, flow-field-driven)
│   ├── Fractal fog (3 slow-drifting radial blobs)
│   ├── Aurora bands (2 sine-composite waves, screen blending)
│   ├── Breathing circle (radial gradient, breath-phase-driven)
│   ├── Vignette + rest basin (spatial hierarchy overlays)
│   └── Trail fade (semi-transparent dark fill each frame)
├── Controls (mode buttons, sliders, play/stop)
└── AudioEngine (Web Audio API graph)
    ├── Binaural oscillator pair → ChannelMerger (stereo)
    ├── 3× Drone layers (triangle + chorus, per-drone lowpass)
    ├── 2× Warm pad pairs (detuned triangles, mode-specific lowpass)
    ├── Pink noise → lowpass@1200Hz (breath-modulated)
    ├── Master breathing LFO → masterGain
    ├── Master EQ: highpass@100Hz → lowpass@4kHz
    └── Reverb: convolver (0.8s impulse), mode-specific wet/dry
```

---

## The Breath Rate: The Central Design Decision

**`BREATH_HZ = 0.095` (~5.7 breaths per minute, ~10.5 second cycle)**

This single constant is the heartbeat of the entire app. It appears in both `audio-engine.ts` and `visual-canvas.tsx` and drives:

| System | What it modulates | Effect |
|--------|------------------|--------|
| Master volume | ±20% gain sway | Whole mix swells and recedes |
| Drone amplitude | ±0.02 gain LFO | Each drone layer breathes |
| Pad amplitude | ±0.012 gain LFO | Pad warmth pulses gently |
| Noise filter | ±60Hz sweep on lowpass cutoff | Air texture brightens/darkens |
| Particle alpha | ×(0.85 + breath × 0.15) | Particles brighten on "inhale" |
| Particle radius | ×(0.92 + breath × 0.08) | Particles expand on "inhale" |
| Aurora opacity | ×(0.8 + breath × 0.2) | Aurora glows on "inhale" |
| Background luminance | rgba(25,18,10, breath × 0.008) | Barely perceptible warm pulse |
| Breathing circle | radius oscillates ±20% | Visual breath guide |

**Research basis**: Slow-paced breathing around 6 breaths/minute can synchronize cardiovascular rhythms, improve baroreflex sensitivity, and promote parasympathetic dominance. The ~5.7 bpm rate was chosen to sit just below the 6 bpm threshold commonly cited in resonance frequency breathing research.

**Adjustable?** Yes — changing this one constant in both files changes the entire app's rhythm. A reviewer might suggest testing at exactly 0.1 Hz (6.0 bpm) or 0.0833 Hz (5.0 bpm).

---

## Audio Engine: Every Design Choice

### Signal Flow

```
Sources → masterGain → highpass(100Hz) → lowpass(4kHz) → dry(70%) → speakers
                                                        → wet(30%) → convolver(0.8s) → speakers
                                                        → analyser(FFT 256) → visual canvas
```

### Three Modes

| | Calm | Ground | Drift |
|---|---|---|---|
| **Carrier** | 580 Hz | 520 Hz | 660 Hz |
| **Binaural offset** | 4 Hz (theta) | 7.83 Hz (Schumann) | 2.5 Hz (delta border) |
| **Drone harmonics** | 580 / 870 / 1160 | 520 / 780 / 1040 | 660 / 990 / 1320 |
| **Pad detuning** | ~3% (580→597, 1160→1195) | ~3% (520→536, 1040→1072) | ~3% (660→680, 1320→1360) |
| **Noise gain** | 0.021 | 0.028 | 0.0175 |
| **Pad filter** | 2200 Hz (open) | 1800 Hz (dark) | 2400 Hz (airy) |
| **Reverb wet** | 30% | 25% (dryer) | 40% (spacious) |
| **Character** | Warm, open | Thick, grounded | Soft, spacious |

**All modes share the same breath rate, transition behavior, and spatial design.** Mode differences are purely timbral — filter brightness, reverb wetness, noise density. This was intentional: the regulatory mechanism (breath entrainment, low urgency, predictability) stays constant regardless of aesthetic preference.

### Gain Balance (Design Rationale)

| Layer | Per-unit gain | Role |
|-------|-------------|------|
| Binaural sine pair | 0.06/ear | Background texture, not perceptually dominant |
| Drones (×3 layers) | 0.05 each | Harmonic warmth foundation |
| Pads (×2 pairs) | 0.045 each | Rich mid-range body |
| Noise | 0.017–0.028 | Atmospheric air/breath texture |
| Master | volume × 0.5 | Headroom for summing |

**Choice**: Binaural beats are intentionally quiet (0.06, was 0.12). The research basis is that binaural beats are popular but the stronger evidence is for tempo/breath entrainment and low-arousal acoustic structure rather than specific beat frequencies. Harmonic warmth (drones + pads) leads the mix instead.

**Adjustable?** A psychologist might want binaural beats more prominent for placebo/expectation effects, or a sound designer might want even less. The gain values are all in the MODES config object.

### Roughness Reduction

| Parameter | Previous | Current | Why |
|-----------|----------|---------|-----|
| Drone chorus detune | +3 Hz | +1.2 Hz | 3Hz beating creates perceptible roughness; 1.2Hz is below the "rough" threshold |
| Chorus blend | 0.6 | 0.5 | Less prominence of the beating component |
| Pad detuning | ~6% | ~3% | Wider detuning creates shimmer/roughness in upper partials |
| LFO jitter | random ±0.02 Hz | None | Random variation creates unpredictable modulation |

**Research basis**: Roughness, abrupt onsets, and modulation rates in the 20–70 Hz range bias perception toward urgency and defensive readiness (e.g., human screams exploit modulation roughness). All modulation in this engine stays well below 1 Hz.

### Noise Layer: Air, Not Hiss

- **Previous**: Bandpass at 800 Hz, Q 0.6, ±150 Hz sweep → reads as filtered hiss, can trigger scanning
- **Current**: Lowpass at 1200 Hz, Q 0.6, ±60 Hz sweep → reads as soft air/breath

**Research basis**: Nature-like soundscapes (wind, water, broad-spectrum soft noise) support faster stress recovery than noise that reads as mechanical or sharp. The lowpass shaping removes upper-mid energy that could read as vigilance-triggering.

**Adjustable?** The cutoff (1200), Q (0.6), and sweep depth (60) are all single-line changes. A reviewer might want to test with an even lower cutoff (800 Hz lowpass vs bandpass) or wider Q for more "oceanic" quality.

### Master EQ

- **Highpass at 100 Hz** (Q 0.7): Removes sub-bass rumble that can feel threatening or physically intrusive
- **Lowpass at 4000 Hz** (Q 0.7): Removes harsh upper harmonics and any metallic transients

**Research basis**: Heavy low-frequency rumble can increase arousal and feel "looming." Sharp high-frequency content triggers alerting responses. The 100–4000 Hz band roughly corresponds to the prosodic voice range where humans feel safest.

**Adjustable?** Both frequencies and Q values. A reviewer might suggest 80 Hz and 5000 Hz for a wider band, or 120 Hz and 3500 Hz for tighter shaping.

### Transition Timing

| Transition | Duration | Ramp type |
|-----------|----------|----------|
| Fade in (start) | 5 seconds | Exponential |
| Mode crossfade | 4 seconds | Exponential (old fades, new fades in simultaneously) |
| Stop fade | 4 seconds | Exponential |
| Volume change | 0.3 seconds | Exponential |

**Research basis**: Abrupt acoustic transitions create orienting responses (the "what was that?" reflex). Slow, convex (exponential) fades are more predictable and regulation-friendly than linear ramps. The 4–5 second durations are long enough that the transition itself becomes part of the rhythm rather than an interruption.

### Stereo Field

- Binaural pair: hard L/R separation via ChannelMergerNode (required for binaural beat perception)
- Everything else: mono into masterGain, no panning automation
- **No spatial movement**: no automated panning, no looming, no circling, no rear cues

**Research basis**: Auditory proximity cues, approaching sounds, and rear/side spatial movement increase electrodermal response and arousal. A stable, frontal, diffuse field is regulation-friendly.

### Micro-Pauses

The master breathing LFO at ±20% depth means the entire mix dips to ~80% of target gain at each breath trough. This creates a natural "clearing" — not silence, but reduced density — every ~10.5 seconds.

**Research basis**: Pauses in music can reduce heart rate, blood pressure, and ventilation, sometimes below baseline. Even partial density reductions (not full silence) provide this effect.

**Adjustable?** The 20% depth could be increased (25–30% for more pronounced pauses) or decreased (10–15% for subtler effect). A PeriodicWave with a flattened trough could create a more plateau-shaped pause if desired.

---

## Visual System: Every Design Choice

### Spatial Hierarchy

The visual field is not uniform. It's designed to reduce peripheral scanning and create a central "landing zone" for the eye:

1. **Vignette**: Radial gradient from transparent (center) to rgba(10,7,3, 0.12) at edges
2. **Rest basin**: Soft warm haze at center, radius 35% of screen, alpha ~0.03
3. **Horizon falloff**: Particle alpha, radius, saturation, and brightness all diminish toward edges using `1 - pow(distNorm, 1.8) × 0.85`
4. **Gaussian spawn**: Particles spawn center-biased (sum of 3 uniform randoms / 3), not uniformly

**The result**: Center of screen is warm, alive, inviting. Edges are dark, desaturated, receding. The eye settles rather than scans.

**Research basis**: Peripheral visual stimulation can trigger saccadic scanning and increase cognitive load. Reducing peripheral complexity while maintaining a "depth" gradient mimics natural environments (looking into a warm space) rather than artificial ones (screens with uniform brightness).

**Adjustable?**
- Vignette alpha (0.12): increase for more dramatic darkening, decrease for subtler
- Horizon exponent (1.8): higher = sharper center/edge contrast, lower = more gradual
- Horizon multiplier (0.85): max dimming at edges; 1.0 would fade to full black
- Basin radius (0.35): larger = more of the screen feels "safe"

### Particle System

| Parameter | Value | Rationale |
|-----------|-------|----------|
| Count (desktop) | ≤140 (scaled by visualIntensity 0.65) ≈ 91 | Fewer particles = less visual noise, less scanning |
| Count (mobile) | ≤50 | Performance + calmer default |
| Count (reduced motion) | ≤25 | Minimal stimulation |
| Velocity force | 0.07 per frame | Very slow drift (was 0.15) |
| Velocity damping | 0.92 | High drag — particles float, don't fly |
| Radius | 1.5–5.0 px | Small, dust-mote scale |
| Lifespan | 300–800 frames (5–13s at 60fps) | Long enough to settle, not persist forever |
| Fade-in | First 10% of life | No abrupt appearance |
| Fade-out | Last 15% of life | No abrupt disappearance |

**Design intent**: Particles drift like dust motes in warm light, not like fireflies or sparks. Motion is slow enough that no single particle demands attention. The flow field provides organic coherence without sharp direction changes.

### Flow Field (Two-Scale Structure)

```
Large-scale drift: sin(nx×0.3 + t×0.2) × 1.5 + cos(ny×0.25 + t×0.15) × 1.2
Local turbulence:  sin(nx×1.2 + ny×0.9 + t×0.4) × 0.4
Combined field:    largeDrift + localTurb
```

- **Large scale** creates slow directional currents (like air movement in a room)
- **Local turbulence** adds gentle organic variation (like eddies)
- **No audio influence** on the field — audio used to jitter the field was removed entirely

**Research basis**: Fractal-like visual patterns with dimension ~1.3–1.5 are associated with "fractal fluency" — reduced physiological stress responses compared to either overly regular or overly chaotic patterns. The two-scale structure creates this multi-scale quality.

### Fractal Fog

Three large soft radial blobs (15–25% of screen radius) that orbit slowly around center. Very low alpha (0.015–0.025). Drawn with `screen` composite blending.

**Purpose**: Creates organic depth and multi-scale structure behind particles without adding fine-grain shimmer. The fog blobs are what give the scene a sense of "atmosphere" rather than "particles on a flat plane."

### Aurora

- 2 horizontal wave bands (at 35% and 53% of screen height)
- Each is a sine-composite wave: three frequency components (amplitudes 60, 30, 40 pixels)
- `screen` blending, very low alpha: `(0.02 + audioLevel × 0.01) × brightness × (0.8 + breath × 0.2)`
- Peak gradient alpha: 0.15 (very subtle)
- **Skipped on mobile and reduced-motion**

**Adjustable?** Band count (currently 2, was 3), alpha levels, wave amplitudes, Y positions. A reviewer might want to test with aurora disabled entirely to see if the scene is calmer.

### Breathing Circle

- Center of screen
- Base radius: 12% of min(width, height)
- Oscillates via shared breath phase: radius × (0.8 + breathPhase × 0.2)
- Audio adds up to 10% expansion (was 30%)
- Two layers: inner glow (brighter, desaturated center) and outer glow (extending to 3× radius)

**Purpose**: Serves as a visual breath guide. The most explicit regulatory element — users can consciously or unconsciously entrain their breathing to it.

### Color Palette

| Mode | Hue range | Saturation | Brightness |
|------|-----------|------------|------------|
| Calm | 30–50 (amber/gold) | 42 | 58 |
| Ground | 15–40 (earth/umber) | 35 | 48 |
| Drift | 25–55 (warm gold) | 32 | 52 |

**All hues are in the warm amber range (15–55).** No cool blues, greens, or purples. This was a deliberate choice.

**Research basis**: Warm, desaturated tones are associated with lower arousal. High saturation can feel stimulating. The saturation levels (32–42%) are noticeably muted compared to typical ambient visualizers.

**Adjustable?** Each mode's hue range, saturation, and brightness are in the `MODE_PALETTES` object. A reviewer might want to test even lower saturation (25–30%) or slightly expanded hue ranges.

### Circadian Palette Shifting (time-palette.ts)

| Time of Day | Hue shift | Saturation mult | Brightness mult |
|-------------|-----------|-----------------|------------------|
| Morning (6–10) | -2 | ×0.95 | ×1.05 |
| Daytime (10–17) | 0 | ×1.0 | ×1.0 |
| Evening (17–20) | -8 | ×0.8 | ×0.75 |
| Night (20–6) | -15 | ×0.6 | ×0.55 |

**At night**: palette shifts 15° warmer, saturation drops to 60%, brightness drops to 55%. The screen becomes noticeably dimmer and more amber.

**Research basis**: Blue light suppression for melatonin protection. The entire app is already warm-only (no blue), but the evening/night shifts make it even warmer and dimmer.

### Audio Reactivity (Reinterpreted)

Audio reactivity in the visuals is intentionally gentle:

| Visual parameter | Audio influence | Range |
|-----------------|-----------------|-------|
| Particle alpha | +15% at max audio | 0.75 → 0.90 |
| Particle radius | +30% at max audio | 1.0× → 1.3× |
| Aurora alpha | +50% at max audio | 0.02 → 0.03 |
| Breathing circle radius | +10% at max audio | subtle expansion |
| Breathing circle inner alpha | +33% at max audio | 0.15 → 0.20 |
| Fractal fog alpha | +15% (via audioBreath) | gentle warmth |

**What was removed**: Audio no longer affects flow field direction, trail fade rate, or aurora wave amplitude. These created jittery, unpredictable motion. Audio now only affects luminance/glow — slow, gentle modulation.

### Trail System

Each frame, the entire canvas is covered with `rgba(15, 10, 5, 0.05)` — a warm near-black at 5% opacity. This creates motion trails: previous frames slowly fade rather than being cleared. The result is smooth, ghostly particle traces rather than sharp dots.

**Fixed alpha** (was audio-reactive): Removing audio influence from trail fade prevents flickering and creates steadier motion blur.

---

## UI/UX Design

### Controls Layout

Bottom-fixed toolbar with gradient fade (`from-black/60 to-transparent`):
- **Mode buttons**: Capsule-shaped, amber active state with subtle glow shadow
- **Volume slider**: 70–120px width, amber track, 20px touch target
- **Visuals slider**: Same styling, controls visual brightness
- **Play/stop**: 64px circle, pause bars or play triangle, pulsing ring animation when playing
- **Mode description**: Below buttons, explains current mode
- **Headphones hint**: "Headphones recommended for binaural beats" (shown when stopped)

### Auto-Hide

- UI hides after 5 seconds of no interaction when playing
- Mouse move, keyboard, or focus re-shows UI and resets timer
- Click/tap toggles UI visibility
- Cursor hides with UI
- 1-second opacity transition

### Accessibility (WCAG 2.1 AA)

- `aria-label` on canvas, toolbar, buttons
- `aria-pressed` on mode buttons
- `focus-visible` rings on all interactive elements (2px amber)
- `prefers-reduced-motion`: particles drop to ≤25, aurora disabled, time multiplier ×0.03, breathing circle audio reactivity disabled
- Slider thumb: 20px (meets 44px equivalent touch target with padding)
- All text meets 4.5:1 contrast ratio against dark background

### PWA Support

- `manifest.json` with `"display": "fullscreen"` (no browser chrome)
- `apple-mobile-web-app-capable: yes`
- `theme-color: #0f0a05`
- No app icons defined yet (empty array in manifest)

---

## What's Tunable (Summary for Reviewers)

### High-Impact Single-Value Changes

| What to change | Where | Current | Suggested test range |
|---------------|-------|---------|----------------------|
| Breath rate | Both files, `BREATH_HZ` | 0.095 (5.7 bpm) | 0.0833–0.1167 (5.0–7.0 bpm) |
| Master breathing depth | audio-engine.ts L382 | 20% | 10%–30% |
| Binaural prominence | audio-engine.ts L186 | 0.06/ear | 0.03–0.12 |
| Particle count | visual-canvas.tsx L136 | 140 max, /8000 divisor | 80–200, /6000–/12000 |
| Particle speed | visual-canvas.tsx L334 | 0.07 force | 0.03–0.12 |
| Horizon falloff | visual-canvas.tsx L358 | pow 1.8, ×0.85 | pow 1.2–2.5, ×0.5–1.0 |
| Palette saturation | visual-canvas.tsx L28-30 | 32–42 | 20–55 |
| Night dimming | time-palette.ts | sat ×0.6, bright ×0.55 | sat ×0.4–0.8, bright ×0.4–0.7 |
| Noise character | audio-engine.ts L345 | lowpass 1200Hz | 600–2000 Hz |
| Transition speed | audio-engine.ts L91,405,488 | 4–5 seconds | 3–8 seconds |
| Master EQ range | audio-engine.ts L98,103 | 100–4000 Hz | 80–120 low, 3000–6000 high |
| Vignette strength | visual-canvas.tsx L255 | 0.12 alpha | 0.05–0.20 |

### Structural Changes That Could Be Explored

1. **Guided breathing mode**: Explicit inhale/hold/exhale phases instead of continuous sine wave
2. **User-adjustable breath rate**: Slider letting the user set their own pace
3. **Haptic feedback**: On mobile, gentle vibration at breath phase transitions
4. **Session timer**: Timed sessions (5/10/15/20 min) with gradual wind-down
5. **Ambient sound layer**: Optional nature recordings (rain, ocean) mixed in
6. **Progressive deepening**: Gradually slow the breath rate over a session
7. **Biometric feedback**: Heart rate sensor integration to adapt breath rate to user's HRV

---

## Questions for Each Reviewer

### For the UX Designer
- Does the auto-hide timing (5s) feel right? Too aggressive? Too slow?
- Should the breathing circle be more prominent as a breath guide, or is subtlety the point?
- Is the mode switching interaction clear enough? Should modes preview before committing?
- Is the "headphones recommended" hint sufficient, or does the app need onboarding?

### For the UI Designer
- Are the warm amber tones too monotone across modes, or is the subtlety intentional restraint?
- Does the vignette + rest basin create the intended spatial depth, or does it feel like a filter?
- Is the control bar too minimal? Too prominent when visible?
- Should there be visual feedback during the 5-second fade-in (currently audio fades in silently)?

### For the Engineer
- The crossfade creates a second AudioContext (two running simultaneously for 4s). Is this acceptable on low-end devices?
- The canvas renders vignette + basin + fog + particles + aurora + circle every frame via fillRect/arc. Should any layers be pre-rendered to offscreen canvases?
- `getAverageFrequency()` averages all FFT bins equally. Should it weight toward the fundamental range for more musically meaningful reactivity?
- The visual intensity is set once at mount and never changes. Should it be responsive to frame rate?

### For the Psychologist / Neuroscience Reviewer
- Is 5.7 bpm the right target, or should it be exactly 6.0 bpm (0.1 Hz) to match resonance frequency breathing literature?
- Is the breathing circle too subtle to guide conscious breathing, or is unconscious entrainment the goal?
- Should the micro-pause (20% dip) be more pronounced to create a clearer "rest" moment?
- Are there concerns about binaural beats at 7.83 Hz (Schumann resonance) lending pseudoscientific framing?
- Would adding a subtle body-scan or progressive relaxation cue (e.g., moving the warm glow slowly downward) enhance the regulatory effect?
- Is the night mode shift aggressive enough for true circadian protection, or should it go further?
