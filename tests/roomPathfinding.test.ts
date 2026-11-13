import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildRoundedSvgPath,
  buildSmoothedPathPoints,
  findRoomPath,
  resolveShelfPercentPoint,
  simplifyCollinear,
} from "../src/domain/roomPathfinding.ts";

describe("roomPathfinding (A* nos corredores)", () => {
  it("resolveShelfPercentPoint converte top/left e top/right corretamente", () => {
    assert.deepEqual(resolveShelfPercentPoint({ top: "30%", left: "20%" }), { x: 20, y: 30 });
    assert.deepEqual(resolveShelfPercentPoint({ top: "10%", right: "12%" }), { x: 88, y: 10 });
    assert.equal(resolveShelfPercentPoint({ top: "" }), null);
  });

  it("findRoomPath desvia de estantes bloqueadas no caminho direto", () => {
    const entrance = { x: 50, y: 92 };
    const target = { x: 50, y: 20 };
    // Obstáculos bloqueando a coluna central x=50 entre y=40 e y=70
    const obstacles = [
      { x: 50, y: 50 },
      { x: 50, y: 54 },
      { x: 50, y: 58 },
      { x: 46, y: 54 },
    ];

    const path = findRoomPath(entrance, target, obstacles);
    assert.ok(path.length >= 3, "espera rota com desvio pelos corredores");
    assert.deepEqual(path[0], entrance);
    assert.deepEqual(path[path.length - 1], target);

    // Nenhum ponto intermediário deve coincidir com o obstáculo central (50, 54)
    const hitsCenterObstacle = path.slice(1, -1).some((p) => Math.hypot(p.x - 50, p.y - 54) < 3.5);
    assert.equal(hitsCenterObstacle, false);
  });

  it("simplifyCollinear remove pontos redundantes em linha reta", () => {
    const simplified = simplifyCollinear([
      { x: 10, y: 90 },
      { x: 10, y: 70 },
      { x: 10, y: 50 },
      { x: 40, y: 50 },
      { x: 70, y: 50 },
    ]);
    assert.deepEqual(simplified, [
      { x: 10, y: 90 },
      { x: 10, y: 50 },
      { x: 70, y: 50 },
    ]);
  });

  it("buildSmoothedPathPoints e buildRoundedSvgPath suavizam apenas as quinas", () => {
    const corners = [
      { x: 50, y: 90 },
      { x: 50, y: 40 },
      { x: 80, y: 40 },
    ];
    const smoothed = buildSmoothedPathPoints(corners, 2.5);
    assert.equal(smoothed.length, 4);

    const svg = buildRoundedSvgPath(corners, 2.5);
    assert.match(svg, /^M 50 90 L 50 [\d.]+ Q 50 40 [\d.]+ 40 L 80 40$/);
  });
});
