# Regulate — Decision Log

## D-001: Primary experience is a five-minute reset

| Field | Value |
|---|---|
| **Date** | 2026-08-13 |
| **Decision** | The primary call-to-action starts a five-minute timed session with structured arc (fade-in, play, wind-down, fade-out, completion) |
| **Rationale** | A defined-length session lowers the barrier to starting, provides a clear endpoint, and avoids the indefinite commitment of an open session |
| **Alternatives** | Open session only (current); configurable duration (adds complexity); progressive sessions |
| **Consequences** | Need session controller with state machine, wind-down visual/audio behavior, completion UI |
| **Revisit when** | User research shows most sessions are stopped early or run significantly longer |

## D-002: Open sessions remain available

| Field | Value |
|---|---|
| **Date** | 2026-08-13 |
| **Decision** | An "Open Session" option is available as a secondary action alongside the five-minute reset |
| **Rationale** | Some users prefer extended ambient use without time pressure |
| **Alternatives** | Only timed sessions; configurable timer |
| **Consequences** | Two session types in the state machine; open sessions have no wind-down or completion state |
| **Revisit when** | Usage data available to determine if open sessions are used |

## D-003: Experience is passive, not explicitly guided

| Field | Value |
|---|---|
| **Date** | 2026-08-13 |
| **Decision** | No inhale/exhale labels, breath counting, hold phases, spoken guidance, or body-scan animations |
| **Rationale** | The product thesis is that passive exposure to rhythmic stimuli can promote settling without conscious compliance. Guided breathing is a different product. |
| **Alternatives** | Optional guided mode; breath-phase labels; spoken cues |
| **Consequences** | The breathing circle must remain visually subtle enough to not imply failure if the user doesn't follow it |
| **Revisit when** | Expert review or user research suggests guided options would not undermine the passive premise |

## D-004: Default shared rhythm is 5.7 cycles per minute

| Field | Value |
|---|---|
| **Date** | 2026-08-13 |
| **Decision** | The default rhythm is 5.7 cpm (0.095 Hz), with presets at 5.1 (Slower) and 6.1 (Faster) |
| **Rationale** | 5.7 is within the 4.5–6.5 cpm resonance frequency range. Non-round values prevent obvious metronome feel. |
| **Alternatives** | 6.0 cpm (round number, feels mechanical); user-configurable continuous slider (over-precise) |
| **Consequences** | Three discrete presets. Numerical values shown as secondary detail in settings, not primary labels. |
| **Revisit when** | Physiological measurement data suggests a different default is more effective |

## D-005: Calm, Ground, and Drift are soundscapes

| Field | Value |
|---|---|
| **Date** | 2026-08-13 |
| **Decision** | Rename "Mode" to "Soundscape" in user-facing terminology. The three options are tonal palettes, not separate regulatory interventions. |
| **Rationale** | Calling them "modes" implies they do different things mechanically. They share the same rhythm and regulatory mechanism. |
| **Alternatives** | Keep "Mode"; rename to "Tone" or "Scene" |
| **Consequences** | UI label changes; internal rename where safe; code may retain `mode` in some places as technical debt |
| **Revisit when** | If soundscapes are expanded or given genuinely different regulatory parameters |

## D-006: Binaural audio is optional

| Field | Value |
|---|---|
| **Date** | 2026-08-13 |
| **Decision** | Binaural texture can be toggled off in settings. Default is on. |
| **Rationale** | Not all users have headphones; some may find the stereo separation uncomfortable. The regulatory mechanism is the rhythm, not the binaural beats. |
| **Alternatives** | Always on; auto-detect headphones (unreliable) |
| **Consequences** | Need gain ramp on binaural bus; persist preference in localStorage |
| **Revisit when** | Expert review of binaural efficacy |

## D-007: Scientific rationale remains internal

| Field | Value |
|---|---|
| **Date** | 2026-08-13 |
| **Decision** | All scientific and design rationales are preserved in docs/research-ledger.md. None appear in user-facing copy. |
| **Rationale** | The rationales inform design decisions but are not clinically validated for this product. User-facing claims could be misleading. |
| **Alternatives** | Include disclaimered rationale in an About section; remove rationale entirely |
| **Consequences** | User-facing copy uses wellness language only. Internal docs are comprehensive. |
| **Revisit when** | Clinical validation is completed |

## D-008: Scientific claims not shown to users

| Field | Value |
|---|---|
| **Date** | 2026-08-13 |
| **Decision** | Remove theta, delta, Schumann resonance, "nervous system regulation," brainwave entrainment, and similar claims from all user-facing text |
| **Rationale** | These claims lack validation for this specific product and could be misleading |
| **Alternatives** | Disclaimered claims; educational "how it works" section |
| **Consequences** | Mode descriptions, page titles, meta tags, and hints all need copy updates |
| **Revisit when** | Expert review provides validated claims suitable for user-facing use |

## D-009: Outcome surveys and biometric measurement are deferred

| Field | Value |
|---|---|
| **Date** | 2026-08-13 |
| **Decision** | No pre/post surveys, HRV, heart rate, electrodermal activity, or other measurement in this release |
| **Rationale** | Current priority is completing the core experience, PWA, and accessibility. Measurement is a separate research phase. |
| **Alternatives** | Simple post-session "how do you feel" prompt (deferred) |
| **Consequences** | No analytics, no data collection, no accounts, no cloud storage |
| **Revisit when** | Core experience is stable and user base is established |

## D-010: Application uses one AudioContext

| Field | Value |
|---|---|
| **Date** | 2026-08-13 |
| **Decision** | Refactor audio engine to create and reuse a single AudioContext for the application's lifetime |
| **Rationale** | Multiple contexts waste resources, cause potential browser throttling, and risk audio glitches during crossfades |
| **Alternatives** | Current approach (new context per start/crossfade); pooled contexts |
| **Consequences** | Crossfade via bus gains, not context replacement. Context suspended when idle, not closed. |
| **Revisit when** | Browser AudioContext behavior changes significantly |

## D-011: Visual simulation is time-based

| Field | Value |
|---|---|
| **Date** | 2026-08-13 |
| **Decision** | Convert all frame-dependent visual calculations to elapsed-time-based |
| **Rationale** | Frame-dependent logic produces different behavior at 30, 60, and 120 fps. Time-based ensures consistent visual experience. |
| **Alternatives** | Fixed timestep with interpolation (over-complex for this use case) |
| **Consequences** | Particle lifetimes in seconds, damping via power function, delta-time scaling throughout |
| **Revisit when** | N/A — this is standard practice |

## D-012: PWA completion and accessibility are current priorities

| Field | Value |
|---|---|
| **Date** | 2026-08-13 |
| **Decision** | Complete PWA (icons, service worker, offline) and accessibility (keyboard, screen reader, motion preferences) in this release |
| **Rationale** | An installable, offline-capable, accessible app is the minimum viable product |
| **Alternatives** | Defer PWA to later; accessibility as separate pass |
| **Consequences** | Need generated icons, handwritten service worker, accessibility audit, motion preference UI |
| **Revisit when** | After deployment and user feedback |

## Future Measurement (Not Implemented)

Future validation may include:
- Heart-rate variability (HRV)
- Heart rate
- Electrodermal activity
- Respiration rate and pattern
- Subjective activation scales
- Session completion rates
- Comfort and adverse-effect reporting

These are future research possibilities, not current product capabilities or proof of efficacy.
