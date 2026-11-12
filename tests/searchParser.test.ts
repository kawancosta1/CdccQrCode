import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  extractShelves,
  getDefaultRoom,
  normalizeSearchValue,
  parse8693Cutter,
  searchBooksByCode,
  suggestMatchingCodes,
  suggestNearestCodes,
} from "../src/domain/searchParser.ts";
import type { BookCatalogRepository, RoomData, Sala1RangeEntry } from "../src/types/catalog.ts";

function createMockRepository(): BookCatalogRepository {
  const sala1: Record<string, Sala1RangeEntry> = {
    "500": { images: ["s1-500.png"], shelf: "Estante 15 / Estante 16", range: "469 - 510.07" },
    "809.89283 A": { images: ["s1-809-a.png"], shelf: "Estante 10", range: "809.89283" },
    "869.3 A": {
      images: ["s1-869-a368.png"],
      shelf: "Estante 5",
      range: "869.3 A - 869.3 E",
      codeBase: "869.3",
      cutterPrefixStart: "A",
      cutterNumberStart: 368,
      cutterPrefixEnd: "A",
      cutterNumberEnd: 368,
    },
    "869.3 A524-777": {
      images: ["s1-869-a524.png"],
      shelf: "Estante 5",
      range: "869.3 A - 869.3 E",
      codeBase: "869.3",
      cutterPrefixStart: "A",
      cutterNumberStart: 524,
      cutterPrefixEnd: "A",
      cutterNumberEnd: 777,
    },
    "869.3 C": {
      images: ["s1-869-c-broad.png"],
      shelf: "Estante 5",
      range: "869.3 A - 869.3 E",
      codeBase: "869.3",
      cutterPrefixStart: "C",
      cutterNumberStart: 156,
      cutterPrefixEnd: "C",
      cutterNumberEnd: 972,
    },
    "869.3 C180-C543": {
      images: ["s1-869-c.png"],
      shelf: "Estante 5",
      range: "869.3 A - 869.3 E",
      codeBase: "869.3",
      cutterPrefixStart: "C",
      cutterNumberStart: 180,
      cutterPrefixEnd: "C",
      cutterNumberEnd: 543,
    },
    "869.3 F": {
      images: ["s1-869-f.png"],
      shelf: "Estante 6",
      range: "869.3 F - 869.3 R",
      codeBase: "869.3",
      cutterPrefixStart: "F",
      cutterNumberStart: 0,
      cutterPrefixEnd: "F",
      cutterNumberEnd: 9999,
    },
  };

  const sala2: Record<string, RoomData> = {
    "500": { images: ["s2-500.png"], shelf: "Estante 6", range: "378 - 514" },
    R: {
      images: ["s2-r.png"],
      shelf: "Estante R/ Estante R2/ Estante R3/ Estante R4",
      range: "R",
    },
  };

  const sala3: Record<string, RoomData> = {
    "809.89282 A": { images: ["s3-a.png"], shelf: "Estante 1", range: "809.89282 A - C" },
  };

  const dbByRoom: Record<1 | 2 | 3, Record<string, RoomData>> = {
    1: sala1,
    2: sala2,
    3: sala3,
  };

  return {
    findByRoomAndCode(roomId, code) {
      const db = dbByRoom[roomId];
      if (db[code]) return db[code];
      const upper = code.toUpperCase();
      for (const [k, v] of Object.entries(db)) {
        if (k.toUpperCase() === upper) return v;
      }
      return null;
    },
    getSala1RangeEntries() {
      return Object.values(sala1);
    },
    getRoomCodes(roomId) {
      return Object.keys(dbByRoom[roomId] ?? {});
    },
  };
}

describe("normalizeSearchValue", () => {
  it("normaliza códigos 809.89282 e 809.89283 mantendo apenas a primeira letra do cutter em maiúsculo", () => {
    assert.equal(normalizeSearchValue("809.89282 a123"), "809.89282 A");
    assert.equal(normalizeSearchValue("  809.89283   b456  "), "809.89283 B");
  });

  it("normaliza códigos 869.3 com letra isolada em maiúsculo", () => {
    assert.equal(normalizeSearchValue("869.3 f"), "869.3 F");
    assert.equal(normalizeSearchValue("  869.3   p  "), "869.3 P");
  });

  it("reduz códigos iniciados por R ou r para 'R'", () => {
    assert.equal(normalizeSearchValue("R"), "R");
    assert.equal(normalizeSearchValue("R123"), "R");
    assert.equal(normalizeSearchValue("r500 A12"), "R");
  });

  it("remove o complemento após espaço para códigos CDU comuns", () => {
    assert.equal(normalizeSearchValue("500 S586f"), "500");
    assert.equal(normalizeSearchValue("  530.07   A12b  "), "530.07");
  });

  it("retorna string vazia para entradas vazias ou apenas espaços", () => {
    assert.equal(normalizeSearchValue(""), "");
    assert.equal(normalizeSearchValue("   \t\n  "), "");
  });
});

describe("parse8693Cutter", () => {
  it("extrai letra e número de cutters 869.3 válidos", () => {
    assert.deepEqual(parse8693Cutter("869.3 C500"), { letter: "C", number: 500 });
    assert.deepEqual(parse8693Cutter("  869.3   a368 "), { letter: "A", number: 368 });
  });

  it("retorna null para entradas sem cutter completo ou inválidas", () => {
    assert.equal(parse8693Cutter("869.3"), null);
    assert.equal(parse8693Cutter("869.3 F"), null);
    assert.equal(parse8693Cutter("869.3 123"), null);
    assert.equal(parse8693Cutter("869.3 Cabc"), null);
    assert.equal(parse8693Cutter("530 C500"), null);
  });
});

describe("searchBooksByCode", () => {
  const repo = createMockRepository();

  it("retorna objeto vazio para entrada vazia", () => {
    assert.deepEqual(searchBooksByCode("   ", repo), {});
  });

  it("localiza código presente em múltiplas salas e respeita prioridade visual", () => {
    const results = searchBooksByCode("500 A12", repo);
    assert.ok(results[1]);
    assert.ok(results[2]);
    assert.equal(results[3], undefined);
    assert.equal(getDefaultRoom(results), 2);
  });

  it("localiza 869.3 por faixa de cutter apenas na Sala 1", () => {
    const insideRange = searchBooksByCode("869.3 C300", repo);
    assert.equal(insideRange[1]?.shelf, "Estante 5");
    assert.deepEqual(insideRange[1]?.images, ["s1-869-c.png"]);
    assert.equal(insideRange[2], undefined);
    assert.equal(insideRange[3], undefined);

    const broadFallback = searchBooksByCode("869.3 C600", repo);
    assert.deepEqual(broadFallback[1]?.images, ["s1-869-c-broad.png"]);

    const exactBoundary = searchBooksByCode("869.3 A524", repo);
    assert.equal(exactBoundary[1]?.shelf, "Estante 5");

    const gapBetweenRanges = searchBooksByCode("869.3 A400", repo);
    assert.deepEqual(gapBetweenRanges, {});
  });

  it("retorna null em getDefaultRoom quando não há resultados", () => {
    assert.equal(getDefaultRoom({}), null);
  });

  it("localiza 869.3 com letra única por chave direta", () => {
    const results = searchBooksByCode("869.3 f", repo);
    assert.equal(results[1]?.shelf, "Estante 6");
  });

  it("localiza livros da Sala 3 e dá prioridade 3 -> 2 -> 1", () => {
    const results = searchBooksByCode("809.89282 a99", repo);
    assert.equal(getDefaultRoom(results), 3);
    assert.equal(results[3]?.shelf, "Estante 1");
  });

  it("localiza estante R mesmo com entrada minúscula", () => {
    const results = searchBooksByCode("r123", repo);
    assert.equal(getDefaultRoom(results), 2);
    assert.equal(results[2]?.range, "R");
  });
});

describe("extractShelves", () => {
  it("extrai uma ou múltiplas estantes em maiúsculo", () => {
    assert.deepEqual(
      extractShelves({ images: [], shelf: "Estante 15 / Estante 16", range: "" }),
      ["15", "16"],
    );
    assert.deepEqual(
      extractShelves({
        images: [],
        shelf: "Estante R/ Estante R2/ Estante R3/ Estante R4",
        range: "",
      }),
      ["R", "R2", "R3", "R4"],
    );
  });

  it("retorna ['1'] como fallback quando não há estante válida", () => {
    assert.deepEqual(extractShelves(null), ["1"]);
    assert.deepEqual(extractShelves({ images: [], shelf: "Sem info", range: "" }), ["1"]);
  });
});

describe("suggestMatchingCodes e suggestNearestCodes", () => {
  const repo = createMockRepository();

  it("sugere códigos compatíveis priorizando correspondência por prefixo", () => {
    assert.deepEqual(suggestMatchingCodes("869", repo, 3), [
      "869.3 A",
      "869.3 A524-777",
      "869.3 C",
    ]);
    assert.deepEqual(suggestMatchingCodes("   ", repo), []);
  });

  it("sugere códigos numericamente próximos quando a busca exata falha", () => {
    const nearest = suggestNearestCodes("505", repo, 2);
    assert.ok(nearest.includes("500"));
  });
});
