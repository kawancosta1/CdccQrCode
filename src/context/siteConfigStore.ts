import { createContext, useContext } from "react";
import {
  detectSouthernHemisphereSeason,
  isNightTime,
  type SeasonId,
} from "../domain/seasonEngine.ts";
import { DEFAULT_SITE_CONFIG } from "../services/siteConfigService.ts";
import type { SiteConfig } from "../types/content.ts";

export interface SiteConfigContextValue {
  config: SiteConfig;
  loading: boolean;
  activeSeason: SeasonId | null;
  isNightAtmosphere: boolean;
  visitorParticlesEnabled: boolean;
  toggleVisitorParticles: () => void;
  updateConfig: (next: SiteConfig) => Promise<SiteConfig>;
  resetConfig: () => Promise<SiteConfig>;
  reloadConfig: () => Promise<void>;
  getImageSrc: (slotKey: string, defaultSrc: string) => string;
}

export const SiteConfigContext = createContext<SiteConfigContextValue | undefined>(undefined);

export function useSiteConfig(): SiteConfigContextValue {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) {
    return {
      config: DEFAULT_SITE_CONFIG,
      loading: false,
      activeSeason: detectSouthernHemisphereSeason(),
      isNightAtmosphere: isNightTime(),
      visitorParticlesEnabled: true,
      toggleVisitorParticles: () => {},
      updateConfig: async (next) => next,
      resetConfig: async () => DEFAULT_SITE_CONFIG,
      reloadConfig: async () => {},
      getImageSrc: (_slotKey, defaultSrc) => defaultSrc,
    };
  }
  return ctx;
}
