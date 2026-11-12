import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { SectorInput } from "../../api/contracts";
import { useAdminAuth } from "../../context/adminAuthStore";
import { adminServices } from "../../services/adminServices";
import type { Sector, Shelf } from "../../types/admin";
import styles from "../../styles/admin.module.css";

const EMPTY_SECTOR_FORM: SectorInput = {
  name: "",
  codeRange: "",
  description: "",
};

export function AdminSectors() {
  const { user, hasPermission } = useAdminAuth();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SectorInput>(EMPTY_SECTOR_FORM);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const canManage = hasPermission("sectors.manage");
  const effectiveShowForm = showForm && canManage;
  const effectiveConfirmDeleteId = canManage ? confirmDeleteId : null;

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [sectorList, shelfList] = await Promise.all([
        adminServices.SectorService.list(),
        hasPermission("shelves.read") ? adminServices.ShelfService.list(user) : Promise.resolve([]),
      ]);
      setSectors(sectorList);
      setShelves(shelfList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar setores.");
    }
  }, [user, hasPermission]);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (!user) return;
      try {
        const [sectorList, shelfList] = await Promise.all([
          adminServices.SectorService.list(),
          hasPermission("shelves.read") ? adminServices.ShelfService.list(user) : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setSectors(sectorList);
        setShelves(shelfList);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar setores.");
        }
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, [user, hasPermission]);

  const shelfCountBySector = useMemo(() => {
    const counts = new Map<string, number>();
    for (const shelf of shelves) {
      counts.set(shelf.sectorId, (counts.get(shelf.sectorId) ?? 0) + 1);
    }
    return counts;
  }, [shelves]);

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_SECTOR_FORM);
    setShowForm(true);
    setError(null);
    setFeedback(null);
  }

  function openEditForm(sector: Sector) {
    setEditingId(sector.id);
    setForm({
      name: sector.name,
      codeRange: sector.codeRange,
      description: sector.description,
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
        await adminServices.SectorService.update(editingId, form, user);
        setFeedback("Setor atualizado com sucesso.");
      } else {
        await adminServices.SectorService.create(form, user);
        setFeedback("Setor cadastrado com sucesso.");
      }
      setShowForm(false);
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar o setor.");
    }
  }

  async function handleDelete(sectorId: string) {
    if (!user) return;
    setError(null);
    setFeedback(null);
    try {
      await adminServices.SectorService.delete(sectorId, user);
      setConfirmDeleteId(null);
      setFeedback("Setor removido com sucesso.");
      await loadData();
    } catch (err) {
      setConfirmDeleteId(null);
      setError(err instanceof Error ? err.message : "Não foi possível remover o setor.");
    }
  }

  if (!user) return null;

  return (
    <section aria-labelledby="sectors-title" className={styles.pageSection}>
      <header className={styles.sectionHeader}>
        <div>
          <h1 id="sectors-title" className={styles.sectionTitle}>
            Setores e Faixas de Classificação
          </h1>
          <p className={styles.sectionSubtitle}>
            Configure grandes áreas temáticas e faixas Dedalus associadas às estantes.
          </p>
        </div>
        {canManage && (
          <button type="button" onClick={openCreateForm} className={styles.primaryBtn}>
            + Novo setor
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
            {editingId ? "Editar setor" : "Cadastrar novo setor"}
          </h2>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="sector-name" className={styles.fieldLabel}>
                Nome do setor
              </label>
              <input
                id="sector-name"
                required
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className={styles.input}
                placeholder="Ex.: Química e Materiais"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="sector-range" className={styles.fieldLabel}>
                Faixa de códigos Dedalus
              </label>
              <input
                id="sector-range"
                required
                value={form.codeRange}
                onChange={(e) => setForm((prev) => ({ ...prev, codeRange: e.target.value }))}
                className={styles.input}
                placeholder="Ex.: 540 - 549"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="sector-description" className={styles.fieldLabel}>
                Descrição
              </label>
              <input
                id="sector-description"
                required
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className={styles.input}
                placeholder="Ex.: Química geral, orgânica e inorgânica"
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryBtn}>
              {editingId ? "Salvar alterações" : "Cadastrar setor"}
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
                <th>Setor</th>
                <th>Faixa Dedalus</th>
                <th>Descrição</th>
                <th>Estantes</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {sectors.map((sector) => {
                const isConfirming = effectiveConfirmDeleteId === sector.id;
                return (
                  <tr key={sector.id}>
                    <td>
                      <strong>{sector.name}</strong>
                    </td>
                    <td>
                      <span className={styles.codePill}>{sector.codeRange}</span>
                    </td>
                    <td>{sector.description}</td>
                    <td>{shelfCountBySector.get(sector.id) ?? 0}</td>
                    <td>
                      {canManage &&
                        (isConfirming ? (
                          <div className={styles.rowActions}>
                            <button
                              type="button"
                              onClick={() => void handleDelete(sector.id)}
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
                            <button
                              type="button"
                              onClick={() => openEditForm(sector)}
                              className={styles.smallBtn}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(sector.id)}
                              className={styles.smallDangerBtn}
                            >
                              Excluir
                            </button>
                          </div>
                        ))}
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
