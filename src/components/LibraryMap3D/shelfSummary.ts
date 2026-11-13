import * as THREE from "three";
import type { RoomId } from "../../config/roomConstants";
import {
  imageDatabaseSala1,
  imageDatabaseSala2,
  imageDatabaseSala3,
  type ImageData,
} from "../../data";
import type { Point2D } from "../../domain/roomPathfinding";

export interface SelectedShelfInfo {
  key: string;
  rangeSummary: string;
  codeCount: number;
}

export const WORLD_SPAN = 18;

const ROOM_DATABASES: Record<RoomId, Record<string, ImageData>> = {
  1: imageDatabaseSala1,
  2: imageDatabaseSala2,
  3: imageDatabaseSala3,
};

export function toWorldXZ(pt: Point2D): { x: number; z: number } {
  return {
    x: ((pt.x - 50) / 100) * WORLD_SPAN,
    z: ((pt.y - 50) / 100) * WORLD_SPAN,
  };
}

export function getShelfSummary(roomId: RoomId, shelfKey: string): SelectedShelfInfo {
  const db = ROOM_DATABASES[roomId] ?? {};
  const cleanKey = shelfKey.trim().toUpperCase();
  const codes: string[] = [];

  for (const [code, data] of Object.entries(db)) {
    const match = data.shelf.match(/\d+|R\d*/i);
    const normalized = match ? match[0].toUpperCase() : data.shelf.trim().toUpperCase();
    if (normalized === cleanKey) {
      codes.push(code);
    }
  }

  codes.sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));
  const rangeSummary =
    codes.length === 0
      ? "Acervo geral"
      : codes.length === 1
        ? `CDU ${codes[0]}`
        : `CDU ${codes[0]} – ${codes[codes.length - 1]}`;

  return {
    key: shelfKey,
    rangeSummary,
    codeCount: codes.length,
  };
}

export function createShelfLabelSprite(
  text: string,
  isTarget: boolean,
  bgOverride?: string,
): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 160;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.fillStyle = bgOverride ?? (isTarget ? "#b45309" : "#2c2218");
    ctx.beginPath();
    ctx.roundRect(10, 8, 140, 48, 14);
    ctx.fill();

    ctx.strokeStyle = isTarget ? "#fef3c7" : "#e7decb";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = "#faf7f2";
    ctx.font = "700 24px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 80, 33);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.55, 0.64, 1);
  return sprite;
}
