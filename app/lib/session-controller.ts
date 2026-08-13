import {
  RESET_DURATION_MS,
  FADE_IN_MS,
  WIND_DOWN_AT_MS,
  FADE_OUT_AT_MS,
} from "./constants";

export type SessionState =
  | "idle"
  | "starting"
  | "running"
  | "winding-down"
  | "stopping"
  | "completed";

export type SessionType = "reset" | "open";

export interface SessionCallbacks {
  onStateChange: (state: SessionState, sessionType: SessionType) => void;
  onComplete?: () => void;
}

export class SessionController {
  private state: SessionState = "idle";
  private sessionType: SessionType = "reset";
  private startTime = 0;
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private callbacks: SessionCallbacks;

  constructor(callbacks: SessionCallbacks) {
    this.callbacks = callbacks;
  }

  getState(): SessionState {
    return this.state;
  }

  getSessionType(): SessionType {
    return this.sessionType;
  }

  getElapsedMs(): number {
    if (this.state === "idle") return 0;
    return performance.now() - this.startTime;
  }

  getProgress(): number {
    if (this.sessionType !== "reset") return 0;
    if (this.state === "completed") return 1;
    if (this.state === "idle") return 0;
    return Math.min(1, this.getElapsedMs() / RESET_DURATION_MS);
  }

  getWindDownProgress(): number {
    if (this.state !== "winding-down") return 0;
    const elapsed = this.getElapsedMs();
    const windDownDuration = FADE_OUT_AT_MS - WIND_DOWN_AT_MS;
    return Math.min(1, Math.max(0, (elapsed - WIND_DOWN_AT_MS) / windDownDuration));
  }

  startReset(): void {
    if (this.state !== "idle" && this.state !== "completed") return;
    this.sessionType = "reset";
    this.startTime = performance.now();
    this.setState("starting");
    this.startTicking();
  }

  startOpen(): void {
    if (this.state !== "idle" && this.state !== "completed") return;
    this.sessionType = "open";
    this.startTime = performance.now();
    this.setState("starting");
    this.startTicking();
  }

  stop(): void {
    if (this.state === "idle" || this.state === "completed") return;
    this.setState("stopping");
    this.stopTicking();
  }

  replay(): void {
    this.stopTicking();
    this.state = "idle";
    if (this.sessionType === "reset") {
      this.startReset();
    } else {
      this.startOpen();
    }
  }

  dispose(): void {
    this.stopTicking();
    this.state = "idle";
  }

  private setState(next: SessionState): void {
    if (this.state === next) return;
    this.state = next;
    this.callbacks.onStateChange(next, this.sessionType);
    if (next === "completed") {
      this.callbacks.onComplete?.();
    }
  }

  private startTicking(): void {
    this.stopTicking();
    this.tickInterval = setInterval(() => this.tick(), 250);
  }

  private stopTicking(): void {
    if (this.tickInterval !== null) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  private tick(): void {
    if (this.state === "idle" || this.state === "completed") return;

    const elapsed = this.getElapsedMs();

    // For reset sessions that entered stopping via the timer, check completion
    if (this.state === "stopping" && this.sessionType === "reset" && elapsed >= RESET_DURATION_MS) {
      this.stopTicking();
      this.setState("completed");
      return;
    }

    if (this.state === "stopping") return;

    if (this.sessionType === "open") {
      if (this.state === "starting" && elapsed >= FADE_IN_MS) {
        this.setState("running");
      }
      return;
    }

    if (this.state === "starting" && elapsed >= FADE_IN_MS) {
      this.setState("running");
    }

    if (this.state === "running" && elapsed >= WIND_DOWN_AT_MS) {
      this.setState("winding-down");
    }

    if (this.state === "winding-down" && elapsed >= FADE_OUT_AT_MS) {
      this.setState("stopping");
    }
  }
}
