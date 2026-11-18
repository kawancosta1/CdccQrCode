import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "../../lib/firebase.ts";
import type { AdminRole, Administrator } from "../types/admin.ts";
import { ADMIN_ROLES } from "./permissionService.ts";

const DEV_SESSION_KEY = "qrcodecdcc_admin_dev_session";

// Login local de demonstração (admin / senha de desenvolvimento): só em `npm run dev`
// ou quando o Firebase NÃO está configurado. Com o Firebase ativo, essas credenciais
// nunca são aceitas, para não abrir o painel com uma senha pública.
function isLocalDemoAllowed(): boolean {
  return import.meta.env.DEV || !isFirebaseConfigured();
}

export type LoginResult =
  | { ok: true; user: Administrator }
  | { ok: false; error: string };

export const AuthService = {
  isDevSimulationEnabled(): boolean {
    return import.meta.env.DEV;
  },

  isFirebaseActive(): boolean {
    return isFirebaseConfigured();
  },

  getSavedSession(): Administrator | null {
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
      // Sessões simuladas só valem no modo local (DEV ou sem Firebase configurado).
      if (parsed.isSimulated && !isLocalDemoAllowed()) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  },

  async login(username: string, password: string): Promise<LoginResult> {
    const trimmedUser = username.trim();
    if (!trimmedUser) {
      return { ok: false, error: "Informe o e-mail ou nome de usuário." };
    }
    if (!password) {
      return { ok: false, error: "Informe a senha." };
    }

    // 1. Tentar login oficial via Firebase Auth se estiver configurado e o usuário informar um e-mail
    if (isFirebaseConfigured()) {
      const auth = getFirebaseAuth();
      if (auth && trimmedUser.includes("@")) {
        try {
          const cred = await signInWithEmailAndPassword(auth, trimmedUser, password);
          const user: Administrator = {
            id: cred.user.uid,
            username: cred.user.email || trimmedUser,
            displayName: cred.user.displayName || cred.user.email?.split("@")[0] || "Administrador",
            role: "super_admin",
            isSimulated: false,
          };
          try {
            window.sessionStorage.setItem(DEV_SESSION_KEY, JSON.stringify(user));
          } catch {
            // ignora
          }
          return { ok: true, user };
        } catch (err: unknown) {
          const fbErr = err as { code?: string; message?: string };
          if (
            fbErr.code === "auth/invalid-credential" ||
            fbErr.code === "auth/user-not-found" ||
            fbErr.code === "auth/wrong-password"
          ) {
            return { ok: false, error: "E-mail ou senha do Firebase incorretos." };
          }
          if (fbErr.code === "auth/too-many-requests") {
            return { ok: false, error: "Muitas tentativas sem sucesso. Tente novamente em alguns minutos." };
          }
          return {
            ok: false,
            error: fbErr.message || "Erro ao conectar com Firebase Auth.",
          };
        }
      }
    }

    // 2. Modo local de demonstração (sem Firebase ativo ou em desenvolvimento).
    if (isLocalDemoAllowed()) {
      const expectedUser = import.meta.env.VITE_ADMIN_DEV_USER || "admin";
      const expectedPassword = import.meta.env.VITE_ADMIN_DEV_PASSWORD || "cdcc-admin-dev";

      if (trimmedUser === expectedUser && password === expectedPassword) {
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
      }

      return {
        ok: false,
        error: "Usuário ou senha inválidos. Utilize as credenciais do Firebase ou o usuário 'admin' em desenvolvimento.",
      };
    }

    // Firebase ativo: apenas contas de administrador (e-mail + senha) entram.
    return {
      ok: false,
      error: "Informe o e-mail e a senha de uma conta de administrador.",
    };
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

  async logout(): Promise<void> {
    const auth = getFirebaseAuth();
    if (auth) {
      try {
        await signOut(auth);
      } catch {
        // ignora
      }
    }
    try {
      window.sessionStorage.removeItem(DEV_SESSION_KEY);
    } catch {
      // Ignora erro de sessionStorage.
    }
  },
};
