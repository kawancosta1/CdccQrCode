import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import type { SearchableBookRecord } from "../domain/nameSearch.ts";
import { getFirestoreDb } from "../lib/firebase.ts";
import { getCustomPages } from "./pagesService.ts";

const LOCAL_INDEX_KEY = "qrcodecdcc_searchable_books";
const FIRESTORE_COLLECTION = "acervo_busca_nomes";
export const CATALOG_INDEX_UPDATED_EVENT = "cdcc:catalog-index-updated";

function notifyIndexUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CATALOG_INDEX_UPDATED_EVENT));
  }
}

export function readLocalImportedBooks(): SearchableBookRecord[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is SearchableBookRecord =>
        Boolean(item) &&
        typeof (item as SearchableBookRecord).id === "string" &&
        typeof (item as SearchableBookRecord).titulo === "string" &&
        typeof (item as SearchableBookRecord).codigoDedalus === "string",
    );
  } catch {
    return [];
  }
}

function writeLocalImportedBooks(records: SearchableBookRecord[]): void {
  try {
    window.localStorage.setItem(LOCAL_INDEX_KEY, JSON.stringify(records));
  } catch {
    // Ignora falha de quota em modo privado
  }
}

/**
 * Faz o parse de planilhas CSV, TSV ou listas separadas por `;`, `,` ou tabulação.
 * Aceita cabeçalho opcional (Título, Autor, Código Dedalus/CDU) ou ordem posicional.
 */
export function parseDedalusCsv(rawText: string): SearchableBookRecord[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const detectDelimiter = (sample: string): string => {
    if (sample.includes("\t")) return "\t";
    if (sample.includes(";")) return ";";
    return ",";
  };

  const splitLine = (line: string, delimiter: string): string[] => {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === delimiter && !inQuotes) {
        cells.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    cells.push(current.trim());
    return cells.map((c) => c.replace(/^"|"$/g, "").trim());
  };

  const delimiter = detectDelimiter(lines[0]);
  const firstRow = splitLine(lines[0], delimiter).map((c) => c.toLowerCase());
  const looksLikeHeader = firstRow.some(
    (cell) =>
      cell.includes("título") ||
      cell.includes("titulo") ||
      cell.includes("title") ||
      cell.includes("dedalus") ||
      cell.includes("cdu") ||
      cell.includes("código") ||
      cell.includes("codigo"),
  );

  let titleIdx = 0;
  let authorIdx = 1;
  let codeIdx = 2;
  let startRow = 0;

  if (looksLikeHeader) {
    startRow = 1;
    const foundTitle = firstRow.findIndex(
      (c) => c.includes("título") || c.includes("titulo") || c.includes("title") || c.includes("obra"),
    );
    const foundAuthor = firstRow.findIndex((c) => c.includes("autor") || c.includes("author"));
    const foundCode = firstRow.findIndex(
      (c) =>
        c.includes("dedalus") ||
        c.includes("cdu") ||
        c.includes("código") ||
        c.includes("codigo") ||
        c.includes("classifica"),
    );
    if (foundTitle >= 0) titleIdx = foundTitle;
    if (foundAuthor >= 0) authorIdx = foundAuthor;
    if (foundCode >= 0) codeIdx = foundCode;
  }

  const results: SearchableBookRecord[] = [];
  for (let i = startRow; i < lines.length; i++) {
    const cols = splitLine(lines[i], delimiter);
    if (cols.length < 2) continue;

    // Se houver apenas 2 colunas sem cabeçalho, assume Título;Código
    const titulo = (cols[titleIdx] ?? "").trim();
    const codigoDedalus =
      cols.length === 2 && !looksLikeHeader
        ? (cols[1] ?? "").trim()
        : (cols[codeIdx] ?? "").trim();
    const autor =
      cols.length === 2 && !looksLikeHeader ? "" : (cols[authorIdx] ?? "").trim();

    if (!titulo || !codigoDedalus) continue;

    results.push({
      id: `imp-${i}-${titulo.slice(0, 16).toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      titulo,
      autor: autor || undefined,
      codigoDedalus,
    });
  }

  return results;
}

export async function saveImportedDedalusBooks(
  incoming: SearchableBookRecord[],
): Promise<{ added: number; total: number }> {
  const existing = readLocalImportedBooks();
  const byKey = new Map<string, SearchableBookRecord>();

  for (const item of existing) {
    const key = `${item.titulo.toLowerCase()}::${item.codigoDedalus.toUpperCase()}`;
    byKey.set(key, item);
  }

  let added = 0;
  for (const item of incoming) {
    const key = `${item.titulo.toLowerCase()}::${item.codigoDedalus.toUpperCase()}`;
    if (!byKey.has(key)) added++;
    byKey.set(key, item);
  }

  const merged = Array.from(byKey.values());
  writeLocalImportedBooks(merged);

  const db = getFirestoreDb();
  if (db) {
    try {
      await setDoc(doc(collection(db, FIRESTORE_COLLECTION), "batch_index"), {
        items: merged.slice(0, 2000),
        updatedAt: new Date().toISOString(),
      });
    } catch {
      // fallback local preservado
    }
  }

  notifyIndexUpdated();
  return { added, total: merged.length };
}

export async function syncAdminBookToSearchIndex(book: {
  id: string;
  title: string;
  author: string;
  dedalusCode: string;
}): Promise<void> {
  if (!book.title.trim() || !book.dedalusCode.trim()) return;
  await saveImportedDedalusBooks([
    {
      id: `admin-${book.id}`,
      titulo: book.title.trim(),
      autor: book.author.trim() || undefined,
      codigoDedalus: book.dedalusCode.trim(),
    },
  ]);
}

export async function getDynamicSearchableBooks(): Promise<SearchableBookRecord[]> {
  const collected: SearchableBookRecord[] = [...readLocalImportedBooks()];

  const db = getFirestoreDb();
  if (db) {
    try {
      const snap = await getDocs(collection(db, FIRESTORE_COLLECTION));
      snap.forEach((docSnap) => {
        const data = docSnap.data() as { items?: SearchableBookRecord[] };
        if (Array.isArray(data?.items)) {
          collected.push(...data.items);
        }
      });
    } catch {
      // ignora erro de rede e segue com local + páginas
    }
  }

  try {
    const pages = await getCustomPages(true);
    for (const page of pages) {
      for (const block of page.blocos ?? []) {
        if (block.tipo === "grade_livros" && Array.isArray(block.livros)) {
          for (const b of block.livros) {
            if (b.titulo && b.codigoDedalus) {
              collected.push({
                id: `page-${page.slug}-${b.id}`,
                titulo: b.titulo,
                autor: b.autor,
                codigoDedalus: b.codigoDedalus,
              });
            }
          }
        }
      }
    }
  } catch {
    // ignora falha ao ler páginas customizadas
  }

  return collected;
}
