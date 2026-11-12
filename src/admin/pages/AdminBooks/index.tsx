import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  parseDedalusCsv,
  readLocalImportedBooks,
  saveImportedDedalusBooks,
  syncAdminBookToSearchIndex,
} from "../../../services/catalogSearchIndex";
import type { BookInput } from "../../api/contracts";
import { useAdminAuth } from "../../context/adminAuthStore";
import { adminServices } from "../../services/adminServices";
import type { Book, Room, Sector, Shelf } from "../../types/admin";
import styles from "../../styles/admin.module.css";

const EMPTY_BOOK_FORM: BookInput = {
  title: "",
  author: "",
  dedalusCode: "",
  tombo: "",
  roomId: "",
  shelfId: "",
  sectorId: "",
};

export function AdminBooks() {
  const { user, hasPermission } = useAdminAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [search, setSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [shelfFilter, setShelfFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<BookInput>(EMPTY_BOOK_FORM);
  const [movingBookId, setMovingBookId] = useState<string | null>(null);
  const [moveTargetShelfId, setMoveTargetShelfId] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [indexedCount, setIndexedCount] = useState(() => readLocalImportedBooks().length);

  const canCreate = hasPermission("books.create");
  const canUpdate = hasPermission("books.update");
  const canDelete = hasPermission("books.delete");
  const canMove = hasPermission("catalog.manage");
  const effectiveShowForm = showForm && (editingId ? canUpdate : canCreate);
  const effectiveMovingBookId = canMove ? movingBookId : null;
  const effectiveConfirmDeleteId = canDelete ? confirmDeleteId : null;

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [bookList, roomList, shelfList, sectorList] = await Promise.all([
        adminServices.BookService.list(user),
        adminServices.RoomService.list(user),
        adminServices.ShelfService.list(user),
        adminServices.SectorService.list(),
      ]);
      setBooks(bookList);
      setRooms(roomList);
      setShelves(shelfList);
      setSectors(sectorList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar catálogo de livros.");
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (!user) return;
      try {
        const [bookList, roomList, shelfList, sectorList] = await Promise.all([
          adminServices.BookService.list(user),
          adminServices.RoomService.list(user),
          adminServices.ShelfService.list(user),
          adminServices.SectorService.list(),
        ]);
        if (cancelled) return;
        setBooks(bookList);
        setRooms(roomList);
        setShelves(shelfList);
        setSectors(sectorList);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar catálogo de livros.");
        }
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const roomById = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);
  const shelfById = useMemo(() => new Map(shelves.map((s) => [s.id, s])), [shelves]);
  const sectorById = useMemo(() => new Map(sectors.map((s) => [s.id, s])), [sectors]);

  const shelvesForFilter = useMemo(
    () => (roomFilter ? shelves.filter((s) => s.roomId === roomFilter) : shelves),
    [shelves, roomFilter],
  );

  const shelvesForForm = useMemo(
    () => (form.roomId ? shelves.filter((s) => s.roomId === form.roomId) : shelves),
    [shelves, form.roomId],
  );

  const filteredBooks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return books.filter((book) => {
      if (roomFilter && book.roomId !== roomFilter) return false;
      if (shelfFilter && book.shelfId !== shelfFilter) return false;
      if (!q) return true;
      return (
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.dedalusCode.toLowerCase().includes(q) ||
        (book.tombo ?? "").toLowerCase().includes(q)
      );
    });
  }, [books, search, roomFilter, shelfFilter]);

  function openCreateForm() {
    const defaultRoom = rooms[0]?.id ?? "";
    const defaultShelf = shelves.find((s) => s.roomId === defaultRoom) ?? shelves[0];
    setEditingId(null);
    setForm({
      title: "",
      author: "",
      dedalusCode: "",
      tombo: "",
      roomId: defaultRoom,
      shelfId: defaultShelf?.id ?? "",
      sectorId: defaultShelf?.sectorId ?? sectors[0]?.id ?? "",
    });
    setShowForm(true);
    setError(null);
    setFeedback(null);
  }

  function openEditForm(book: Book) {
    setEditingId(book.id);
    setForm({
      title: book.title,
      author: book.author,
      dedalusCode: book.dedalusCode,
      tombo: book.tombo ?? "",
      roomId: book.roomId,
      shelfId: book.shelfId,
      sectorId: book.sectorId,
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
        const updated = await adminServices.BookService.update(editingId, form, user);
        await syncAdminBookToSearchIndex(updated);
        setFeedback("Livro atualizado com sucesso e indexado na busca por nome.");
      } else {
        const created = await adminServices.BookService.create(form, user);
        await syncAdminBookToSearchIndex(created);
        setFeedback("Livro cadastrado com sucesso e indexado na busca por nome.");
      }
      setIndexedCount(readLocalImportedBooks().length);
      setShowForm(false);
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar o livro.");
    }
  }

  async function handleMoveConfirm(bookId: string) {
    if (!user || !moveTargetShelfId) return;
    setError(null);
    setFeedback(null);
    try {
      await adminServices.BookService.move(bookId, moveTargetShelfId, user);
      setMovingBookId(null);
      setMoveTargetShelfId("");
      setFeedback("Livro movido para a nova estante.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao mover livro.");
    }
  }

  async function handleDelete(bookId: string) {
    if (!user) return;
    setError(null);
    setFeedback(null);
    try {
      await adminServices.BookService.delete(bookId, user);
      setConfirmDeleteId(null);
      setFeedback("Livro removido do catálogo.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover livro.");
    }
  }

  const parsedCsvPreview = useMemo(() => parseDedalusCsv(csvText), [csvText]);

  async function handleCsvFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsvText(text);
    e.target.value = "";
  }

  async function handleImportCsvSubmit() {
    if (parsedCsvPreview.length === 0) {
      setError("Nenhum registro válido encontrado. Use o formato: Título;Autor;Código Dedalus");
      return;
    }
    setError(null);
    const res = await saveImportedDedalusBooks(parsedCsvPreview);
    setIndexedCount(res.total);
    setCsvText("");
    setShowCsvImport(false);
    setFeedback(
      `${parsedCsvPreview.length} obra(s) processada(s) (${res.added} nova(s)). Total indexado para busca por nome: ${res.total}.`,
    );
  }

  if (!user) return null;

  return (
    <section aria-labelledby="books-title" className={styles.pageSection}>
      <header className={styles.sectionHeader}>
        <div>
          <h1 id="books-title" className={styles.sectionTitle}>
            Livros e Classificação Dedalus
          </h1>
          <p className={styles.sectionSubtitle}>
            Gerencie títulos, códigos Dedalus e vínculo com sala, setor e estante. ({indexedCount} título(s) indexado(s) na busca por nome)
          </p>
        </div>
        <div className={styles.rowActions}>
          <button
            type="button"
            onClick={() => setShowCsvImport((prev) => !prev)}
            className={styles.secondaryBtn}
          >
            {showCsvImport ? "Fechar importador CSV" : "Importar Planilha Dedalus (CSV)"}
          </button>
          {canCreate && (
            <button type="button" onClick={openCreateForm} className={styles.primaryBtn}>
              + Novo livro
            </button>
          )}
        </div>
      </header>

      {showCsvImport && (
        <div className={styles.panelCard} style={{ marginBottom: "1rem" }}>
          <h2 className={styles.panelTitle}>Importar Acervo Dedalus para Busca por Nome (CSV / TSV)</h2>
          <p className={styles.sectionSubtitle} style={{ marginBottom: "0.75rem" }}>
            Envie um arquivo <code>.csv</code>/<code>.tsv</code> ou cole linhas no formato{" "}
            <code>Título;Autor;Código Dedalus</code> (ex.: <code>Física Conceitual;Paul Hewitt;530 H611f</code>).
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
            <input
              type="file"
              accept=".csv,.tsv,.txt"
              onChange={(e) => void handleCsvFileChange(e)}
              className={styles.input}
              style={{ maxWidth: "360px" }}
            />
          </div>
          <textarea
            rows={5}
            className={styles.textarea}
            placeholder={"Título;Autor;Código Dedalus\nFísica Conceitual;Paul G. Hewitt;530\nCálculo Vol. 1;James Stewart;517"}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.75rem", gap: "0.75rem", flexWrap: "wrap" }}>
            <span className={styles.sectionSubtitle}>
              Registros reconhecidos: <strong>{parsedCsvPreview.length}</strong>
            </span>
            <button
              type="button"
              className={styles.primaryBtn}
              disabled={parsedCsvPreview.length === 0}
              onClick={() => void handleImportCsvSubmit()}
            >
              Indexar na Busca por Nome
            </button>
          </div>
        </div>
      )}

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
            {editingId ? "Editar livro" : "Cadastrar novo livro"}
          </h2>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="book-title" className={styles.fieldLabel}>
                Título
              </label>
              <input
                id="book-title"
                required
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className={styles.input}
                placeholder="Ex.: Física Conceitual"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="book-author" className={styles.fieldLabel}>
                Autor
              </label>
              <input
                id="book-author"
                required
                value={form.author}
                onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))}
                className={styles.input}
                placeholder="Ex.: Paul G. Hewitt"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="book-dedalus" className={styles.fieldLabel}>
                Código Dedalus
              </label>
              <input
                id="book-dedalus"
                required
                value={form.dedalusCode}
                onChange={(e) => setForm((prev) => ({ ...prev, dedalusCode: e.target.value }))}
                className={styles.input}
                placeholder="Ex.: 530 H611f"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="book-tombo" className={styles.fieldLabel}>
                Tombo (opcional)
              </label>
              <input
                id="book-tombo"
                value={form.tombo ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, tombo: e.target.value }))}
                className={styles.input}
                placeholder="Ex.: CDCC-0192"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="book-room" className={styles.fieldLabel}>
                Sala
              </label>
              <select
                id="book-room"
                required
                value={form.roomId}
                onChange={(e) => {
                  const nextRoomId = e.target.value;
                  const firstShelf = shelves.find((s) => s.roomId === nextRoomId);
                  setForm((prev) => ({
                    ...prev,
                    roomId: nextRoomId,
                    shelfId: firstShelf?.id ?? "",
                    sectorId: firstShelf?.sectorId ?? prev.sectorId,
                  }));
                }}
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
              <label htmlFor="book-shelf" className={styles.fieldLabel}>
                Estante
              </label>
              <select
                id="book-shelf"
                required
                value={form.shelfId}
                onChange={(e) => {
                  const nextShelfId = e.target.value;
                  const targetShelf = shelfById.get(nextShelfId);
                  setForm((prev) => ({
                    ...prev,
                    shelfId: nextShelfId,
                    sectorId: targetShelf?.sectorId ?? prev.sectorId,
                  }));
                }}
                className={styles.select}
              >
                {shelvesForForm.map((shelf) => (
                  <option key={shelf.id} value={shelf.id}>
                    {shelf.label} ({shelf.classificationRange})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="book-sector" className={styles.fieldLabel}>
                Setor
              </label>
              <select
                id="book-sector"
                required
                value={form.sectorId}
                onChange={(e) => setForm((prev) => ({ ...prev, sectorId: e.target.value }))}
                className={styles.select}
              >
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name} ({sector.codeRange})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryBtn}>
              {editingId ? "Salvar alterações" : "Cadastrar livro"}
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
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, autor, Dedalus ou tombo..."
            aria-label="Buscar livros"
            className={`${styles.input} ${styles.toolbarSearch}`}
          />
          <select
            value={roomFilter}
            onChange={(e) => {
              setRoomFilter(e.target.value);
              setShelfFilter("");
            }}
            aria-label="Filtrar por sala"
            className={`${styles.select} ${styles.toolbarFilter}`}
          >
            <option value="">Todas as salas</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
          <select
            value={shelfFilter}
            onChange={(e) => setShelfFilter(e.target.value)}
            aria-label="Filtrar por estante"
            className={`${styles.select} ${styles.toolbarFilter}`}
          >
            <option value="">Todas as estantes</option>
            {shelvesForFilter.map((shelf) => (
              <option key={shelf.id} value={shelf.id}>
                {shelf.label}
              </option>
            ))}
          </select>
        </div>

        {filteredBooks.length === 0 ? (
          <p className={styles.emptyState}>Nenhum livro encontrado com os filtros atuais.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Título / Autor</th>
                  <th>Dedalus</th>
                  <th>Localização</th>
                  <th>Setor</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => {
                  const room = roomById.get(book.roomId);
                  const shelf = shelfById.get(book.shelfId);
                  const sector = sectorById.get(book.sectorId);
                  const isMoving = effectiveMovingBookId === book.id;
                  const isConfirmingDelete = effectiveConfirmDeleteId === book.id;

                  return (
                    <tr key={book.id}>
                      <td>
                        <strong>{book.title}</strong>
                        {book.isDemoData && (
                          <span className={styles.demoTag} title="Registro demonstrativo">
                            DEMO
                          </span>
                        )}
                        <div className={styles.mutedText}>
                          {book.author}
                          {book.tombo ? ` • Tombo ${book.tombo}` : ""}
                        </div>
                      </td>
                      <td>
                        <span className={styles.codePill}>{book.dedalusCode}</span>
                      </td>
                      <td>
                        <div>{room?.name ?? book.roomId}</div>
                        {room && shelf ? (
                          <Link
                            to={`/estantes/${room.slug}/${shelf.code}`}
                            className={styles.inlineLink}
                          >
                            {shelf.label} ↗
                          </Link>
                        ) : (
                          <span className={styles.mutedText}>{book.shelfId}</span>
                        )}
                      </td>
                      <td>{sector?.name ?? book.sectorId}</td>
                      <td>
                        {isMoving ? (
                          <div className={styles.rowActions}>
                            <select
                              value={moveTargetShelfId}
                              onChange={(e) => setMoveTargetShelfId(e.target.value)}
                              aria-label="Selecionar nova estante"
                              className={styles.select}
                            >
                              {shelves.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {roomById.get(s.roomId)?.name} — {s.label}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => void handleMoveConfirm(book.id)}
                              className={styles.smallBtn}
                            >
                              Confirmar
                            </button>
                            <button
                              type="button"
                              onClick={() => setMovingBookId(null)}
                              className={styles.smallBtn}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : isConfirmingDelete ? (
                          <div className={styles.rowActions}>
                            <button
                              type="button"
                              onClick={() => void handleDelete(book.id)}
                              className={styles.smallDangerBtn}
                            >
                              Confirmar exclusão
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
                                onClick={() => openEditForm(book)}
                                className={styles.smallBtn}
                              >
                                Editar
                              </button>
                            )}
                            {canMove && (
                              <button
                                type="button"
                                onClick={() => {
                                  setMovingBookId(book.id);
                                  setMoveTargetShelfId(book.shelfId);
                                }}
                                className={styles.smallBtn}
                              >
                                Mover
                              </button>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(book.id)}
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
