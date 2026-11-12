import type { AdminRole, Permission } from "../types/admin.ts";

export class AuthorizationError extends Error {
  readonly permission: Permission;

  constructor(permission: Permission, message?: string) {
    super(message ?? `Permissão insuficiente para executar esta ação (${permission}).`);
    this.name = "AuthorizationError";
    this.permission = permission;
  }
}

export interface RoleMetadata {
  role: AdminRole;
  label: string;
  shortLabel: string;
  description: string;
}

export const ADMIN_ROLES: readonly AdminRole[] = ["super_admin", "level_1", "level_2", "level_3"];

export const ROLE_METADATA: Record<AdminRole, RoleMetadata> = {
  super_admin: {
    role: "super_admin",
    label: "Super Admin",
    shortLabel: "Super Admin",
    description: "Controle administrativo total, auditoria e configurações do sistema.",
  },
  level_1: {
    role: "level_1",
    label: "Nível 1 — Operador",
    shortLabel: "Nível 1",
    description: "Consulta somente leitura de livros, classificações, salas e estantes.",
  },
  level_2: {
    role: "level_2",
    label: "Nível 2 — Adm. de Conteúdo",
    shortLabel: "Nível 2",
    description: "Cadastro e edição de livros e classificações; consulta salas e estantes.",
  },
  level_3: {
    role: "level_3",
    label: "Nível 3 — Adm. do Acervo",
    shortLabel: "Nível 3",
    description: "Gestão completa de livros, estantes, salas, setores e importação/exportação.",
  },
};

export const ROLE_PERMISSIONS: Record<AdminRole, readonly Permission[]> = {
  super_admin: [
    "books.read",
    "books.create",
    "books.update",
    "books.delete",
    "shelves.read",
    "shelves.create",
    "shelves.update",
    "shelves.delete",
    "rooms.read",
    "rooms.create",
    "rooms.update",
    "rooms.delete",
    "sectors.manage",
    "catalog.import",
    "catalog.export",
    "catalog.manage",
    "carousel.manage",
    "games.manage",
    "pages.manage",
    "appearance.manage",
    "qrcodes.manage",
    "mapping.manage",
    "users.manage",
    "audit.read",
    "settings.manage",
  ],
  level_1: ["books.read", "shelves.read", "rooms.read", "qrcodes.manage"],
  level_2: [
    "books.read",
    "books.create",
    "books.update",
    "shelves.read",
    "rooms.read",
    "carousel.manage",
    "games.manage",
    "pages.manage",
    "qrcodes.manage",
  ],
  level_3: [
    "books.read",
    "books.create",
    "books.update",
    "books.delete",
    "shelves.read",
    "shelves.create",
    "shelves.update",
    "shelves.delete",
    "rooms.read",
    "rooms.create",
    "rooms.update",
    "rooms.delete",
    "sectors.manage",
    "catalog.import",
    "catalog.export",
    "catalog.manage",
    "carousel.manage",
    "games.manage",
  ],
};

export const PermissionService = {
  getRolePermissions(role: AdminRole): readonly Permission[] {
    return ROLE_PERMISSIONS[role];
  },

  hasPermission(role: AdminRole, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role].includes(permission);
  },

  hasAnyPermission(role: AdminRole, permissions: readonly Permission[]): boolean {
    return permissions.some((permission) => this.hasPermission(role, permission));
  },

  assertPermission(role: AdminRole, permission: Permission): void {
    if (!this.hasPermission(role, permission)) {
      throw new AuthorizationError(permission);
    }
  },
};
