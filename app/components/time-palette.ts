// Time-of-day color shift for circadian alignment
// Shifts palette warmer in the evening, amber at night to protect melatonin

export function getTimeOfDayShift(): {
  hueShift: number;
  saturationMult: number;
  brightnessMult: number;
} {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 10) {
    // Morning: slightly brighter, gentle warmth
    return { hueShift: -2, saturationMult: 0.95, brightnessMult: 1.05 };
  } else if (hour >= 10 && hour < 17) {
    // Daytime: neutral
    return { hueShift: 0, saturationMult: 1.0, brightnessMult: 1.0 };
  } else if (hour >= 17 && hour < 20) {
    // Evening: warmer, noticeably dimmer and desaturated
    return { hueShift: -8, saturationMult: 0.8, brightnessMult: 0.75 };
  } else {
    // Night (20:00–06:00): deep amber, very dim, strongly desaturated
    return { hueShift: -15, saturationMult: 0.6, brightnessMult: 0.55 };
  }
}
