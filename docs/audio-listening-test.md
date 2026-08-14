# Regulate — Audio Listening Test Protocol

## Purpose

Evaluate audio comfort, swell depth perception, and crossfade quality through structured listening sessions.

## Test 1: Master Swell Depth

**Current value**: `MASTER_SWELL_DEPTH = 0.20` (20% gain modulation at breath rate)

**Test conditions**: Three depth levels — 10%, 15%, 20% (defined in `DEV_SWELL_OPTIONS`)

**Method**:
1. Participant listens to each depth for 2 minutes in randomized order
2. 30-second silence between conditions
3. After each condition: rate on 1-7 scale for "noticeable," "comfortable," "natural"
4. After all three: rank preference and describe ideal in own words

**Participants**: 8-12 adults, headphones required.

**Success criteria**: Preferred depth should feel "natural" (5+ on 7-point scale) and "comfortable" (5+). If 20% scores below 4 on comfort, reduce the default.

---

## Test 2: Stereo Comfort (Binaural Tones)

**Test conditions**: Binaural on vs. off, across all three soundscapes.

**Method**:
1. 2 minutes per soundscape with binaural on, then 2 minutes with binaural off (randomized)
2. Rate each on 1-7 scale for "comfortable," "distracting," "pleasant"
3. Open question: "Did you notice anything about the left/right difference?"

**Listening notes**:
- Hard stereo separation: binaural tones are fully left/right with no center blending
- Current binaural offsets: calm 4 Hz, ground 7.83 Hz, drift 2.5 Hz
- Watch for: headache reports, discomfort, nausea

**Success criteria**: No participant reports discomfort above 2 on 7-point scale. If any do, consider reducing binaural gain or adding partial center blending.

---

## Test 3: Soundscape Crossfade

**Method**:
1. Start with Calm soundscape
2. Switch to Ground (observe crossfade)
3. Switch to Drift (observe crossfade)
4. Rate each crossfade: "smooth," "jarring," "natural" on 1-7 scale

**Technical notes**:
- Crossfade duration: 4 seconds
- Old soundscape fades out while new fades in (parallel buses)
- No AudioContext recreation during crossfade

**Success criteria**: All crossfades rate 5+ on "smooth." No audible pops or gaps.

---

## Test 4: Extended Listening (Endurance)

**Method**: 10-minute session with preferred soundscape. No interaction required.

**Post-session questions**:
- "Did the sound become annoying at any point?"
- "Did you notice any repeating patterns?"
- "Was the volume comfortable throughout?"
- "Did you feel any ear fatigue?"

**Success criteria**: No participant reports annoyance before 8 minutes. No ear fatigue reports.

---

## Equipment Requirements

- Over-ear or in-ear headphones (no speakers — binaural test requires isolation)
- Quiet room (ambient noise < 40 dB)
- Consistent playback device across participants
- Volume normalized to 70 dB SPL at participant's ear

## Data Recording

Record all ratings in a spreadsheet. Audio tests should not be recorded (privacy). Note any spontaneous comments verbatim.
