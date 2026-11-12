import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { RoomInput } from "../../api/contracts";
import { useAdminAuth } from "../../context/adminAuthStore";
import { adminServices } from "../../services/adminServices";
import type { Room, Shelf } from "../../types/admin";
import styles from "../../styles/admin.module.css";

const EMPTY_ROOM_FORM: RoomInput = {
  slug: "",
  name: "",
  description: "",
};

export function AdminRooms() {
  const { user, hasPermission } = useAdminAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<RoomInput>(EMPTY_ROOM_FORM);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const canCreate = hasPermission("rooms.create");
  const canUpdate = hasPermission("rooms.update");
  const canDelete = hasPermission("rooms.delete");
  const effectiveShowForm = showForm && (editingId ? canUpdate : canCreate);
  const effectiveConfirmDeleteId = canDelete ? confirmDeleteId : null;

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [roomList, shelfList] = await Promise.all([
        adminServices.RoomService.list(user),
        hasPermission("shelves.read") ? adminServices.ShelfService.list(user) : Promise.resolve([]),
      ]);
      setRooms(roomList);
      setShelves(shelfList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar salas.");
    }
  }, [user, hasPermission]);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (!user) return;
      try {
        const [roomList, shelfList] = await Promise.all([
          adminServices.RoomService.list(user),
          hasPermission("shelves.read") ? adminServices.ShelfService.list(user) : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setRooms(roomList);
        setShelves(shelfList);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar salas.");
        }
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, [user, hasPermission]);

  const shelfCountByRoom = useMemo(() => {
    const counts = new Map<string, number>();
    for (const shelf of shelves) {
      counts.set(shelf.roomId, (counts.get(shelf.roomId) ?? 0) + 1);
    }
    return counts;
  }, [shelves]);

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_ROOM_FORM);
    setShowForm(true);
    setError(null);
    setFeedback(null);
  }

  function openEditForm(room: Room) {
    setEditingId(room.id);
    setForm({
      slug: room.slug,
      name: room.name,
      description: room.description,
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
        await adminServices.RoomService.update(editingId, form, user);
        setFeedback("Sala atualizada com sucesso.");
      } else {
        await adminServices.RoomService.create(form, user);
        setFeedback("Sala cadastrada com sucesso.");
      }
      setShowForm(false);
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar a sala.");
    }
  }

  async function handleDelete(roomId: string) {
    if (!user) return;
    setError(null);
    setFeedback(null);
    try {
      await adminServices.RoomService.delete(roomId, user);
      setConfirmDeleteId(null);
      setFeedback("Sala removida com sucesso.");
      await loadData();
    } catch (err) {
      setConfirmDeleteId(null);
      setError(err instanceof Error ? err.message : "Não foi possível remover a sala.");
    }
  }

  if (!user) return null;

  return (
    <section aria-labelledby="rooms-title" className={styles.pageSection}>
      <header className={styles.sectionHeader}>
        <div>
          <h1 id="rooms-title" className={styles.sectionTitle}>
            Salas da Biblioteca
          </h1>
          <p className={styles.sectionSubtitle}>
            Gerencie as salas físicas conectadas aos slugs públicos de localização.
          </p>
        </div>
        {canCreate && (
          <button type="button" onClick={openCreateForm} className={styles.primaryBtn}>
            + Nova sala
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
          <h2 className={styles.panelTitle}>{editingId ? "Editar sala" : "Cadastrar nova sala"}</h2>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="room-name" className={styles.fieldLabel}>
                Nome da sala
              </label>
              <input
                id="room-name"
                required
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className={styles.input}
                placeholder="Ex.: Sala 4"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="room-slug" className={styles.fieldLabel}>
                Slug da rota
              </label>
              <input
                id="room-slug"
                required
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                className={styles.input}
                placeholder="Ex.: sala4"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="room-description" className={styles.fieldLabel}>
                Descrição
              </label>
              <input
                id="room-description"
                required
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className={styles.input}
                placeholder="Ex.: Acervo complementar e periódicos"
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryBtn}>
              {editingId ? "Salvar alterações" : "Cadastrar sala"}
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
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sala</th>
                <th>Slug</th>
                <th>Descrição</th>
                <th>Estantes</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => {
                const isConfirming = effectiveConfirmDeleteId === room.id;
                return (
                  <tr key={room.id}>
                    <td>
                      <strong>{room.name}</strong>
                    </td>
                    <td>
                      <span className={styles.codePill}>{room.slug}</span>
                    </td>
                    <td>{room.description}</td>
                    <td>{shelfCountByRoom.get(room.id) ?? 0}</td>
                    <td>
                      {isConfirming ? (
                        <div className={styles.rowActions}>
                          <button
                            type="button"
                            onClick={() => void handleDelete(room.id)}
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
                              onClick={() => openEditForm(room)}
                              className={styles.smallBtn}
                            >
                              Editar
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(room.id)}
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
      </div>
    </section>
  );
}
