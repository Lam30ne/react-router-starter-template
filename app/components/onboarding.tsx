import { useState } from "react";
import { ONBOARDING_VERSION, ONBOARDING_STORAGE_KEY, BRAND } from "../lib/constants";
import type { Pathway } from "../lib/settings";

const STORAGE_KEY = `${ONBOARDING_STORAGE_KEY}${ONBOARDING_VERSION}`;

export function hasSeenOnboarding(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function markOnboardingSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {}
}

interface OnboardingProps {
  onDismiss: (pathway: Pathway) => void;
}

export function Onboarding({ onDismiss }: OnboardingProps) {
  const [showSafety, setShowSafety] = useState(false);

  const handleDismiss = (pathway: Pathway) => {
    markOnboardingSeen();
    onDismiss(pathway);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#0f0a05" }}>
      <div className="w-full max-w-md space-y-6">
        <h2 className="text-amber-100/70 text-lg font-extralight tracking-wider text-center">
          Before you begin
        </h2>

        <div className="space-y-3 text-amber-100/50 text-sm font-light leading-relaxed">
          <p>
            {BRAND.name} is a general wellness experience, not medical care.
          </p>
          <p>
            You do not need to match the rhythm or take unusually deep breaths.
            You are in control and can stop at any time.
          </p>
          <p>
            If you feel lightheaded, tingly, short of breath, panicky, or
            uncomfortable, stop the session and breathe normally.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 pt-2">
          <button
            onClick={() => handleDismiss("ambient-rhythm")}
            className="min-h-[44px] w-full max-w-xs px-6 py-3 rounded-full bg-amber-200/10 text-amber-100/80 text-sm font-light tracking-wider border border-amber-200/20 hover:bg-amber-200/15 transition-all duration-500 focus-visible:ring-2 focus-visible:ring-amber-200/60 focus-visible:outline-none"
          >
            Start ambient reset
          </button>
          <button
            onClick={() => handleDismiss("external-focus")}
            className="min-h-[44px] w-full max-w-xs px-5 py-2 rounded-full text-amber-100/50 text-xs font-light tracking-wider border border-amber-200/10 hover:text-amber-100/70 hover:bg-white/5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-amber-200/60 focus-visible:outline-none"
          >
            Use external focus
          </button>
          <button
            onClick={() => setShowSafety(!showSafety)}
            className="min-h-[44px] text-amber-100/30 text-xs font-light tracking-wider hover:text-amber-100/50 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-amber-200/60 focus-visible:outline-none"
            aria-expanded={showSafety}
          >
            {showSafety ? "Hide safety information" : "Review safety information"}
          </button>
        </div>

        {showSafety && (
          <div className="rounded-xl bg-white/5 border border-amber-200/10 p-4 space-y-3 text-amber-100/40 text-xs font-light leading-relaxed animate-fadeIn">
            <p>
              Consult a qualified clinician before using slow-paced breathing
              experiences if you are pregnant or have a history involving:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Uncontrolled high blood pressure</li>
              <li>Cardiovascular disease</li>
              <li>Heart rhythm conditions</li>
              <li>Previous stroke or heart attack</li>
              <li>Epilepsy or seizures</li>
              <li>Severe asthma</li>
              <li>Unmanaged respiratory conditions</li>
              <li>Glaucoma or detached retina</li>
              <li>Recent major surgery</li>
              <li>Severe panic symptoms</li>
              <li>Dissociation</li>
              <li>Psychosis</li>
              <li>Recent psychiatric hospitalization</li>
            </ul>
            <p className="pt-2 border-t border-amber-200/5">
              {BRAND.name} does not replace professional medical or mental-health care.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
