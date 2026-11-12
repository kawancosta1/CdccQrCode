import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../context/adminAuthStore";
import { adminServices } from "../../services/adminServices";
import { CarouselService } from "../../../services/carouselService";
import { GamesService } from "../../../services/gamesService";
import { PermissionService, ROLE_METADATA } from "../../services/permissionService";
import type { AdminDashboardSummary, AuditLog } from "../../types/admin";
import styles from "../../styles/admin.module.css";

export function AdminDashboard() {
  const { user, hasPermission } = useAdminAuth();
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [carouselCount, setCarouselCount] = useState<number | null>(null);
  const [gamesCount, setGamesCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canReadAudit = hasPermission("audit.read");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const [nextSummary, slides, games] = await Promise.all([
          adminServices.CatalogService.getDashboardSummary(),
          CarouselService.getAll().catch(() => []),
          GamesService.getAll().catch(() => []),
        ]);

        if (cancelled) return;
        setSummary(nextSummary);
        setCarouselCount(slides.length);
        setGamesCount(games.length);

        if (canReadAudit && user) {
          const logs = await adminServices.AuditService.list(user);
          if (!cancelled) {
            setRecentLogs(logs.slice(0, 5));
          }
        } else {
          setRecentLogs([]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar painel.");
        }
      }
    }

    void loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [canReadAudit, user]);

  if (!user) return null;

  const roleInfo = ROLE_METADATA[user.role];
  const permissions = PermissionService.getRolePermissions(user.role);

  return (
    <section aria-labelledby="dashboard-title" className={styles.pageSection}>
      <header className={styles.sectionHeader}>
        <div>
          <h1 id="dashboard-title" className={styles.sectionTitle}>
            Visão Geral do Acervo
          </h1>
          <p className={styles.sectionSubtitle}>
            Perfil ativo: <strong>{roleInfo.label}</strong> — {roleInfo.description}
          </p>
        </div>
      </header>

      {error && (
        <div role="alert" className={styles.errorBanner}>
          {error}
        </div>
      )}

      {summary?.isDemoCatalog && (
        <div className={styles.warningBanner}>
          <strong>Dados demonstrativos em memória:</strong> as salas e estantes refletem o layout
          real da biblioteca do CDCC, enquanto os registros de livros e logs são dados fictícios de
          demonstração até a conexão com a API/SQL.
        </div>
      )}

      <div className={styles.statsGrid}>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Slides no Carrossel</span>
          <strong className={styles.statValue}>
            {carouselCount !== null ? carouselCount : "—"}
          </strong>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Jogos no Espaço Lúdico</span>
          <strong className={styles.statValue}>{gamesCount !== null ? gamesCount : "—"}</strong>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Livros no catálogo</span>
          <strong className={styles.statValue}>{summary ? summary.booksCount : "—"}</strong>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Estantes cadastradas</span>
          <strong className={styles.statValue}>{summary ? summary.shelvesCount : "—"}</strong>
        </article>
      </div>

      <div className={styles.panelCard}>
        <h2 className={styles.panelTitle}>Atalhos disponíveis para o seu perfil</h2>
        <div className={styles.quickActions}>
          {hasPermission("carousel.manage") && (
            <Link to="/admin/carrossel" className={styles.primaryBtn}>
              Gerenciar Carrossel
            </Link>
          )}
          {hasPermission("games.manage") && (
            <Link to="/admin/jogos" className={styles.primaryBtn}>
              Gerenciar Jogos
            </Link>
          )}
          {hasPermission("books.read") && (
            <Link to="/admin/livros" className={styles.secondaryBtn}>
              Gerenciar Livros
            </Link>
          )}
          {hasPermission("shelves.read") && (
            <Link to="/admin/estantes" className={styles.secondaryBtn}>
              Estantes e Localização
            </Link>
          )}
          {hasPermission("rooms.read") && (
            <Link to="/admin/salas" className={styles.secondaryBtn}>
              Salas da Biblioteca
            </Link>
          )}
          {hasPermission("sectors.manage") && (
            <Link to="/admin/setores" className={styles.secondaryBtn}>
              Setores e Classificações
            </Link>
          )}
          {hasPermission("audit.read") && (
            <Link to="/admin/auditoria" className={styles.secondaryBtn}>
              Logs de Auditoria
            </Link>
          )}
          {hasPermission("settings.manage") && (
            <Link to="/admin/configuracoes" className={styles.secondaryBtn}>
              Configurações e Backup
            </Link>
          )}
        </div>

        <p className={styles.sectionSubtitle}>
          Permissões ativas ({permissions.length}):{" "}
          <span className={styles.codePill}>{permissions.join(", ")}</span>
        </p>
      </div>

      {canReadAudit && (
        <div className={styles.panelCard}>
          <h2 className={styles.panelTitle}>Atividade recente (Auditoria)</h2>
          {recentLogs.length === 0 ? (
            <p className={styles.emptyState}>Nenhum evento de auditoria registrado.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Ação</th>
                    <th>Entidade</th>
                    <th>Responsável</th>
                    <th>Data/Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <span className={styles.codePill}>{log.action}</span>
                      </td>
                      <td>
                        <strong>{log.entityLabel}</strong>
                        <div className={styles.mutedText}>{log.details}</div>
                      </td>
                      <td>
                        {log.actorUsername} ({ROLE_METADATA[log.actorRole].shortLabel})
                      </td>
                      <td>{new Date(log.createdAt).toLocaleString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
