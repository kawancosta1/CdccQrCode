import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_SITE_CONFIG,
  getSiteConfig,
  resetSiteConfig,
  saveSiteConfig,
} from "../services/siteConfigService.ts";
import type { SiteConfig } from "../types/content.ts";
import { SiteConfigContext, type SiteConfigContextValue } from "./siteConfigStore.ts";

function applyCssVariables(config: SiteConfig): void {
  const root = document.documentElement;
  if (config.brandColor && config.brandColor !== DEFAULT_SITE_CONFIG.brandColor) {
    root.style.setProperty("--color-brand", config.brandColor);
  } else {
    root.style.removeProperty("--color-brand");
  }

  if (config.accentColor && config.accentColor !== DEFAULT_SITE_CONFIG.accentColor) {
    root.style.setProperty("--color-accent", config.accentColor);
  } else {
    root.style.removeProperty("--color-accent");
  }

  if (config.bgColor && config.bgColor !== DEFAULT_SITE_CONFIG.bgColor) {
    root.style.setProperty("--color-bg", config.bgColor);
  } else {
    root.style.removeProperty("--color-bg");
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

  const reloadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const loaded = await getSiteConfig();
      setConfig(loaded);
      applyCssVariables(loaded);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadConfig();
  }, [reloadConfig]);

  useEffect(() => {
    applyCssVariables(config);
  }, [config]);

  const updateConfig = useCallback(async (next: SiteConfig) => {
    const saved = await saveSiteConfig(next);
    setConfig(saved);
    applyCssVariables(saved);
    return saved;
  }, []);

  const resetConfig = useCallback(async () => {
    const fresh = await resetSiteConfig();
    setConfig(fresh);
    applyCssVariables(fresh);
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
      updateConfig,
      resetConfig,
      reloadConfig,
      getImageSrc,
    }),
    [config, loading, updateConfig, resetConfig, reloadConfig, getImageSrc]
  );

  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
}
