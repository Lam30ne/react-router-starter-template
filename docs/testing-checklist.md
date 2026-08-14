# Regulate — Manual Testing Checklist

## Session Model — 5-Minute Reset
- [ ] "Start 5-Minute Reset" begins a session with 5s audio fade-in
- [ ] Session runs normally for ~4 minutes without interruption
- [ ] Wind-down begins at ~4:15, visual density reduces gradually
- [ ] Final fade at ~4:55, audio fades to silence
- [ ] "Reset complete" appears with "Run again" and "Open session" options
- [ ] Stop during any phase fades audio out over ~4 seconds
- [ ] No countdown or timer dominates the screen

## Session Model — 10-Minute Reset
- [ ] "10-Minute Reset" button is visible as a secondary option
- [ ] Session starts with same 5s audio fade-in
- [ ] Session runs normally for ~9 minutes
- [ ] Wind-down begins at ~9:00, visual density reduces gradually
- [ ] Final fade at ~9:55, audio fades to silence
- [ ] "Reset complete" appears at 10:00 with "Run again" and "Open session" options
- [ ] Progress indicator shows correct time remaining (10:00 countdown)
- [ ] Replay from completed state starts another 10-minute session

## Session Model — Open Session
- [ ] "Open session" runs indefinitely until manually stopped
- [ ] No progress indicator during open session
- [ ] No wind-down or completion state

## Soundscapes
- [ ] Calm, Ground, Drift each produce distinct tonal palettes
- [ ] Switching soundscapes during playback crossfades smoothly (~4s)
- [ ] No audio gap or pop during crossfade
- [ ] No second AudioContext created during crossfade

## Settings
- [ ] Settings panel opens from gear icon
- [ ] Rhythm: Slower/Steady/Faster toggles work
- [ ] Cycle shape: Longer release / Balanced toggles work
- [ ] Binaural toggle mutes/unmutes the stereo offset tones
- [ ] Experience: Audio+Visuals / Audio-only / Visuals-only each work
- [ ] Audio-only shows dark background, no canvas rendering
- [ ] Visuals-only runs visuals without creating AudioContext
- [ ] Audio reactivity: On / Reduced / Off each take effect
- [ ] Motion: System/Full/Reduced/Static each take effect without reload
- [ ] Static removes particles, aurora, fog — breathing circle only
- [ ] Keep controls visible prevents auto-hide
- [ ] Announce rhythm changes toggle works with screen reader
- [ ] All settings persist across page reloads (localStorage)
- [ ] Corrupted localStorage values fallback to defaults

## Auto-hide
- [ ] Controls hide after 5s of inactivity during playback
- [ ] Mouse movement reveals controls
- [ ] Keyboard activity reveals controls
- [ ] Focus on a control reveals controls
- [ ] Controls don't hide while keyboard focus is inside controls
- [ ] Controls don't hide while pointer is over controls
- [ ] Controls don't hide while settings panel is open
- [ ] First tap when hidden reveals controls only (no button activation)
- [ ] Cursor hides when controls are hidden

## Accessibility
- [ ] All buttons have accessible names (check with screen reader)
- [ ] All interactive targets are at least 44x44px
- [ ] Tab order is logical: pathway → soundscapes → sliders → session buttons → settings
- [ ] Volume/brightness sliders announce current value
- [ ] Session start and completion are announced via aria-live
- [ ] Hidden controls remain in a11y tree (no inert attribute)
- [ ] Keyboard focus on hidden control reveals the controls
- [ ] Canvas has descriptive aria-label
- [ ] Visible focus rings on all interactive elements
- [ ] prefers-reduced-motion is respected (check System motion setting)
- [ ] Changing system motion preference takes effect without reload

## Visual Performance
- [ ] Throttle to 30fps in Chrome DevTools — visuals should look similar to 60fps
- [ ] Particles don't move 2x faster at 120fps or 2x slower at 30fps
- [ ] Tab switch: canvas rendering pauses when tab is hidden
- [ ] Tab return: visuals resume without a large time jump
- [ ] DPR cap: canvas renders at max 2x device pixel ratio

## Audio
- [ ] Audio continues playing when tab is hidden
- [ ] No clipping at maximum volume (compressor catches peaks)
- [ ] Audio fades are smooth exponential curves, no pops
- [ ] Stop and replay don't leak audio nodes (check Chrome DevTools)

## PWA
- [ ] Manifest loads correctly (check Chrome DevTools > Application > Manifest)
- [ ] All three icons display (192, 512, maskable)
- [ ] Service worker registers on production deploy
- [ ] After initial load: disconnect network, reload — app shell loads
- [ ] Install prompt appears on supported browsers
- [ ] start_url and scope match the deployment base path

## User-Facing Copy
- [ ] No mention of theta, delta, Schumann, brainwave, or entrainment
- [ ] No "nervous system regulation" or similar claims
- [ ] Page title: "Regulate — Ambient sound & visuals"
- [ ] Soundscape descriptions use wellness language
- [ ] General wellness disclaimer in settings panel

## Cross-Browser
- [ ] Chrome desktop: full experience works
- [ ] Chrome mobile: touch interactions, auto-hide, install
- [ ] Safari iOS: AudioContext resume on first interaction
- [ ] Firefox: DynamicsCompressorNode functions correctly
- [ ] Safari macOS: service worker and offline behavior

## Device Testing
- [ ] iOS PWA install and offline behavior
- [ ] Android PWA install and offline behavior
- [ ] Low-end device: adaptive quality degrades gracefully

## Onboarding
- [ ] First visit shows onboarding screen before any session
- [ ] "Before you begin" heading is visible
- [ ] Health warning text is displayed
- [ ] Expandable safety details section works (expand/collapse)
- [ ] Contraindications list is comprehensive and readable
- [ ] "Start ambient reset" button dismisses and selects Ambient Rhythm pathway
- [ ] "Use external focus" button dismisses and selects External Focus pathway
- [ ] After dismissal, onboarding does not reappear on reload
- [ ] Clearing localStorage key `regulate-onboarding-v1` re-shows onboarding
- [ ] Incrementing ONBOARDING_VERSION re-shows onboarding for all users

## External Focus Pathway
- [ ] Selecting "External Focus" in controls changes the pathway
- [ ] Audio: master breathing swell ramps to 0 (no rhythmic volume modulation)
- [ ] Visual: breathing circle becomes steady (minimal scale modulation)
- [ ] Sensory prompts appear during active External Focus sessions
- [ ] Prompts rotate every ~45 seconds
- [ ] Prompts fade in/out smoothly (3s transition)
- [ ] Prompts are not shown when controls are hidden
- [ ] Switching back to "Ambient Rhythm" restores rhythmic swell and breathing circle

## Cycle Shape
- [ ] Default cycle shape is "Longer release" (40/60 ratio)
- [ ] "Balanced" option produces symmetrical 50/50 cycle
- [ ] Visual breathing circle matches selected cycle shape
- [ ] Switching cycle shape takes effect immediately during session
- [ ] Setting persists across reloads

## Audio Reactivity
- [ ] Default audio reactivity is "On"
- [ ] "Reduced" dampens audio influence on visuals
- [ ] "Off" removes all audio influence on visuals
- [ ] Switching during a session takes effect immediately
- [ ] Setting persists across reloads

## Rhythm Announcer
- [ ] "Announce rhythm changes" toggle is off by default
- [ ] When enabled during a session, screen reader announces "rising" and "settling"
- [ ] Announcements occur at most once per half-cycle (no flooding)
- [ ] When disabled, no announcements are made
- [ ] Setting persists across reloads

## Diagnostics Overlay
- [ ] Overlay appears in development mode (`npm run dev`)
- [ ] Overlay appears in production with `?diagnostics` query parameter
- [ ] Overlay does not appear in production without query parameter
- [ ] Overlay shows: session state, pathway, rhythm preset, cycle shape
- [ ] Overlay shows: motion preference, audio reactivity, audio level, AudioContext state
- [ ] Overlay is not interactive (pointer-events: none)
- [ ] Overlay is hidden from screen readers (aria-hidden)
