import { ROOM_PRIORITY, type RoomId } from "../config/roomConstants.ts";
import type { BookCatalogRepository, RoomData, SearchResultsByRoom } from "../types/catalog.ts";

export type { RoomData, SearchResultsByRoom };

type CutterInput = {
  letter: string;
  number: number;
};

/**
 * Normaliza o código digitado para a chave esperada nos bancos de estantes.
 * - `809.89282` / `809.89283`: preserva o prefixo + primeira letra do cutter em maiúsculo.
 * - `869.3 X`: preserva código + letra única em maiúsculo.
 * - `R...`: reduz para `'R'`.
 * - Demais códigos: usa apenas o trecho antes do primeiro espaço.
 */
export function normalizeSearchValue(rawValue: string): string {
  const value = rawValue.trim();
  if (!value) return "";

  const parts = value.split(/\s+/);

  if (
    (parts[0].startsWith("809.89283") || parts[0].startsWith("809.89282")) &&
    parts.length >= 2
  ) {
    return `${parts[0]} ${parts[1].charAt(0).toUpperCase()}`;
  }

  if (parts[0].startsWith("869.3") && parts.length >= 2) {
    if (parts[1].length === 1 && /^[A-Z]$/i.test(parts[1])) {
      return `${parts[0]} ${parts[1].toUpperCase()}`;
    }
  }

  if (parts[0].toUpperCase().startsWith("R")) {
    return "R";
  }

  return parts[0];
}

/**
 * Extrai letra e número do cutter para classificações 869.3 (ex: "869.3 C500").
 */
export function parse8693Cutter(rawValue: string): CutterInput | null {
  const value = rawValue.trim().toUpperCase();
  if (!value.startsWith("869.3")) return null;

  const parts = value.split(/\s+/).filter(Boolean);
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

function findSala1ByCutterRange(
  rawValue: string,
  repository: BookCatalogRepository,
): RoomData | null {
  const parsed = parse8693Cutter(rawValue);
  if (!parsed) return null;

  for (const entry of repository.getSala1RangeEntries()) {
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
 * Busca um código de classificação em todas as salas disponíveis usando o repositório informado.
 */
export function searchBooksByCode(
  rawInput: string,
  repository: BookCatalogRepository,
): SearchResultsByRoom {
  if (!rawInput.trim()) return {};

  const normalizedValue = normalizeSearchValue(rawInput);
  const parsed8693Cutter = parse8693Cutter(rawInput);
  const results: SearchResultsByRoom = {};

  const sala1Entry = parsed8693Cutter
    ? findSala1ByCutterRange(rawInput, repository)
    : repository.findByRoomAndCode(1, normalizedValue);

  if (sala1Entry) {
    results[1] = sala1Entry;
  }

  // Quando for 869.3 com cutter, a classificação pertence exclusivamente à Sala 1.
  if (!parsed8693Cutter) {
    const sala2Entry = repository.findByRoomAndCode(2, normalizedValue);
    const sala3Entry = repository.findByRoomAndCode(3, normalizedValue);
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
