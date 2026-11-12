import type { RoomId } from "../config/roomConstants.ts";

export interface RoomData {
  images: string[];
  shelf: string;
  range: string;
}

export type Sala1RangeEntry = RoomData & {
  codeBase?: string;
  cutterPrefixStart?: string;
  cutterNumberStart?: number;
  cutterPrefixEnd?: string;
  cutterNumberEnd?: number;
};

export type SearchResultsByRoom = Partial<Record<RoomId, RoomData>>;

/**
 * Contrato de acesso ao catálogo de estantes por sala.
 * Permite trocar a origem estática por API/SQL sem alterar a lógica de domínio.
 */
export interface BookCatalogRepository {
  findByRoomAndCode(roomId: RoomId, code: string): RoomData | null;
  getSala1RangeEntries(): Sala1RangeEntry[];
}
