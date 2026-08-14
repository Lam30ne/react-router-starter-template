# Regulate — Performance Test Matrix

## Target Devices

| Category | Device | OS | Browser | Expected Tier |
|----------|--------|----|---------|---------------|
| Desktop High | MacBook Pro M2+ | macOS 14+ | Chrome, Safari | High (full particles, aurora, fog) |
| Desktop Mid | Intel i5 laptop | Windows 11 | Chrome, Firefox | Medium (reduced particles) |
| Desktop Low | Chromebook | ChromeOS | Chrome | Low (minimal particles, no aurora) |
| Mobile High | iPhone 15 Pro | iOS 17+ | Safari | Medium (mobile detection) |
| Mobile Mid | iPhone 12 | iOS 16+ | Safari | Medium |
| Mobile Low | Android budget (4 cores) | Android 13+ | Chrome | Low |
| Tablet | iPad Air | iPadOS 17+ | Safari | Medium |

## Metrics to Capture

### Visual Performance
- **FPS**: Target 60fps on high, 30fps minimum on low
- **Frame budget**: < 16ms per frame on high, < 33ms on low
- **Particle count**: Verify adaptive quality selects appropriate count
- **Canvas resolution**: DPR capped at 2x, verify on high-DPR displays
- **Memory**: Canvas buffer size stays reasonable (check Chrome DevTools > Memory)

### Audio Performance
- **AudioContext state**: Verify single context, correct state transitions
- **Audio glitches**: No pops, clicks, or gaps during crossfade
- **CPU from audio**: Web Audio processing thread stays under 10% CPU

### Session Lifecycle
- **Fade-in timing**: 5s audio fade matches expected curve
- **Wind-down visual**: Density reduces starting at 4:15 (5-min) / 9:00 (10-min)
- **Completion**: State transitions happen at correct timestamps
- **Tab hidden**: Canvas pauses, audio continues, no time jump on return

### PWA
- **Install prompt**: Appears on Android Chrome, Safari iOS
- **Offline**: App shell loads with network disconnected
- **Icons**: 192x192, 512x512, maskable 512x512 all display correctly

## Test Procedure

1. Open app on target device + browser
2. Start a 5-minute reset session
3. Monitor FPS via diagnostics overlay (`?diagnostics` query param)
4. Switch soundscapes mid-session (test crossfade)
5. Toggle settings mid-session (test reactivity)
6. Let session complete naturally
7. Start a 10-minute reset, stop at ~2 minutes
8. Start an open session, let run for 1 minute, stop
9. Test offline by disabling network after initial load
10. Record all metrics in spreadsheet

## Pass/Fail Criteria

| Metric | Pass | Fail |
|--------|------|------|
| FPS (high tier) | Sustained 55+ fps | Drops below 30 fps |
| FPS (low tier) | Sustained 25+ fps | Drops below 15 fps |
| Audio glitches | Zero during 10-min session | Any audible pop or gap |
| Memory growth | < 50MB over 10-min session | > 100MB or visible leak |
| Tab resume | Visuals resume within 1 frame, no jump | Visible time skip > 1s |
| Offline load | App shell renders | Blank page or error |
| DPR cap | Canvas at 2x max on 3x display | Canvas at full 3x |
