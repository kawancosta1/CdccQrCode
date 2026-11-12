import type { RoomId } from "../config/roomConstants.ts";
import { imageDatabaseSala1, imageDatabaseSala2, imageDatabaseSala3 } from "../data";
import type { BookCatalogRepository, RoomData, Sala1RangeEntry } from "../types/catalog.ts";

type RoomDatabase = Record<string, RoomData>;

const ROOM_DATABASES: Record<RoomId, RoomDatabase> = {
  1: imageDatabaseSala1,
  2: imageDatabaseSala2,
  3: imageDatabaseSala3,
};

function findCodeInDatabase(database: RoomDatabase, code: string): RoomData | null {
  if (database[code]) return database[code];

  const normalizedTarget = code.toUpperCase();
  for (const [key, entry] of Object.entries(database)) {
    if (key.toUpperCase() === normalizedTarget) {
      return entry;
    }
  }

  return null;
}

/**
 * Implementação padrão baseada nos bancos estáticos em memória.
 */
export const staticBookCatalogRepository: BookCatalogRepository = {
  findByRoomAndCode(roomId: RoomId, code: string): RoomData | null {
    const database = ROOM_DATABASES[roomId];
    return database ? findCodeInDatabase(database, code) : null;
  },

  getSala1RangeEntries(): Sala1RangeEntry[] {
    return Object.values(imageDatabaseSala1) as Sala1RangeEntry[];
  },

  getRoomCodes(roomId: RoomId): string[] {
    const database = ROOM_DATABASES[roomId];
    return database ? Object.keys(database) : [];
  },
};
