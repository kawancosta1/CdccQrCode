import { Link, Navigate, useLocation } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAdminAuth } from "../context/adminAuthStore";
import { ROLE_METADATA } from "../services/permissionService";
import type { Permission } from "../types/admin";
import style from "../styles/admin.module.css";

export function RequireAdminAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAdminAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

export function RequirePermission({
  permission,
  children,
}: {
  permission: Permission;
  children: React.ReactNode;
}) {
  const { user, hasPermission } = useAdminAuth();

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!hasPermission(permission)) {
    return (
      <div className={style.deniedCard} role="alert">
        <ShieldAlert size={28} className={style.deniedIcon} aria-hidden="true" />
        <h1 className={style.deniedTitle}>Acesso negado</h1>
        <p className={style.deniedText}>
          O perfil atual (<strong>{ROLE_METADATA[user.role].label}</strong>) não possui a permissão{" "}
          <code>{permission}</code> necessária para acessar esta área.
        </p>
        <Link to="/admin" className={style.secondaryBtn}>
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
