import { useState, useRef, useCallback, useEffect } from "react";
import type { Route } from "./+types/home";
import { AudioEngine } from "../components/audio-engine";
import { VisualCanvas } from "../components/visual-canvas";
import { Controls } from "../components/controls";
import { SettingsPanel } from "../components/settings-panel";
import { useSession } from "../hooks/use-session";
import { useSettings } from "../lib/settings";
import { getBreathHz } from "../lib/regulation-clock";
import { APP_TITLE, APP_SUBTITLE } from "../lib/constants";
import type { SoundscapeId } from "../lib/settings";
import type { SessionState, SessionType } from "../lib/session-controller";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `${APP_TITLE} — ${APP_SUBTITLE}` },
    {
      name: "description",
      content: "A slow audiovisual environment designed to make settling easier",
    },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    { name: "theme-color", content: "#0f0a05" },
  ];
}

function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768 || navigator.hardwareConcurrency <= 4;
}

export default function Home() {
  const [settings, updateSettings] = useSettings();
  const audioRef = useRef<AudioEngine | null>(null);
  const [showUI, setShowUI] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [visualIntensity] = useState(() => (isMobile() ? 0.5 : 0.65));
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const controlsHovered = useRef(false);
  const wasHiddenRef = useRef(false);

  const handleStateChange = useCallback(
    (state: SessionState, _sessionType: SessionType) => {
      const engine = audioRef.current;
      if (!engine) return;

      if (state === "starting") {
        if (settings.experienceMode !== "visuals-only") {
          engine.start(settings.soundscape, {
            rhythmPreset: settings.rhythmPreset,
            binauralEnabled: settings.binauralEnabled,
          });
        }
      } else if (state === "stopping") {
        engine.stop();
      } else if (state === "completed") {
        setShowUI(true);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      }
    },
    [settings.soundscape, settings.rhythmPreset, settings.binauralEnabled, settings.experienceMode],
  );

  const session = useSession(handleStateChange);
  const isActive = session.state !== "idle" && session.state !== "completed";

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new AudioEngine();
    }
    return () => {
      audioRef.current?.dispose();
    };
  }, []);

  // Auto-hide logic
  const startHideTimer = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (!isActive) return;
    if (settings.keepControlsVisible) return;
    if (settingsOpen) return;

    hideTimerRef.current = setTimeout(() => {
      if (controlsHovered.current) return;
      const active = document.activeElement;
      const controls = document.querySelector('[role="toolbar"]');
      if (controls && active && controls.contains(active)) return;
      setShowUI(false);
    }, 5000);
  }, [isActive, settings.keepControlsVisible, settingsOpen]);

  const revealUI = useCallback(() => {
    setShowUI(true);
    startHideTimer();
  }, [startHideTimer]);

  useEffect(() => {
    if (isActive && !settings.keepControlsVisible && !settingsOpen) {
      startHideTimer();
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isActive, settings.keepControlsVisible, settingsOpen, startHideTimer]);

  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      if (!showUI) {
        e.stopPropagation();
        setShowUI(true);
        startHideTimer();
        wasHiddenRef.current = true;
        return;
      }
      if (wasHiddenRef.current) {
        wasHiddenRef.current = false;
        return;
      }
      if (!settingsOpen && isActive) {
        setShowUI((prev) => !prev);
        if (!showUI) startHideTimer();
      }
    },
    [showUI, settingsOpen, isActive, startHideTimer],
  );

  const handleSoundscapeChange = useCallback(
    (s: SoundscapeId) => {
      updateSettings({ soundscape: s });
      if (isActive && audioRef.current && settings.experienceMode !== "visuals-only") {
        audioRef.current.crossfadeTo(s);
      }
    },
    [isActive, updateSettings, settings.experienceMode],
  );

  const handleVolumeChange = useCallback(
    (level: number) => {
      updateSettings({ volume: level });
      audioRef.current?.setVolume(level);
    },
    [updateSettings],
  );

  const handleBrightnessChange = useCallback(
    (level: number) => {
      updateSettings({ brightness: level });
    },
    [updateSettings],
  );

  const handleStartReset = useCallback(() => {
    audioRef.current?.setVolume(settings.volume);
    session.startReset();
    startHideTimer();
  }, [session, settings.volume, startHideTimer]);

  const handleStartOpen = useCallback(() => {
    audioRef.current?.setVolume(settings.volume);
    session.startOpen();
    startHideTimer();
  }, [session, settings.volume, startHideTimer]);

  const handleStop = useCallback(() => {
    session.stop();
    setShowUI(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, [session]);

  const handleReplay = useCallback(() => {
    session.replay();
    startHideTimer();
  }, [session, startHideTimer]);

  const handleSettingsUpdate = useCallback(
    (update: Partial<typeof settings>) => {
      updateSettings(update);
      if (update.rhythmPreset && audioRef.current) {
        audioRef.current.setRhythm(update.rhythmPreset);
      }
      if (update.binauralEnabled !== undefined && audioRef.current) {
        audioRef.current.setBinauralEnabled(update.binauralEnabled);
      }
    },
    [updateSettings],
  );

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  const showVisuals = settings.experienceMode !== "audio-only";
  const rhythmHz = getBreathHz(settings.rhythmPreset);

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none"
      onMouseMove={revealUI}
      onClick={handleContainerClick}
      onKeyDown={revealUI}
      onFocusCapture={revealUI}
      style={{ cursor: showUI ? "default" : "none" }}
    >
      {showVisuals && (
        <VisualCanvas
          audioEngine={audioRef.current}
          isPlaying={isActive}
          mode={settings.soundscape}
          brightness={settings.brightness}
          visualIntensity={visualIntensity}
          rhythmHz={rhythmHz}
          motionPreference={settings.motionPreference}
          experienceMode={settings.experienceMode}
          windDownProgress={session.windDownProgress}
        />
      )}

      {!showVisuals && (
        <div className="fixed inset-0" style={{ background: "#0f0a05" }} />
      )}

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-10 flex items-start justify-between pt-4 sm:pt-8 pb-8 sm:pb-16 px-4 sm:px-8 bg-gradient-to-b from-black/40 to-transparent transition-opacity duration-1000 ${showUI ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        {...(!showUI ? { inert: "" as unknown as boolean } : {})}
      >
        <div className="w-10" />
        <div className="flex flex-col items-center">
          <h1 className="text-amber-50/70 text-base sm:text-lg font-extralight tracking-[0.3em] uppercase">
            {APP_TITLE}
          </h1>
          <p className="text-amber-100/55 text-xs font-light tracking-wider mt-1">
            {APP_SUBTITLE}
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-amber-100/50 hover:text-amber-100/80 hover:bg-white/5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-amber-200/60 focus-visible:outline-none"
          aria-label="Toggle fullscreen"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 6V1h5M17 6V1h-5M1 12v5h5M17 12v5h-5" />
          </svg>
        </button>
      </header>

      {/* Controls */}
      <div
        className={`transition-opacity duration-1000 ${showUI ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        {...(!showUI ? { inert: "" as unknown as boolean } : {})}
        onPointerEnter={() => { controlsHovered.current = true; }}
        onPointerLeave={() => { controlsHovered.current = false; }}
      >
        <Controls
          sessionState={session.state}
          sessionType={session.sessionType}
          progress={session.progress}
          soundscape={settings.soundscape}
          volume={settings.volume}
          brightness={settings.brightness}
          onStartReset={handleStartReset}
          onStartOpen={handleStartOpen}
          onStop={handleStop}
          onReplay={handleReplay}
          onSoundscapeChange={handleSoundscapeChange}
          onVolumeChange={handleVolumeChange}
          onBrightnessChange={handleBrightnessChange}
          onOpenSettings={() => { setSettingsOpen(true); }}
        />
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        settings={settings}
        onUpdate={handleSettingsUpdate}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
