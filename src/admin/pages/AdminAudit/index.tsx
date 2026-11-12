import { useEffect, useMemo, useState } from "react";
import { useAdminAuth } from "../../context/adminAuthStore";
import { adminServices } from "../../services/adminServices";
import { ROLE_METADATA } from "../../services/permissionService";
import type { AdminRole, AuditLog } from "../../types/admin";
import styles from "../../styles/admin.module.css";

export function AdminAudit() {
  const { user } = useAdminAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [actionFilter, setActionFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | AdminRole>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (!user) return;
      try {
        const result = await adminServices.AuditService.list(user);
        if (!cancelled) {
          setLogs(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar logs de auditoria.");
        }
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const distinctActions = useMemo(
    () => Array.from(new Set(logs.map((l) => l.action))).sort(),
    [logs],
  );

  const filteredLogs = useMemo(
    () =>
      logs.filter((log) => {
        if (actionFilter && log.action !== actionFilter) return false;
        if (roleFilter && log.actorRole !== roleFilter) return false;
        return true;
      }),
    [logs, actionFilter, roleFilter],
  );

  if (!user) return null;

  return (
    <section aria-labelledby="audit-title" className={styles.pageSection}>
      <header className={styles.sectionHeader}>
        <div>
          <h1 id="audit-title" className={styles.sectionTitle}>
            Auditoria Administrativa
          </h1>
          <p className={styles.sectionSubtitle}>
            Histórico de alterações no catálogo, exclusões e exportações/importações.
          </p>
        </div>
      </header>

      <div className={styles.warningBanner}>
        <strong>Auditoria em memória:</strong> os registros abaixo refletem as ações realizadas
        nesta sessão (marcados como simulados) até a persistência definitiva em banco SQL.
      </div>

      {error && (
        <div role="alert" className={styles.errorBanner}>
          {error}
        </div>
      )}

      <div className={styles.panelCard}>
        <div className={styles.toolbar}>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            aria-label="Filtrar por ação"
            className={`${styles.select} ${styles.toolbarFilter}`}
          >
            <option value="">Todas as ações</option>
            {distinctActions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "" | AdminRole)}
            aria-label="Filtrar por perfil"
            className={`${styles.select} ${styles.toolbarFilter}`}
          >
            <option value="">Todos os perfis</option>
            {Object.values(ROLE_METADATA).map((meta) => (
              <option key={meta.role} value={meta.role}>
                {meta.label}
              </option>
            ))}
          </select>
        </div>

        {filteredLogs.length === 0 ? (
          <p className={styles.emptyState}>Nenhum registro de auditoria para os filtros atuais.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Ação</th>
                  <th>Entidade</th>
                  <th>Detalhes</th>
                  <th>Responsável</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.createdAt).toLocaleString("pt-BR")}</td>
                    <td>
                      <span className={styles.codePill}>{log.action}</span>
                    </td>
                    <td>
                      <strong>{log.entityLabel}</strong>
                      <div className={styles.mutedText}>
                        {log.entityType} ({log.entityId})
                      </div>
                    </td>
                    <td>{log.details}</td>
                    <td>
                      {log.actorUsername}
                      <div className={styles.mutedText}>
                        {ROLE_METADATA[log.actorRole].shortLabel}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
