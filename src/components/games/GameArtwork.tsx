import type { SVGProps } from "react";

export interface GameVisualSignature {
  themeKey: "chess" | "ludo" | "naval" | "classic";
  accentColor: string;
  accentSoft: string;
  accentBorder: string;
  surfaceTint: string;
  boardPreviewBg: string;
  duration: string;
  complexity: string;
  tagline: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export function getGameVisualSignature(slug: string): GameVisualSignature {
  const normalized = slug.toLowerCase();
  if (normalized.includes("xadrez") || normalized.includes("chess")) {
    return {
      themeKey: "chess",
      accentColor: "#7c4d2b",
      accentSoft: "#f7efe8",
      accentBorder: "#dec6b0",
      surfaceTint: "#fcf9f5",
      boardPreviewBg: "#e9decb",
      duration: "20–45 min",
      complexity: "Estratégia Pura",
      tagline: "Tabuleiro clássico em nogueira e marfim fosco",
    };
  }

  if (normalized.includes("ludo")) {
    return {
      themeKey: "ludo",
      accentColor: "#b8432e",
      accentSoft: "#fbf0ed",
      accentBorder: "#e8c5bd",
      surfaceTint: "#fdfaf6",
      boardPreviewBg: "#f5efe2",
      duration: "15–30 min",
      complexity: "Tática & Dados",
      tagline: "Percurso cruciforme retrô com casas seguras e corrida final",
    };
  }

  if (normalized.includes("batalha") || normalized.includes("naval")) {
    return {
      themeKey: "naval",
      accentColor: "#165b6d",
      accentSoft: "#eaf4f6",
      accentBorder: "#b7d7df",
      surfaceTint: "#f6fafb",
      boardPreviewBg: "#122b40",
      duration: "15–25 min",
      complexity: "Dedução Tática",
      tagline: "Carta hidrográfica e sonar de coordenadas A1–J10",
    };
  }

  return {
    themeKey: "classic",
    accentColor: "#8a3354",
    accentSoft: "#f9eff3",
    accentBorder: "#e5c3d0",
    surfaceTint: "#fcf9fa",
    boardPreviewBg: "#f1eaee",
    duration: "15–35 min",
    complexity: "Jogo de Mesa",
    tagline: "Acervo recreativo presencial da Biblioteca do CDCC",
  };
}

/**
 * Ilustração vetorial customizada para o card e cabeçalho de cada jogo.
 */
export function GameEmblemSvg({
  themeKey,
  ...props
}: { themeKey: GameVisualSignature["themeKey"] } & SVGProps<SVGSVGElement>) {
  if (themeKey === "chess") {
    return (
      <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" {...props}>
        {/* Mini piso de tabuleiro em perspectiva sutil */}
        <rect x="14" y="14" width="92" height="92" rx="18" fill="#DFCFB5" stroke="#B69272" strokeWidth="2" />
        <rect x="22" y="22" width="38" height="38" rx="4" fill="#F4EDE2" />
        <rect x="60" y="22" width="38" height="38" rx="4" fill="#9E7356" />
        <rect x="22" y="60" width="38" height="38" rx="4" fill="#9E7356" />
        <rect x="60" y="60" width="38" height="38" rx="4" fill="#F4EDE2" />
        {/* Silhueta escultural do Cavalo de Xadrez */}
        <path
          d="M42 88H78L75 80H45L42 88ZM47 76H73C74 64 73 53 67 45C70 41 71 35 68 31C64 32 61 34 59 37C53 35 46 39 43 46C40 52 43 58 49 56C52 55 55 52 57 49C56 56 50 61 47 76Z"
          fill="#2D221B"
          stroke="#F7F1E5"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="53" cy="44" r="2" fill="#F7F1E5" />
      </svg>
    );
  }

  if (themeKey === "ludo") {
    return (
      <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" {...props}>
        <rect x="14" y="14" width="92" height="92" rx="18" fill="#F7F2E7" stroke="#D5C7B2" strokeWidth="2" />
        {/* Quatro quadrantes retrô */}
        <rect x="22" y="22" width="30" height="30" rx="6" fill="#C84B31" />
        <rect x="68" y="22" width="30" height="30" rx="6" fill="#2D7D56" />
        <rect x="22" y="68" width="30" height="30" rx="6" fill="#2B5B84" />
        <rect x="68" y="68" width="30" height="30" rx="6" fill="#D99B26" />
        {/* Centro cruciforme e dado tátil */}
        <polygon points="52,52 68,52 60,60" fill="#2D7D56" />
        <polygon points="52,68 68,68 60,60" fill="#2B5B84" />
        <polygon points="52,52 52,68 60,60" fill="#C84B31" />
        <polygon points="68,52 68,68 60,60" fill="#D99B26" />
        <rect
          x="45"
          y="45"
          width="30"
          height="30"
          rx="7"
          fill="#FFFDF9"
          stroke="#3A322B"
          strokeWidth="2.2"
        />
        <circle cx="53" cy="53" r="2.6" fill="#C84B31" />
        <circle cx="67" cy="53" r="2.6" fill="#3A322B" />
        <circle cx="60" cy="60" r="2.6" fill="#C84B31" />
        <circle cx="53" cy="67" r="2.6" fill="#3A322B" />
        <circle cx="67" cy="67" r="2.6" fill="#C84B31" />
      </svg>
    );
  }

  if (themeKey === "naval") {
    return (
      <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" {...props}>
        <rect x="14" y="14" width="92" height="92" rx="18" fill="#10283D" stroke="#28587B" strokeWidth="2" />
        {/* Anéis de sonar */}
        <circle cx="60" cy="60" r="34" stroke="#2D7D8A" strokeWidth="1.5" strokeDasharray="4 4" />
        <circle cx="60" cy="60" r="21" stroke="#2D7D8A" strokeWidth="1.5" />
        <line x1="22" y1="60" x2="98" y2="60" stroke="#23536B" strokeWidth="1.2" />
        <line x1="60" y1="22" x2="60" y2="98" stroke="#23536B" strokeWidth="1.2" />
        {/* Feixe de varredura e silhueta de navio */}
        <path d="M60 60L86 38A34 34 0 0 1 94 60H60Z" fill="rgba(56, 189, 178, 0.24)" />
        <rect x="37" y="56" width="46" height="8" rx="4" fill="#E2EEF2" />
        <rect x="49" y="50" width="16" height="6" rx="2" fill="#9AC5D3" />
        {/* Pino de impacto */}
        <circle cx="74" cy="45" r="5" fill="#E0533C" stroke="#FFF" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" {...props}>
      <rect x="14" y="14" width="92" height="92" rx="18" fill="#F6EBF0" stroke="#D9B2C1" strokeWidth="2" />
      <circle cx="60" cy="60" r="28" fill="#8A3354" fillOpacity="0.12" stroke="#8A3354" strokeWidth="2" />
      <path
        d="M48 74H72L69 56L60 44L51 56L48 74Z"
        fill="#8A3354"
        stroke="#FFF"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="60" cy="38" r="5" fill="#8A3354" />
    </svg>
  );
}
