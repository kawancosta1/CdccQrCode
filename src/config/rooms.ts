import { ROOM_IDS, ROOM_PRIORITY, type RoomId } from "./roomConstants.ts";
import mapaSala1 from "../components/img/MapaSala1.webp";
import mapaSala2 from "../components/img/MapaSala2.webp";
import mapaSala3 from "../components/img/MapaSala3.webp";

export { ROOM_IDS, ROOM_PRIORITY, type RoomId };

export interface ShelfMarkerPosition {
  top: string;
  left?: string;
  right?: string;
  centered?: boolean;
  /** Largura física aproximada na planta (em % do mapa, 0..100) */
  widthPct?: number;
  /** Profundidade física aproximada na planta (em % do mapa, 0..100) */
  depthPct?: number;
  /** Direção da face frontal com livros */
  facing?: "south" | "north" | "east" | "west";
}

export interface RoomConfig {
  id: RoomId;
  slug: string;
  label: string;
  areaLabel: string;
  mapSrc: string;
  mapAlt: string;
  shelfNumbers: number[];
  shelfMarkers: Record<string, ShelfMarkerPosition>;
}



export const ROOM_CONFIG: Record<RoomId, RoomConfig> = {
  1: {
    id: 1,
    slug: "sala1",
    label: "Sala 1",
    areaLabel: "Ciências e Literatura (469–930)",
    mapSrc: mapaSala1,
    mapAlt: "Mapa da Sala 1",
    shelfNumbers: Array.from({ length: 25 }, (_, i) => i + 1),
    shelfMarkers: {
      "1": { top: "43.2%", left: "23.2%", centered: true, widthPct: 20.5, depthPct: 4.1, facing: "south" },
      "2": { top: "39.1%", left: "23.2%", centered: true, widthPct: 20.5, depthPct: 4.1, facing: "north" },
      "3": { top: "33.1%", left: "10%", centered: true, widthPct: 6, depthPct: 7.5, facing: "east" },
      "4": { top: "27.2%", left: "23.2%", centered: true, widthPct: 20.5, depthPct: 4.1, facing: "south" },
      "5": { top: "23.1%", left: "23.2%", centered: true, widthPct: 20.5, depthPct: 4.1, facing: "north" },
      "6": { top: "9%", left: "9.8%", centered: true, widthPct: 6, depthPct: 7.5, facing: "east" },
      "7": { top: "3.2%", left: "23%", centered: true, widthPct: 20.5, depthPct: 4, facing: "south" },
      "8": { top: "9%", left: "36%", centered: true, widthPct: 5.8, depthPct: 7.5, facing: "west" },
      "9": { top: "9%", left: "41.8%", centered: true, widthPct: 5.8, depthPct: 7.5, facing: "east" },
      "10": { top: "9%", left: "57.1%", centered: true, widthPct: 5.8, depthPct: 7.5, facing: "west" },
      "11": { top: "9%", left: "62.9%", centered: true, widthPct: 5.8, depthPct: 7.5, facing: "east" },
      "12": { top: "3.2%", right: "23.7%", centered: true, widthPct: 20.5, depthPct: 4, facing: "south" },
      "13": { top: "9%", right: "10.3%", centered: true, widthPct: 6, depthPct: 7.5, facing: "west" },
      "14": { top: "23.1%", right: "23.5%", centered: true, widthPct: 20.5, depthPct: 4.1, facing: "north" },
      "15": { top: "27.2%", right: "23.5%", centered: true, widthPct: 20.5, depthPct: 4.1, facing: "south" },
      "16": { top: "33.1%", right: "10.3%", centered: true, widthPct: 6, depthPct: 7.5, facing: "west" },
      "17": { top: "39.1%", right: "23.5%", centered: true, widthPct: 20.5, depthPct: 4.1, facing: "north" },
      "18": { top: "43.2%", right: "23.5%", centered: true, widthPct: 20.5, depthPct: 4.1, facing: "south" },
      "19": { top: "49.1%", right: "10.3%", centered: true, widthPct: 6, depthPct: 7.5, facing: "west" },
      "20": { top: "55.1%", right: "23.5%", centered: true, widthPct: 20.5, depthPct: 4.1, facing: "north" },
      "21": { top: "59.2%", right: "23.5%", centered: true, widthPct: 20.5, depthPct: 4.1, facing: "south" },
      "22": { top: "65.1%", right: "10.3%", centered: true, widthPct: 6, depthPct: 7.5, facing: "west" },
      "23": { top: "70.8%", right: "18.4%", centered: true, widthPct: 10.5, depthPct: 4.1, facing: "north" },
      "24": { top: "74.9%", right: "18.4%", centered: true, widthPct: 10.5, depthPct: 4.1, facing: "south" },
      "25": { top: "80.7%", right: "10.3%", centered: true, widthPct: 6, depthPct: 7.5, facing: "west" },
      "26": { top: "50%", left: "50%", centered: true },
      "27": { top: "50%", left: "50%", centered: true },
      "28": { top: "50%", left: "50%", centered: true },
    },
  },
  2: {
    id: 2,
    slug: "sala2",
    label: "Sala 2",
    areaLabel: "Acervo Geral e Referência (001–469, R)",
    mapSrc: mapaSala2,
    mapAlt: "Mapa da Sala 2",
    shelfNumbers: Array.from({ length: 12 }, (_, i) => i + 1),
    shelfMarkers: {
      "1": { top: "82%", left: "11.2%", centered: true, widthPct: 6, depthPct: 7.5, facing: "east" },
      "2": { top: "75.5%", left: "29.5%", centered: true, widthPct: 31, depthPct: 4, facing: "south" },
      "3": { top: "71.5%", left: "29.5%", centered: true, widthPct: 31, depthPct: 4, facing: "north" },
      "4": { top: "66%", left: "11.2%", centered: true, widthPct: 6, depthPct: 7.5, facing: "east" },
      "5": { top: "60%", left: "29.5%", centered: true, widthPct: 31, depthPct: 4, facing: "south" },
      "6": { top: "56%", left: "29.5%", centered: true, widthPct: 31, depthPct: 4, facing: "north" },
      "7": { top: "50%", left: "11.2%", centered: true, widthPct: 6, depthPct: 7.5, facing: "east" },
      "8": { top: "44%", left: "29.5%", centered: true, widthPct: 31, depthPct: 4, facing: "south" },
      "9": { top: "40%", left: "29.5%", centered: true, widthPct: 31, depthPct: 4, facing: "north" },
      "10": { top: "34%", left: "11.2%", centered: true, widthPct: 6, depthPct: 7.5, facing: "east" },
      "11": { top: "28%", left: "29.5%", centered: true, widthPct: 31, depthPct: 4, facing: "south" },
      "12": { top: "24%", left: "29.5%", centered: true, widthPct: 31, depthPct: 4, facing: "north" },
      "13": { top: "20.2%", left: "29.5%", centered: true, widthPct: 31, depthPct: 4, facing: "north" },
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
    areaLabel: "Espaço Lúdico e Literatura (809.89282 A–Z)",
    mapSrc: mapaSala3,
    mapAlt: "Mapa da Sala 3",
    shelfNumbers: [1, 2, 3, 4, 5],
    shelfMarkers: {
      "1": { top: "48%", left: "11.5%", centered: true },
      "2": { top: "40%", left: "36%", centered: true },
      "3": { top: "31.5%", left: "11.5%", centered: true },
      "4": { top: "23%", left: "36%", centered: true },
      "5": { top: "15%", left: "11.5%", centered: true },
    },
  },
};

function describeMapPosition(pos: ShelfMarkerPosition): string {
  const topPct = Number.parseFloat(pos.top);
  const vertical =
    topPct <= 33 ? "na parte superior" : topPct >= 67 ? "na parte inferior" : "na região central";

  if (pos.left) {
    const leftPct = Number.parseFloat(pos.left);
    const horizontal =
      leftPct <= 35 ? "à esquerda" : leftPct >= 65 ? "à direita" : "no centro";
    return `${vertical}, ${horizontal} do mapa`;
  }

  if (pos.right) {
    const rightPct = Number.parseFloat(pos.right);
    const horizontal =
      rightPct <= 35 ? "à direita" : rightPct >= 65 ? "à esquerda" : "no centro";
    return `${vertical}, ${horizontal} do mapa`;
  }

  return `${vertical} do mapa`;
}

/**
 * Gera descrição textual acessível com a posição da(s) estante(s) no mapa da sala.
 */
export function getShelfDirectionText(roomId: RoomId, shelves: string[]): string {
  const room = ROOM_CONFIG[roomId];
  const shelfLabel = shelves.length > 1 ? `Estantes ${shelves.join(" e ")}` : `Estante ${shelves[0]}`;
  const firstPos = room.shelfMarkers[shelves[0]];

  if (!firstPos) {
    return `${room.label} (${room.areaLabel}), ${shelfLabel}.`;
  }

  return `${room.label} (${room.areaLabel}): ${shelfLabel} localizada ${describeMapPosition(firstPos)}.`;
}

/** Resolve um slug de rota (ex: "sala1") para o RoomId correspondente. */
export function getRoomIdBySlug(slug: string | undefined): RoomId | null {
  if (!slug) return null;
  const entry = Object.values(ROOM_CONFIG).find((room) => room.slug === slug);
  return entry ? entry.id : null;
}
