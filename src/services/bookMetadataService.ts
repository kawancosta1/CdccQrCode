export interface BookMetadataResult {
  coverUrl?: string;
  sinopse?: string;
  anoPublicacao?: string;
  paginas?: number;
  isbn?: string;
  source?: "google-books" | "open-library" | "cache";
  cachedAt: number;
}

const CACHE_KEY = "qrcodecdcc_book_meta_cache_v1";
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias
const NEGATIVE_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 1 dia quando não encontra capa

const inFlight = new Map<string, Promise<BookMetadataResult | null>>();

function makeKey(titulo: string, autor?: string, isbn?: string): string {
  const cleanIsbn = (isbn ?? "").replace(/[^0-9Xx]/g, "").trim();
  if (cleanIsbn) return `isbn:${cleanIsbn}`;
  return `q:${titulo.trim().toLowerCase()}|${(autor ?? "").trim().toLowerCase()}`;
}

function readCache(): Record<string, BookMetadataResult> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, BookMetadataResult>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeCacheEntry(key: string, entry: BookMetadataResult): void {
  if (typeof window === "undefined") return;
  try {
    const cache = readCache();
    cache[key] = entry;
    // Mantém cache enxuto (máximo 120 entradas)
    const keys = Object.keys(cache);
    if (keys.length > 120) {
      keys
        .sort((a, b) => (cache[a]?.cachedAt ?? 0) - (cache[b]?.cachedAt ?? 0))
        .slice(0, keys.length - 120)
        .forEach((oldKey) => delete cache[oldKey]);
    }
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore quota errors
  }
}

function normalizeGoogleCoverUrl(rawUrl?: string): string | undefined {
  if (!rawUrl) return undefined;
  let url = rawUrl.replace(/^http:\/\//i, "https://");
  if (url.includes("zoom=5") || url.includes("zoom=0")) {
    url = url.replace(/zoom=\d+/, "zoom=1");
  }
  return url;
}

function extractYear(publishedDate?: string): string | undefined {
  if (!publishedDate) return undefined;
  const match = publishedDate.match(/\b(1[0-9]{3}|20[0-9]{2})\b/);
  return match ? match[1] : undefined;
}

interface GoogleBooksResponse {
  items?: Array<{
    volumeInfo?: {
      description?: string;
      publishedDate?: string;
      pageCount?: number;
      imageLinks?: {
        thumbnail?: string;
        smallThumbnail?: string;
      };
      industryIdentifiers?: Array<{
        type?: string;
        identifier?: string;
      }>;
    };
  }>;
}

async function queryGoogleBooks(query: string): Promise<BookMetadataResult | null> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 6500);
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query,
    )}&maxResults=4&printType=books`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as GoogleBooksResponse;
    const items = data.items ?? [];
    if (items.length === 0) return null;

    // Prioriza item com capa; se nenhum tiver, pega o primeiro com descrição
    const withCover = items.find(
      (item) => item.volumeInfo?.imageLinks?.thumbnail || item.volumeInfo?.imageLinks?.smallThumbnail,
    );
    const chosen = withCover ?? items[0];
    const info = chosen?.volumeInfo;
    if (!info) return null;

    const coverUrl = normalizeGoogleCoverUrl(
      info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail,
    );
    const isbn13 = info.industryIdentifiers?.find((id) => id.type === "ISBN_13")?.identifier;
    const isbn10 = info.industryIdentifiers?.find((id) => id.type === "ISBN_10")?.identifier;

    return {
      coverUrl,
      sinopse: info.description?.trim() || undefined,
      anoPublicacao: extractYear(info.publishedDate),
      paginas: typeof info.pageCount === "number" && info.pageCount > 0 ? info.pageCount : undefined,
      isbn: isbn13 ?? isbn10,
      source: "google-books",
      cachedAt: Date.now(),
    };
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

interface OpenLibrarySearchResponse {
  docs?: Array<{
    cover_i?: number;
    first_publish_year?: number;
    number_of_pages_median?: number;
    isbn?: string[];
  }>;
}

async function queryOpenLibrary(
  titulo: string,
  autor?: string,
  isbn?: string,
): Promise<BookMetadataResult | null> {
  const cleanIsbn = (isbn ?? "").replace(/[^0-9Xx]/g, "").trim();
  if (cleanIsbn) {
    return {
      coverUrl: `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(cleanIsbn)}-M.jpg?default=false`,
      isbn: cleanIsbn,
      source: "open-library",
      cachedAt: Date.now(),
    };
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 6500);
  try {
    const params = new URLSearchParams({
      title: titulo.trim(),
      limit: "4",
    });
    if (autor?.trim()) {
      params.set("author", autor.trim());
    }
    const res = await fetch(`https://openlibrary.org/search.json?${params.toString()}`, {
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as OpenLibrarySearchResponse;
    const docWithCover = (data.docs ?? []).find((d) => typeof d.cover_i === "number");
    const first = docWithCover ?? data.docs?.[0];
    if (!first) return null;

    const coverUrl =
      typeof first.cover_i === "number"
        ? `https://covers.openlibrary.org/b/id/${first.cover_i}-M.jpg`
        : undefined;

    return {
      coverUrl,
      anoPublicacao: first.first_publish_year ? String(first.first_publish_year) : undefined,
      paginas:
        typeof first.number_of_pages_median === "number"
          ? first.number_of_pages_median
          : undefined,
      isbn: first.isbn?.[0],
      source: "open-library",
      cachedAt: Date.now(),
    };
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

/**
 * Busca capa real e metadados (sinopse, ano, páginas, ISBN) na Google Books API e Open Library,
 * com cache em localStorage e deduplicação de requisições simultâneas.
 */
export async function fetchBookCoverAndMetadata(params: {
  titulo: string;
  autor?: string;
  isbn?: string;
  skipCache?: boolean;
}): Promise<BookMetadataResult | null> {
  const { titulo, autor, isbn, skipCache = false } = params;
  if (!titulo.trim() && !isbn?.trim()) return null;

  const key = makeKey(titulo, autor, isbn);

  if (!skipCache) {
    const cache = readCache();
    const cached = cache[key];
    if (cached) {
      const ttl = cached.coverUrl ? CACHE_TTL_MS : NEGATIVE_CACHE_TTL_MS;
      if (Date.now() - cached.cachedAt < ttl) {
        return { ...cached, source: "cache" };
      }
    }
  }

  const pending = inFlight.get(key);
  if (pending) return pending;

  const promise = (async () => {
    const cleanIsbn = (isbn ?? "").replace(/[^0-9Xx]/g, "").trim();
    let result: BookMetadataResult | null = null;

    if (cleanIsbn) {
      result = await queryGoogleBooks(`isbn:${cleanIsbn}`);
    }

    if (!result?.coverUrl && titulo.trim()) {
      const query = autor?.trim()
        ? `intitle:${titulo.trim()} inauthor:${autor.trim()}`
        : `intitle:${titulo.trim()}`;
      result = await queryGoogleBooks(query);

      if (!result?.coverUrl && autor?.trim()) {
        const fallbackGb = await queryGoogleBooks(`intitle:${titulo.trim()}`);
        if (fallbackGb?.coverUrl || !result) {
          result = fallbackGb ?? result;
        }
      }
    }

    if (!result?.coverUrl) {
      const ol = await queryOpenLibrary(titulo, autor, cleanIsbn);
      if (ol?.coverUrl) {
        result = {
          ...(result ?? { cachedAt: Date.now() }),
          ...ol,
          sinopse: result?.sinopse ?? ol.sinopse,
          anoPublicacao: result?.anoPublicacao ?? ol.anoPublicacao,
          paginas: result?.paginas ?? ol.paginas,
        };
      }
    }

    const finalEntry: BookMetadataResult = result ?? {
      cachedAt: Date.now(),
    };
    writeCacheEntry(key, finalEntry);
    return result;
  })();

  inFlight.set(key, promise);
  try {
    return await promise;
  } finally {
    inFlight.delete(key);
  }
}
