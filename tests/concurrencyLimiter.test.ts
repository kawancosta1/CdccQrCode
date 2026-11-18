import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createLimiter } from "../src/utils/concurrencyLimiter.ts";

describe("createLimiter", () => {
  it("nunca excede o limite de tarefas simultâneas e executa todas", async () => {
    const limit = createLimiter(3);
    let active = 0;
    let peak = 0;
    const results = await Promise.all(
      Array.from({ length: 20 }, (_, i) =>
        limit(async () => {
          active += 1;
          peak = Math.max(peak, active);
          await new Promise((r) => setTimeout(r, 5));
          active -= 1;
          return i;
        }),
      ),
    );
    assert.equal(peak, 3);
    assert.deepEqual(results, Array.from({ length: 20 }, (_, i) => i));
  });

  it("continua processando a fila quando uma tarefa falha", async () => {
    const limit = createLimiter(1);
    const failing = limit(async () => {
      throw new Error("falhou");
    });
    const ok = limit(async () => "ok");
    await assert.rejects(failing, /falhou/);
    assert.equal(await ok, "ok");
  });
});
