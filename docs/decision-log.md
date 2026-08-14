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

## D-013: Default cycle shape is 40/60 (longer release)

| Field | Value |
|---|---|
| **Date** | 2026-08-14 |
| **Decision** | The default breath cycle shape uses a 40% rise / 60% release ratio, implemented as a piecewise cosine envelope |
| **Rationale** | Extended release phase aligns with literature on prolonged exhalation and parasympathetic activation. The asymmetry is subtle enough to not feel unnatural. |
| **Alternatives** | 50/50 balanced (available as option); 30/70 (too pronounced); user-adjustable ratio (over-complex) |
| **Consequences** | Need `getShapedBreathPhase()` function with piecewise cosine; "Balanced" alternative in settings |
| **Revisit when** | Listening tests or physiological measurement suggest a different ratio |

## D-014: Ten-minute reset as secondary option

| Field | Value |
|---|---|
| **Date** | 2026-08-14 |
| **Decision** | A 10-minute timed reset is available as a secondary action alongside the primary 5-minute reset |
| **Rationale** | Some users may benefit from a longer session, particularly for deeper settling. 10 minutes is short enough for a work break. |
| **Alternatives** | Configurable duration slider (adds complexity); 15 or 20 minute options (too long for most breaks) |
| **Consequences** | Session controller handles three duration types; wind-down timing adjusted for longer session (60s wind-down starting at 9:00) |
| **Revisit when** | Usage data shows whether 10-minute sessions are actually used |

## D-015: Onboarding before first use

| Field | Value |
|---|---|
| **Date** | 2026-08-14 |
| **Decision** | A safety-focused onboarding screen appears before the first session, presenting health warnings and pathway choice |
| **Rationale** | Trauma-informed design requires informed consent. Users should understand what the app does and have an exit ramp before exposure to rhythmic stimuli. |
| **Alternatives** | Skip onboarding, put warnings in settings only (less visible); mandatory onboarding every session (too intrusive) |
| **Consequences** | Versioned localStorage key for re-showing when content changes; pathway choice integrated into onboarding flow |
| **Revisit when** | UX research reveals onboarding is a barrier to adoption |

## D-016: External Focus as alternative pathway

| Field | Value |
|---|---|
| **Date** | 2026-08-14 |
| **Decision** | An "External Focus" pathway removes breath-related audio modulation and visual rhythm, replacing them with a steady environment and optional sensory prompts |
| **Rationale** | Breath-focused practices can trigger distress in trauma populations. External grounding is a recognized alternative in clinical practice. |
| **Alternatives** | No alternative (exclusionary); guided grounding script (too directive for passive app); separate app |
| **Consequences** | Audio engine needs pathway-aware LFO control; visual canvas needs steady mode; new external-focus-prompts component |
| **Revisit when** | Expert review of trauma-informed approach; user research on pathway usage |

## D-017: Audio reactivity setting (on/reduced/off)

| Field | Value |
|---|---|
| **Date** | 2026-08-14 |
| **Decision** | Users can control how much audio analysis influences visuals: full, reduced (30% dampening), or off |
| **Rationale** | Audio-reactive visuals add richness but some users may find them distracting or overstimulating |
| **Alternatives** | Binary on/off (less granular); automatic based on motion preference (conflates two concerns) |
| **Consequences** | `getAudioLevel()` returns modified values based on setting; visual canvas respects the setting |
| **Revisit when** | User feedback on whether "reduced" is a useful middle ground |

## D-018: Rhythm announcements are opt-in

| Field | Value |
|---|---|
| **Date** | 2026-08-14 |
| **Decision** | Screen reader rhythm announcements ("rising" / "settling") are off by default and enabled via settings |
| **Rationale** | Frequent announcements every half-cycle could be intrusive for screen reader users. Making it opt-in respects user preference. |
| **Alternatives** | On by default for screen reader users (hard to detect reliably); always off (reduces accessibility) |
| **Consequences** | Need RhythmAnnouncer component with aria-live; toggle in settings; throttling to prevent announcement flooding |
| **Revisit when** | Accessibility testing with screen reader users |

## D-019: MASTER_SWELL_DEPTH as named constant

| Field | Value |
|---|---|
| **Date** | 2026-08-14 |
| **Decision** | The master breathing swell depth (0.20) is extracted to a named constant in constants.ts with test options [0.10, 0.15, 0.20] |
| **Rationale** | The swell depth needs to be easily adjustable for listening tests. A named constant documents the value and makes it searchable. |
| **Alternatives** | Inline value (hard to find and adjust); user-configurable slider (premature) |
| **Consequences** | `DEV_SWELL_OPTIONS` array available for future A/B testing UI |
| **Revisit when** | After listening tests determine optimal depth |

## D-020: BRAND centralization

| Field | Value |
|---|---|
| **Date** | 2026-08-14 |
| **Decision** | Brand name, short name, and description are centralized in a `BRAND` constant in constants.ts |
| **Rationale** | If the name changes (trademark issues), only one file needs updating. Prevents inconsistent naming across components. |
| **Alternatives** | Environment variable (adds build complexity); distributed constants (inconsistency risk) |
| **Consequences** | All components import from BRAND; page title derives from BRAND.name |
| **Revisit when** | Trademark search results available |

## D-021: Auto-hide accessibility fix

| Field | Value |
|---|---|
| **Date** | 2026-08-14 |
| **Decision** | Hidden controls use `opacity-0` + `pointer-events-none` instead of `inert` attribute. Controls remain in the accessibility tree when visually hidden. |
| **Rationale** | Using `inert` removes controls from the a11y tree entirely, making them undiscoverable by keyboard navigation. The `onFocusCapture` handler reveals controls when keyboard focus enters them, providing a natural discovery mechanism. |
| **Alternatives** | `inert` attribute (simpler but less accessible); `aria-hidden` (same problem as inert); visible at all times (defeats auto-hide purpose) |
| **Consequences** | Screen readers can navigate to hidden controls; focus entering the area triggers reveal; cursor hides when controls are hidden |
| **Revisit when** | Accessibility audit with screen reader users |

## D-022: Diagnostics overlay is dev-only

| Field | Value |
|---|---|
| **Date** | 2026-08-14 |
| **Decision** | The diagnostics overlay renders only in development mode (`import.meta.env.DEV`) or when `?diagnostics` query parameter is present |
| **Rationale** | Diagnostics are useful for development and testing but would confuse end users. The query param escape hatch allows debugging production builds. |
| **Alternatives** | Always available behind a secret gesture (discoverable risk); dev-only with no production access (limits debugging) |
| **Consequences** | DiagnosticsOverlay component conditionally renders; shows session state, FPS, audio state, pathway, rhythm, etc. |
| **Revisit when** | If production debugging needs increase |

## D-023: Onboarding versioned key

| Field | Value |
|---|---|
| **Date** | 2026-08-14 |
| **Decision** | Onboarding dismissal is stored with a versioned localStorage key (`regulate-onboarding-v1`). Incrementing `ONBOARDING_VERSION` re-shows onboarding to all users. |
| **Rationale** | Safety information may evolve. When it does, all users should see the updated onboarding regardless of whether they dismissed a previous version. |
| **Alternatives** | Unversioned key (users never see updates); force clear all localStorage (loses settings); in-app notification of changes (more complex) |
| **Consequences** | `ONBOARDING_VERSION` constant in constants.ts; `hasSeenOnboarding()` checks version-specific key |
| **Revisit when** | Safety information is updated |

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
