import { ROOM_PRIORITY, type RoomId } from "../config/rooms";
import { imageDatabaseSala1, imageDatabaseSala2, imageDatabaseSala3 } from "../data";

export interface RoomData {
  images: string[];
  shelf: string;
  range: string;
}

export type SearchResultsByRoom = Partial<Record<RoomId, RoomData>>;

type Sala1RangeEntry = RoomData & {
  codeBase?: string;
  cutterPrefixStart?: string;
  cutterNumberStart?: number;
  cutterPrefixEnd?: string;
  cutterNumberEnd?: number;
};

type CutterInput = {
  letter: string;
  number: number;
};

/**
 * Normaliza o código digitado para a chave esperada nos bancos de estantes.
 */
export function normalizeSearchValue(rawValue: string): string {
  let value = rawValue.trim();

  // Para códigos 809.8928x, mantém apenas a primeira letra após o espaço.
  if (
    (value.startsWith("809.89283") || value.startsWith("809.89282")) &&
    value.includes(" ")
  ) {
    const parts = value.split(" ");
    if (parts.length >= 2) {
      value = `${parts[0]} ${parts[1].charAt(0)}`;
    }
    return value;
  }

  // Para códigos 869.3 X (ex: 869.3 A, 869.3 F), mantém o padrão completo.
  if (value.startsWith("869.3") && value.includes(" ")) {
    const parts = value.split(" ");
    if (parts.length >= 2 && parts[1].length === 1 && /^[A-Z]$/i.test(parts[1])) {
      return `${parts[0]} ${parts[1].toUpperCase()}`;
    }
  }

  if (value.startsWith("R")) {
    return value.charAt(0);
  }

  // Para os demais, usa só o trecho antes do espaço.
  if (value.includes(" ")) {
    return value.split(" ")[0];
  }

  return value;
}

/**
 * Extrai letra e número do cutter para classificações 869.3 (ex: "869.3 C500").
 */
export function parse8693Cutter(rawValue: string): CutterInput | null {
  const value = rawValue.trim().toUpperCase();
  if (!value.startsWith("869.3")) return null;

  const parts = value.split(" ").filter(Boolean);
  if (parts.length < 2) return null;

  const cutterText = parts[1];
  const letter = cutterText.charAt(0);
  const numberText = cutterText.slice(1);
  const number = Number(numberText);

  if (letter < "A" || letter > "Z") return null;
  if (numberText.length === 0 || Number.isNaN(number)) return null;

  return { letter, number };
}

function isInsideCutterRange(
  inputLetter: string,
  inputNumber: number,
  startLetter: string,
  startNumber: number,
  endLetter: string,
  endNumber: number,
): boolean {
  if (inputLetter < startLetter || inputLetter > endLetter) return false;
  if (inputLetter === startLetter && inputNumber < startNumber) return false;
  if (inputLetter === endLetter && inputNumber > endNumber) return false;
  return true;
}

function findSala1ByCutterRange(rawValue: string): RoomData | null {
  const parsed = parse8693Cutter(rawValue);
  if (!parsed) return null;

  for (const entry of Object.values(imageDatabaseSala1) as Sala1RangeEntry[]) {
    if (
      entry.codeBase !== "869.3" ||
      !entry.cutterPrefixStart ||
      entry.cutterNumberStart === undefined ||
      !entry.cutterPrefixEnd ||
      entry.cutterNumberEnd === undefined
    ) {
      continue;
    }

    const startLetter = entry.cutterPrefixStart.toUpperCase();
    const endLetter = entry.cutterPrefixEnd.toUpperCase();

    if (
      isInsideCutterRange(
        parsed.letter,
        parsed.number,
        startLetter,
        entry.cutterNumberStart,
        endLetter,
        entry.cutterNumberEnd,
      )
    ) {
      return entry;
    }
  }

  return null;
}

/**
 * Busca um código de classificação em todas as salas disponíveis.
 */
export function searchBooksByCode(rawInput: string): SearchResultsByRoom {
  const normalizedValue = normalizeSearchValue(rawInput);
  const parsed8693Cutter = parse8693Cutter(rawInput);
  const results: SearchResultsByRoom = {};

  const sala1Entry = parsed8693Cutter
    ? findSala1ByCutterRange(rawInput)
    : (imageDatabaseSala1[normalizedValue] ?? null);

  if (sala1Entry) {
    results[1] = sala1Entry;
  }

  // Quando for 869.3 com cutter, ignora Sala 2 e Sala 3.
  if (!parsed8693Cutter) {
    const sala2Entry = imageDatabaseSala2[normalizedValue] ?? null;
    const sala3Entry = imageDatabaseSala3[normalizedValue] ?? null;
    if (sala2Entry) results[2] = sala2Entry;
    if (sala3Entry) results[3] = sala3Entry;
  }

  return results;
}

/**
 * Retorna a primeira sala encontrada seguindo a prioridade visual configurada.
 */
export function getDefaultRoom(results: SearchResultsByRoom): RoomId | null {
  for (const roomId of ROOM_PRIORITY) {
    if (results[roomId]) return roomId;
  }
  return null;
}

/**
 * Extrai identificadores de estante (ex: "Estante 1 / Estante 2" -> ["1", "2"]).
 */
export function extractShelves(roomData: RoomData | null): string[] {
  if (!roomData) return ["1"];

  const matches = Array.from(
    roomData.shelf.matchAll(/Estante\s+([A-Za-z0-9]+)/gi),
    (match) => match[1].toUpperCase(),
  );

  return matches.length > 0 ? matches : ["1"];
}
