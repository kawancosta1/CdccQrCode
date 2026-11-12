import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { isFirebaseConfigured } from "../../../lib/firebase";
import { useAdminAuth } from "../../context/adminAuthStore";
import style from "../../styles/admin.module.css";

export function AdminLogin() {
  const { user, isDevMode, login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isOnlineFirebase = isFirebaseConfigured();
  const rawFrom = (location.state as { from?: string } | null)?.from;
  const redirectTo =
    rawFrom && rawFrom.startsWith("/admin") && rawFrom !== "/admin/login" ? rawFrom : "/admin";

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await login(username, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError("");
      navigate(redirectTo, { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={style.loginWrapper}>
      <section className={style.loginCard} aria-labelledby="admin-login-title">
        <div className={style.loginHeader}>
          <span className={style.loginBadge}>
            <ShieldCheck size={15} aria-hidden="true" />
            Administração CDCC
          </span>
          <h1 id="admin-login-title" className={style.loginTitle}>
            Acesso Administrativo
          </h1>
          <p className={style.loginSubtitle}>
            Entre para gerenciar livros, estantes, salas e setores do QRCodeCDCC.
          </p>
        </div>

        {isOnlineFirebase ? (
          <div className={style.devNotice} style={{ borderColor: "#86efac", backgroundColor: "#f0fdf4", color: "#166534" }} role="status">
            <CheckCircle2 size={16} aria-hidden="true" style={{ color: "#16a34a" }} />
            <span>
              <strong>Firebase Auth Ativo:</strong> insira seu e-mail e senha de administrador para autenticar com segurança.
            </span>
          </div>
        ) : isDevMode ? (
          <div className={style.devNotice} role="note">
            <Lock size={15} aria-hidden="true" />
            <span>
              <strong>Modo Desenvolvimento:</strong> autenticação local ativa (usuário{" "}
              <code>admin</code> / senha <code>cdcc-admin-dev</code>).
            </span>
          </div>
        ) : (
          <div className={style.devNotice} role="status">
            <Lock size={15} aria-hidden="true" />
            <span>
              <strong>Modo Demonstração (Sem SQL/Firebase):</strong> entre com{" "}
              <code>admin</code> / <code>cdcc-admin-dev</code> para testar o painel. Alterações
              ficam salvas apenas no seu navegador até conectar Firebase ou SQL.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={style.loginForm} noValidate>
          <fieldset disabled={submitting} className={style.formFieldset}>
            <div className={style.fieldGroup}>
              <label htmlFor="admin-username" className={style.fieldLabel}>
                Usuário
              </label>
              <input
                id="admin-username"
                type="text"
                autoComplete="username"
                className={style.input}
                placeholder="admin"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "admin-login-error" : undefined}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError("");
                }}
                required
              />
            </div>

            <div className={style.fieldGroup}>
              <label htmlFor="admin-password" className={style.fieldLabel}>
                Senha
              </label>
              <div className={style.passwordWrap}>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={style.passwordInput}
                  placeholder="Digite sua senha"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "admin-login-error" : undefined}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  required
                />
                <button
                  type="button"
                  className={style.eyeBtn}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ocultar senha" : "Visualizar senha"}
                >
                  {showPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div id="admin-login-error" className={style.errorBanner} role="alert">
                {error}
              </div>
            )}

            <button type="submit" className={style.primaryBtnFull} disabled={submitting}>
              {submitting ? "Autenticando..." : "Entrar no painel"}
            </button>
          </fieldset>
        </form>
      </section>
    </div>
  );
}
