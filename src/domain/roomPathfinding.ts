import type { RoomId } from "../config/roomConstants.ts";

export interface Point2D {
  x: number;
  y: number;
}

export interface ShelfObstacle extends Point2D {
  widthPct?: number;
  depthPct?: number;
}

export interface TargetApproachOptions {
  widthPct?: number;
  depthPct?: number;
  facing?: "south" | "north" | "east" | "west";
}

export interface ShelfPositionInput {
  top: string;
  left?: string;
  right?: string;
}

export const ROOM_ENTRANCE_POINT: Record<RoomId, Point2D & { label: string }> = {
  1: { x: 85, y: 92, label: "Porta (canto inf. dir.)" },
  2: { x: 12, y: 92, label: "Porta (← Sala 1)" },
  3: { x: 50, y: 90, label: "Entrada" },
};

const GRID_SIZE = 40; // 40x40 => cada célula cobre 2.5% x 2.5% do mapa (0..100)
const CELL_STEP = 100 / GRID_SIZE;

function parsePercent(value?: string): number | null {
  if (!value) return null;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

export function resolveShelfPercentPoint(pos: ShelfPositionInput): Point2D | null {
  const y = parsePercent(pos.top);
  if (y === null) return null;
  const left = parsePercent(pos.left);
  if (left !== null) return { x: clampPercent(left), y: clampPercent(y) };
  const right = parsePercent(pos.right);
  if (right !== null) return { x: clampPercent(100 - right), y: clampPercent(y) };
  return null;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function toGridIndex(percent: number): number {
  return Math.max(0, Math.min(GRID_SIZE - 1, Math.floor((clampPercent(percent) / 100) * GRID_SIZE)));
}

function toPercentCenter(gridIndex: number): number {
  return Number(((gridIndex + 0.5) * CELL_STEP).toFixed(2));
}

interface AStarNode {
  gx: number;
  gy: number;
  dirIdx: number; // -1 inicial, 0..3 direções ortogonais
  g: number;
  f: number;
  parent: AStarNode | null;
}

const DIRS: ReadonlyArray<readonly [number, number]> = [
  [0, -1], // cima
  [1, 0],  // direita
  [0, 1],  // baixo
  [-1, 0], // esquerda
];

function resolveApproachAndEdge(
  target: Point2D,
  options?: TargetApproachOptions,
): { astarGoal: Point2D; finalPoint: Point2D; hasFacing: boolean } {
  if (!options?.facing) {
    return { astarGoal: target, finalPoint: target, hasFacing: false };
  }
  const halfW = (options.widthPct ?? 12.5) / 2;
  const halfD = (options.depthPct ?? 7.5) / 2;
  const aisleOffset = 3.2;

  switch (options.facing) {
    case "south":
      return {
        astarGoal: { x: clampPercent(target.x), y: clampPercent(target.y + halfD + aisleOffset) },
        finalPoint: { x: clampPercent(target.x), y: clampPercent(target.y + halfD) },
        hasFacing: true,
      };
    case "north":
      return {
        astarGoal: { x: clampPercent(target.x), y: clampPercent(target.y - halfD - aisleOffset) },
        finalPoint: { x: clampPercent(target.x), y: clampPercent(target.y - halfD) },
        hasFacing: true,
      };
    case "east":
      return {
        astarGoal: { x: clampPercent(target.x + halfW + aisleOffset), y: clampPercent(target.y) },
        finalPoint: { x: clampPercent(target.x + halfW), y: clampPercent(target.y) },
        hasFacing: true,
      };
    case "west":
      return {
        astarGoal: { x: clampPercent(target.x - halfW - aisleOffset), y: clampPercent(target.y) },
        finalPoint: { x: clampPercent(target.x - halfW), y: clampPercent(target.y) },
        hasFacing: true,
      };
  }
}

/**
 * Calcula o menor caminho ortogonal pelos corredores usando A* em grade 40x40,
 * desviando das áreas reais ocupadas pelas estantes e penalizando curvas desnecessárias.
 */
export function findRoomPath(
  entrance: Point2D,
  target: Point2D,
  shelfObstacles: ShelfObstacle[],
  targetOptions?: TargetApproachOptions,
): Point2D[] {
  const { astarGoal, finalPoint, hasFacing } = resolveApproachAndEdge(target, targetOptions);
  const startGx = toGridIndex(entrance.x);
  const startGy = toGridIndex(entrance.y);
  const goalGx = toGridIndex(astarGoal.x);
  const goalGy = toGridIndex(astarGoal.y);

  if (startGx === goalGx && startGy === goalGy) {
    return hasFacing ? simplifyCollinear([entrance, astarGoal, finalPoint]) : [entrance, target];
  }

  const blocked = new Set<string>();
  for (const obs of shelfObstacles) {
    const halfW = (obs.widthPct ?? 12.5) / 2;
    const halfD = (obs.depthPct ?? 7.5) / 2;
    const minGx = toGridIndex(obs.x - halfW + 0.15);
    const maxGx = toGridIndex(obs.x + halfW - 0.15);
    const minGy = toGridIndex(obs.y - halfD + 0.15);
    const maxGy = toGridIndex(obs.y + halfD - 0.15);

    for (let bx = minGx; bx <= maxGx; bx += 1) {
      for (let by = minGy; by <= maxGy; by += 1) {
        if (bx === startGx && by === startGy) continue;
        if (bx === goalGx && by === goalGy) continue;
        if (!hasFacing && Math.abs(bx - goalGx) <= 1 && Math.abs(by - goalGy) <= 1) {
          continue;
        }
        blocked.add(`${bx},${by}`);
      }
    }
  }

  const open: AStarNode[] = [
    {
      gx: startGx,
      gy: startGy,
      dirIdx: -1,
      g: 0,
      f: Math.abs(goalGx - startGx) + Math.abs(goalGy - startGy),
      parent: null,
    },
  ];
  const bestG = new Map<string, number>();
  bestG.set(`${startGx},${startGy},-1`, 0);

  let reached: AStarNode | null = null;

  while (open.length > 0) {
    let bestIdx = 0;
    for (let i = 1; i < open.length; i += 1) {
      if (open[i].f < open[bestIdx].f) {
        bestIdx = i;
      }
    }
    const current = open.splice(bestIdx, 1)[0];

    if (current.gx === goalGx && current.gy === goalGy) {
      reached = current;
      break;
    }

    for (let d = 0; d < DIRS.length; d += 1) {
      const [dx, dy] = DIRS[d];
      const nx = current.gx + dx;
      const ny = current.gy + dy;

      if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) continue;
      if (blocked.has(`${nx},${ny}`)) continue;

      const turnCost = current.dirIdx !== -1 && current.dirIdx !== d ? 0.35 : 0;
      const nextG = current.g + 1 + turnCost;
      const stateKey = `${nx},${ny},${d}`;
      const prevBest = bestG.get(stateKey);

      if (prevBest !== undefined && prevBest <= nextG) continue;

      bestG.set(stateKey, nextG);
      const h = Math.abs(goalGx - nx) + Math.abs(goalGy - ny);
      open.push({
        gx: nx,
        gy: ny,
        dirIdx: d,
        g: nextG,
        f: nextG + h,
        parent: current,
      });
    }
  }

  if (!reached) {
    // Fallback ortogonal seguro caso o destino esteja isolado
    const midY = Number(((entrance.y + target.y) / 2).toFixed(2));
    return simplifyCollinear([
      entrance,
      { x: entrance.x, y: midY },
      { x: target.x, y: midY },
      target,
    ]);
  }

  const gridPoints: Point2D[] = [];
  let cursor: AStarNode | null = reached;
  while (cursor) {
    gridPoints.push({
      x: toPercentCenter(cursor.gx),
      y: toPercentCenter(cursor.gy),
    });
    cursor = cursor.parent;
  }
  gridPoints.reverse();

  // Ajusta extremidades exatas para a entrada e o ponto de acesso/face da estante alvo
  gridPoints[0] = { x: clampPercent(entrance.x), y: clampPercent(entrance.y) };
  gridPoints[gridPoints.length - 1] = {
    x: clampPercent(astarGoal.x),
    y: clampPercent(astarGoal.y),
  };
  if (hasFacing) {
    gridPoints.push({
      x: clampPercent(finalPoint.x),
      y: clampPercent(finalPoint.y),
    });
  }

  return simplifyCollinear(gridPoints);
}

/**
 * Remove pontos intermediários colineares mantendo apenas os vértices de curva.
 */
export function simplifyCollinear(points: Point2D[]): Point2D[] {
  if (points.length <= 2) return points;
  const out: Point2D[] = [points[0]];

  for (let i = 1; i < points.length - 1; i += 1) {
    const prev = out[out.length - 1];
    const curr = points[i];
    const next = points[i + 1];

    const dx1 = Math.sign(curr.x - prev.x);
    const dy1 = Math.sign(curr.y - prev.y);
    const dx2 = Math.sign(next.x - curr.x);
    const dy2 = Math.sign(next.y - curr.y);

    if (dx1 === dx2 && dy1 === dy2) {
      continue;
    }
    out.push(curr);
  }

  out.push(points[points.length - 1]);
  return out;
}

/**
 * Gera pontos com cantos suavizados (chamfer/rounded corners) a partir dos vértices ortogonais,
 * ideal para CatmullRomCurve3 ou SVG sem invadir áreas de estantes.
 */
export function buildSmoothedPathPoints(waypoints: Point2D[], cornerRadius = 2.4): Point2D[] {
  if (waypoints.length <= 2) return waypoints;
  const smoothed: Point2D[] = [waypoints[0]];

  for (let i = 1; i < waypoints.length - 1; i += 1) {
    const prev = waypoints[i - 1];
    const curr = waypoints[i];
    const next = waypoints[i + 1];

    const v1x = prev.x - curr.x;
    const v1y = prev.y - curr.y;
    const len1 = Math.hypot(v1x, v1y);

    const v2x = next.x - curr.x;
    const v2y = next.y - curr.y;
    const len2 = Math.hypot(v2x, v2y);

    if (len1 < 0.5 || len2 < 0.5) {
      smoothed.push(curr);
      continue;
    }

    const r = Math.min(cornerRadius, len1 * 0.38, len2 * 0.38);
    smoothed.push({
      x: Number((curr.x + (v1x / len1) * r).toFixed(2)),
      y: Number((curr.y + (v1y / len1) * r).toFixed(2)),
    });
    smoothed.push({
      x: Number((curr.x + (v2x / len2) * r).toFixed(2)),
      y: Number((curr.y + (v2y / len2) * r).toFixed(2)),
    });
  }

  smoothed.push(waypoints[waypoints.length - 1]);
  return smoothed;
}

/**
 * Converte uma sequência de waypoints em comando SVG `d` com cantos arredondados via `Q`.
 */
export function buildRoundedSvgPath(waypoints: Point2D[], cornerRadius = 2.6): string {
  if (waypoints.length === 0) return "";
  if (waypoints.length === 1) return `M ${waypoints[0].x} ${waypoints[0].y}`;
  if (waypoints.length === 2) {
    return `M ${waypoints[0].x} ${waypoints[0].y} L ${waypoints[1].x} ${waypoints[1].y}`;
  }

  const parts: string[] = [`M ${waypoints[0].x} ${waypoints[0].y}`];

  for (let i = 1; i < waypoints.length - 1; i += 1) {
    const prev = waypoints[i - 1];
    const curr = waypoints[i];
    const next = waypoints[i + 1];

    const v1x = prev.x - curr.x;
    const v1y = prev.y - curr.y;
    const len1 = Math.hypot(v1x, v1y);

    const v2x = next.x - curr.x;
    const v2y = next.y - curr.y;
    const len2 = Math.hypot(v2x, v2y);

    if (len1 < 0.5 || len2 < 0.5) {
      parts.push(`L ${curr.x} ${curr.y}`);
      continue;
    }

    const r = Math.min(cornerRadius, len1 * 0.4, len2 * 0.4);
    const pInX = Number((curr.x + (v1x / len1) * r).toFixed(2));
    const pInY = Number((curr.y + (v1y / len1) * r).toFixed(2));
    const pOutX = Number((curr.x + (v2x / len2) * r).toFixed(2));
    const pOutY = Number((curr.y + (v2y / len2) * r).toFixed(2));

    parts.push(`L ${pInX} ${pInY} Q ${curr.x} ${curr.y} ${pOutX} ${pOutY}`);
  }

  const last = waypoints[waypoints.length - 1];
  parts.push(`L ${last.x} ${last.y}`);
  return parts.join(" ");
}
