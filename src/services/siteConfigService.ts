import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getFirebaseStorageInstance, getFirestoreDb } from "../lib/firebase.ts";
import type { SiteConfig } from "../types/content.ts";

const COLLECTION_NAME = "configuracoes_site";
const DOC_ID = "global";
const LOCAL_STORAGE_KEY = "qrcodecdcc_site_config_v1";

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  brandColor: "#145399",
  accentColor: "#9c471b",
  bgColor: "#f8fafc",
  borderRadiusScale: "default",
  portalName: "Biblioteca CDCC",
  logoUrl: "",
  footerText: "Desenvolvido pelo Centro de Divulgação Científica e Cultural — USP São Carlos",
  footerLinkLabel: "Portal Oficial CDCC",
  footerLinkUrl: "https://cdcc.usp.br",
  noticeBanner: {
    enabled: false,
    text: "Confira as obras obrigatórias da FUVEST, UNICAMP e UNESP disponíveis na Biblioteca!",
    color: "#145399",
    linkUrl: "/vestibular",
    linkLabel: "Ver lista",
  },
  imageOverrides: {},
  homeConfig: {
    heroBadge: "Acervo Físico • CDCC-USP",
    heroTitle: "Encontre seu livro nas estantes",
    heroSubtitle:
      "Digite o código CDU ou de classificação do Dedalus para localizar exatamente a sala e a prateleira no mapa.",
    searchPlaceholder: "Ex.: 530, 512.04, 869.93 M149...",
    searchHint: "Dica: o código fica na etiqueta da lombada ou na ficha do Dedalus USP.",
    exampleCodes: [
      { code: "530", label: "Física (530)" },
      { code: "510", label: "Matemática (510)" },
      { code: "540", label: "Química (540)" },
      { code: "869.93", label: "Literatura (869.93)" },
    ],
    quickCards: [
      {
        id: "vestibular",
        title: "Leituras do Vestibular",
        description: "Obras obrigatórias da FUVEST, UNICAMP e UNESP com localização na estante.",
        to: "/vestibular",
        icon: "graduation",
      },
      {
        id: "espaco-ludico",
        title: "Espaço Lúdico",
        description: "Jogos de tabuleiro disponíveis na biblioteca e tabuleiros digitais.",
        to: "/espacoludico",
        icon: "gamepad",
      },
      {
        id: "dedalus-usp",
        title: "Catálogo Dedalus USP",
        description: "Pesquise disponibilidade e exemplares no banco de dados oficial da USP.",
        href: "https://dedalus.usp.br",
        icon: "external",
      },
    ],
    tutorialPhases: [
      {
        id: "fase-1",
        phaseNumber: "01",
        tabLabel: "1. Pesquise no Dedalus",
        tagline: "Passo 1 • Consulta ao catálogo",
        title: "Copie o código de classificação no Dedalus",
        description:
          "Acesse o catálogo Dedalus da USP, filtre pela Biblioteca do CDCC e anote o código de localização (CDU) do exemplar desejado.",
        bullets: [
          "Selecione a unidade CDCC — São Carlos",
          "Verifique se o exemplar está disponível para empréstimo",
          "Copie o código numérico ou alfanumérico (ex.: 530.12)",
        ],
        calloutLabel: "Exemplo de código",
        calloutValue: "530.12 G854f",
        imageAlt: "Tela de pesquisa no catálogo Dedalus USP",
        badge: "Dedalus USP",
      },
      {
        id: "fase-2",
        phaseNumber: "02",
        tabLabel: "2. Busque aqui no Portal",
        tagline: "Passo 2 • Localização inteligente",
        title: "Cole o código no buscador do Portal CDCC",
        description:
          "Nosso buscador identifica automaticamente a sala (Sala 1, 2 ou 3) e a estante exata onde o código está organizado.",
        bullets: [
          "Compatível com códigos numéricos e de literatura (869.9...)",
          "Indicação visual do ponto exato na planta baixa",
          "Funciona direto pelo celular ao escanear os QR Codes",
        ],
        calloutLabel: "Resultado imediato",
        calloutValue: "Sala 1 • Estante 17",
        imageAlt: "Buscador do Portal da Biblioteca CDCC indicando a estante",
        badge: "Busca Rápida",
      },
      {
        id: "fase-3",
        phaseNumber: "03",
        tabLabel: "3. Vá até a estante",
        tagline: "Passo 3 • Mapa interativo",
        title: "Siga o mapa 3D e encontre o livro na prateleira",
        description:
          "Veja a planta da sala, confira a foto real da estante e retire o livro com rapidez. Qualquer dúvida, fale com a equipe no balcão.",
        bullets: [
          "Planta baixa interativa com marcadores numerados",
          "Fotos reais das estantes para conferência visual",
          "Atendimento presencial no balcão da biblioteca",
        ],
        calloutLabel: "Localização física",
        calloutValue: "Prateleira identificada",
        imageAlt: "Mapa da biblioteca mostrando a estante do livro",
        badge: "Mapa CDCC",
      },
    ],
    sectionsVisibility: {
      hero: true,
      quickAccess: true,
      carousel: true,
      tutorial: true,
    },
    carouselConfig: {
      autoPlayEnabled: true,
      autoPlaySeconds: 6,
      showArrows: true,
      showDots: true,
      showPauseButton: true,
      heightMode: "default",
    },
  },
};

export const GLOBAL_IMAGE_SLOTS: Array<{
  key: string;
  label: string;
  description: string;
  fallbackPath: string;
}> = [
  {
    key: "bentinho_logo",
    label: "Logo / Mascote Bentinho (Navbar e Rodapé)",
    description: "Substitui o ícone principal do Bentinho/CDCC.",
    fallbackPath: "Logo padrão CDCC",
  },
  {
    key: "tutorial_fase_1",
    label: "Imagem Tutorial — Passo 1 (Dedalus)",
    description: "Ilustração do primeiro passo do tutorial na Home.",
    fallbackPath: "Tutorial Passo 1 padrão",
  },
  {
    key: "tutorial_fase_2",
    label: "Imagem Tutorial — Passo 2 (Buscador)",
    description: "Ilustração do segundo passo do tutorial na Home.",
    fallbackPath: "Tutorial Passo 2 padrão",
  },
  {
    key: "tutorial_fase_3",
    label: "Imagem Tutorial — Passo 3 (Estante)",
    description: "Ilustração do terceiro passo do tutorial na Home.",
    fallbackPath: "Tutorial Passo 3 padrão",
  },
  {
    key: "mapa_sala_1",
    label: "Planta Baixa — Sala 1",
    description: "Imagem de fundo do mapa da Sala 1.",
    fallbackPath: "Planta Sala 1 padrão",
  },
  {
    key: "mapa_sala_2",
    label: "Planta Baixa — Sala 2",
    description: "Imagem de fundo do mapa da Sala 2.",
    fallbackPath: "Planta Sala 2 padrão",
  },
  {
    key: "mapa_sala_3",
    label: "Planta Baixa — Sala 3",
    description: "Imagem de fundo do mapa da Sala 3.",
    fallbackPath: "Planta Sala 3 padrão",
  },
];

export function mergeWithDefaultSiteConfig(partial?: Partial<SiteConfig> | null): SiteConfig {
  if (!partial) return structuredClone(DEFAULT_SITE_CONFIG);
  return {
    ...DEFAULT_SITE_CONFIG,
    ...partial,
    noticeBanner: {
      ...DEFAULT_SITE_CONFIG.noticeBanner,
      ...(partial.noticeBanner ?? {}),
    },
    imageOverrides: {
      ...DEFAULT_SITE_CONFIG.imageOverrides,
      ...(partial.imageOverrides ?? {}),
    },
    homeConfig: {
      ...DEFAULT_SITE_CONFIG.homeConfig,
      ...(partial.homeConfig ?? {}),
      exampleCodes:
        Array.isArray(partial.homeConfig?.exampleCodes) && partial.homeConfig.exampleCodes.length > 0
          ? partial.homeConfig.exampleCodes
          : DEFAULT_SITE_CONFIG.homeConfig.exampleCodes,
      quickCards:
        Array.isArray(partial.homeConfig?.quickCards) && partial.homeConfig.quickCards.length > 0
          ? partial.homeConfig.quickCards
          : DEFAULT_SITE_CONFIG.homeConfig.quickCards,
      tutorialPhases:
        Array.isArray(partial.homeConfig?.tutorialPhases) && partial.homeConfig.tutorialPhases.length > 0
          ? partial.homeConfig.tutorialPhases
          : DEFAULT_SITE_CONFIG.homeConfig.tutorialPhases,
      sectionsVisibility: {
        ...DEFAULT_SITE_CONFIG.homeConfig.sectionsVisibility,
        ...(partial.homeConfig?.sectionsVisibility ?? {}),
      },
      carouselConfig: {
        autoPlayEnabled: true,
        autoPlaySeconds: 6,
        showArrows: true,
        showDots: true,
        showPauseButton: true,
        heightMode: "default",
        ...(partial.homeConfig?.carouselConfig ?? {}),
      },
    },
  };
}

/**
 * Comprime imagens no navegador para WebP antes de enviar ao Storage ou salvar offline.
 */
export async function compressImageToWebp(
  file: File,
  maxWidth = 1400,
  quality = 0.84
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Falha ao ler arquivo de imagem."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Arquivo selecionado não é uma imagem válida."));
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          "image/webp",
          quality
        );
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadCmsImage(file: File, folder = "cms"): Promise<string> {
  const compressed = await compressImageToWebp(file);
  const storage = getFirebaseStorageInstance();
  if (storage) {
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.[^.]+$/, "");
      const storageRef = ref(storage, `${folder}/${Date.now()}-${safeName}.webp`);
      await uploadBytes(storageRef, compressed, { contentType: "image/webp" });
      return await getDownloadURL(storageRef);
    } catch {
      // Fallback para data URL comprimida se Storage falhar
    }
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Falha ao processar imagem."));
    reader.readAsDataURL(compressed);
  });
}

function readLocalConfig(): SiteConfig | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    return mergeWithDefaultSiteConfig(JSON.parse(raw) as Partial<SiteConfig>);
  } catch {
    return null;
  }
}

function saveLocalConfig(config: SiteConfig): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore storage quota errors
  }
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const db = getFirestoreDb();
  if (db) {
    try {
      const snap = await getDoc(doc(db, COLLECTION_NAME, DOC_ID));
      if (snap.exists()) {
        const merged = mergeWithDefaultSiteConfig(snap.data() as Partial<SiteConfig>);
        saveLocalConfig(merged);
        return merged;
      }
    } catch {
      // fallback to localStorage or default
    }
  }
  return readLocalConfig() ?? structuredClone(DEFAULT_SITE_CONFIG);
}

export async function saveSiteConfig(config: SiteConfig): Promise<SiteConfig> {
  const payload: SiteConfig = {
    ...mergeWithDefaultSiteConfig(config),
    atualizadoEm: new Date().toISOString(),
  };
  saveLocalConfig(payload);
  const db = getFirestoreDb();
  if (db) {
    await setDoc(doc(db, COLLECTION_NAME, DOC_ID), payload, { merge: true });
  }
  return payload;
}

export async function resetSiteConfig(): Promise<SiteConfig> {
  const fresh = structuredClone(DEFAULT_SITE_CONFIG);
  return saveSiteConfig(fresh);
}
