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
    areaLabel: "Acervo Geral e Referência (001–469, R)",
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
