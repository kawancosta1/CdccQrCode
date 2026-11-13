import { VESTIBULAR_BOOKS_SEED } from "../data/vestibularBooksSeed.ts";
import type { BookCatalogRepository } from "../types/catalog.ts";
import { getDefaultRoom, searchBooksByCode } from "./searchParser.ts";

export interface NameMatchItem {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  kind: "livro" | "assunto" | "estante";
  exactMatch?: boolean;
  routePath?: string;
}

export interface SearchableBookRecord {
  id: string;
  titulo: string;
  autor?: string;
  codigoDedalus: string;
}

interface SubjectEntry {
  id: string;
  label: string;
  code: string;
  keywords: string[];
}

const SUBJECT_CDU_ENTRIES: SubjectEntry[] = [
  { id: "subj-fisica", label: "Física", code: "530", keywords: ["fisica", "mecanica", "optica", "eletromagnetismo", "termodinamica"] },
  { id: "subj-quimica", label: "Química", code: "540", keywords: ["quimica", "organica", "inorganica", "tabela periodica"] },
  { id: "subj-matematica", label: "Matemática", code: "510", keywords: ["matematica", "algebra", "aritmetica"] },
  { id: "subj-calculo", label: "Cálculo e Análise", code: "517", keywords: ["calculo", "derivada", "integral", "analise matematica"] },
  { id: "subj-geometria", label: "Geometria", code: "513", keywords: ["geometria", "trigonometria"] },
  { id: "subj-estatistica", label: "Probabilidade e Estatística", code: "519", keywords: ["estatistica", "probabilidade"] },
  { id: "subj-astronomia", label: "Astronomia e Astrofísica", code: "520", keywords: ["astronomia", "astrofisica", "planetas", "universo", "estrelas"] },
  { id: "subj-biologia", label: "Biologia e Ciências da Vida", code: "570", keywords: ["biologia", "genetica", "evolucao", "celula"] },
  { id: "subj-ecologia", label: "Ecologia e Meio Ambiente", code: "574", keywords: ["ecologia", "meio ambiente", "sustentabilidade"] },
  { id: "subj-botanica", label: "Botânica e Plantas", code: "580", keywords: ["botanica", "plantas", "flora"] },
  { id: "subj-zoologia", label: "Zoologia e Animais", code: "590", keywords: ["zoologia", "animais", "fauna"] },
  { id: "subj-geologia", label: "Geologia e Ciências da Terra", code: "550", keywords: ["geologia", "rochas", "minerais", "meteorologia"] },
  { id: "subj-filosofia", label: "Filosofia", code: "100", keywords: ["filosofia", "etica", "logica"] },
  { id: "subj-psicologia", label: "Psicologia", code: "150", keywords: ["psicologia", "mente", "comportamento"] },
  { id: "subj-sociologia", label: "Sociologia e Ciências Sociais", code: "301", keywords: ["sociologia", "sociedade", "antropologia"] },
  { id: "subj-educacao", label: "Educação e Pedagogia", code: "370", keywords: ["educacao", "pedagogia", "ensino", "didatica"] },
  { id: "subj-informatica", label: "Computação e Informática", code: "001.6", keywords: ["informatica", "computacao", "programacao", "algoritmo"] },
  { id: "subj-arte", label: "Artes", code: "700", keywords: ["arte", "artes", "pintura", "escultura", "desenho"] },
  { id: "subj-musica", label: "Música", code: "780", keywords: ["musica", "instrumentos", "partitura"] },
  { id: "subj-literatura-br", label: "Literatura Brasileira", code: "869.9", keywords: ["literatura brasileira", "romance brasileiro", "poesia brasileira"] },
  { id: "subj-literatura-pt", label: "Literatura Portuguesa", code: "869", keywords: ["literatura portuguesa", "portugues"] },
  { id: "subj-geografia", label: "Geografia e Atlas", code: "910", keywords: ["geografia", "atlas", "mapas", "cartografia"] },
  { id: "subj-historia", label: "História Geral", code: "930", keywords: ["historia", "historia antiga", "historia geral"] },
  { id: "subj-referencia", label: "Obras de Referência (Dicionários e Enciclopédias)", code: "R", keywords: ["referencia", "dicionario", "enciclopedia", "almanaque"] },
  { id: "subj-infantil", label: "Literatura Infantojuvenil", code: "809.89282 A", keywords: ["infantil", "infantojuvenil", "juvenil", "contos infantis"] },
];

export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Gera URL direta de consulta no catálogo Dedalus USP filtrada para a Biblioteca do CDCC.
 */
export function buildDedalusSearchUrl(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) {
    return "https://dedalus.usp.br/F";
  }
  const params = new URLSearchParams({
    func: "find-b",
    find_code: "WRD",
    request: trimmed,
    local_base: "USP01",
    filter_code_1: "WSL",
    filter_request_1: "CDCC",
  });
  return `https://dedalus.usp.br/F/?${params.toString()}`;
}

function isPurelyNumericOrCodeLike(normalized: string): boolean {
  return /^\d[\d.\s]*$/.test(normalized);
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  const curr = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) {
      prev[j] = curr[j];
    }
  }
  return prev[b.length];
}

function matchTokensWithFuzzy(
  tokens: string[],
  targetText: string,
): { matched: boolean; exact: boolean } {
  const words = targetText.split(" ").filter(Boolean);
  let allExact = true;

  for (const token of tokens) {
    if (targetText.includes(token)) {
      continue;
    }

    if (token.length < 4) {
      return { matched: false, exact: false };
    }

    const maxDist = token.length >= 7 ? 2 : 1;
    const fuzzyHit = words.some((word) => {
      if (Math.abs(word.length - token.length) > maxDist) return false;
      return levenshteinDistance(token, word) <= maxDist;
    });

    if (!fuzzyHit) {
      return { matched: false, exact: false };
    }
    allExact = false;
  }

  return { matched: true, exact: allExact };
}

/**
 * Busca obras por título/autor (seed do vestibular + registros extras) e áreas CDU por assunto,
 * validando cada código contra o repositório de estantes do CDCC.
 */
export function searchByNameOrSubject(
  rawQuery: string,
  repository: BookCatalogRepository,
  extraBooks: SearchableBookRecord[] = [],
  limit = 6,
): NameMatchItem[] {
  const normalized = normalizeSearchText(rawQuery);
  if (normalized.length < 2 || isPurelyNumericOrCodeLike(normalized)) {
    return [];
  }

  const tokens = normalized.split(" ").filter((t) => t.length >= 2);
  if (tokens.length === 0) return [];

  const scoredResults: Array<{ score: number; item: NameMatchItem }> = [];
  const seenKeys = new Set<string>();

  const allBooks: SearchableBookRecord[] = [
    ...VESTIBULAR_BOOKS_SEED.map((b) => ({
      id: b.id,
      titulo: b.titulo,
      autor: b.autor,
      codigoDedalus: b.codigoDedalus,
    })),
    ...extraBooks,
  ];

  for (const book of allBooks) {
    if (!book.codigoDedalus?.trim()) continue;
    const normTitle = normalizeSearchText(book.titulo);
    const normAuthor = normalizeSearchText(book.autor ?? "");
    const combined = `${normTitle} ${normAuthor}`.trim();

    const { matched, exact } = matchTokensWithFuzzy(tokens, combined);
    if (!matched) continue;

    const dedupeKey = `${book.codigoDedalus.toUpperCase()}::${normTitle}`;
    if (seenKeys.has(dedupeKey)) continue;

    const results = searchBooksByCode(book.codigoDedalus, repository);
    if (!getDefaultRoom(results)) continue;

    seenKeys.add(dedupeKey);

    let score = exact ? 50 : 28;
    if (normTitle === normalized) score = 120;
    else if (normTitle.startsWith(normalized)) score = 100;
    else if (normTitle.includes(normalized)) score = 85;
    else if (normAuthor.includes(normalized)) score = 70;

    scoredResults.push({
      score,
      item: {
        id: `book-${book.id}`,
        title: book.titulo,
        subtitle: book.autor ? `${book.autor} • ${book.codigoDedalus}` : book.codigoDedalus,
        code: book.codigoDedalus,
        kind: "livro",
        exactMatch: exact,
      },
    });
  }

  for (const subject of SUBJECT_CDU_ENTRIES) {
    const normLabel = normalizeSearchText(subject.label);
    const allKeywordsText = `${normLabel} ${subject.keywords.join(" ")}`;
    const matchesKeyword = subject.keywords.some(
      (kw) => kw.includes(normalized) || normalized.includes(kw),
    );
    const { matched: matchesTokens, exact: exactTokens } = matchTokensWithFuzzy(
      tokens,
      allKeywordsText,
    );

    if (!matchesKeyword && !matchesTokens) continue;

    const results = searchBooksByCode(subject.code, repository);
    if (!getDefaultRoom(results)) continue;

    const dedupeKey = `subj::${subject.code}`;
    if (seenKeys.has(dedupeKey)) continue;
    seenKeys.add(dedupeKey);

    let score = matchesKeyword || exactTokens ? 45 : 24;
    if (normLabel === normalized || subject.keywords.includes(normalized)) score = 110;
    else if (normLabel.startsWith(normalized)) score = 90;

    scoredResults.push({
      score,
      item: {
        id: subject.id,
        title: subject.label,
        subtitle: `Área temática • CDU ${subject.code}`,
        code: subject.code,
        kind: "assunto",
        exactMatch: matchesKeyword || exactTokens,
      },
    });
  }

  for (const shelfMatch of searchRoomOrShelfMatches(rawQuery)) {
    scoredResults.push({
      score: shelfMatch.score,
      item: shelfMatch.item,
    });
  }

  return scoredResults
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, "pt-BR"))
    .slice(0, limit)
    .map((entry) => entry.item);
}

const ROOM_SHELF_DIRECTORY: Array<{
  roomId: 1 | 2 | 3;
  slug: string;
  label: string;
  areaLabel: string;
  maxShelf: number;
}> = [
  { roomId: 1, slug: "sala1", label: "Sala 1", areaLabel: "Ciências e Literatura (469–930)", maxShelf: 25 },
  { roomId: 2, slug: "sala2", label: "Sala 2", areaLabel: "Acervo Geral e Referência (001–469, R)", maxShelf: 12 },
  { roomId: 3, slug: "sala3", label: "Sala 3", areaLabel: "Acervo Infantojuvenil e Ludoteca", maxShelf: 5 },
];

export function searchRoomOrShelfMatches(rawQuery: string): Array<{ score: number; item: NameMatchItem }> {
  const normalized = normalizeSearchText(rawQuery);
  if (normalized.length < 3) return [];

  const results: Array<{ score: number; item: NameMatchItem }> = [];
  const shelfMatch = normalized.match(/^(?:estante|est)\s*(\d{1,2})$/);
  if (shelfMatch) {
    const shelfNum = Number(shelfMatch[1]);
    if (Number.isInteger(shelfNum) && shelfNum >= 1) {
      for (const room of ROOM_SHELF_DIRECTORY) {
        if (shelfNum <= room.maxShelf) {
          results.push({
            score: 115 - room.roomId,
            item: {
              id: `shelf-${room.slug}-${shelfNum}`,
              title: `${room.label} • Estante ${shelfNum}`,
              subtitle: `Abrir foto e mapa • ${room.areaLabel}`,
              code: `S${room.roomId}-E${shelfNum}`,
              kind: "estante",
              exactMatch: true,
              routePath: `/estantes/${room.slug}/${shelfNum}`,
            },
          });
        }
      }
    }
    return results;
  }

  const roomMatch = normalized.match(/^sala\s*([123])$/);
  if (roomMatch) {
    const roomId = Number(roomMatch[1]);
    const room = ROOM_SHELF_DIRECTORY.find((r) => r.roomId === roomId);
    if (room) {
      results.push({
        score: 115,
        item: {
          id: `room-${room.slug}`,
          title: `${room.label} (${room.maxShelf} estantes)`,
          subtitle: `Ver todas as estantes • ${room.areaLabel}`,
          code: `Sala ${room.roomId}`,
          kind: "estante",
          exactMatch: true,
          routePath: `/estantes`,
        },
      });
    }
    return results;
  }

  if (normalized.includes("estante") || normalized.includes("mapa das estantes")) {
    results.push({
      score: 60,
      item: {
        id: "all-shelves",
        title: "Mapa de Todas as Estantes",
        subtitle: "Navegar por Sala 1, Sala 2 e Sala 3",
        code: "Estantes",
        kind: "estante",
        exactMatch: true,
        routePath: "/estantes",
      },
    });
  }

  return results;
}
