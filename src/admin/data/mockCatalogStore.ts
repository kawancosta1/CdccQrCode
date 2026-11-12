import type {
  AdminCatalogApi,
  BookInput,
  CatalogExportPayload,
  RoomInput,
  SectorInput,
  ShelfInput,
} from "../api/contracts.ts";
import { PermissionService } from "../services/permissionService.ts";
import type {
  AdminDashboardSummary,
  Administrator,
  AuditAction,
  AuditLog,
  Book,
  Room,
  Sector,
  Shelf,
} from "../types/admin.ts";

export class DomainValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainValidationError";
  }
}

function createStableId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createInitialRooms(): Room[] {
  return [
    {
      id: "room-1",
      slug: "sala1",
      name: "Sala 1",
      description: "Ciências Exatas, Naturais, Artes, História e Literatura (469–930)",
    },
    {
      id: "room-2",
      slug: "sala2",
      name: "Sala 2",
      description: "Acervo Geral, Filosofia, Educação, Ciências e Referência (001–469, R)",
    },
    {
      id: "room-3",
      slug: "sala3",
      name: "Sala 3",
      description: "Espaço Lúdico e Literatura Brasileira (809.89282 A–Z)",
    },
  ];
}

function createInitialSectors(): Sector[] {
  return [
    {
      id: "sector-geral",
      name: "Generalidades e Referência",
      codeRange: "001–099 / R",
      description: "Obras de referência, informática e biblioteconomia.",
    },
    {
      id: "sector-humanas",
      name: "Ciências Humanas e Educação",
      codeRange: "100–399",
      description: "Filosofia, psicologia, ciências sociais e educação.",
    },
    {
      id: "sector-ciencias",
      name: "Ciências Exatas e Naturais",
      codeRange: "500–699",
      description: "Matemática, física, química, biologia e tecnologia.",
    },
    {
      id: "sector-artes-historia",
      name: "Artes e História",
      codeRange: "700–799 / 900–999",
      description: "Artes visuais, música, geografia e história.",
    },
    {
      id: "sector-literatura",
      name: "Literatura e Línguas",
      codeRange: "400–499 / 800–899",
      description: "Literatura brasileira, estrangeira e linguística.",
    },
  ];
}

function createInitialShelves(): Shelf[] {
  const shelves: Shelf[] = [];

  for (let n = 1; n <= 25; n++) {
    const sectorId =
      n <= 13 ? "sector-literatura" : n <= 20 ? "sector-ciencias" : "sector-artes-historia";
    shelves.push({
      id: `shelf-1-${n}`,
      code: String(n),
      label: `Estante ${n}`,
      roomId: "room-1",
      sectorId,
      classificationRange: n <= 13 ? "714.5–899" : n <= 20 ? "469–610" : "611–930",
    });
  }

  for (let n = 1; n <= 12; n++) {
    const sectorId = n <= 2 ? "sector-geral" : n <= 5 ? "sector-humanas" : "sector-ciencias";
    shelves.push({
      id: `shelf-2-${n}`,
      code: String(n),
      label: `Estante ${n}`,
      roomId: "room-2",
      sectorId,
      classificationRange: n <= 2 ? "001–170 / R" : n <= 5 ? "200–375" : "378–599",
    });
  }

  for (let n = 1; n <= 5; n++) {
    shelves.push({
      id: `shelf-3-${n}`,
      code: String(n),
      label: `Estante ${n}`,
      roomId: "room-3",
      sectorId: "sector-literatura",
      classificationRange: "809.89282 A–Z",
    });
  }

  return shelves;
}

function createInitialDemoBooks(): Book[] {
  const now = new Date().toISOString();
  return [
    {
      id: "book-demo-1",
      title: "Curso de Física Básica: Mecânica (Demonstração)",
      author: "H. Moysés Nussenzveig",
      dedalusCode: "530",
      tombo: "CDCC-DEMO-001",
      roomId: "room-1",
      shelfId: "shelf-1-17",
      sectorId: "sector-ciencias",
      isDemoData: true,
      updatedAt: now,
    },
    {
      id: "book-demo-2",
      title: "Dom Casmurro (Demonstração)",
      author: "Machado de Assis",
      dedalusCode: "869.3 C500",
      tombo: "CDCC-DEMO-002",
      roomId: "room-1",
      shelfId: "shelf-1-5",
      sectorId: "sector-literatura",
      isDemoData: true,
      updatedAt: now,
    },
    {
      id: "book-demo-3",
      title: "Contos Brasileiros (Demonstração)",
      author: "Vários Autores",
      dedalusCode: "809.89282 A",
      tombo: "CDCC-DEMO-003",
      roomId: "room-3",
      shelfId: "shelf-3-1",
      sectorId: "sector-literatura",
      isDemoData: true,
      updatedAt: now,
    },
    {
      id: "book-demo-4",
      title: "Dicionário de Ciências (Demonstração)",
      author: "Obra de Referência",
      dedalusCode: "R",
      tombo: "CDCC-DEMO-004",
      roomId: "room-2",
      shelfId: "shelf-2-1",
      sectorId: "sector-geral",
      isDemoData: true,
      updatedAt: now,
    },
  ];
}

function createInitialDemoAuditLogs(): AuditLog[] {
  return [
    {
      id: "audit-demo-1",
      actorUsername: "admin",
      actorRole: "super_admin",
      action: "book.create",
      entityType: "book",
      entityId: "book-demo-1",
      entityLabel: "Curso de Física Básica (530)",
      details: "Registro inicial de demonstração carregado no ambiente de desenvolvimento.",
      createdAt: new Date(Date.now() - 3600_000).toISOString(),
      isSimulated: true,
    },
  ];
}

export function createMockAdminCatalogApi(): AdminCatalogApi {
  let rooms = createInitialRooms();
  let sectors = createInitialSectors();
  let shelves = createInitialShelves();
  let books = createInitialDemoBooks();
  let auditLogs = createInitialDemoAuditLogs();

  function recordAudit(
    actor: Administrator,
    action: AuditAction,
    entityType: AuditLog["entityType"],
    entityId: string,
    entityLabel: string,
    details: string,
  ): void {
    auditLogs = [
      {
        id: createStableId("audit"),
        actorUsername: actor.username,
        actorRole: actor.role,
        action,
        entityType,
        entityId,
        entityLabel,
        details,
        createdAt: new Date().toISOString(),
        isSimulated: true,
      },
      ...auditLogs,
    ];
  }

  function validateBookRelations(input: BookInput): { room: Room; shelf: Shelf; sector: Sector } {
    if (!input || typeof input !== "object") {
      throw new DomainValidationError("Registro de livro inválido.");
    }
    if (typeof input.title !== "string" || !input.title.trim()) {
      throw new DomainValidationError("Informe o título do livro.");
    }
    if (typeof input.author !== "string" || !input.author.trim()) {
      throw new DomainValidationError("Informe o autor do livro.");
    }
    if (typeof input.dedalusCode !== "string" || !input.dedalusCode.trim()) {
      throw new DomainValidationError("Informe o código de classificação Dedalus.");
    }

    const room = rooms.find((r) => r.id === input.roomId);
    if (!room) throw new DomainValidationError("Sala selecionada não existe.");

    const shelf = shelves.find((s) => s.id === input.shelfId);
    if (!shelf) throw new DomainValidationError("Estante selecionada não existe.");
    if (shelf.roomId !== room.id) {
      throw new DomainValidationError("A estante selecionada não pertence à sala informada.");
    }

    const sector = sectors.find((sec) => sec.id === input.sectorId);
    if (!sector) throw new DomainValidationError("Setor selecionado não existe.");

    return { room, shelf, sector };
  }

  return {
    async getDashboardSummary(): Promise<AdminDashboardSummary> {
      return {
        booksCount: books.length,
        shelvesCount: shelves.length,
        roomsCount: rooms.length,
        sectorsCount: sectors.length,
        isDemoCatalog: true,
      };
    },

    async listBooks(): Promise<Book[]> {
      return [...books];
    },

    async createBook(input: BookInput, actor: Administrator): Promise<Book> {
      PermissionService.assertPermission(actor.role, "books.create");
      const { room, shelf } = validateBookRelations(input);

      const created: Book = {
        id: createStableId("book"),
        title: input.title.trim(),
        author: input.author.trim(),
        dedalusCode: input.dedalusCode.trim(),
        tombo: input.tombo?.trim() || undefined,
        roomId: input.roomId,
        shelfId: input.shelfId,
        sectorId: input.sectorId,
        isDemoData: true,
        updatedAt: new Date().toISOString(),
      };

      books = [created, ...books];
      recordAudit(
        actor,
        "book.create",
        "book",
        created.id,
        `${created.title} (${created.dedalusCode})`,
        `Cadastrado em ${room.name} • ${shelf.label}.`,
      );
      return created;
    },

    async updateBook(id: string, input: BookInput, actor: Administrator): Promise<Book> {
      PermissionService.assertPermission(actor.role, "books.update");
      const existing = books.find((b) => b.id === id);
      if (!existing) throw new DomainValidationError("Livro não encontrado.");

      const { room, shelf } = validateBookRelations(input);
      const updated: Book = {
        ...existing,
        title: input.title.trim(),
        author: input.author.trim(),
        dedalusCode: input.dedalusCode.trim(),
        tombo: input.tombo?.trim() || undefined,
        roomId: input.roomId,
        shelfId: input.shelfId,
        sectorId: input.sectorId,
        updatedAt: new Date().toISOString(),
      };

      books = books.map((b) => (b.id === id ? updated : b));
      recordAudit(
        actor,
        "book.update",
        "book",
        updated.id,
        `${updated.title} (${updated.dedalusCode})`,
        `Atualizado para ${room.name} • ${shelf.label}.`,
      );
      return updated;
    },

    async moveBook(id: string, targetShelfId: string, actor: Administrator): Promise<Book> {
      PermissionService.assertPermission(actor.role, "catalog.manage");
      const existing = books.find((b) => b.id === id);
      if (!existing) throw new DomainValidationError("Livro não encontrado.");

      const targetShelf = shelves.find((s) => s.id === targetShelfId);
      if (!targetShelf) throw new DomainValidationError("Estante de destino não existe.");

      const targetRoom = rooms.find((r) => r.id === targetShelf.roomId);
      const updated: Book = {
        ...existing,
        roomId: targetShelf.roomId,
        shelfId: targetShelf.id,
        sectorId: targetShelf.sectorId,
        updatedAt: new Date().toISOString(),
      };

      books = books.map((b) => (b.id === id ? updated : b));
      recordAudit(
        actor,
        "book.move",
        "book",
        updated.id,
        `${updated.title} (${updated.dedalusCode})`,
        `Movido para ${targetRoom?.name ?? targetShelf.roomId} • ${targetShelf.label}.`,
      );
      return updated;
    },

    async deleteBook(id: string, actor: Administrator): Promise<void> {
      PermissionService.assertPermission(actor.role, "books.delete");
      const existing = books.find((b) => b.id === id);
      if (!existing) throw new DomainValidationError("Livro não encontrado.");

      books = books.filter((b) => b.id !== id);
      recordAudit(
        actor,
        "book.delete",
        "book",
        existing.id,
        `${existing.title} (${existing.dedalusCode})`,
        "Livro removido do catálogo de demonstração.",
      );
    },

    async listShelves(): Promise<Shelf[]> {
      return [...shelves];
    },

    async createShelf(input: ShelfInput, actor: Administrator): Promise<Shelf> {
      PermissionService.assertPermission(actor.role, "shelves.create");
      if (!input.code.trim()) throw new DomainValidationError("Informe o número/código da estante.");
      if (!input.label.trim()) throw new DomainValidationError("Informe o rótulo da estante.");

      const room = rooms.find((r) => r.id === input.roomId);
      if (!room) throw new DomainValidationError("Sala selecionada não existe.");
      const sector = sectors.find((s) => s.id === input.sectorId);
      if (!sector) throw new DomainValidationError("Setor selecionado não existe.");

      const duplicate = shelves.some(
        (s) => s.roomId === input.roomId && s.code.toUpperCase() === input.code.trim().toUpperCase(),
      );
      if (duplicate) {
        throw new DomainValidationError(
          `Já existe uma estante com código "${input.code.trim()}" na ${room.name}.`,
        );
      }

      const created: Shelf = {
        id: createStableId("shelf"),
        code: input.code.trim(),
        label: input.label.trim(),
        roomId: input.roomId,
        sectorId: input.sectorId,
        classificationRange: input.classificationRange.trim() || "A definir",
      };

      shelves = [...shelves, created];
      recordAudit(
        actor,
        "shelf.create",
        "shelf",
        created.id,
        `${room.name} • ${created.label}`,
        `Setor: ${sector.name} | Faixa: ${created.classificationRange}`,
      );
      return created;
    },

    async updateShelf(id: string, input: ShelfInput, actor: Administrator): Promise<Shelf> {
      PermissionService.assertPermission(actor.role, "shelves.update");
      const existing = shelves.find((s) => s.id === id);
      if (!existing) throw new DomainValidationError("Estante não encontrada.");
      if (!input.code.trim()) throw new DomainValidationError("Informe o número/código da estante.");
      if (!input.label.trim()) throw new DomainValidationError("Informe o rótulo da estante.");

      const room = rooms.find((r) => r.id === input.roomId);
      if (!room) throw new DomainValidationError("Sala selecionada não existe.");
      const sector = sectors.find((s) => s.id === input.sectorId);
      if (!sector) throw new DomainValidationError("Setor selecionado não existe.");

      const duplicate = shelves.some(
        (s) =>
          s.id !== id &&
          s.roomId === input.roomId &&
          s.code.toUpperCase() === input.code.trim().toUpperCase(),
      );
      if (duplicate) {
        throw new DomainValidationError(
          `Já existe uma estante com código "${input.code.trim()}" na ${room.name}.`,
        );
      }

      const updated: Shelf = {
        ...existing,
        code: input.code.trim(),
        label: input.label.trim(),
        roomId: input.roomId,
        sectorId: input.sectorId,
        classificationRange: input.classificationRange.trim() || "A definir",
      };

      shelves = shelves.map((s) => (s.id === id ? updated : s));
      if (existing.roomId !== updated.roomId || existing.sectorId !== updated.sectorId) {
        books = books.map((b) =>
          b.shelfId === id
            ? { ...b, roomId: updated.roomId, sectorId: updated.sectorId }
            : b,
        );
      }

      recordAudit(
        actor,
        "shelf.update",
        "shelf",
        updated.id,
        `${room.name} • ${updated.label}`,
        `Atualizada para setor ${sector.name} (${updated.classificationRange}).`,
      );
      return updated;
    },

    async deleteShelf(id: string, actor: Administrator): Promise<void> {
      PermissionService.assertPermission(actor.role, "shelves.delete");
      const existing = shelves.find((s) => s.id === id);
      if (!existing) throw new DomainValidationError("Estante não encontrada.");

      const linkedBooksCount = books.filter((b) => b.shelfId === id).length;
      if (linkedBooksCount > 0) {
        throw new DomainValidationError(
          `Não é possível excluir ${existing.label}: existem ${linkedBooksCount} livro(s) associado(s). Mova ou remova os livros antes.`,
        );
      }

      shelves = shelves.filter((s) => s.id !== id);
      recordAudit(
        actor,
        "shelf.delete",
        "shelf",
        existing.id,
        existing.label,
        "Estante excluída após verificação de ausência de livros.",
      );
    },

    async listRooms(): Promise<Room[]> {
      return [...rooms];
    },

    async createRoom(input: RoomInput, actor: Administrator): Promise<Room> {
      PermissionService.assertPermission(actor.role, "rooms.create");
      if (!input.name.trim()) throw new DomainValidationError("Informe o nome da sala.");
      const slug = input.slug.trim().toLowerCase();
      if (!slug) throw new DomainValidationError("Informe o slug da sala (ex: sala4).");
      if (rooms.some((r) => r.slug === slug)) {
        throw new DomainValidationError(`Já existe uma sala com slug "${slug}".`);
      }

      const created: Room = {
        id: createStableId("room"),
        slug,
        name: input.name.trim(),
        description: input.description.trim(),
      };
      rooms = [...rooms, created];
      recordAudit(actor, "room.create", "room", created.id, created.name, created.description);
      return created;
    },

    async updateRoom(id: string, input: RoomInput, actor: Administrator): Promise<Room> {
      PermissionService.assertPermission(actor.role, "rooms.update");
      const existing = rooms.find((r) => r.id === id);
      if (!existing) throw new DomainValidationError("Sala não encontrada.");
      if (!input.name.trim()) throw new DomainValidationError("Informe o nome da sala.");
      const nextSlug = input.slug.trim().toLowerCase() || existing.slug;
      if (rooms.some((r) => r.id !== id && r.slug === nextSlug)) {
        throw new DomainValidationError(`Já existe uma sala com slug "${nextSlug}".`);
      }

      const updated: Room = {
        ...existing,
        slug: nextSlug,
        name: input.name.trim(),
        description: input.description.trim(),
      };
      rooms = rooms.map((r) => (r.id === id ? updated : r));
      recordAudit(actor, "room.update", "room", updated.id, updated.name, updated.description);
      return updated;
    },

    async deleteRoom(id: string, actor: Administrator): Promise<void> {
      PermissionService.assertPermission(actor.role, "rooms.delete");
      const existing = rooms.find((r) => r.id === id);
      if (!existing) throw new DomainValidationError("Sala não encontrada.");

      const linkedShelves = shelves.filter((s) => s.roomId === id).length;
      if (linkedShelves > 0) {
        throw new DomainValidationError(
          `Não é possível excluir ${existing.name}: existem ${linkedShelves} estante(s) vinculada(s).`,
        );
      }

      rooms = rooms.filter((r) => r.id !== id);
      recordAudit(actor, "room.delete", "room", existing.id, existing.name, "Sala removida.");
    },

    async listSectors(): Promise<Sector[]> {
      return [...sectors];
    },

    async createSector(input: SectorInput, actor: Administrator): Promise<Sector> {
      PermissionService.assertPermission(actor.role, "sectors.manage");
      const name = input.name.trim();
      if (!name) throw new DomainValidationError("Informe o nome do setor.");
      if (sectors.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
        throw new DomainValidationError(`Já existe um setor com o nome "${name}".`);
      }

      const created: Sector = {
        id: createStableId("sector"),
        name,
        codeRange: input.codeRange.trim() || "Geral",
        description: input.description.trim(),
      };
      sectors = [...sectors, created];
      recordAudit(actor, "sector.create", "sector", created.id, created.name, created.codeRange);
      return created;
    },

    async updateSector(id: string, input: SectorInput, actor: Administrator): Promise<Sector> {
      PermissionService.assertPermission(actor.role, "sectors.manage");
      const existing = sectors.find((s) => s.id === id);
      if (!existing) throw new DomainValidationError("Setor não encontrado.");
      const name = input.name.trim();
      if (!name) throw new DomainValidationError("Informe o nome do setor.");
      if (sectors.some((s) => s.id !== id && s.name.toLowerCase() === name.toLowerCase())) {
        throw new DomainValidationError(`Já existe um setor com o nome "${name}".`);
      }

      const updated: Sector = {
        ...existing,
        name,
        codeRange: input.codeRange.trim() || existing.codeRange,
        description: input.description.trim(),
      };
      sectors = sectors.map((s) => (s.id === id ? updated : s));
      recordAudit(actor, "sector.update", "sector", updated.id, updated.name, updated.codeRange);
      return updated;
    },

    async deleteSector(id: string, actor: Administrator): Promise<void> {
      PermissionService.assertPermission(actor.role, "sectors.manage");
      const existing = sectors.find((s) => s.id === id);
      if (!existing) throw new DomainValidationError("Setor não encontrado.");

      const linkedShelves = shelves.filter((s) => s.sectorId === id).length;
      if (linkedShelves > 0) {
        throw new DomainValidationError(
          `Não é possível excluir o setor "${existing.name}": existem ${linkedShelves} estante(s) associada(s).`,
        );
      }

      sectors = sectors.filter((s) => s.id !== id);
      recordAudit(actor, "sector.delete", "sector", existing.id, existing.name, "Setor removido.");
    },

    async listAuditLogs(): Promise<AuditLog[]> {
      return [...auditLogs];
    },

    async exportCatalog(actor: Administrator): Promise<CatalogExportPayload> {
      PermissionService.assertPermission(actor.role, "catalog.export");
      recordAudit(
        actor,
        "catalog.export",
        "catalog",
        "catalog-snapshot",
        "Exportação do acervo",
        `Exportados ${books.length} livros, ${shelves.length} estantes e ${rooms.length} salas.`,
      );
      return {
        exportedAt: new Date().toISOString(),
        isDemoData: true,
        rooms: [...rooms],
        sectors: [...sectors],
        shelves: [...shelves],
        books: [...books],
      };
    },

    async importBooksBatch(inputs: BookInput[], actor: Administrator): Promise<{ imported: number }> {
      PermissionService.assertPermission(actor.role, "catalog.import");
      if (!Array.isArray(inputs) || inputs.length === 0) {
        throw new DomainValidationError("Informe ao menos um livro válido para importação.");
      }
      let imported = 0;
      for (const item of inputs) {
        validateBookRelations(item);
      }
      for (const item of inputs) {
        const created: Book = {
          id: createStableId("book"),
          title: item.title.trim(),
          author: item.author.trim(),
          dedalusCode: item.dedalusCode.trim(),
          tombo: item.tombo?.trim() || undefined,
          roomId: item.roomId,
          shelfId: item.shelfId,
          sectorId: item.sectorId,
          isDemoData: true,
          updatedAt: new Date().toISOString(),
        };
        books = [created, ...books];
        imported++;
      }
      recordAudit(
        actor,
        "catalog.import",
        "catalog",
        "catalog-import",
        "Importação em lote",
        `${imported} registro(s) importado(s) no ambiente de demonstração.`,
      );
      return { imported };
    },
  };
}

export const mockAdminCatalogApi = createMockAdminCatalogApi();
