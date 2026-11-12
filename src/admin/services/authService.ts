import type { AdminRole, Administrator } from "../types/admin.ts";
import { ADMIN_ROLES } from "./permissionService.ts";

const DEV_SESSION_KEY = "qrcodecdcc_admin_dev_session";

export type LoginResult =
  | { ok: true; user: Administrator }
  | { ok: false; error: string };

export const AuthService = {
  isDevSimulationEnabled(): boolean {
    return import.meta.env.DEV;
  },

  getSavedSession(): Administrator | null {
    if (!import.meta.env.DEV) return null;
    try {
      const raw = window.sessionStorage.getItem(DEV_SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Administrator;
      if (
        !parsed ||
        typeof parsed.username !== "string" ||
        !ADMIN_ROLES.includes(parsed.role)
      ) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  },

  login(username: string, password: string): LoginResult {
    const trimmedUser = username.trim();
    if (!trimmedUser) {
      return { ok: false, error: "Informe o nome de usuário." };
    }
    if (!password) {
      return { ok: false, error: "Informe a senha." };
    }

    if (!import.meta.env.DEV) {
      return {
        ok: false,
        error:
          "Autenticação administrativa indisponível: o backend oficial ainda não está integrado ao ambiente de produção.",
      };
    }

    const expectedUser = import.meta.env.VITE_ADMIN_DEV_USER || "admin";
    const expectedPassword = import.meta.env.VITE_ADMIN_DEV_PASSWORD;

    if (!expectedPassword) {
      return {
        ok: false,
        error:
          "Variável VITE_ADMIN_DEV_PASSWORD não configurada em .env.local para login de desenvolvimento.",
      };
    }

    if (trimmedUser !== expectedUser || password !== expectedPassword) {
      return { ok: false, error: "Usuário ou senha inválidos." };
    }

    const user: Administrator = {
      id: "dev-admin-1",
      username: expectedUser,
      displayName: "Administrador (DEV)",
      role: "super_admin",
      isSimulated: true,
    };

    try {
      window.sessionStorage.setItem(DEV_SESSION_KEY, JSON.stringify(user));
    } catch {
      // Ignora erro de sessionStorage.
    }

    return { ok: true, user };
  },

  simulateRole(currentUser: Administrator, nextRole: AdminRole): Administrator {
    if (!import.meta.env.DEV || !ADMIN_ROLES.includes(nextRole)) {
      return currentUser;
    }
    const updated: Administrator = { ...currentUser, role: nextRole };
    try {
      window.sessionStorage.setItem(DEV_SESSION_KEY, JSON.stringify(updated));
    } catch {
      // Ignora erro de sessionStorage.
    }
    return updated;
  },

  logout(): void {
    try {
      window.sessionStorage.removeItem(DEV_SESSION_KEY);
    } catch {
      // Ignora erro de sessionStorage.
    }
  },
};
