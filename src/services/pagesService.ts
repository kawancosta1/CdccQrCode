import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { VESTIBULAR_BOOKS_SEED } from "../data/vestibularBooksSeed.ts";
import { fetchBookCoverAndMetadata } from "./bookMetadataService.ts";
import { getFirestoreDb } from "../lib/firebase.ts";
import type { CustomPage, VestibularBook } from "../types/content.ts";

const PAGES_COLLECTION = "paginas_customizadas";
const VESTIBULAR_COLLECTION = "vestibular_books";
const LOCAL_PAGES_KEY = "qrcodecdcc_custom_pages_v1";
const LOCAL_VESTIBULAR_KEY = "qrcodecdcc_vestibular_books_v1";

export const DEFAULT_CUSTOM_PAGES: CustomPage[] = [
  {
    id: "guia-calouros",
    slug: "guia-calouros",
    titulo: "Guia do Estudante e Empréstimos",
    subtitulo: "Como emprestar livros, renovar prazos e usar as salas de estudo do CDCC.",
    icone: "BookOpen",
    publicada: true,
    mostrarNoMenu: false,
    blocos: [
      {
        id: "bloco-intro",
        tipo: "texto",
        titulo: "Como funciona o empréstimo no CDCC-USP",
        conteudo:
          "Alunos da USP, estudantes do ensino médio e professores da rede pública podem consultar o acervo presencialmente. Para empréstimos domiciliares, apresente seu Cartão USP ou documento com foto no balcão de atendimento.",
      },
      {
        id: "bloco-dica",
        tipo: "alerta_bentinho",
        titulo: "Dica do Bentinho",
        conteudo:
          "Você pode usar a barra de busca no topo de qualquer página para digitar o código CDU do livro e ver a foto exata da estante antes mesmo de sair da sua mesa!",
      },
      {
        id: "bloco-link",
        tipo: "link_externo",
        titulo: "Portal Dedalus USP",
        conteudo: "Consulte disponibilidade em tempo real ou renove seus empréstimos online.",
        linkUrl: "https://dedalus.usp.br",
        linkLabel: "Acessar Dedalus USP",
      },
    ],
  },
];

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed;
  } catch {
    return fallback;
  }
}

function saveLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

export function normalizeSlug(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ==========================================
// Páginas Customizadas (/p/:slug)
// ==========================================

export async function getCustomPages(onlyPublished = false): Promise<CustomPage[]> {
  const db = getFirestoreDb();
  let pages: CustomPage[] | null = null;
  if (db) {
    try {
      const snap = await getDocs(collection(db, PAGES_COLLECTION));
      if (!snap.empty) {
        pages = snap.docs.map((d) => ({ ...(d.data() as CustomPage), id: d.id }));
        saveLocal(LOCAL_PAGES_KEY, pages);
      }
    } catch {
      // fallback to localStorage
    }
  }
  const list = pages ?? readLocal<CustomPage[]>(LOCAL_PAGES_KEY, DEFAULT_CUSTOM_PAGES);
  return onlyPublished ? list.filter((p) => p.publicada) : list;
}

export async function getCustomPageBySlug(slug: string): Promise<CustomPage | null> {
  const clean = normalizeSlug(slug);
  const all = await getCustomPages(false);
  return all.find((p) => normalizeSlug(p.slug) === clean) ?? null;
}

export async function saveCustomPage(page: CustomPage): Promise<CustomPage> {
  const cleanSlug = normalizeSlug(page.slug || page.titulo) || `pagina-${Date.now()}`;
  const payload: CustomPage = {
    ...page,
    id: page.id || cleanSlug,
    slug: cleanSlug,
    atualizadoEm: new Date().toISOString(),
    criadoEm: page.criadoEm || new Date().toISOString(),
  };

  const current = readLocal<CustomPage[]>(LOCAL_PAGES_KEY, DEFAULT_CUSTOM_PAGES);
  const idx = current.findIndex((p) => p.id === payload.id);
  const updated =
    idx >= 0
      ? current.map((p) => (p.id === payload.id ? payload : p))
      : [...current, payload];
  saveLocal(LOCAL_PAGES_KEY, updated);

  const db = getFirestoreDb();
  if (db) {
    await setDoc(doc(db, PAGES_COLLECTION, payload.id), payload, { merge: true });
  }
  return payload;
}

export async function deleteCustomPage(id: string): Promise<void> {
  const current = readLocal<CustomPage[]>(LOCAL_PAGES_KEY, DEFAULT_CUSTOM_PAGES);
  saveLocal(
    LOCAL_PAGES_KEY,
    current.filter((p) => p.id !== id)
  );
  const db = getFirestoreDb();
  if (db) {
    await deleteDoc(doc(db, PAGES_COLLECTION, id));
  }
}

// ==========================================
// Obras Obrigatórias do Vestibular
// ==========================================

const SEED_BY_ID = new Map(VESTIBULAR_BOOKS_SEED.map((b) => [b.id, b]));

function enrichVestibularBook(book: VestibularBook): VestibularBook {
  const seed = SEED_BY_ID.get(book.id);
  if (!seed) return book;
  return {
    ...book,
    escolaLiteraria: book.escolaLiteraria || seed.escolaLiteraria,
    anoPublicacao: book.anoPublicacao || seed.anoPublicacao,
    sinopse: book.sinopse || seed.sinopse,
    temasVestibular:
      Array.isArray(book.temasVestibular) && book.temasVestibular.length > 0
        ? book.temasVestibular
        : seed.temasVestibular,
    dominioPublicoUrl: book.dominioPublicoUrl || seed.dominioPublicoUrl,
  };
}

export async function getVestibularBooks(): Promise<VestibularBook[]> {
  const db = getFirestoreDb();
  if (db) {
    try {
      const q = query(collection(db, VESTIBULAR_COLLECTION), orderBy("ordem", "asc"));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list = snap.docs.map((d) =>
          enrichVestibularBook({ ...(d.data() as VestibularBook), id: d.id }),
        );
        saveLocal(LOCAL_VESTIBULAR_KEY, list);
        return list;
      }
    } catch {
      // fallback to local/seed
    }
  }
  const local = readLocal<VestibularBook[]>(LOCAL_VESTIBULAR_KEY, []);
  if (local.length > 0) return local.map(enrichVestibularBook);
  return VESTIBULAR_BOOKS_SEED;
}

export async function saveVestibularBook(book: VestibularBook): Promise<VestibularBook> {
  const payload: VestibularBook = {
    ...book,
    id: book.id || `vest-${Date.now()}`,
    atualizadoEm: new Date().toISOString(),
  };

  const current = await getVestibularBooks();
  const exists = current.some((b) => b.id === payload.id);
  const next = exists
    ? current.map((b) => (b.id === payload.id ? payload : b))
    : [...current, payload];
  next.sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
  saveLocal(LOCAL_VESTIBULAR_KEY, next);

  const db = getFirestoreDb();
  if (db) {
    await setDoc(doc(db, VESTIBULAR_COLLECTION, payload.id), payload, { merge: true });
  }
  return payload;
}

export async function deleteVestibularBook(id: string): Promise<void> {
  const current = await getVestibularBooks();
  saveLocal(
    LOCAL_VESTIBULAR_KEY,
    current.filter((b) => b.id !== id)
  );
  const db = getFirestoreDb();
  if (db) {
    await deleteDoc(doc(db, VESTIBULAR_COLLECTION, id));
  }
}

export async function resetVestibularBooksToSeed(): Promise<VestibularBook[]> {
  saveLocal(LOCAL_VESTIBULAR_KEY, VESTIBULAR_BOOKS_SEED);
  const db = getFirestoreDb();
  if (db) {
    for (const book of VESTIBULAR_BOOKS_SEED) {
      await setDoc(doc(db, VESTIBULAR_COLLECTION, book.id), book, { merge: true });
    }
  }
  return VESTIBULAR_BOOKS_SEED;
}

/**
 * Salva a URL da capa automática descoberta no cache local e no Firestore (quando permitido),
 * evitando novas chamadas externas em carregamentos futuros.
 */
export async function persistVestibularAutoCover(
  bookId: string,
  capaAutoUrl: string,
): Promise<void> {
  if (!bookId || !capaAutoUrl) return;
  const local = readLocal<VestibularBook[]>(LOCAL_VESTIBULAR_KEY, []);
  if (local.length > 0) {
    saveLocal(
      LOCAL_VESTIBULAR_KEY,
      local.map((b) => (b.id === bookId ? { ...b, capaAutoUrl } : b)),
    );
  }
  const db = getFirestoreDb();
  if (db) {
    try {
      await setDoc(doc(db, VESTIBULAR_COLLECTION, bookId), { capaAutoUrl }, { merge: true });
    } catch {
      // Visitantes sem permissão de escrita no Firestore mantêm o cache local
    }
  }
}

/**
 * Busca e salva permanentemente no Firestore as capas reais de todas as obras que ainda não possuem capa.
 */
export async function syncMissingVestibularCovers(): Promise<number> {
  const books = await getVestibularBooks();
  const db = getFirestoreDb();
  let updatedCount = 0;

  const updatedBooks = await Promise.all(
    books.map(async (book) => {
      if (book.capaUrl?.trim() || book.capaAutoUrl?.trim()) {
        return book;
      }
      const meta = await fetchBookCoverAndMetadata({
        titulo: book.titulo,
        autor: book.autor,
        isbn: book.isbn,
      });
      if (!meta?.coverUrl) return book;
      updatedCount += 1;
      const nextBook: VestibularBook = { ...book, capaAutoUrl: meta.coverUrl };
      if (db) {
        await setDoc(
          doc(db, VESTIBULAR_COLLECTION, book.id),
          { capaAutoUrl: meta.coverUrl },
          { merge: true },
        );
      }
      return nextBook;
    }),
  );

  if (updatedCount > 0) {
    saveLocal(LOCAL_VESTIBULAR_KEY, updatedBooks);
  }
  return updatedCount;
}
