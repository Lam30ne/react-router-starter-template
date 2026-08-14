import { useState, useRef, useCallback, useEffect } from "react";
import {
  SessionController,
  type SessionState,
  type SessionDuration,
} from "../lib/session-controller";

interface UseSessionReturn {
  state: SessionState;
  sessionType: SessionDuration;
  progress: number;
  windDownProgress: number;
  startReset: () => void;
  startTenMinuteReset: () => void;
  startOpen: () => void;
  stop: () => void;
  replay: () => void;
}

export function useSession(
  onStateChange?: (state: SessionState, duration: SessionDuration) => void,
): UseSessionReturn {
  const [state, setState] = useState<SessionState>("idle");
  const [sessionType, setSessionType] = useState<SessionDuration>("five-minute");
  const [progress, setProgress] = useState(0);
  const [windDownProgress, setWindDownProgress] = useState(0);
  const onStateChangeRef = useRef(onStateChange);
  onStateChangeRef.current = onStateChange;

  const controllerRef = useRef<SessionController | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = new SessionController({
      onStateChange: (s, d) => {
        setState(s);
        setSessionType(d);
        onStateChangeRef.current?.(s, d);
      },
    });
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const ctrl = controllerRef.current;
      if (!ctrl) return;
      const s = ctrl.getState();
      if (s !== "idle" && s !== "completed") {
        setProgress(ctrl.getProgress());
        setWindDownProgress(ctrl.getWindDownProgress());
      }
    }, 250);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => controllerRef.current?.dispose();
  }, []);

  const startReset = useCallback(() => controllerRef.current?.startReset(), []);
  const startTenMinuteReset = useCallback(() => controllerRef.current?.startTenMinuteReset(), []);
  const startOpen = useCallback(() => controllerRef.current?.startOpen(), []);
  const stop = useCallback(() => controllerRef.current?.stop(), []);
  const replay = useCallback(() => controllerRef.current?.replay(), []);

  return { state, sessionType, progress, windDownProgress, startReset, startTenMinuteReset, startOpen, stop, replay };
}
