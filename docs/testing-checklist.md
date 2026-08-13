# Regulate — Manual Testing Checklist

## Session Model
- [ ] "Start 5-Minute Reset" begins a session with 5s audio fade-in
- [ ] Session runs normally for ~4 minutes without interruption
- [ ] Wind-down begins at ~4:15, visual density reduces gradually
- [ ] Final fade at ~4:55, audio fades to silence
- [ ] "Reset complete" appears with "Start again" and "Open session" options
- [ ] "Open session" runs indefinitely until manually stopped
- [ ] Stop during any phase fades audio out over ~4 seconds
- [ ] No countdown or timer dominates the screen

## Soundscapes
- [ ] Calm, Ground, Drift each produce distinct tonal palettes
- [ ] Switching soundscapes during playback crossfades smoothly (~4s)
- [ ] No audio gap or pop during crossfade
- [ ] No second AudioContext created during crossfade

## Settings
- [ ] Settings panel opens from gear icon
- [ ] Rhythm: Slower/Steady/Faster toggles work
- [ ] Binaural toggle mutes/unmutes the stereo offset tones
- [ ] Experience: Audio+Visuals / Audio-only / Visuals-only each work
- [ ] Audio-only shows dark background, no canvas rendering
- [ ] Visuals-only runs visuals without creating AudioContext
- [ ] Motion: System/Full/Reduced/Static each take effect without reload
- [ ] Static removes particles, aurora, fog — breathing circle only
- [ ] Keep controls visible prevents auto-hide
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
- [ ] Tab order is logical: soundscapes → sliders → session buttons → settings
- [ ] Volume/brightness sliders announce current value
- [ ] Session start and completion are announced via aria-live
- [ ] Hidden controls are marked inert (not focusable by screen reader)
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
