export type AdminRole = "super_admin" | "level_1" | "level_2" | "level_3";

export type Permission =
  | "books.read"
  | "books.create"
  | "books.update"
  | "books.delete"
  | "shelves.read"
  | "shelves.create"
  | "shelves.update"
  | "shelves.delete"
  | "rooms.read"
  | "rooms.create"
  | "rooms.update"
  | "rooms.delete"
  | "sectors.manage"
  | "catalog.import"
  | "catalog.export"
  | "catalog.manage"
  | "carousel.manage"
  | "games.manage"
  | "audit.read"
  | "settings.manage";

export interface Administrator {
  id: string;
  username: string;
  displayName: string;
  role: AdminRole;
  isSimulated: boolean;
}

export interface Sector {
  id: string;
  name: string;
  codeRange: string;
  description: string;
}

export interface Room {
  id: string;
  slug: string;
  name: string;
  description: string;
}

export interface Shelf {
  id: string;
  code: string;
  label: string;
  roomId: string;
  sectorId: string;
  classificationRange: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  dedalusCode: string;
  tombo?: string;
  roomId: string;
  shelfId: string;
  sectorId: string;
  isDemoData: boolean;
  updatedAt: string;
}

export type AuditAction =
  | "book.create"
  | "book.update"
  | "book.delete"
  | "book.move"
  | "shelf.create"
  | "shelf.update"
  | "shelf.delete"
  | "room.create"
  | "room.update"
  | "room.delete"
  | "sector.create"
  | "sector.update"
  | "sector.delete"
  | "catalog.import"
  | "catalog.export";

export interface AuditLog {
  id: string;
  actorUsername: string;
  actorRole: AdminRole;
  action: AuditAction;
  entityType: "book" | "shelf" | "room" | "sector" | "catalog";
  entityId: string;
  entityLabel: string;
  details: string;
  createdAt: string;
  isSimulated: boolean;
}

export interface AdminDashboardSummary {
  booksCount: number;
  shelvesCount: number;
  roomsCount: number;
  sectorsCount: number;
  isDemoCatalog: boolean;
}
