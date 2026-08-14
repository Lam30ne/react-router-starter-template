# Regulate — Research Ledger

Internal reference for scientific and design rationales. Not for user-facing copy.

## Confidence Statuses

- **Observed implementation fact** — Describes what the code actually does
- **Design hypothesis** — A design choice based on reasoning, not empirical validation
- **Plausible but unverified** — Reasonable expectation without direct evidence in this context
- **Literature-informed** — Based on published research, but not clinically validated for this product
- **Expert review required** — Needs specialist evaluation before confidence can increase
- **User-facing claim prohibited** — Must not appear in user-facing copy regardless of confidence
- **Deprecated** — Previously used, no longer part of the product

---

## Entries

### R-001: Slow rhythm near six cycles per minute

| Field | Value |
|---|---|
| **Hypothesis** | A shared audiovisual rhythm near 6 cycles/min (~0.1 Hz) may promote autonomic down-regulation by encouraging respiratory entrainment near resonance frequency |
| **Implementation** | Default rhythm preset "Steady" at 5.7 cpm (0.095 Hz). Non-round value avoids obvious metronome feel |
| **Parameters** | `RHYTHM_PRESETS.steady.bpm = 5.7`, `hz = 0.095` |
| **Confidence** | Literature-informed |
| **User-facing** | Prohibited — do not claim "regulates your nervous system" |
| **Expert needed** | Psychophysiology / respiratory physiology |
| **Files** | `app/lib/regulation-clock.ts` |
| **Evidence** | Resonance frequency breathing literature (Lehrer & Gevirtz, 2014) suggests 4.5–6.5 cpm range. No clinical validation for this product. |
| **Last reviewed** | 2026-08-13 |

### R-002: Shared audio and visual entrainment

| Field | Value |
|---|---|
| **Hypothesis** | Cross-modal rhythmic coherence (audio LFOs + visual breathing at same rate) may increase likelihood of unconscious respiratory entrainment |
| **Implementation** | Single regulation-clock module drives all audio modulation and visual breath phase |
| **Parameters** | All LFOs and visual sine use same hz from regulation-clock |
| **Confidence** | Design hypothesis |
| **User-facing** | Prohibited |
| **Expert needed** | Multisensory perception / entrainment research |
| **Files** | `app/lib/regulation-clock.ts`, `app/components/audio-engine.ts`, `app/components/visual-canvas.tsx` |
| **Evidence** | Cross-modal entrainment is plausible but not specifically validated for ambient wellness apps |
| **Last reviewed** | 2026-08-13 |

### R-003: Stable, low-roughness sound

| Field | Value |
|---|---|
| **Hypothesis** | Minimizing spectral roughness (beating, dissonance) reduces arousal and supports settling |
| **Implementation** | Chorus detune reduced to +1.2 Hz, pad detuning ~3%, no random LFO jitter |
| **Parameters** | Drone chorus: +1.2 Hz offset. Pad pairs: ~3% frequency separation |
| **Confidence** | Plausible but unverified |
| **User-facing** | Prohibited |
| **Expert needed** | Psychoacoustics |
| **Files** | `app/components/audio-engine.ts` |
| **Last reviewed** | 2026-08-13 |

### R-004: Slow acoustic transitions

| Field | Value |
|---|---|
| **Hypothesis** | Gradual volume and timbral changes avoid startle responses and maintain low arousal |
| **Implementation** | Fade-in 5s, crossfade 4s, stop fade 4s, all exponential ramps |
| **Parameters** | `FADE_IN_MS = 5000`, crossfade 4000ms, stop 4000ms |
| **Confidence** | Design hypothesis |
| **User-facing** | Permitted as "gentle transitions" |
| **Files** | `app/components/audio-engine.ts`, `app/lib/constants.ts` |
| **Last reviewed** | 2026-08-13 |

### R-005: Partial density troughs (master breathing)

| Field | Value |
|---|---|
| **Hypothesis** | Periodic reduction in overall audio density at the breath rate creates implicit "space" that may encourage exhale-phase relaxation |
| **Implementation** | Master gain modulated ±20% at breath rate via sine LFO |
| **Parameters** | `BREATH_HZ`, depth 0.20 of target gain |
| **Confidence** | Design hypothesis |
| **User-facing** | Prohibited |
| **Expert needed** | Psychoacoustics / respiratory physiology |
| **Files** | `app/components/audio-engine.ts` |
| **Last reviewed** | 2026-08-13 |

### R-006: Warm and desaturated colors

| Field | Value |
|---|---|
| **Hypothesis** | Warm, low-saturation amber/brown palette is less alerting than cool or high-saturation colors |
| **Implementation** | MODE_PALETTES with saturation 32-42, hue range 15-55 (amber/warm spectrum) |
| **Parameters** | calm: sat 42, ground: sat 35, drift: sat 32 |
| **Confidence** | Plausible but unverified |
| **User-facing** | Permitted as "warm colors" |
| **Files** | `app/components/visual-canvas.tsx` |
| **Last reviewed** | 2026-08-13 |

### R-007: Reduced peripheral complexity

| Field | Value |
|---|---|
| **Hypothesis** | Dimming edges and concentrating visual activity at center reduces visual scanning and peripheral alerting |
| **Implementation** | Horizon falloff: `pow(distNorm, 1.8) * 0.85`, vignette, rest basin glow at center |
| **Parameters** | Falloff exponent 1.8, intensity 0.85 |
| **Confidence** | Design hypothesis |
| **User-facing** | Prohibited |
| **Expert needed** | Visual perception / attention research |
| **Files** | `app/components/visual-canvas.tsx` |
| **Last reviewed** | 2026-08-13 |

### R-008: Multi-scale / fractal-like visual structure

| Field | Value |
|---|---|
| **Hypothesis** | Visual patterns with structure at multiple spatial scales may be perceived as more natural and less fatiguing |
| **Implementation** | Two-scale flow field (large drift + local turbulence), fractal fog (3 overlapping blobs), particles at individual scale |
| **Parameters** | Large drift: 0.3 spatial freq, local turbulence: 1.2 spatial freq |
| **Confidence** | Plausible but unverified |
| **User-facing** | Prohibited |
| **Files** | `app/components/visual-canvas.tsx` |
| **Last reviewed** | 2026-08-13 |

### R-009: Night palette behavior (circadian)

| Field | Value |
|---|---|
| **Hypothesis** | Shifting palette warmer and dimmer at night aligns with circadian principles and may reduce blue-light alerting |
| **Implementation** | Time-of-day palette shifts: evening hue -8, sat ×0.8, bright ×0.75; night hue -15, sat ×0.6, bright ×0.55 |
| **Parameters** | See `getTimeOfDayShift()` return values |
| **Confidence** | Literature-informed (general blue-light research exists, specific application unverified) |
| **User-facing** | Prohibited — do not claim "protects melatonin" |
| **Expert needed** | Chronobiology |
| **Files** | `app/components/time-palette.ts` |
| **Last reviewed** | 2026-08-13 |

### R-010: Binaural frequency offsets

| Field | Value |
|---|---|
| **Hypothesis** | Binaural beat frequencies in specific EEG bands may promote corresponding brain states |
| **Implementation** | calm: 4 Hz (theta band), ground: 7.83 Hz (Schumann/alpha-theta), drift: 2.5 Hz (delta band) |
| **Parameters** | `binauralOffset` per soundscape config |
| **Confidence** | Expert review required — binaural beat research is mixed |
| **User-facing** | Prohibited — do not use theta, delta, Schumann, brainwave entrainment |
| **Expert needed** | Auditory neuroscience |
| **Files** | `app/components/audio-engine.ts` |
| **Last reviewed** | 2026-08-13 |

### R-011: The 7.83 Hz configuration (Schumann resonance)

| Field | Value |
|---|---|
| **Hypothesis** | 7.83 Hz binaural offset corresponds to Earth's Schumann resonance and may have grounding effects |
| **Implementation** | Ground soundscape uses `binauralOffset: 7.83` |
| **Parameters** | `SOUNDSCAPES.ground.binauralOffset = 7.83` |
| **Confidence** | Expert review required — Schumann resonance connection to human physiology is speculative |
| **User-facing** | Prohibited — do not use "Earth frequency" or "Schumann resonance" |
| **Expert needed** | Geophysics / neuroscience |
| **Files** | `app/components/audio-engine.ts` |
| **Last reviewed** | 2026-08-13 |

### R-012: Stable stereo field

| Field | Value |
|---|---|
| **Hypothesis** | Stable stereo positioning reduces spatial uncertainty and potential anxiety from unpredictable sound movement |
| **Implementation** | No random panning. Binaural beats are fixed left/right. All other sources are centered or static. |
| **Confidence** | Design hypothesis |
| **User-facing** | Permitted as general description |
| **Files** | `app/components/audio-engine.ts` |
| **Last reviewed** | 2026-08-13 |

### R-013: Low-pass noise character

| Field | Value |
|---|---|
| **Hypothesis** | Low-passed pink noise resembles natural ambient sound and is less alerting than broadband noise |
| **Implementation** | Pink noise through lowpass at 1200 Hz with gentle breath-paced filter modulation |
| **Parameters** | Lowpass cutoff 1200 Hz, Q 0.6, modulation depth 60 Hz |
| **Confidence** | Plausible but unverified |
| **User-facing** | Permitted as "soft ambient texture" |
| **Files** | `app/components/audio-engine.ts` |
| **Last reviewed** | 2026-08-13 |

### R-014: Master EQ choices

| Field | Value |
|---|---|
| **Hypothesis** | Constraining audio output to the 100 Hz–4 kHz band keeps the sound within the prosodic voice band, which may feel more natural and less intrusive |
| **Implementation** | Master highpass at 100 Hz (Q 0.7) + lowpass at 4000 Hz (Q 0.7) |
| **Parameters** | HP: 100 Hz, LP: 4000 Hz, both Q 0.7 |
| **Confidence** | Design hypothesis |
| **User-facing** | Prohibited |
| **Files** | `app/components/audio-engine.ts` |
| **Last reviewed** | 2026-08-13 |

### R-015: Reduced-motion behavior

| Field | Value |
|---|---|
| **Hypothesis** | Users with vestibular sensitivity or motion sensitivity need reduced or eliminated visual movement |
| **Implementation** | Reduced: 25 max particles, no aurora, slower flow. Static: no particles, no aurora, no fog — breathing circle only with gentle scale. |
| **Confidence** | Observed implementation fact (accessibility requirement) |
| **User-facing** | Permitted |
| **Files** | `app/components/visual-canvas.tsx`, `app/lib/settings.ts` |
| **Last reviewed** | 2026-08-13 |

### R-016: Release-biased cycle shape (40/60)

| Field | Value |
|---|---|
| **Hypothesis** | A longer release phase (60% of cycle) relative to rise (40%) may better support parasympathetic activation by encouraging prolonged exhalation |
| **Implementation** | Piecewise cosine envelope: rise over 40% of cycle, release over 60%. Continuous value and first derivative at the junction. |
| **Parameters** | `riseFraction = 0.4`, rise: `0.5 - 0.5 * cos(pi * t / 0.4)`, release: `0.5 + 0.5 * cos(pi * (t - 0.4) / 0.6)` |
| **Confidence** | Literature-informed |
| **User-facing** | Prohibited — do not claim "optimized breathing ratio" |
| **Expert needed** | Respiratory physiology |
| **Files** | `app/lib/regulation-clock.ts` |
| **Evidence** | Extended exhalation is associated with vagal activation in resonance frequency breathing literature. Specific 40/60 ratio is a design choice, not a validated prescription. |
| **Last reviewed** | 2026-08-14 |

### R-017: Balanced cycle shape alternative (50/50)

| Field | Value |
|---|---|
| **Hypothesis** | A symmetrical 50/50 cycle (standard sine) provides a simpler alternative for users who find the asymmetric shape uncomfortable |
| **Implementation** | Standard sine wave via `getBreathPhase()`. Available as "Balanced" option in settings. |
| **Confidence** | Design hypothesis |
| **User-facing** | Permitted as setting label |
| **Files** | `app/lib/regulation-clock.ts`, `app/components/settings-panel.tsx` |
| **Last reviewed** | 2026-08-14 |

### R-018: No breath holds

| Field | Value |
|---|---|
| **Hypothesis** | Breath holds (pauses between inhale and exhale phases) can increase anxiety in some users, particularly those with trauma histories |
| **Implementation** | Both cycle shapes transition smoothly between rise and release with no plateau or hold phase. Continuous first derivative ensures no sudden transitions. |
| **Confidence** | Literature-informed |
| **User-facing** | Prohibited — do not claim "trauma-safe breathing" |
| **Expert needed** | Trauma-informed care specialist |
| **Files** | `app/lib/regulation-clock.ts` |
| **Evidence** | Breath holds are contraindicated in some trauma-informed breathing protocols. |
| **Last reviewed** | 2026-08-14 |

### R-019: Gentle breathing — no forceful techniques

| Field | Value |
|---|---|
| **Hypothesis** | Passive, gentle rhythmic exposure is safer than active breathing techniques that require forceful inhalation or exhalation |
| **Implementation** | The app provides ambient rhythm only; it does not instruct, coach, or count breaths. No inhale/exhale labels. |
| **Confidence** | Design hypothesis |
| **User-facing** | Permitted as general description ("ambient rhythm") |
| **Files** | `app/components/visual-canvas.tsx`, `app/components/audio-engine.ts` |
| **Last reviewed** | 2026-08-14 |

### R-020: Lightheadedness risk from slow breathing

| Field | Value |
|---|---|
| **Hypothesis** | Slow-paced breathing can cause lightheadedness or dizziness in some individuals, particularly at rates below 5 cpm |
| **Implementation** | Default rate is 5.7 cpm (well within safe range). Slowest preset is 5.1 cpm. Safety onboarding warns about stopping if discomfort occurs. |
| **Confidence** | Literature-informed |
| **User-facing** | Safety warning in onboarding |
| **Expert needed** | Respiratory physiology |
| **Files** | `app/components/onboarding.tsx`, `app/lib/regulation-clock.ts` |
| **Last reviewed** | 2026-08-14 |

### R-021: Breath-focus distress in trauma populations

| Field | Value |
|---|---|
| **Hypothesis** | Directing attention to breathing can trigger distress in individuals with trauma histories, particularly those with PTSD or panic disorder |
| **Implementation** | External Focus pathway provides a non-breath alternative. Removes rhythmic swell from audio, replaces breathing circle with steady visual anchor. Sensory prompts direct attention outward. |
| **Confidence** | Literature-informed |
| **User-facing** | Prohibited — do not claim "trauma-safe" or "PTSD-appropriate" |
| **Expert needed** | Trauma-informed care specialist, clinical psychologist |
| **Files** | `app/components/onboarding.tsx`, `app/components/external-focus-prompts.tsx` |
| **Evidence** | Clinical literature on interoceptive exposure and trauma suggests breath-focused practices can be triggering. External grounding techniques are a common alternative. |
| **Last reviewed** | 2026-08-14 |

### R-022: External Focus pathway

| Field | Value |
|---|---|
| **Hypothesis** | An alternative pathway that directs attention to external sensory experience (rather than breath) provides a safer entry point for users who find breath-focus uncomfortable |
| **Implementation** | "External Focus" pathway: master breathing LFO gain ramped to 0, visual circle uses steady mode (minimal scale modulation), optional sensory prompts rotate every 45s |
| **Parameters** | LFO gain ramp to 0 over default ramp time; visual `steadyMode = true`; prompts: 3 rotating sensory observations |
| **Confidence** | Design hypothesis |
| **User-facing** | Permitted as pathway label |
| **Expert needed** | Trauma-informed care specialist |
| **Files** | `app/components/audio-engine.ts`, `app/components/visual-canvas.tsx`, `app/components/external-focus-prompts.tsx` |
| **Last reviewed** | 2026-08-14 |

### R-023: Ten-minute session duration

| Field | Value |
|---|---|
| **Hypothesis** | A 10-minute option provides a longer reset for users who find 5 minutes insufficient, while remaining short enough to fit into a break |
| **Implementation** | 10-minute reset with wind-down at 540s (9 min), fade-out at 595s (9:55), completion at 600s |
| **Parameters** | `TEN_MINUTE_DURATION_MS = 600_000`, `TEN_MINUTE_WIND_DOWN_AT_MS = 540_000`, `TEN_MINUTE_FADE_OUT_AT_MS = 595_000` |
| **Confidence** | Design hypothesis |
| **User-facing** | Permitted |
| **Files** | `app/lib/constants.ts`, `app/lib/session-controller.ts` |
| **Last reviewed** | 2026-08-14 |

### R-024: Master swell depth testability

| Field | Value |
|---|---|
| **Hypothesis** | The master swell depth (currently 20%) should be easily adjustable for listening tests to find the optimal value |
| **Implementation** | Named constant `MASTER_SWELL_DEPTH = 0.20` in constants.ts. `DEV_SWELL_OPTIONS = [0.10, 0.15, 0.20]` for A/B testing. |
| **Confidence** | Observed implementation fact |
| **User-facing** | Not applicable |
| **Files** | `app/lib/constants.ts`, `app/components/audio-engine.ts` |
| **Last reviewed** | 2026-08-14 |

### R-025: Hard stereo separation concern

| Field | Value |
|---|---|
| **Hypothesis** | Fully panned binaural tones (100% left, 100% right) may cause discomfort in some listeners |
| **Implementation** | Binaural tones use full left/right separation. Binaural toggle allows disabling. |
| **Confidence** | Plausible but unverified |
| **User-facing** | Toggle available ("Binaural tones" with description "most noticeable with headphones") |
| **Expert needed** | Psychoacoustics, audiology |
| **Files** | `app/components/audio-engine.ts`, `app/components/settings-panel.tsx` |
| **Last reviewed** | 2026-08-14 |

### R-026: Accessibility alternatives to visual rhythm

| Field | Value |
|---|---|
| **Hypothesis** | Screen reader users cannot perceive visual breathing rhythm and benefit from optional auditory announcements |
| **Implementation** | Opt-in "Announce rhythm changes" setting. Uses aria-live polite region with "rising" / "settling" announcements. Throttled to one per half-cycle. |
| **Confidence** | Observed implementation fact (accessibility requirement) |
| **User-facing** | Permitted as setting label |
| **Files** | `app/components/rhythm-announcer.tsx`, `app/components/settings-panel.tsx` |
| **Last reviewed** | 2026-08-14 |

### R-027: Static mode rendering optimization

| Field | Value |
|---|---|
| **Hypothesis** | When motion is set to "static," continuous rendering wastes resources since the visual output doesn't change frame to frame |
| **Implementation** | Static mode reduces visual content to background, vignette, rest basin, and breathing circle with minimal modulation. Particle count is 0, no aurora or fog. Animation loop continues but does minimal work. |
| **Confidence** | Observed implementation fact |
| **User-facing** | Not applicable |
| **Files** | `app/components/visual-canvas.tsx` |
| **Last reviewed** | 2026-08-14 |

### R-028: Versioned onboarding

| Field | Value |
|---|---|
| **Hypothesis** | Onboarding content may change as safety information evolves. A versioned key ensures users see updated onboarding when content changes significantly. |
| **Implementation** | localStorage key `regulate-onboarding-v${ONBOARDING_VERSION}`. Incrementing `ONBOARDING_VERSION` re-shows onboarding to all users. |
| **Parameters** | `ONBOARDING_VERSION = 1`, `ONBOARDING_STORAGE_KEY = "regulate-onboarding-v"` |
| **Confidence** | Design hypothesis |
| **User-facing** | Not applicable |
| **Files** | `app/lib/constants.ts`, `app/components/onboarding.tsx` |
| **Last reviewed** | 2026-08-14 |

### R-029: Sensory grounding prompts

| Field | Value |
|---|---|
| **Hypothesis** | Brief sensory observation prompts ("Notice one color around you") support external grounding and are a common technique in trauma-informed care |
| **Implementation** | Three rotating prompts shown during External Focus sessions, changing every 45s with 3s fade transitions |
| **Confidence** | Literature-informed |
| **User-facing** | Permitted as presented (simple observational prompts, no clinical claims) |
| **Expert needed** | Trauma-informed care specialist |
| **Files** | `app/components/external-focus-prompts.tsx` |
| **Evidence** | External sensory grounding is a standard technique in clinical trauma work (e.g., 5-4-3-2-1 grounding). Simplified to single-sense prompts for ambient context. |
| **Last reviewed** | 2026-08-14 |
