import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { ExternalLink, Menu, Search, X } from "lucide-react";
import { useBookSearchContext } from "../../context/bookSearchStore";
import logoCdcc from "../img/CdccLogo.webp";
import style from "./style.module.css";

interface NavSearchFormProps {
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
        <input
          type="search"
          placeholder="Código Dedalus (ex: 530)"
          aria-label="Pesquisar código de classificação Dedalus"
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
  const {
    searchValue,
    searchError,
    handleSearchChange,
    submitSearch,
    clearSearch,
  } = useBookSearchContext();

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
            formClassName={style.desktopSearchForm}
            ariaLabel="Busca rápida por código Dedalus"
            value={searchValue}
            hasError={Boolean(searchError)}
            errorId={errorBannerId}
            onChange={handleSearchChange}
            onClear={clearSearch}
            onSubmit={handleSubmit}
          />

          <div className={style.desktopLinks}>{renderLinks()}</div>

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
