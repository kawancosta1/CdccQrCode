import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Accessibility, ExternalLink, Menu, Search, X } from "lucide-react";
import { useAccessibility } from "../../context/accessibilityStore";
import { useBookSearchContext } from "../../context/bookSearchStore";
import logoCdcc from "../img/CdccLogo.webp";
import style from "./style.module.css";

interface NavSearchFormProps {
  inputId: string;
  formClassName: string;
  ariaLabel: string;
  value: string;
  hasError: boolean;
  errorId?: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

function NavSearchForm({
  inputId,
  formClassName,
  ariaLabel,
  value,
  hasError,
  errorId,
  onChange,
  onClear,
  onSubmit,
}: NavSearchFormProps) {
  return (
    <form className={formClassName} onSubmit={onSubmit} role="search" aria-label={ariaLabel}>
      <div className={style.searchInputWrapper}>
        <Search size={16} className={style.searchIcon} aria-hidden="true" />
        <label htmlFor={inputId} className="sr-only">
          Pesquisar código de classificação Dedalus
        </label>
        <input
          id={inputId}
          type="search"
          placeholder="Código Dedalus (ex: 530)"
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={style.searchInput}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            type="button"
            className={style.clearBtn}
            onClick={onClear}
            aria-label="Limpar busca"
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>
      <button type="submit" className={style.searchSubmitBtn}>
        Buscar
      </button>
    </form>
  );
}

const INTERNAL_NAV_LINKS = [
  { to: "/", label: "Início", end: true },
  { to: "/estantes", label: "Estantes", end: false },
  { to: "/espacoludico", label: "Espaço Lúdico", end: false },
] as const;

/**
 * Barra de navegação principal com acesso às seções e busca rápida por código Dedalus.
 */
export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isPanelOpen, activeCount, togglePanel } = useAccessibility();
  const {
    searchValue,
    searchError,
    handleSearchChange,
    submitSearch,
    clearSearch,
  } = useBookSearchContext();

  useEffect(() => {
    if (!menuOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [menuOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = submitSearch(searchValue);
    if (found) {
      setMenuOpen(false);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${style.navItem} ${isActive ? style.navItemActive : ""}`;

  const renderLinks = (onNavigate?: () => void) => (
    <>
      {INTERNAL_NAV_LINKS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={navLinkClass}
          onClick={onNavigate}
        >
          {item.label}
        </NavLink>
      ))}
      <a
        href="https://dedalus.usp.br/"
        target="_blank"
        rel="noopener noreferrer"
        className={style.navItem}
        onClick={onNavigate}
      >
        Dedalus USP
        <ExternalLink size={14} aria-hidden="true" />
      </a>
    </>
  );

  const errorBannerId = "nav-search-error";

  return (
    <header className={style.header}>
      <nav className={style.navBar} aria-label="Navegação principal">
        <div className={style.navInner}>
          <Link
            to="/"
            className={style.brandLink}
            onClick={closeMenu}
            aria-label="QRCodeCDCC — Página inicial"
          >
            <img src={logoCdcc} alt="Logo Oficial do CDCC" className={style.logo} />
          </Link>

          <NavSearchForm
            inputId="nav-search-desktop"
            formClassName={style.desktopSearchForm}
            ariaLabel="Busca rápida por código Dedalus"
            value={searchValue}
            hasError={Boolean(searchError)}
            errorId={errorBannerId}
            onChange={handleSearchChange}
            onClear={clearSearch}
            onSubmit={handleSubmit}
          />

          <div className={style.desktopLinks}>
            {renderLinks()}
            <button
              type="button"
              className={style.a11yTriggerBtn}
              onClick={togglePanel}
              aria-expanded={isPanelOpen}
              aria-controls="a11y-drawer"
              aria-label={`Abrir painel de acessibilidade${
                activeCount > 0 ? ` (${activeCount} recursos ativos)` : ""
              }`}
              title="Acessibilidade (Alt + A)"
            >
              <Accessibility size={17} aria-hidden="true" />
              <span className={style.a11yBtnLabel}>Acessibilidade</span>
              {activeCount > 0 && (
                <span className={style.a11yBadge} aria-hidden="true">
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          <div className={style.mobileActionGroup}>
            <button
              type="button"
              className={style.a11yMobileBtn}
              onClick={togglePanel}
              aria-expanded={isPanelOpen}
              aria-controls="a11y-drawer"
              aria-label={`Acessibilidade${activeCount > 0 ? ` (${activeCount} ativos)` : ""}`}
              title="Acessibilidade (Alt + A)"
            >
              <Accessibility size={20} aria-hidden="true" />
              {activeCount > 0 && (
                <span className={style.a11yBadge} aria-hidden="true">
                  {activeCount}
                </span>
              )}
            </button>

            <button
              type="button"
              className={style.hamburger}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-menu"
            >
              {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {searchError && (
          <div id={errorBannerId} className={style.errorBanner} role="alert">
            <span>{searchError}</span>
            <button
              type="button"
              onClick={clearSearch}
              className={style.errorClose}
              aria-label="Fechar aviso"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        )}

        <div
          id="mobile-nav-menu"
          className={`${style.mobileDrawer} ${menuOpen ? style.mobileDrawerOpen : ""}`}
        >
          <NavSearchForm
            inputId="nav-search-mobile"
            formClassName={style.mobileSearchForm}
            ariaLabel="Busca rápida mobile"
            value={searchValue}
            hasError={Boolean(searchError)}
            errorId={errorBannerId}
            onChange={handleSearchChange}
            onClear={clearSearch}
            onSubmit={handleSubmit}
          />

          <div className={style.mobileLinks}>{renderLinks(closeMenu)}</div>
        </div>
      </nav>
    </header>
  );
}
