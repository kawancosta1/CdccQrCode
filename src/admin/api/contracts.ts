import type {
  AdminDashboardSummary,
  Administrator,
  AuditLog,
  Book,
  Room,
  Sector,
  Shelf,
} from "../types/admin.ts";

export interface BookInput {
  title: string;
  author: string;
  dedalusCode: string;
  tombo?: string;
  roomId: string;
  shelfId: string;
  sectorId: string;
}

export interface ShelfInput {
  code: string;
  label: string;
  roomId: string;
  sectorId: string;
  classificationRange: string;
}

export interface RoomInput {
  slug: string;
  name: string;
  description: string;
}

export interface SectorInput {
  name: string;
  codeRange: string;
  description: string;
}

export interface CatalogExportPayload {
  exportedAt: string;
  isDemoData: boolean;
  rooms: Room[];
  sectors: Sector[];
  shelves: Shelf[];
  books: Book[];
}

export interface AdminCatalogApi {
  getDashboardSummary(): Promise<AdminDashboardSummary>;

  listBooks(): Promise<Book[]>;
  createBook(input: BookInput, actor: Administrator): Promise<Book>;
  updateBook(id: string, input: BookInput, actor: Administrator): Promise<Book>;
  moveBook(id: string, targetShelfId: string, actor: Administrator): Promise<Book>;
  deleteBook(id: string, actor: Administrator): Promise<void>;

  listShelves(): Promise<Shelf[]>;
  createShelf(input: ShelfInput, actor: Administrator): Promise<Shelf>;
  updateShelf(id: string, input: ShelfInput, actor: Administrator): Promise<Shelf>;
  deleteShelf(id: string, actor: Administrator): Promise<void>;

  listRooms(): Promise<Room[]>;
  createRoom(input: RoomInput, actor: Administrator): Promise<Room>;
  updateRoom(id: string, input: RoomInput, actor: Administrator): Promise<Room>;
  deleteRoom(id: string, actor: Administrator): Promise<void>;

  listSectors(): Promise<Sector[]>;
  createSector(input: SectorInput, actor: Administrator): Promise<Sector>;
  updateSector(id: string, input: SectorInput, actor: Administrator): Promise<Sector>;
  deleteSector(id: string, actor: Administrator): Promise<void>;

  listAuditLogs(): Promise<AuditLog[]>;
  exportCatalog(actor: Administrator): Promise<CatalogExportPayload>;
  importBooksBatch(inputs: BookInput[], actor: Administrator): Promise<{ imported: number }>;
}
