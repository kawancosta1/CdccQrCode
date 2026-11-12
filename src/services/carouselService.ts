import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { getFirestoreDb } from "../lib/firebase.ts";
import type { CarouselSlide } from "../types/content.ts";
import { uploadCmsImage } from "./siteConfigService.ts";

const arvoreImg = new URL("../components/img/Carrousel/arvore.webp", import.meta.url).href;
const espacoLudicoImg = new URL("../components/img/Carrousel/espacoLudico1.webp", import.meta.url).href;
const guiaMangaImg = new URL("../components/img/Carrousel/guia_manga.webp", import.meta.url).href;
const sala1EspacoImg = new URL("../components/img/Carrousel/sala1Espaco.webp", import.meta.url).href;
const vestibularImg = new URL("../components/img/Carrousel/vestibular1.webp", import.meta.url).href;

const COLLECTION_NAME = "carrossel_home";
const LOCAL_STORAGE_KEY = "qrcodecdcc_carousel_local";

export const DEFAULT_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: "sala-biblioteca",
    eyebrow: "Biblioteca CDCC • USP",
    titulo: "Ciência, leitura e descoberta em um só espaço",
    descricao:
      "Explore o acervo da Sala 1 e da Sala 2 com localização exata das estantes pelo código Dedalus.",
    textoBotao: "Explorar estantes",
    linkDestino: "/estantes",
    imagemUrl: sala1EspacoImg,
    imagemAlt: "Vista da Sala 1 da Biblioteca do CDCC com mesas de estudo e estantes",
    posicaoObjeto: "center 45%",
    ordem: 1,
    ativo: true,
  },
  {
    id: "espaco-ludico",
    eyebrow: "Espaço Lúdico",
    titulo: "Jogos de estratégia para aprender e se divertir",
    descricao:
      "Xadrez, Ludo, Batalha Naval e livros infantojuvenis em um ambiente pensado para a convivência.",
    textoBotao: "Conheça os jogos",
    linkDestino: "/espacoludico",
    imagemUrl: espacoLudicoImg,
    imagemAlt: "Espaço Lúdico da Biblioteca do CDCC com tabuleiros de xadrez, ludo e batalha naval",
    posicaoObjeto: "center 55%",
    ordem: 2,
    ativo: true,
  },
  {
    id: "vestibular",
    eyebrow: "Acervo de Vestibular",
    titulo: "Leituras obrigatórias para Fuvest e Unicamp",
    descricao: "Encontre rapidamente os clássicos e obras cobradas nos principais vestibulares.",
    textoBotao: "Ver leituras obrigatórias",
    linkDestino: "/vestibular",
    imagemUrl: vestibularImg,
    imagemAlt: "Estante de leitura obrigatória para vestibulares na Biblioteca do CDCC",
    posicaoObjeto: "center 40%",
    ordem: 3,
    ativo: true,
  },
  {
    id: "guia-manga",
    eyebrow: "Divulgação Científica",
    titulo: "Guias Mangá e Audiolivros de Ciência",
    descricao: "Aprenda física, cálculo, estatística e tecnologia de forma visual e acessível.",
    textoBotao: "Ver estantes",
    linkDestino: "/estantes",
    imagemUrl: guiaMangaImg,
    imagemAlt: "Estante com coleção Guias Mangá de ciências e seção de audiolivros",
    posicaoObjeto: "center 45%",
    ordem: 4,
    ativo: true,
  },
  {
    id: "novidades-quadrinhos",
    eyebrow: "Novidades e HQs",
    titulo: "Lançamentos, quadrinhos e leitura jovem",
    descricao: "Confira as novidades em destaque na entrada da biblioteca e nossa estante de quadrinhos.",
    textoBotao: "Explorar acervo",
    linkDestino: "/estantes",
    imagemUrl: arvoreImg,
    imagemAlt: "Área de novidades da biblioteca e estante de quadrinhos do CDCC",
    posicaoObjeto: "center 45%",
    ordem: 5,
    ativo: true,
  },
];

const memoryCache: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // fallback para memoryCache
  }
  return memoryCache[key] ?? null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch {
    // fallback
  }
  memoryCache[key] = value;
}

function getLocalSlides(): CarouselSlide[] {
  const raw = safeGetItem(LOCAL_STORAGE_KEY);
  if (!raw) {
    return [...DEFAULT_CAROUSEL_SLIDES];
  }
  try {
    const parsed = JSON.parse(raw) as CarouselSlide[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
        .map((slide) =>
          slide.id === "vestibular" &&
          slide.linkDestino === "https://dedalus.usp.br/F" &&
          slide.textoBotao === "Consultar Dedalus"
            ? { ...slide, linkDestino: "/vestibular", textoBotao: "Ver leituras obrigatórias" }
            : slide
        )
        .sort((a, b) => a.ordem - b.ordem);
    }
  } catch {
    // ignora erro de parse
  }
  return [...DEFAULT_CAROUSEL_SLIDES];
}

function saveLocalSlides(slides: CarouselSlide[]): void {
  safeSetItem(LOCAL_STORAGE_KEY, JSON.stringify(slides));
}

export const CarouselService = {
  async getAll(): Promise<CarouselSlide[]> {
    const db = getFirestoreDb();
    if (db) {
      try {
        const colRef = collection(db, COLLECTION_NAME);
        const q = query(colRef, orderBy("ordem", "asc"));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const remoteSlides = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<CarouselSlide, "id">),
          }));
          saveLocalSlides(remoteSlides);
          return remoteSlides;
        }
      } catch (err) {
        console.warn("Firestore inacessível ou offline. Usando fallback do carrossel:", err);
      }
    }
    return getLocalSlides();
  },

  async getActive(): Promise<CarouselSlide[]> {
    const all = await this.getAll();
    const active = all.filter((s) => s.ativo !== false).sort((a, b) => a.ordem - b.ordem);
    if (active.length === 0) {
      return DEFAULT_CAROUSEL_SLIDES.filter((s) => s.ativo);
    }
    return active;
  },

  async create(data: Omit<CarouselSlide, "id">, imageFile?: File): Promise<CarouselSlide> {
    let finalImageUrl = data.imagemUrl;
    if (imageFile) {
      finalImageUrl = await this.uploadImage(imageFile);
    }

    const newSlideData: Omit<CarouselSlide, "id"> = {
      ...data,
      imagemUrl: finalImageUrl,
      ordem: typeof data.ordem === "number" ? data.ordem : (await this.getAll()).length + 1,
      ativo: data.ativo ?? true,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    const db = getFirestoreDb();
    if (db) {
      try {
        const colRef = collection(db, COLLECTION_NAME);
        const docRef = await addDoc(colRef, newSlideData);
        const created: CarouselSlide = { id: docRef.id, ...newSlideData };
        const local = getLocalSlides();
        saveLocalSlides([...local, created]);
        return created;
      } catch (err) {
        console.warn("Falha ao salvar no Firestore. Gravando localmente:", err);
      }
    }

    const localId = `local-slide-${Date.now()}`;
    const created: CarouselSlide = { id: localId, ...newSlideData };
    const local = getLocalSlides();
    saveLocalSlides([...local, created]);
    return created;
  },

  async update(id: string, data: Partial<CarouselSlide>, imageFile?: File): Promise<CarouselSlide> {
    let finalImageUrl = data.imagemUrl;
    if (imageFile) {
      finalImageUrl = await this.uploadImage(imageFile);
    }

    const updates: Partial<CarouselSlide> = {
      ...data,
      ...(finalImageUrl ? { imagemUrl: finalImageUrl } : {}),
      atualizadoEm: new Date().toISOString(),
    };

    const db = getFirestoreDb();
    if (db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, updates);
      } catch (err) {
        console.warn("Falha ao atualizar no Firestore. Atualizando localmente:", err);
      }
    }

    const local = getLocalSlides();
    const updated = local.map((slide) => (slide.id === id ? { ...slide, ...updates } : slide));
    saveLocalSlides(updated);
    const result = updated.find((s) => s.id === id);
    if (!result) {
      throw new Error(`Slide com id ${id} não encontrado.`);
    }
    return result;
  },

  async delete(id: string): Promise<void> {
    const db = getFirestoreDb();
    if (db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn("Falha ao excluir no Firestore. Excluindo localmente:", err);
      }
    }

    const local = getLocalSlides();
    const filtered = local.filter((slide) => slide.id !== id);
    saveLocalSlides(filtered);
  },

  async toggleActive(id: string, nextActive: boolean): Promise<void> {
    await this.update(id, { ativo: nextActive });
  },

  async reorder(orderedIds: string[]): Promise<void> {
    const local = getLocalSlides();
    const reordered: CarouselSlide[] = [];

    orderedIds.forEach((id, index) => {
      const match = local.find((s) => s.id === id);
      if (match) {
        reordered.push({ ...match, ordem: index + 1, atualizadoEm: new Date().toISOString() });
      }
    });

    // Se algum slide não estava no orderedIds, anexa no fim
    local.forEach((s) => {
      if (!orderedIds.includes(s.id)) {
        reordered.push({ ...s, ordem: reordered.length + 1 });
      }
    });

    saveLocalSlides(reordered);

    const db = getFirestoreDb();
    if (db) {
      try {
        await Promise.all(
          reordered.map((slide) => {
            const docRef = doc(db, COLLECTION_NAME, slide.id);
            return updateDoc(docRef, { ordem: slide.ordem });
          }),
        );
      } catch (err) {
        console.warn("Falha ao atualizar ordem no Firestore:", err);
      }
    }
  },

  async uploadImage(file: File): Promise<string> {
    return uploadCmsImage(file, "carousel");
  },

  async resetToDefaults(): Promise<void> {
    saveLocalSlides([...DEFAULT_CAROUSEL_SLIDES]);
    const db = getFirestoreDb();
    if (db) {
      try {
        const existing = await this.getAll();
        await Promise.all(existing.map((s) => this.delete(s.id)));
        for (const slide of DEFAULT_CAROUSEL_SLIDES) {
          const data = { ...slide };
          delete (data as { id?: string }).id;
          await this.create(data);
        }
      } catch (err) {
        console.warn("Falha ao semear no Firestore:", err);
      }
    }
  },
};
