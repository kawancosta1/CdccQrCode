import { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "../../lib/firebase";
import { AuthService } from "../services/authService";
import { PermissionService } from "../services/permissionService";
import type { AdminRole, Administrator, Permission } from "../types/admin";
import { AdminAuthContext } from "./adminAuthStore";

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Administrator | null>(() => AuthService.getSavedSession());
  const isDevMode = AuthService.isDevSimulationEnabled();

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    const auth = getFirebaseAuth();
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          username: firebaseUser.email || "admin",
          displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Administrador",
          role: "super_admin",
          isSimulated: false,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const result = await AuthService.login(username, password);
    if (result.ok) {
      setUser(result.user);
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    void AuthService.logout();
    setUser(null);
  }, []);

  const simulateRole = useCallback((role: AdminRole) => {
    if (!import.meta.env.DEV) return;
    setUser((prev) => (prev ? AuthService.simulateRole(prev, role) : prev));
  }, []);

  const hasPermission = useCallback(
    (permission: Permission) => (user ? PermissionService.hasPermission(user.role, permission) : false),
    [user],
  );

  const hasAnyPermission = useCallback(
    (permissions: readonly Permission[]) =>
      user ? PermissionService.hasAnyPermission(user.role, permissions) : false,
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      isDevMode,
      login,
      logout,
      simulateRole,
      hasPermission,
      hasAnyPermission,
    }),
    [user, isDevMode, login, logout, simulateRole, hasPermission, hasAnyPermission],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
