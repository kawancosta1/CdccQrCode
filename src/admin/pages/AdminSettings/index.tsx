import { useState, type FormEvent } from "react";
import type { BookInput } from "../../api/contracts";
import { useAdminAuth } from "../../context/adminAuthStore";
import { adminServices } from "../../services/adminServices";
import { ADMIN_ROLES, PermissionService, ROLE_METADATA } from "../../services/permissionService";
import styles from "../../styles/admin.module.css";

const SAMPLE_IMPORT_JSON = `[
  {
    "title": "Química Geral e Reações Químicas",
    "author": "John C. Kotz",
    "dedalusCode": "540 K87q",
    "tombo": "CDCC-0501",
    "roomId": "room-1",
    "shelfId": "shelf-1-17",
    "sectorId": "sector-ciencias"
  }
]`;

export function AdminSettings() {
  const { user, hasPermission } = useAdminAuth();
  const [importPayload, setImportPayload] = useState(SAMPLE_IMPORT_JSON);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!user) return null;

  const canExport = hasPermission("catalog.export");
  const canImport = hasPermission("catalog.import");
  const canManageSettings = hasPermission("settings.manage");

  async function handleExport() {
    if (!user) return;
    setError(null);
    setFeedback(null);
    try {
      const payload = await adminServices.CatalogService.exportCatalog(user);
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `cdcc-catalogo-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setFeedback(
        `Catálogo exportado (${payload.books.length} livros, ${payload.shelves.length} estantes, ${payload.rooms.length} salas).`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao exportar catálogo.");
    }
  }

  async function handleImport(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setError(null);
    setFeedback(null);
    try {
      const parsed: unknown = JSON.parse(importPayload);
      if (!Array.isArray(parsed)) {
        throw new Error("O JSON de importação deve ser um array de objetos de livro.");
      }
      const result = await adminServices.CatalogService.importBooksBatch(
        parsed as BookInput[],
        user,
      );
      setFeedback(`${result.imported} livro(s) importado(s) com sucesso.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao importar lote de livros.");
    }
  }

  return (
    <section aria-labelledby="settings-title" className={styles.pageSection}>
      <header className={styles.sectionHeader}>
        <div>
          <h1 id="settings-title" className={styles.sectionTitle}>
            Configurações e Integração de Dados
          </h1>
          <p className={styles.sectionSubtitle}>
            Exportação, importação em lote e matriz RBAC preparada para API REST/SQL.
          </p>
        </div>
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

      {canManageSettings && (
        <div className={styles.panelCard}>
          <h2 className={styles.panelTitle}>Estado da Arquitetura de Persistência</h2>
          <p className={styles.sectionSubtitle}>
            Adaptador ativo: <span className={styles.codePill}>mockAdminCatalogApi</span> (em
            memória). Para conectar ao banco SQL definitivo, basta implementar a interface{" "}
            <span className={styles.codePill}>AdminCatalogApi</span> em um adaptador HTTP/REST e
            injetá-lo em <span className={styles.codePill}>createAdminServices(api)</span>.
          </p>
        </div>
      )}

      {(canExport || canImport) && (
        <div className={styles.panelCard}>
          <h2 className={styles.panelTitle}>Backup e Importação de Catálogo (JSON)</h2>

          {canExport && (
            <div className={styles.formActions}>
              <button type="button" onClick={() => void handleExport()} className={styles.primaryBtn}>
                Exportar catálogo completo (.json)
              </button>
            </div>
          )}

          {canImport && (
            <form onSubmit={handleImport} className={styles.importForm}>
              <div className={styles.fieldGroup}>
                <label htmlFor="import-json" className={styles.fieldLabel}>
                  Importar lote de livros (JSON)
                </label>
                <textarea
                  id="import-json"
                  rows={8}
                  value={importPayload}
                  onChange={(e) => setImportPayload(e.target.value)}
                  className={styles.textarea}
                />
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.secondaryBtn}>
                  Importar livros do JSON
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {canManageSettings && (
        <div className={styles.panelCard}>
          <h2 className={styles.panelTitle}>Matriz de Permissões RBAC</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Perfil</th>
                  <th>Descrição</th>
                  <th>Permissões</th>
                </tr>
              </thead>
              <tbody>
                {ADMIN_ROLES.map((role) => {
                  const meta = ROLE_METADATA[role];
                  const perms = PermissionService.getRolePermissions(role);
                  return (
                    <tr key={role}>
                      <td>
                        <strong>{meta.label}</strong>
                      </td>
                      <td>{meta.description}</td>
                      <td>
                        <span className={styles.codePill}>{perms.join(", ")}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
