import { createContext, useContext } from "react";
import type { AdminRole, Administrator, Permission } from "../types/admin";
import type { LoginResult } from "../services/authService";

export interface AdminAuthContextValue {
  user: Administrator | null;
  isDevMode: boolean;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  simulateRole: (role: AdminRole) => void;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: readonly Permission[]) => boolean;
}

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth deve ser usado dentro de AdminAuthProvider");
  }
  return ctx;
}
