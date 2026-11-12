import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AuthorizationError,
  PermissionService,
  ROLE_PERMISSIONS,
} from "../src/admin/services/permissionService.ts";

describe("PermissionService (RBAC)", () => {
  it("concede todas as permissões apenas ao Super Admin", () => {
    assert.equal(PermissionService.hasPermission("super_admin", "audit.read"), true);
    assert.equal(PermissionService.hasPermission("super_admin", "settings.manage"), true);
    assert.equal(PermissionService.hasPermission("super_admin", "books.delete"), true);
    assert.equal(PermissionService.hasPermission("super_admin", "carousel.manage"), true);
    assert.equal(PermissionService.hasPermission("super_admin", "games.manage"), true);
    assert.equal(PermissionService.hasPermission("super_admin", "pages.manage"), true);
    assert.equal(PermissionService.hasPermission("super_admin", "appearance.manage"), true);
    assert.equal(PermissionService.hasPermission("super_admin", "qrcodes.manage"), true);
    assert.equal(PermissionService.hasPermission("super_admin", "mapping.manage"), true);
    assert.equal(PermissionService.hasPermission("super_admin", "users.manage"), true);
    assert.equal(ROLE_PERMISSIONS.super_admin.length, 25);
  });

  it("restringe Nível 1 (Operador) a operações somente leitura", () => {
    assert.equal(PermissionService.hasPermission("level_1", "books.read"), true);
    assert.equal(PermissionService.hasPermission("level_1", "shelves.read"), true);
    assert.equal(PermissionService.hasPermission("level_1", "rooms.read"), true);

    assert.equal(PermissionService.hasPermission("level_1", "books.create"), false);
    assert.equal(PermissionService.hasPermission("level_1", "books.update"), false);
    assert.equal(PermissionService.hasPermission("level_1", "books.delete"), false);
    assert.equal(PermissionService.hasPermission("level_1", "shelves.create"), false);
    assert.equal(PermissionService.hasPermission("level_1", "carousel.manage"), false);
    assert.equal(PermissionService.hasPermission("level_1", "games.manage"), false);
    assert.equal(PermissionService.hasPermission("level_1", "audit.read"), false);
  });

  it("permite ao Nível 2 criar e editar livros, mas impede exclusão e gestão estrutural", () => {
    assert.equal(PermissionService.hasPermission("level_2", "books.read"), true);
    assert.equal(PermissionService.hasPermission("level_2", "books.create"), true);
    assert.equal(PermissionService.hasPermission("level_2", "books.update"), true);
    assert.equal(PermissionService.hasPermission("level_2", "shelves.read"), true);
    assert.equal(PermissionService.hasPermission("level_2", "carousel.manage"), true);
    assert.equal(PermissionService.hasPermission("level_2", "games.manage"), true);

    assert.equal(PermissionService.hasPermission("level_2", "books.delete"), false);
    assert.equal(PermissionService.hasPermission("level_2", "shelves.create"), false);
    assert.equal(PermissionService.hasPermission("level_2", "rooms.create"), false);
    assert.equal(PermissionService.hasPermission("level_2", "sectors.manage"), false);
    assert.equal(PermissionService.hasPermission("level_2", "audit.read"), false);
  });

  it("permite ao Nível 3 gerenciar todo o acervo, mas bloqueia auditoria e configurações", () => {
    assert.equal(PermissionService.hasPermission("level_3", "books.delete"), true);
    assert.equal(PermissionService.hasPermission("level_3", "shelves.delete"), true);
    assert.equal(PermissionService.hasPermission("level_3", "rooms.delete"), true);
    assert.equal(PermissionService.hasPermission("level_3", "sectors.manage"), true);
    assert.equal(PermissionService.hasPermission("level_3", "catalog.import"), true);
    assert.equal(PermissionService.hasPermission("level_3", "catalog.export"), true);
    assert.equal(PermissionService.hasPermission("level_3", "carousel.manage"), true);
    assert.equal(PermissionService.hasPermission("level_3", "games.manage"), true);

    assert.equal(PermissionService.hasPermission("level_3", "audit.read"), false);
    assert.equal(PermissionService.hasPermission("level_3", "settings.manage"), false);
  });

  it("lança AuthorizationError em assertPermission quando a permissão não existe", () => {
    assert.throws(
      () => PermissionService.assertPermission("level_1", "books.delete"),
      (err) => err instanceof AuthorizationError && err.permission === "books.delete",
    );
  });
});
