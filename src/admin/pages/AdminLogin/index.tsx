import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
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

  const rawFrom = (location.state as { from?: string } | null)?.from;
  const redirectTo =
    rawFrom && rawFrom.startsWith("/admin") && rawFrom !== "/admin/login" ? rawFrom : "/admin";

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = login(username, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError("");
    navigate(redirectTo, { replace: true });
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

        {!isDevMode && (
          <div className={style.warningBanner} role="status">
            <AlertCircle size={18} aria-hidden="true" />
            <span>
              Ambiente de produção: a autenticação simulada está desativada. Aguardando integração
              com o backend oficial.
            </span>
          </div>
        )}

        {isDevMode && (
          <div className={style.devNotice} role="note">
            <Lock size={15} aria-hidden="true" />
            <span>
              <strong>Modo Desenvolvimento:</strong> autenticação simulada via variáveis{" "}
              <code>.env.local</code> (usuário padrão: <code>admin</code>). Não representa segurança
              real de produção.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={style.loginForm} noValidate>
          <fieldset disabled={!isDevMode} className={style.formFieldset}>
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

            <button type="submit" className={style.primaryBtnFull}>
              Entrar no painel
            </button>
          </fieldset>
        </form>
      </section>
    </div>
  );
}
