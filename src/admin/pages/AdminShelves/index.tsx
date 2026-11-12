import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import type { ShelfInput } from "../../api/contracts";
import { useAdminAuth } from "../../context/adminAuthStore";
import { adminServices } from "../../services/adminServices";
import type { Book, Room, Sector, Shelf } from "../../types/admin";
import styles from "../../styles/admin.module.css";

const EMPTY_SHELF_FORM: ShelfInput = {
  code: "",
  label: "",
  roomId: "",
  sectorId: "",
  classificationRange: "",
};

export function AdminShelves() {
  const { user, hasPermission } = useAdminAuth();
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [roomFilter, setRoomFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ShelfInput>(EMPTY_SHELF_FORM);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const canCreate = hasPermission("shelves.create");
  const canUpdate = hasPermission("shelves.update");
  const canDelete = hasPermission("shelves.delete");
  const effectiveShowForm = showForm && (editingId ? canUpdate : canCreate);
  const effectiveConfirmDeleteId = canDelete ? confirmDeleteId : null;

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [shelfList, roomList, sectorList, bookList] = await Promise.all([
        adminServices.ShelfService.list(user),
        adminServices.RoomService.list(user),
        adminServices.SectorService.list(),
        hasPermission("books.read") ? adminServices.BookService.list(user) : Promise.resolve([]),
      ]);
      setShelves(shelfList);
      setRooms(roomList);
      setSectors(sectorList);
      setBooks(bookList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar estantes.");
    }
  }, [user, hasPermission]);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (!user) return;
      try {
        const [shelfList, roomList, sectorList, bookList] = await Promise.all([
          adminServices.ShelfService.list(user),
          adminServices.RoomService.list(user),
          adminServices.SectorService.list(),
          hasPermission("books.read") ? adminServices.BookService.list(user) : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setShelves(shelfList);
        setRooms(roomList);
        setSectors(sectorList);
        setBooks(bookList);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar estantes.");
        }
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, [user, hasPermission]);

  const roomById = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);
  const sectorById = useMemo(() => new Map(sectors.map((s) => [s.id, s])), [sectors]);

  const bookCountByShelf = useMemo(() => {
    const counts = new Map<string, number>();
    for (const book of books) {
      counts.set(book.shelfId, (counts.get(book.shelfId) ?? 0) + 1);
    }
    return counts;
  }, [books]);

  const filteredShelves = useMemo(
    () =>
      shelves.filter((shelf) => {
        if (roomFilter && shelf.roomId !== roomFilter) return false;
        if (sectorFilter && shelf.sectorId !== sectorFilter) return false;
        return true;
      }),
    [shelves, roomFilter, sectorFilter],
  );

  function openCreateForm() {
    setEditingId(null);
    setForm({
      code: "",
      label: "",
      roomId: rooms[0]?.id ?? "",
      sectorId: sectors[0]?.id ?? "",
      classificationRange: "",
    });
    setShowForm(true);
    setError(null);
    setFeedback(null);
  }

  function openEditForm(shelf: Shelf) {
    setEditingId(shelf.id);
    setForm({
      code: shelf.code,
      label: shelf.label,
      roomId: shelf.roomId,
      sectorId: shelf.sectorId,
      classificationRange: shelf.classificationRange,
    });
    setShowForm(true);
    setError(null);
    setFeedback(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setError(null);
    setFeedback(null);
    try {
      if (editingId) {
        await adminServices.ShelfService.update(editingId, form, user);
        setFeedback("Estante atualizada com sucesso.");
      } else {
        await adminServices.ShelfService.create(form, user);
        setFeedback("Estante cadastrada com sucesso.");
      }
      setShowForm(false);
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar a estante.");
    }
  }

  async function handleDelete(shelfId: string) {
    if (!user) return;
    setError(null);
    setFeedback(null);
    try {
      await adminServices.ShelfService.delete(shelfId, user);
      setConfirmDeleteId(null);
      setFeedback("Estante removida com sucesso.");
      await loadData();
    } catch (err) {
      setConfirmDeleteId(null);
      setError(err instanceof Error ? err.message : "Não foi possível remover a estante.");
    }
  }

  if (!user) return null;

  return (
    <section aria-labelledby="shelves-title" className={styles.pageSection}>
      <header className={styles.sectionHeader}>
        <div>
          <h1 id="shelves-title" className={styles.sectionTitle}>
            Estantes e Faixas de Classificação
          </h1>
          <p className={styles.sectionSubtitle}>
            Organize as estantes por sala e setor temático, preservando a integridade do acervo.
          </p>
        </div>
        {canCreate && (
          <button type="button" onClick={openCreateForm} className={styles.primaryBtn}>
            + Nova estante
          </button>
        )}
      </header>

      {error && (
        <div role="alert" className={styles.errorBanner}>
          {error}
        </div>
      )}
      {feedback && (
        <div role="status" className={styles.successBanner}>
          {feedback}
        </div>
      )}

      {effectiveShowForm && (
        <form onSubmit={handleSubmit} className={styles.panelCard}>
          <h2 className={styles.panelTitle}>
            {editingId ? "Editar estante" : "Cadastrar nova estante"}
          </h2>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="shelf-code" className={styles.fieldLabel}>
                Código da estante
              </label>
              <input
                id="shelf-code"
                required
                value={form.code}
                onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                className={styles.input}
                placeholder="Ex.: 26"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="shelf-label" className={styles.fieldLabel}>
                Rótulo
              </label>
              <input
                id="shelf-label"
                required
                value={form.label}
                onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
                className={styles.input}
                placeholder="Ex.: Estante 26"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="shelf-room" className={styles.fieldLabel}>
                Sala
              </label>
              <select
                id="shelf-room"
                required
                value={form.roomId}
                onChange={(e) => setForm((prev) => ({ ...prev, roomId: e.target.value }))}
                className={styles.select}
              >
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="shelf-sector" className={styles.fieldLabel}>
                Setor
              </label>
              <select
                id="shelf-sector"
                required
                value={form.sectorId}
                onChange={(e) => setForm((prev) => ({ ...prev, sectorId: e.target.value }))}
                className={styles.select}
              >
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="shelf-range" className={styles.fieldLabel}>
                Faixa Dedalus
              </label>
              <input
                id="shelf-range"
                required
                value={form.classificationRange}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, classificationRange: e.target.value }))
                }
                className={styles.input}
                placeholder="Ex.: 530 - 539"
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryBtn}>
              {editingId ? "Salvar alterações" : "Cadastrar estante"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className={styles.secondaryBtn}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className={styles.panelCard}>
        <div className={styles.toolbar}>
          <select
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            aria-label="Filtrar por sala"
            className={`${styles.select} ${styles.toolbarFilter}`}
          >
            <option value="">Todas as salas ({shelves.length})</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            aria-label="Filtrar por setor"
            className={`${styles.select} ${styles.toolbarFilter}`}
          >
            <option value="">Todos os setores</option>
            {sectors.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.name}
              </option>
            ))}
          </select>
        </div>

        {filteredShelves.length === 0 ? (
          <p className={styles.emptyState}>Nenhuma estante encontrada para este filtro.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Estante</th>
                  <th>Sala</th>
                  <th>Setor</th>
                  <th>Faixa Dedalus</th>
                  <th>Livros</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredShelves.map((shelf) => {
                  const room = roomById.get(shelf.roomId);
                  const sector = sectorById.get(shelf.sectorId);
                  const bookCount = bookCountByShelf.get(shelf.id) ?? 0;
                  const isConfirming = effectiveConfirmDeleteId === shelf.id;

                  return (
                    <tr key={shelf.id}>
                      <td>
                        <strong>{shelf.label}</strong>
                        <div className={styles.mutedText}>Código: {shelf.code}</div>
                      </td>
                      <td>
                        {room ? (
                          <Link
                            to={`/estantes/${room.slug}/${shelf.code}`}
                            className={styles.inlineLink}
                          >
                            {room.name} ↗
                          </Link>
                        ) : (
                          shelf.roomId
                        )}
                      </td>
                      <td>{sector?.name ?? shelf.sectorId}</td>
                      <td>
                        <span className={styles.codePill}>{shelf.classificationRange}</span>
                      </td>
                      <td>{bookCount}</td>
                      <td>
                        {isConfirming ? (
                          <div className={styles.rowActions}>
                            <button
                              type="button"
                              onClick={() => void handleDelete(shelf.id)}
                              className={styles.smallDangerBtn}
                            >
                              Confirmar
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className={styles.smallBtn}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className={styles.rowActions}>
                            {canUpdate && (
                              <button
                                type="button"
                                onClick={() => openEditForm(shelf)}
                                className={styles.smallBtn}
                              >
                                Editar
                              </button>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(shelf.id)}
                                className={styles.smallDangerBtn}
                              >
                                Excluir
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
