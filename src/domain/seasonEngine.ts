export type SeasonId = "outono" | "inverno" | "primavera" | "verao";

export type SeasonalMode = "auto" | SeasonId | "off";

export type ParticleIntensity = "suave" | "normal" | "intenso";

export interface SeasonalConfig {
  mode: SeasonalMode;
  intensity: ParticleIntensity;
  nightEffectEnabled: boolean;
  greetings: Record<SeasonId, string>;
}

export interface SeasonMetadata {
  id: SeasonId;
  label: string;
  emoji: string;
  defaultGreeting: string;
  accentColor: string;
  badgeText: string;
}

export const SEASON_METADATA: Record<SeasonId, SeasonMetadata> = {
  outono: {
    id: "outono",
    label: "Outono",
    emoji: "🍂",
    defaultGreeting: "🍂 Outono no CDCC: nada melhor que um bom livro!",
    accentColor: "#c2410c",
    badgeText: "Outono no CDCC",
  },
  inverno: {
    id: "inverno",
    label: "Inverno",
    emoji: "❄️",
    defaultGreeting: "❄️ Inverno aconchegante na biblioteca",
    accentColor: "#2563eb",
    badgeText: "Inverno no CDCC",
  },
  primavera: {
    id: "primavera",
    label: "Primavera",
    emoji: "🌸",
    defaultGreeting: "🌸 Primavera no CDCC: ciência e leitura em flor",
    accentColor: "#db2777",
    badgeText: "Primavera no CDCC",
  },
  verao: {
    id: "verao",
    label: "Verão",
    emoji: "☀️",
    defaultGreeting: "☀️ Verão no CDCC: explore novos mundos nas estantes",
    accentColor: "#d97706",
    badgeText: "Verão no CDCC",
  },
};

export const DEFAULT_SEASONAL_CONFIG: SeasonalConfig = {
  mode: "auto",
  intensity: "normal",
  nightEffectEnabled: true,
  greetings: {
    outono: SEASON_METADATA.outono.defaultGreeting,
    inverno: SEASON_METADATA.inverno.defaultGreeting,
    primavera: SEASON_METADATA.primavera.defaultGreeting,
    verao: SEASON_METADATA.verao.defaultGreeting,
  },
};

/**
 * Detecta a estação atual com base no calendário astronômico do Hemisfério Sul (Brasil):
 * - Outono: 20 de março a 20 de junho
 * - Inverno: 21 de junho a 21 de setembro
 * - Primavera: 22 de setembro a 20 de dezembro
 * - Verão: 21 de dezembro a 19 de março
 */
export function detectSouthernHemisphereSeason(date: Date = new Date()): SeasonId {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 20) || month === 4 || month === 5 || (month === 6 && day <= 20)) {
    return "outono";
  }
  if ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day <= 21)) {
    return "inverno";
  }
  if ((month === 9 && day >= 22) || month === 10 || month === 11 || (month === 12 && day <= 20)) {
    return "primavera";
  }
  return "verao";
}

export function resolveActiveSeason(
  mode: SeasonalMode | undefined,
  date: Date = new Date(),
): SeasonId | null {
  if (mode === "off") return null;
  if (mode && mode !== "auto") return mode;
  return detectSouthernHemisphereSeason(date);
}

/**
 * Retorna true entre 18h00 e 05h59 (horário noturno).
 */
export function isNightTime(date: Date = new Date()): boolean {
  const hour = date.getHours();
  return hour >= 18 || hour < 6;
}
