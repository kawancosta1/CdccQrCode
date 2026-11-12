import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { CarouselService, DEFAULT_CAROUSEL_SLIDES } from "../src/services/carouselService.ts";
import { DEFAULT_GAMES, GamesService, generateSlug } from "../src/services/gamesService.ts";

describe("CarouselService (Fallback & Persistência)", () => {
  beforeEach(async () => {
    await CarouselService.resetToDefaults();
  });

  it("retorna slides padrão quando o banco está vazio ou offline", async () => {
    const slides = await CarouselService.getAll();
    assert.equal(slides.length, DEFAULT_CAROUSEL_SLIDES.length);
    assert.equal(slides[0].titulo, DEFAULT_CAROUSEL_SLIDES[0].titulo);
    assert.equal(slides[0].ordem, 1);
  });

  it("retorna apenas slides ativos em getActive()", async () => {
    const all = await CarouselService.getAll();
    const targetId = all[0].id;
    await CarouselService.toggleActive(targetId, false);

    const active = await CarouselService.getActive();
    assert.equal(active.some((s) => s.id === targetId), false);
    assert.equal(active.length, all.length - 1);
  });

  it("cria, atualiza e exclui um slide dinâmico com sucesso", async () => {
    const created = await CarouselService.create({
      titulo: "Novo Acervo de Astronomia",
      eyebrow: "Destaque Científico",
      descricao: "Coleção especial sobre o sistema solar e exploração espacial.",
      linkDestino: "/estantes",
      imagemUrl: "/assets/astronomia.webp",
      ordem: 99,
      ativo: true,
    });

    assert.ok(created.id);
    assert.equal(created.titulo, "Novo Acervo de Astronomia");

    const updated = await CarouselService.update(created.id, {
      titulo: "Novo Acervo de Astrofísica",
    });
    assert.equal(updated.titulo, "Novo Acervo de Astrofísica");

    await CarouselService.delete(created.id);
    const afterDelete = await CarouselService.getAll();
    assert.equal(afterDelete.some((s) => s.id === created.id), false);
  });

  it("reordena slides mantendo integridade sequencial", async () => {
    const all = await CarouselService.getAll();
    const reversedIds = all.map((s) => s.id).reverse();
    await CarouselService.reorder(reversedIds);

    const reordered = await CarouselService.getAll();
    assert.equal(reordered[0].id, reversedIds[0]);
    assert.equal(reordered[0].ordem, 1);
  });
});

describe("GamesService (Fallback & Persistência)", () => {
  beforeEach(async () => {
    await GamesService.resetToDefaults();
  });

  it("retorna catálogo de jogos padrão e regras completas", async () => {
    const games = await GamesService.getAll();
    assert.equal(games.length, DEFAULT_GAMES.length);

    const xadrez = await GamesService.getBySlug("xadrez");
    assert.ok(xadrez);
    assert.equal(xadrez?.nome, "Xadrez");
    assert.ok(Array.isArray(xadrez?.regras) && xadrez?.regras.length > 0);
  });

  it("gera slugs consistentes para URLs a partir do nome", () => {
    assert.equal(generateSlug("Jogo da Vida!"), "jogo-da-vida");
    assert.equal(generateSlug("Catan: Navegadores das Ilhas"), "catan-navegadores-das-ilhas");
    assert.equal(generateSlug("Ação & Reação 2026"), "acao-reacao-2026");
  });

  it("filtra apenas jogos disponíveis para o público", async () => {
    const games = await GamesService.getAll();
    const target = games[0];
    await GamesService.toggleDisponivel(target.id, false);

    const active = await GamesService.getActive();
    assert.equal(active.some((g) => g.id === target.id), false);
  });

  it("permite cadastrar novos jogos com regras e categoria", async () => {
    const created = await GamesService.create({
      nome: "Damas",
      slug: "damas",
      descricao: "Clássico jogo de peças diagonais com captura por salto.",
      capaUrl: "/assets/damas.webp",
      categoria: "Estratégia Clássica",
      ordem: 10,
      disponivel: true,
      jogadores: "2 jogadores",
      objetivo: "Capturar todas as peças adversárias.",
      regras: ["Peças movem na diagonal para frente.", "Dama move em ambas as direções."],
    });

    assert.ok(created.id);
    assert.equal(created.slug, "damas");

    const fetched = await GamesService.getBySlug("damas");
    assert.equal(fetched?.nome, "Damas");
  });
});
