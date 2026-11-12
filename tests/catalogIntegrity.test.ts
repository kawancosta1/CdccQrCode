import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { ROOM_IDS, ROOM_PRIORITY } from "../src/config/roomConstants.ts";

const SRC_ROOT = path.resolve(import.meta.dirname, "../src");

function walkSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkSourceFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

describe("Configuração de salas e integridade de ativos", () => {
  it("mantém ROOM_IDS e ROOM_PRIORITY consistentes com as 3 salas", () => {
    assert.deepEqual([...ROOM_IDS].sort((a, b) => a - b), [1, 2, 3]);
    assert.deepEqual([...ROOM_PRIORITY].sort((a, b) => a - b), [1, 2, 3]);
    assert.deepEqual(ROOM_PRIORITY, [3, 2, 1]);
  });

  it("não possui imports legados de .png/.jpg/.jpeg em src/ e todos os .webp existem", () => {
    const codeFiles = walkSourceFiles(SRC_ROOT);
    const legacyImports: string[] = [];
    const missingWebp: string[] = [];

    for (const filePath of codeFiles) {
      const content = fs.readFileSync(filePath, "utf8");
      const importRegex = /from\s+["']([^"']+\.(?:png|jpg|jpeg|webp))["']/gi;

      for (const match of content.matchAll(importRegex)) {
        const relImport = match[1];
        if (/\.(png|jpg|jpeg)$/i.test(relImport)) {
          legacyImports.push(`${path.relative(SRC_ROOT, filePath)} -> ${relImport}`);
          continue;
        }

        const resolved = path.resolve(path.dirname(filePath), relImport);
        if (!fs.existsSync(resolved)) {
          missingWebp.push(`${path.relative(SRC_ROOT, filePath)} -> ${relImport}`);
        }
      }
    }

    assert.deepEqual(legacyImports, []);
    assert.deepEqual(missingWebp, []);
  });
});
