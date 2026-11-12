import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Building2,
  ClipboardList,
  FolderTree,
  Gamepad2,
  Images,
  LayoutDashboard,
  Layers,
  LogOut,
  Settings,
} from "lucide-react";
import { useAdminAuth } from "../../context/adminAuthStore";
import { ADMIN_ROLES, ROLE_METADATA } from "../../services/permissionService";
import type { AdminRole, Permission } from "../../types/admin";
import style from "../../styles/admin.module.css";

interface AdminNavItem {
  to: string;
  label: string;
  end?: boolean;
  permission?: Permission;
  icon: React.ReactNode;
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { to: "/admin", label: "Dashboard", end: true, icon: <LayoutDashboard size={16} aria-hidden="true" /> },
  { to: "/admin/carrossel", label: "Carrossel Home", permission: "carousel.manage", icon: <Images size={16} aria-hidden="true" /> },
  { to: "/admin/jogos", label: "Jogos Lúdicos", permission: "games.manage", icon: <Gamepad2 size={16} aria-hidden="true" /> },
  { to: "/admin/livros", label: "Livros", permission: "books.read", icon: <BookOpen size={16} aria-hidden="true" /> },
  { to: "/admin/estantes", label: "Estantes", permission: "shelves.read", icon: <Layers size={16} aria-hidden="true" /> },
  { to: "/admin/salas", label: "Salas", permission: "rooms.read", icon: <Building2 size={16} aria-hidden="true" /> },
  { to: "/admin/setores", label: "Setores", permission: "sectors.manage", icon: <FolderTree size={16} aria-hidden="true" /> },
  { to: "/admin/auditoria", label: "Auditoria", permission: "audit.read", icon: <ClipboardList size={16} aria-hidden="true" /> },
  { to: "/admin/configuracoes", label: "Configurações", permission: "settings.manage", icon: <Settings size={16} aria-hidden="true" /> },
];

export function AdminLayout() {
  const { user, logout, simulateRole, hasPermission } = useAdminAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const visibleNavItems = ADMIN_NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(item.permission),
  );

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className={style.shell}>
      <header className={style.topBar}>
        <div className={style.topBarLeft}>
          <div className={style.topTitleRow}>
            <p className={style.topTitle}>Painel Administrativo — QRCodeCDCC</p>
            <span className={style.roleBadge}>{ROLE_METADATA[user.role].label}</span>
          </div>
          <p className={style.topMeta}>
            Conectado como <strong>{user.username}</strong> • {ROLE_METADATA[user.role].description}
          </p>
        </div>

        <div className={style.topActions}>
          {import.meta.env.DEV && (
            <div className={style.devRoleSwitcher}>
              <label htmlFor="dev-role-select">
                <strong>Simular perfil (DEV):</strong>
              </label>
              <select
                id="dev-role-select"
                className={style.devRoleSelect}
                value={user.role}
                onChange={(e) => simulateRole(e.target.value as AdminRole)}
              >
                {ADMIN_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_METADATA[role].label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button type="button" className={style.secondaryBtn} onClick={handleLogout}>
            <LogOut size={16} aria-hidden="true" />
            Sair
          </button>
        </div>
      </header>

      <div className={style.workspaceGrid}>
        <nav className={style.sidebar} aria-label="Navegação administrativa">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${style.navLink} ${isActive ? style.navLinkActive : ""}`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={style.mainPanel}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
