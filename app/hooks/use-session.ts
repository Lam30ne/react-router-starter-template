import { useState, useRef, useCallback, useEffect } from "react";
import {
  SessionController,
  type SessionState,
  type SessionType,
} from "../lib/session-controller";

interface UseSessionReturn {
  state: SessionState;
  sessionType: SessionType;
  progress: number;
  windDownProgress: number;
  startReset: () => void;
  startOpen: () => void;
  stop: () => void;
  replay: () => void;
}

export function useSession(
  onStateChange?: (state: SessionState, sessionType: SessionType) => void,
): UseSessionReturn {
  const [state, setState] = useState<SessionState>("idle");
  const [sessionType, setSessionType] = useState<SessionType>("reset");
  const [progress, setProgress] = useState(0);
  const [windDownProgress, setWindDownProgress] = useState(0);
  const onStateChangeRef = useRef(onStateChange);
  onStateChangeRef.current = onStateChange;

  const controllerRef = useRef<SessionController | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = new SessionController({
      onStateChange: (s, t) => {
        setState(s);
        setSessionType(t);
        onStateChangeRef.current?.(s, t);
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
  const startOpen = useCallback(() => controllerRef.current?.startOpen(), []);
  const stop = useCallback(() => controllerRef.current?.stop(), []);
  const replay = useCallback(() => controllerRef.current?.replay(), []);

  return { state, sessionType, progress, windDownProgress, startReset, startOpen, stop, replay };
}
