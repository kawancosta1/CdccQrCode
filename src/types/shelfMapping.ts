import type { RoomId } from "../config/roomConstants.ts";

export interface ShelfRegion {
  x: number; // % (0 a 100)
  y: number; // % (0 a 100)
  w: number; // % (0 a 100)
  h: number; // % (0 a 100)
  shelfRow?: number; // ex: 4 (Prateleira 4)
  label?: string; // ex: "530 - Física"
}

export interface ShelfMapping {
  shelfId: string; // ex: "sala-2-estante-8"
  roomId: RoomId;
  shelfNumber: number;
  cleanImageUrl?: string;
  imageAspectRatio?: number; // ex: 0.75 (3:4) para evitar CLS
  spatialHint?: string;
  dividers?: number[]; // porcentagens Y das divisórias horizontais (ex: [20, 40, 60, 80])
  updatedAt?: string;
  regions: Record<string, ShelfRegion>;
}
