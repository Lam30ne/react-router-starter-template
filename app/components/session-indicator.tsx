import type { SessionState, SessionDuration } from "../lib/session-controller";

interface SessionIndicatorProps {
  state: SessionState;
  sessionType: SessionDuration;
  progress: number;
  onStartAgain: () => void;
  onOpenSession: () => void;
}

export function SessionIndicator({
  state,
  sessionType,
  progress,
  onStartAgain,
  onOpenSession,
}: SessionIndicatorProps) {
  if (state === "completed") {
    return (
      <div className="flex flex-col items-center gap-4 animate-fadeIn">
        <p
          className="text-amber-100/60 text-sm font-light tracking-wider"
          role="status"
          aria-live="polite"
        >
          Reset complete
        </p>
        <div className="flex gap-3">
          <button
            onClick={onStartAgain}
            className="min-h-[44px] px-5 py-2.5 rounded-full bg-amber-200/10 text-amber-100/70 text-xs font-light tracking-wider border border-amber-200/20 hover:bg-amber-200/15 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-amber-200/60 focus-visible:outline-none"
          >
            Run again
          </button>
          <button
            onClick={onOpenSession}
            className="min-h-[44px] px-5 py-2.5 rounded-full text-amber-100/40 text-xs font-light tracking-wider border border-amber-200/10 hover:text-amber-100/60 hover:bg-white/5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-amber-200/60 focus-visible:outline-none"
          >
            Open session
          </button>
        </div>
      </div>
    );
  }

  if (sessionType === "open") return null;
  if (state === "idle") return null;

  const totalSeconds = sessionType === "ten-minute" ? 600 : 300;
  const remaining = Math.max(0, Math.ceil((1 - progress) * totalSeconds));
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="48" height="48" viewBox="0 0 48 48" className="opacity-40">
        <circle
          cx="24" cy="24" r="20"
          fill="none"
          stroke="rgba(251, 191, 36, 0.1)"
          strokeWidth="1.5"
        />
        <circle
          cx="24" cy="24" r="20"
          fill="none"
          stroke="rgba(251, 191, 36, 0.35)"
          strokeWidth="1.5"
          strokeDasharray={`${2 * Math.PI * 20}`}
          strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress)}`}
          strokeLinecap="round"
          transform="rotate(-90 24 24)"
          className="transition-all duration-500"
        />
        <text
          x="24" y="26"
          textAnchor="middle"
          className="fill-amber-100/40 text-[9px] font-light"
        >
          {timeStr}
        </text>
      </svg>
    </div>
  );
}

export function SessionAnnouncer({ state }: { state: SessionState }) {
  const message =
    state === "starting" ? "Session starting" :
    state === "completed" ? "Session complete" :
    state === "stopping" ? "Session ending" :
    null;

  if (!message) return null;

  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
