import { useEffect, useRef, useState } from "react";
import type { SessionState, SessionDuration } from "../lib/session-controller";
import type { Pathway, AudioReactivity, MotionPreference } from "../lib/settings";
import type { RhythmPresetId, CycleShape } from "../lib/regulation-clock";

interface DiagnosticsProps {
  sessionState: SessionState;
  sessionDuration: SessionDuration;
  pathway: Pathway;
  rhythmPreset: RhythmPresetId;
  cycleShape: CycleShape;
  motionPreference: MotionPreference;
  audioReactivity: AudioReactivity;
  audioLevel: number;
  audioContextState: string;
}

function shouldShow(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (import.meta.env.DEV) return true;
  } catch {}
  return new URLSearchParams(window.location.search).has("diagnostics");
}

export function DiagnosticsOverlay(props: DiagnosticsProps) {
  const [fps, setFps] = useState(0);
  const frameTimesRef = useRef<number[]>([]);
  const rafRef = useRef(0);
  const [visible, setVisible] = useState(shouldShow);

  useEffect(() => {
    if (!visible) return;

    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      const times = frameTimesRef.current;
      times.push(dt);
      if (times.length > 30) times.shift();
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      setFps(Math.round(1000 / avg));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible]);

  if (!visible) return null;

  const lines = [
    `session: ${props.sessionState} (${props.sessionDuration})`,
    `pathway: ${props.pathway}`,
    `rhythm: ${props.rhythmPreset} | shape: ${props.cycleShape}`,
    `motion: ${props.motionPreference}`,
    `audio-rx: ${props.audioReactivity}`,
    `fps: ${fps}`,
    `rms: ${props.audioLevel.toFixed(3)}`,
    `ctx: ${props.audioContextState}`,
  ];

  return (
    <div
      className="fixed top-2 left-2 z-[100] pointer-events-none font-mono text-[10px] leading-tight text-green-400/70 bg-black/50 rounded px-2 py-1"
      aria-hidden="true"
    >
      {lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  );
}
