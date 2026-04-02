// Time-of-day color shift for circadian alignment
// Shifts palette warmer in the evening, amber at night to protect melatonin

export function getTimeOfDayShift(): {
  hueShift: number;
  saturationMult: number;
  brightnessMult: number;
} {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 10) {
    // Morning: slightly brighter, base palette is already warm
    return { hueShift: 0, saturationMult: 1.0, brightnessMult: 1.1 };
  } else if (hour >= 10 && hour < 17) {
    // Daytime: neutral
    return { hueShift: 0, saturationMult: 1.0, brightnessMult: 1.0 };
  } else if (hour >= 17 && hour < 20) {
    // Evening: warmer, slightly dimmer
    return { hueShift: -5, saturationMult: 0.9, brightnessMult: 0.85 };
  } else {
    // Night (20:00–06:00): deep amber, dim, minimal blue
    return { hueShift: -10, saturationMult: 0.75, brightnessMult: 0.7 };
  }
}
