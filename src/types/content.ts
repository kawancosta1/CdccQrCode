export interface CarouselSlide {
  id: string;
  imagemUrl: string;
  titulo: string;
  linkDestino: string;
  ordem: number;
  ativo: boolean;
  eyebrow?: string;
  descricao?: string;
  textoBotao?: string;
  imagemAlt?: string;
  posicaoObjeto?: string;
  overlayOpacity?: number;
  textAlign?: "left" | "center" | "right";
  accentColor?: string;
  openInNewTab?: boolean;
  hideButton?: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface GameItem {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  capaUrl: string;
  categoria: string;
  ordem: number;
  disponivel: boolean;
  regrasTitulo?: string;
  jogadores?: string;
  objetivo?: string;
  preparacao?: string;
  regras?: string[];
  condicaoVitoria?: string;
  accentColor?: string;
  duration?: string;
  complexity?: string;
  emblemKey?: "chess" | "ludo" | "naval" | "classic";
  emprStatus?: "disponivel" | "emprestado";
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface ExampleCodeChip {
  code: string;
  label: string;
}

export interface QuickAccessCardConfig {
  id: string;
  title: string;
  description: string;
  to?: string;
  href?: string;
  icon: "book" | "external" | "gamepad" | "graduation" | "sparkles";
}

export interface TutorialPhaseConfig {
  id: string;
  phaseNumber: string;
  tabLabel: string;
  tagline: string;
  title: string;
  description: string;
  bullets: string[];
  calloutLabel: string;
  calloutValue: string;
  imageUrl?: string;
  imageAlt: string;
  badge: string;
  enabled?: boolean;
  actionLabel?: string;
  actionUrl?: string;
}

import type { SeasonalConfig } from "../domain/seasonEngine.ts";

export interface SiteConfig {
  brandColor: string;
  accentColor: string;
  bgColor: string;
  borderRadiusScale: "compact" | "default" | "rounded";
  portalName: string;
  logoUrl: string;
  footerText: string;
  footerLinkLabel: string;
  footerLinkUrl: string;
  noticeBanner: {
    enabled: boolean;
    text: string;
    color: string;
    linkUrl: string;
    linkLabel: string;
  };
  imageOverrides: Record<string, string>;
  homeConfig: {
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    searchPlaceholder: string;
    searchHint: string;
    exampleCodes: ExampleCodeChip[];
    quickCards: QuickAccessCardConfig[];
    tutorialPhases: TutorialPhaseConfig[];
    sectionsVisibility: {
      hero: boolean;
      quickAccess: boolean;
      carousel: boolean;
      tutorial: boolean;
    };
    sectionsOrder?: Array<"hero" | "quickAccess" | "carousel" | "tutorial">;
    carouselConfig?: {
      autoPlayEnabled: boolean;
      autoPlaySeconds: number;
      showArrows: boolean;
      showDots: boolean;
      showPauseButton: boolean;
      heightMode: "compact" | "default" | "tall";
    };
  };
  estacao?: SeasonalConfig;
  atualizadoEm?: string;
}

export type VestibularExamTag =
  | "FUVEST"
  | "FUVEST 2026–2028"
  | "UNICAMP"
  | "UNESP / Clássicos";

export interface VestibularBook {
  id: string;
  titulo: string;
  autor: string;
  vestibular: VestibularExamTag;
  anos: string;
  genero: string;
  escolaLiteraria?: string;
  anoPublicacao?: string;
  paginas?: number;
  isbn?: string;
  codigoDedalus: string;
  sala: string;
  estante: string;
  capaUrl?: string;
  corCapa?: string;
  disponivel: boolean;
  observacao?: string;
  sinopse?: string;
  temasVestibular?: string[];
  dominioPublicoUrl?: string;
  ordem: number;
  atualizadoEm?: string;
}

export interface CustomPageBookItem {
  id: string;
  titulo: string;
  autor: string;
  categoria: string;
  codigoDedalus: string;
  salaEstante: string;
  capaUrl?: string;
  disponivel: boolean;
}

export interface CustomPageBlock {
  id: string;
  tipo: "texto" | "alerta_bentinho" | "link_externo" | "grade_livros";
  titulo?: string;
  conteudo?: string;
  linkUrl?: string;
  linkLabel?: string;
  livros?: CustomPageBookItem[];
}

export interface CustomPage {
  id: string;
  slug: string;
  titulo: string;
  subtitulo: string;
  icone: string;
  bannerUrl?: string;
  publicada: boolean;
  mostrarNoMenu: boolean;
  blocos: CustomPageBlock[];
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface DynamicShelfMapping {
  id: string;
  roomId: 1 | 2 | 3;
  code: string;
  shelf: string;
  range: string;
  images: string[];
  atualizadoEm?: string;
}

export interface DynamicMarkerOverride {
  roomId: 1 | 2 | 3;
  shelfKey: string;
  top: string;
  left: string;
  centered?: boolean;
}

export interface AdminUserRecord {
  id: string;
  email: string;
  displayName: string;
  role: "super_admin" | "level_1" | "level_2" | "level_3";
  ativo: boolean;
  atualizadoEm?: string;
}
