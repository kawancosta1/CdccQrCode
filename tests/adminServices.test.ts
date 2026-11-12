import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createMockAdminCatalogApi, DomainValidationError } from "../src/admin/data/mockCatalogStore.ts";
import { createAdminServices } from "../src/admin/services/adminServices.ts";
import { AuthorizationError } from "../src/admin/services/permissionService.ts";
import type { Administrator, AdminRole } from "../src/admin/types/admin.ts";

function makeActor(role: AdminRole): Administrator {
  return {
    id: `test-${role}`,
    username: "admin",
    displayName: "Teste",
    role,
    isSimulated: true,
  };
}

describe("AdminServices + Integridade Referencial", () => {
  it("impede Nível 1 e Nível 2 de excluir livros ou criar estantes", async () => {
    const services = createAdminServices(createMockAdminCatalogApi());
    const level1 = makeActor("level_1");
    const level2 = makeActor("level_2");

    await assert.rejects(
      () => services.BookService.delete("book-demo-1", level1),
      AuthorizationError,
    );
    await assert.rejects(
      () => services.BookService.delete("book-demo-1", level2),
      AuthorizationError,
    );
    await assert.rejects(
      () =>
        services.ShelfService.create(
          {
            code: "99",
            label: "Estante 99",
            roomId: "room-1",
            sectorId: "sector-ciencias",
            classificationRange: "500",
          },
          level2,
        ),
      AuthorizationError,
    );
  });

  it("impede exclusão de estante com livros associados até que sejam movidos", async () => {
    const services = createAdminServices(createMockAdminCatalogApi());
    const level3 = makeActor("level_3");

    // shelf-1-17 possui book-demo-1 inicialmente
    await assert.rejects(
      () => services.ShelfService.delete("shelf-1-17", level3),
      DomainValidationError,
    );

    // Move o livro para shelf-1-18 e tenta excluir novamente
    await services.BookService.move("book-demo-1", "shelf-1-18", level3);
    await services.ShelfService.delete("shelf-1-17", level3);

    const shelves = await services.ShelfService.list(level3);
    assert.equal(
      shelves.some((s) => s.id === "shelf-1-17"),
      false,
    );
  });

  it("bloqueia auditoria para Nível 3 e registra ações para Super Admin", async () => {
    const services = createAdminServices(createMockAdminCatalogApi());
    const level3 = makeActor("level_3");
    const superAdmin = makeActor("super_admin");

    assert.throws(() => services.AuditService.list(level3), AuthorizationError);

    await services.BookService.create(
      {
        title: "Cálculo I",
        author: "Guidorizzi",
        dedalusCode: "515",
        roomId: "room-1",
        shelfId: "shelf-1-15",
        sectorId: "sector-ciencias",
      },
      level3,
    );

    const logs = await services.AuditService.list(superAdmin);
    assert.equal(logs[0]?.action, "book.create");
    assert.equal(logs[0]?.actorRole, "level_3");
  });

  it("valida CRUD de livros, estantes, salas e setores contra duplicidade e vínculos", async () => {
    const services = createAdminServices(createMockAdminCatalogApi());
    const level3 = makeActor("level_3");

    // Estante shelf-2-1 pertence à room-2, não à room-1
    await assert.rejects(
      () =>
        services.BookService.create(
          {
            title: "Livro Inválido",
            author: "Autor",
            dedalusCode: "500",
            roomId: "room-1",
            shelfId: "shelf-2-1",
            sectorId: "sector-ciencias",
          },
          level3,
        ),
      DomainValidationError,
    );

    // Duplicidade de código de estante na atualização
    await assert.rejects(
      () =>
        services.ShelfService.update(
          "shelf-1-2",
          {
            code: "1",
            label: "Estante 1",
            roomId: "room-1",
            sectorId: "sector-literatura",
            classificationRange: "714.5",
          },
          level3,
        ),
      DomainValidationError,
    );

    // Sala com estantes não pode ser excluída; sala vazia pode
    await assert.rejects(() => services.RoomService.delete("room-1", level3), DomainValidationError);
    const createdRoom = await services.RoomService.create(
      { slug: "sala4", name: "Sala 4", description: "Nova sala" },
      level3,
    );
    await assert.rejects(
      () =>
        services.RoomService.update(
          createdRoom.id,
          { slug: "sala1", name: "Sala 4", description: "Conflito de slug" },
          level3,
        ),
      DomainValidationError,
    );
    await services.RoomService.delete(createdRoom.id, level3);

    // Setor duplicado e setor com estantes vinculadas
    await assert.rejects(
      () =>
        services.SectorService.create(
          { name: "Ciências Exatas e Naturais", codeRange: "500", description: "Duplicado" },
          level3,
        ),
      DomainValidationError,
    );
    await assert.rejects(
      () => services.SectorService.delete("sector-ciencias", level3),
      DomainValidationError,
    );
  });

  it("valida importação em lote contra entradas vazias ou malformadas", async () => {
    const services = createAdminServices(createMockAdminCatalogApi());
    const level3 = makeActor("level_3");

    await assert.rejects(
      () => services.CatalogService.importBooksBatch([], level3),
      DomainValidationError,
    );

    await assert.rejects(
      () =>
        services.CatalogService.importBooksBatch(
          [{ title: "Sem autor" } as unknown as Parameters<typeof services.BookService.create>[0]],
          level3,
        ),
      DomainValidationError,
    );

    const result = await services.CatalogService.importBooksBatch(
      [
        {
          title: "Química Geral",
          author: "John C. Kotz",
          dedalusCode: "540 K87q",
          roomId: "room-1",
          shelfId: "shelf-1-17",
          sectorId: "sector-ciencias",
        },
      ],
      level3,
    );
    assert.equal(result.imported, 1);
  });
});
