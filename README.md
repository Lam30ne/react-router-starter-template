# Regulate

A passive ambient reset designed to support relaxation. Regulate combines generative audio synthesis with procedural visuals, breathing together at a slow rhythm.

**Live app**: [https://lam30ne.github.io/regulate-app/](https://lam30ne.github.io/regulate-app/)

## Features

- Three soundscapes: Calm, Ground, Drift
- Shared breathing rhythm at ~5.7 cycles per minute
- Release-biased cycle shape (40% rise / 60% release)
- External Focus pathway for non-breath-based grounding
- 5-minute, 10-minute, and open session modes
- Optional binaural tones
- Adaptive visuals with motion preference support
- PWA with offline support

## Development

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173/regulate-app/`

## Build

```bash
npm run build
```

## Tests

```bash
npm test
```

## Stack

React 19, React Router 7, Tailwind CSS 4, Web Audio API, Canvas 2D

Deployed to GitHub Pages via GitHub Actions.
