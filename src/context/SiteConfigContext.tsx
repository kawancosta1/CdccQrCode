import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_SEASON_PALETTES,
  isNightTime,
  resolveActiveSeason,
  type SeasonId,
} from "../domain/seasonEngine.ts";
import {
  DEFAULT_SITE_CONFIG,
  getSiteConfig,
  resetSiteConfig,
  saveSiteConfig,
} from "../services/siteConfigService.ts";
import type { SiteConfig } from "../types/content.ts";
import { SiteConfigContext, type SiteConfigContextValue } from "./siteConfigStore.ts";

const VISITOR_PARTICLES_KEY = "qrcodecdcc_visitor_particles_v1";

function readVisitorParticlesPref(): boolean {
  try {
    const raw = window.localStorage.getItem(VISITOR_PARTICLES_KEY);
    if (raw === "false") return false;
  } catch {
    // ignore
  }
  return true;
}

const DYNAMIC_THEME_STYLE_ID = "cdcc-dynamic-theme";

function isSafeCssColor(value: string | undefined): value is string {
  if (!value) return false;
  return /^#[0-9a-fA-F]{3,8}$/.test(value.trim());
}

function applyCssVariables(config: SiteConfig, activeSeason: SeasonId | null): void {
  const root = document.documentElement;
  // Limpa estilos inline legados para garantir que Alto Contraste sempre vença
  root.style.removeProperty("--color-brand");
  root.style.removeProperty("--color-accent");
  root.style.removeProperty("--color-bg");

  const rules: string[] = [];

  if (activeSeason) {
    const customPalette = config.estacao?.palettes?.[activeSeason];
    const defaultPalette = DEFAULT_SEASON_PALETTES[activeSeason];
    const declarations: string[] = [];

    if (
      customPalette &&
      isSafeCssColor(customPalette.brandColor) &&
      customPalette.brandColor.toLowerCase() !== defaultPalette.brandColor.toLowerCase()
    ) {
      const b = customPalette.brandColor.trim();
      declarations.push(
        `--color-brand: ${b};`,
        `--color-brand-hover: color-mix(in srgb, ${b} 82%, #000000);`,
        `--color-brand-active: color-mix(in srgb, ${b} 68%, #000000);`,
        `--color-brand-soft: color-mix(in srgb, ${b} 9%, #ffffff);`,
        `--color-brand-border: color-mix(in srgb, ${b} 28%, #ffffff);`,
        `--color-brand-text: color-mix(in srgb, ${b} 85%, #000000);`,
        `--color-brand-ring: color-mix(in srgb, ${b} 16%, transparent);`,
        `--focus-ring-color: ${b};`,
      );
    }

    if (
      customPalette &&
      isSafeCssColor(customPalette.accentColor) &&
      customPalette.accentColor.toLowerCase() !== defaultPalette.accentColor.toLowerCase()
    ) {
      const a = customPalette.accentColor.trim();
      declarations.push(
        `--color-accent: ${a};`,
        `--color-accent-soft: color-mix(in srgb, ${a} 12%, #ffffff);`,
      );
    }

    if (
      customPalette &&
      isSafeCssColor(customPalette.bgColor) &&
      customPalette.bgColor.toLowerCase() !== defaultPalette.bgColor.toLowerCase()
    ) {
      const bg = customPalette.bgColor.trim();
      declarations.push(
        `--color-bg: ${bg};`,
        `--color-surface-subtle: color-mix(in srgb, ${bg} 94%, #000000);`,
      );
    }

    if (declarations.length > 0) {
      rules.push(
        `html[data-season="${activeSeason}"]:not(.high-contrast):not(.high-contrast-dark):not(.high-contrast-light) {\n  ${declarations.join("\n  ")}\n}`,
      );
    }
  } else {
    const declarations: string[] = [];
    if (
      isSafeCssColor(config.brandColor) &&
      config.brandColor.toLowerCase() !== DEFAULT_SITE_CONFIG.brandColor.toLowerCase()
    ) {
      const b = config.brandColor.trim();
      declarations.push(
        `--color-brand: ${b};`,
        `--color-brand-hover: color-mix(in srgb, ${b} 82%, #000000);`,
        `--color-brand-ring: color-mix(in srgb, ${b} 16%, transparent);`,
        `--focus-ring-color: ${b};`,
      );
    }
    if (
      isSafeCssColor(config.accentColor) &&
      config.accentColor.toLowerCase() !== DEFAULT_SITE_CONFIG.accentColor.toLowerCase()
    ) {
      declarations.push(`--color-accent: ${config.accentColor.trim()};`);
    }
    if (
      isSafeCssColor(config.bgColor) &&
      config.bgColor.toLowerCase() !== DEFAULT_SITE_CONFIG.bgColor.toLowerCase()
    ) {
      declarations.push(`--color-bg: ${config.bgColor.trim()};`);
    }
    if (declarations.length > 0) {
      rules.push(
        `html:not([data-season]):not(.high-contrast):not(.high-contrast-dark):not(.high-contrast-light) {\n  ${declarations.join("\n  ")}\n}`,
      );
    }
  }

  let styleEl = document.getElementById(DYNAMIC_THEME_STYLE_ID) as HTMLStyleElement | null;
  if (rules.length > 0) {
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = DYNAMIC_THEME_STYLE_ID;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = rules.join("\n");
  } else if (styleEl) {
    styleEl.remove();
  }

  if (config.borderRadiusScale !== DEFAULT_SITE_CONFIG.borderRadiusScale) {
    const radiusMap: Record<SiteConfig["borderRadiusScale"], { sm: string; md: string; lg: string }> = {
      compact: { sm: "4px", md: "6px", lg: "10px" },
      default: { sm: "8px", md: "12px", lg: "18px" },
      rounded: { sm: "12px", md: "18px", lg: "26px" },
    };
    const scale = radiusMap[config.borderRadiusScale] ?? radiusMap.default;
    root.style.setProperty("--radius-sm", scale.sm);
    root.style.setProperty("--radius-md", scale.md);
    root.style.setProperty("--radius-lg", scale.lg);
  } else {
    root.style.removeProperty("--radius-sm");
    root.style.removeProperty("--radius-md");
    root.style.removeProperty("--radius-lg");
  }
}

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(() => structuredClone(DEFAULT_SITE_CONFIG));
  const [loading, setLoading] = useState(true);
  const [visitorParticlesEnabled, setVisitorParticlesEnabled] = useState<boolean>(
    readVisitorParticlesPref,
  );

  const activeSeason = useMemo(
    () => resolveActiveSeason(config.estacao?.mode),
    [config.estacao?.mode],
  );

  const isNightAtmosphere = useMemo(() => {
    if (config.estacao?.nightEffectEnabled === false) return false;
    return isNightTime();
  }, [config.estacao?.nightEffectEnabled]);

  useEffect(() => {
    const root = document.documentElement;
    if (activeSeason) {
      root.setAttribute("data-season", activeSeason);
    } else {
      root.removeAttribute("data-season");
    }
    root.setAttribute("data-night", isNightAtmosphere ? "true" : "false");
  }, [activeSeason, isNightAtmosphere]);

  const toggleVisitorParticles = useCallback(() => {
    setVisitorParticlesEnabled((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(VISITOR_PARTICLES_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const reloadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const loaded = await getSiteConfig();
      setConfig(loaded);
      applyCssVariables(loaded, resolveActiveSeason(loaded.estacao?.mode));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadConfig();
  }, [reloadConfig]);

  useEffect(() => {
    applyCssVariables(config, activeSeason);
  }, [config, activeSeason]);

  const updateConfig = useCallback(async (next: SiteConfig) => {
    const saved = await saveSiteConfig(next);
    setConfig(saved);
    applyCssVariables(saved, resolveActiveSeason(saved.estacao?.mode));
    return saved;
  }, []);

  const resetConfig = useCallback(async () => {
    const fresh = await resetSiteConfig();
    setConfig(fresh);
    applyCssVariables(fresh, resolveActiveSeason(fresh.estacao?.mode));
    return fresh;
  }, []);

  const getImageSrc = useCallback(
    (slotKey: string, defaultSrc: string) => {
      const override = config.imageOverrides?.[slotKey]?.trim();
      return override ? override : defaultSrc;
    },
    [config.imageOverrides]
  );

  const value = useMemo<SiteConfigContextValue>(
    () => ({
      config,
      loading,
      activeSeason,
      isNightAtmosphere,
      visitorParticlesEnabled,
      toggleVisitorParticles,
      updateConfig,
      resetConfig,
      reloadConfig,
      getImageSrc,
    }),
    [
      config,
      loading,
      activeSeason,
      isNightAtmosphere,
      visitorParticlesEnabled,
      toggleVisitorParticles,
      updateConfig,
      resetConfig,
      reloadConfig,
      getImageSrc,
    ],
  );

  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
}
