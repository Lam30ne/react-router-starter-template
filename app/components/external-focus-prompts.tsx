import { useState, useEffect, useRef } from "react";

const PROMPTS = [
  "Notice one color around you.",
  "Notice one sound outside the app.",
  "Notice where the chair, floor, or surface supports you.",
];

interface ExternalFocusPromptsProps {
  active: boolean;
  visible: boolean;
}

export function ExternalFocusPrompts({ active, visible }: ExternalFocusPromptsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active || !visible) {
      setOpacity(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const showPrompt = () => {
      setOpacity(1);
      setTimeout(() => setOpacity(0), 12000);
    };

    const cycle = () => {
      setCurrentIndex((i) => (i + 1) % PROMPTS.length);
      showPrompt();
    };

    const initialDelay = setTimeout(() => {
      showPrompt();
      intervalRef.current = setInterval(cycle, 45000);
    }, 10000);

    return () => {
      clearTimeout(initialDelay);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [active, visible]);

  if (!active || !visible) return null;

  return (
    <div
      className="fixed top-1/3 left-0 right-0 z-5 flex justify-center pointer-events-none"
      aria-live="polite"
    >
      <p
        className="text-amber-100/40 text-sm font-light tracking-wider max-w-xs text-center transition-opacity duration-[3000ms]"
        style={{ opacity }}
      >
        {PROMPTS[currentIndex]}
      </p>
    </div>
  );
}
