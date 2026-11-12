import { createContext, useContext } from "react";

export type FontScaleOption = "100" | "115" | "130";
export type HighContrastTheme = "dark" | "light";

export interface AccessibilityPreferences {
  fontScale: FontScaleOption;
  highContrast: boolean;
  contrastTheme: HighContrastTheme;
  colorblindMode: boolean;
  dyslexicReading: boolean;
  reducedMotion: boolean;
  enhancedFocus: boolean;
  readingGuide: boolean;
  vlibrasEnabled: boolean;
}

export const A11Y_STORAGE_KEY = "cdcc_a11y_preferences_v1";

export function detectSystemReducedMotion(): boolean {
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  return false;
}

export function getDefaultAccessibilityPreferences(
  systemReducedMotion = detectSystemReducedMotion(),
): AccessibilityPreferences {
  return {
    fontScale: "100",
    highContrast: false,
    contrastTheme: "dark",
    colorblindMode: false,
    dyslexicReading: false,
    reducedMotion: systemReducedMotion,
    enhancedFocus: false,
    readingGuide: false,
    vlibrasEnabled: false,
  };
}

export function sanitizeAccessibilityPreferences(
  raw: unknown,
  systemReducedMotion = detectSystemReducedMotion(),
): AccessibilityPreferences {
  const defaults = getDefaultAccessibilityPreferences(systemReducedMotion);
  if (!raw || typeof raw !== "object") {
    return defaults;
  }

  const obj = raw as Record<string, unknown>;
  const fontScale: FontScaleOption =
    obj.fontScale === "115" || obj.fontScale === "130" || obj.fontScale === "100"
      ? obj.fontScale
      : defaults.fontScale;

  const contrastTheme: HighContrastTheme =
    obj.contrastTheme === "light" || obj.contrastTheme === "dark"
      ? obj.contrastTheme
      : defaults.contrastTheme;

  return {
    fontScale,
    highContrast: typeof obj.highContrast === "boolean" ? obj.highContrast : defaults.highContrast,
    contrastTheme,
    colorblindMode:
      typeof obj.colorblindMode === "boolean" ? obj.colorblindMode : defaults.colorblindMode,
    dyslexicReading:
      typeof obj.dyslexicReading === "boolean" ? obj.dyslexicReading : defaults.dyslexicReading,
    reducedMotion:
      typeof obj.reducedMotion === "boolean" ? obj.reducedMotion : defaults.reducedMotion,
    enhancedFocus:
      typeof obj.enhancedFocus === "boolean" ? obj.enhancedFocus : defaults.enhancedFocus,
    readingGuide:
      typeof obj.readingGuide === "boolean" ? obj.readingGuide : defaults.readingGuide,
    vlibrasEnabled:
      typeof obj.vlibrasEnabled === "boolean" ? obj.vlibrasEnabled : defaults.vlibrasEnabled,
  };
}

export function loadAccessibilityPreferences(): AccessibilityPreferences {
  const systemReduced = detectSystemReducedMotion();
  try {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem(A11Y_STORAGE_KEY);
      if (saved) {
        return sanitizeAccessibilityPreferences(JSON.parse(saved), systemReduced);
      }
    }
  } catch {
    // fallback silencioso
  }
  return getDefaultAccessibilityPreferences(systemReduced);
}

export function saveAccessibilityPreferences(prefs: AccessibilityPreferences): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(prefs));
    }
  } catch {
    // fallback silencioso
  }
}

export function countActiveAccessibilityFeatures(prefs: AccessibilityPreferences): number {
  let count = 0;
  if (prefs.fontScale !== "100") count += 1;
  if (prefs.highContrast) count += 1;
  if (prefs.colorblindMode) count += 1;
  if (prefs.dyslexicReading) count += 1;
  if (prefs.reducedMotion) count += 1;
  if (prefs.enhancedFocus) count += 1;
  if (prefs.readingGuide) count += 1;
  if (prefs.vlibrasEnabled) count += 1;
  return count;
}

export function applyAccessibilityToElement(
  prefs: AccessibilityPreferences,
  root: HTMLElement | null = typeof document !== "undefined" ? document.documentElement : null,
): void {
  if (!root) return;

  root.style.fontSize = `${prefs.fontScale}%`;
  root.setAttribute("data-font-scale", prefs.fontScale);
  root.setAttribute("data-contrast", prefs.highContrast ? prefs.contrastTheme : "normal");

  root.classList.toggle("high-contrast", prefs.highContrast);
  root.classList.toggle("high-contrast-dark", prefs.highContrast && prefs.contrastTheme === "dark");
  root.classList.toggle(
    "high-contrast-light",
    prefs.highContrast && prefs.contrastTheme === "light",
  );
  root.classList.toggle("colorblind-mode", prefs.colorblindMode);
  root.classList.toggle("dyslexic-spacing", prefs.dyslexicReading);
  root.classList.toggle("reduced-motion", prefs.reducedMotion);
  root.classList.toggle("enhanced-focus", prefs.enhancedFocus);
  root.classList.toggle("reading-guide-active", prefs.readingGuide);
  root.classList.toggle("vlibras-enabled", prefs.vlibrasEnabled);
}

export interface AccessibilityContextValue extends AccessibilityPreferences {
  isPanelOpen: boolean;
  activeCount: number;
  announcement: string;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  setFontScale: (scale: FontScaleOption) => void;
  setHighContrast: (enabled: boolean) => void;
  setContrastTheme: (theme: HighContrastTheme) => void;
  setColorblindMode: (enabled: boolean) => void;
  setDyslexicReading: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setEnhancedFocus: (enabled: boolean) => void;
  setReadingGuide: (enabled: boolean) => void;
  setVlibrasEnabled: (enabled: boolean) => void;
  resetPreferences: () => void;
  announce: (message: string) => void;
}

export const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function useAccessibility(): AccessibilityContextValue {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error("useAccessibility deve ser utilizado dentro de AccessibilityProvider");
  }
  return ctx;
}
