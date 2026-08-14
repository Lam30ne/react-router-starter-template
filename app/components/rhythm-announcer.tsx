import { useRef, useEffect, useState } from "react";

interface RhythmAnnouncerProps {
  enabled: boolean;
  breathPhase: number;
}

export function RhythmAnnouncer({ enabled, breathPhase }: RhythmAnnouncerProps) {
  const [announcement, setAnnouncement] = useState("");
  const prevPhaseRef = useRef(breathPhase);
  const lastAnnouncedRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setAnnouncement("");
      return;
    }

    const prev = prevPhaseRef.current;
    prevPhaseRef.current = breathPhase;

    const now = Date.now();
    if (now - lastAnnouncedRef.current < 2000) return;

    if (prev <= 0.5 && breathPhase > 0.5) {
      setAnnouncement("rising");
      lastAnnouncedRef.current = now;
    } else if (prev >= 0.5 && breathPhase < 0.5) {
      setAnnouncement("settling");
      lastAnnouncedRef.current = now;
    }
  }, [enabled, breathPhase]);

  if (!enabled || !announcement) return null;

  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement}
    </div>
  );
}
