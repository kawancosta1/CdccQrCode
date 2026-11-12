import type {
  AdminCatalogApi,
  BookInput,
  RoomInput,
  SectorInput,
  ShelfInput,
} from "../api/contracts.ts";
import { mockAdminCatalogApi } from "../data/mockCatalogStore.ts";
import type { Administrator } from "../types/admin.ts";
import { PermissionService } from "./permissionService.ts";

/**
 * Serviços de domínio desacoplados da origem de dados.
 * Para integrar com a API SQL futura, basta substituir `api` por uma implementação REST.
 */
export function createAdminServices(api: AdminCatalogApi) {
  return {
    BookService: {
      list: (actor: Administrator) => {
        PermissionService.assertPermission(actor.role, "books.read");
        return api.listBooks();
      },
      create: (input: BookInput, actor: Administrator) => api.createBook(input, actor),
      update: (id: string, input: BookInput, actor: Administrator) => api.updateBook(id, input, actor),
      move: (id: string, targetShelfId: string, actor: Administrator) =>
        api.moveBook(id, targetShelfId, actor),
      delete: (id: string, actor: Administrator) => api.deleteBook(id, actor),
    },
    ShelfService: {
      list: (actor: Administrator) => {
        PermissionService.assertPermission(actor.role, "shelves.read");
        return api.listShelves();
      },
      create: (input: ShelfInput, actor: Administrator) => api.createShelf(input, actor),
      update: (id: string, input: ShelfInput, actor: Administrator) =>
        api.updateShelf(id, input, actor),
      delete: (id: string, actor: Administrator) => api.deleteShelf(id, actor),
    },
    RoomService: {
      list: (actor: Administrator) => {
        PermissionService.assertPermission(actor.role, "rooms.read");
        return api.listRooms();
      },
      create: (input: RoomInput, actor: Administrator) => api.createRoom(input, actor),
      update: (id: string, input: RoomInput, actor: Administrator) => api.updateRoom(id, input, actor),
      delete: (id: string, actor: Administrator) => api.deleteRoom(id, actor),
    },
    SectorService: {
      list: () => api.listSectors(),
      create: (input: SectorInput, actor: Administrator) => api.createSector(input, actor),
      update: (id: string, input: SectorInput, actor: Administrator) =>
        api.updateSector(id, input, actor),
      delete: (id: string, actor: Administrator) => api.deleteSector(id, actor),
    },
    CatalogService: {
      getDashboardSummary: () => api.getDashboardSummary(),
      exportCatalog: (actor: Administrator) => api.exportCatalog(actor),
      importBooksBatch: (inputs: BookInput[], actor: Administrator) =>
        api.importBooksBatch(inputs, actor),
    },
    AuditService: {
      list: (actor: Administrator) => {
        PermissionService.assertPermission(actor.role, "audit.read");
        return api.listAuditLogs();
      },
    },
  };
}

export const adminServices = createAdminServices(mockAdminCatalogApi);
