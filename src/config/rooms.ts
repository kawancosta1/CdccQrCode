import mapaSala1 from "../components/img/MapaSala1.png";
import mapaSala2 from "../components/img/MapaSala2.png";
import mapaSala3 from "../components/img/MapaSala3.png";

export type RoomId = 1 | 2 | 3;

export interface ShelfMarkerPosition {
  top: string;
  left?: string;
  right?: string;
  centered?: boolean;
}

export interface RoomConfig {
  id: RoomId;
  slug: string;
  label: string;
  mapSrc: string;
  mapAlt: string;
  shelfNumbers: number[];
  shelfMarkers: Record<string, ShelfMarkerPosition>;
}

/** Ordem de exibição padrão dos botões de sala. */
export const ROOM_IDS: RoomId[] = [1, 2, 3];

/** Prioridade visual ao selecionar a sala inicial após uma busca. */
export const ROOM_PRIORITY: RoomId[] = [3, 2, 1];

export const ROOM_CONFIG: Record<RoomId, RoomConfig> = {
  1: {
    id: 1,
    slug: "sala1",
    label: "Sala 1",
    mapSrc: mapaSala1,
    mapAlt: "Mapa da Sala 1",
    shelfNumbers: Array.from({ length: 25 }, (_, i) => i + 1),
    shelfMarkers: {
      "1": { top: "42%", left: "21%", centered: true },
      "2": { top: "38%", left: "21%", centered: true },
      "3": { top: "30%", left: "12%", centered: true },
      "4": { top: "26%", left: "20%", centered: true },
      "5": { top: "22%", left: "20%", centered: true },
      "6": { top: "10%", left: "10%", centered: true },
      "7": { top: "10%", left: "10%", centered: true },
      "8": { top: "10%", right: "62%", centered: true },
      "9": { top: "10%", right: "58%", centered: true },
      "10": { top: "10%", right: "42%", centered: true },
      "11": { top: "10%", right: "38%", centered: true },
      "12": { top: "2%", right: "20%", centered: true },
      "13": { top: "10%", right: "12%", centered: true },
      "14": { top: "22%", right: "20%", centered: true },
      "15": { top: "27%", right: "20%", centered: true },
      "16": { top: "30%", right: "12%", centered: true },
      "17": { top: "38%", right: "20%", centered: true },
      "18": { top: "42%", right: "20%", centered: true },
      "19": { top: "50%", right: "12%", centered: true },
      "20": { top: "54%", right: "20%", centered: true },
      "21": { top: "60%", right: "20%", centered: true },
      "22": { top: "61%", right: "12%", centered: true },
      "23": { top: "69%", right: "18%", centered: true },
      "24": { top: "73%", right: "17%", centered: true },
      "25": { top: "82%", right: "13%", centered: true },
      "26": { top: "50%", left: "50%", centered: true },
      "27": { top: "50%", left: "50%", centered: true },
      "28": { top: "50%", left: "50%", centered: true },
    },
  },
  2: {
    id: 2,
    slug: "sala2",
    label: "Sala 2",
    mapSrc: mapaSala2,
    mapAlt: "Mapa da Sala 2",
    shelfNumbers: Array.from({ length: 12 }, (_, i) => i + 1),
    shelfMarkers: {
      "1": { top: "78%", left: "13.2%" },
      "2": { top: "75%", left: "24%" },
      "3": { top: "71%", left: "22%" },
      "4": { top: "63%", left: "12%" },
      "5": { top: "60%", left: "24%" },
      "6": { top: "55%", left: "24%" },
      "7": { top: "48%", left: "8.2%" },
      "8": { top: "44%", left: "24%" },
      "9": { top: "39%", left: "24%" },
      "10": { top: "31%", left: "12%" },
      "11": { top: "26.5%", left: "24%" },
      "12": { top: "27.2%", left: "24%" },
      "13": { top: "20.2%", left: "24%" },
      R: { top: "2.2%", left: "22%" },
      R2: { top: "2.2%", left: "85%" },
      R3: { top: "6%", left: "10%" },
      R4: { top: "5%", left: "90%" },
    },
  },
  3: {
    id: 3,
    slug: "sala3",
    label: "Sala 3",
    mapSrc: mapaSala3,
    mapAlt: "Mapa da Sala 3",
    shelfNumbers: [],
    shelfMarkers: {},
  },
};

/** Resolve um slug de rota (ex: "sala1") para o RoomId correspondente. */
export function getRoomIdBySlug(slug: string | undefined): RoomId | null {
  if (!slug) return null;
  const entry = Object.values(ROOM_CONFIG).find((room) => room.slug === slug);
  return entry ? entry.id : null;
}
