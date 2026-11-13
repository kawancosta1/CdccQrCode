import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { ExternalLink, Menu, Search, X } from "lucide-react";
import {
  SearchAutocompleteDropdown,
  type AutocompleteEntry,
} from "../SearchAutocompleteDropdown";
import { UniversalAccessibilityIcon } from "../icons/UniversalAccessibilityIcon";
import { useAccessibility } from "../../context/accessibilityStore";
import { useBookSearchContext } from "../../context/bookSearchStore";
import { useSiteConfig } from "../../context/siteConfigStore";
import { SEASON_METADATA } from "../../domain/seasonEngine";
import { getCustomPages } from "../../services/pagesService";
import type { CustomPage } from "../../types/content";
import logoCdcc from "../img/CdccLogo.webp";
import style from "./style.module.css";

interface NavSearchFormProps {
  inputId: string;
  formClassName: string;
  ariaLabel: string;
  value: string;
  hasError: boolean;
  errorId?: string;
  entries: AutocompleteEntry[];
  dedalusSearchUrl: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onSelectEntry: (entry: AutocompleteEntry) => void;
}

function NavSearchForm({
  inputId,
  formClassName,
  ariaLabel,
  value,
  hasError,
  errorId,
  entries,
  dedalusSearchUrl,
  onChange,
  onClear,
  onSubmit,
  onSelectEntry,
}: NavSearchFormProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || entries.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % entries.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? entries.length - 1 : prev - 1));
    } else if (e.key === "Enter" && activeIndex >= 0 && activeIndex < entries.length) {
      e.preventDefault();
      setOpen(false);
      onSelectEntry(entries[activeIndex]);
      setActiveIndex(-1);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <form
      className={formClassName}
      onSubmit={(e) => {
        setOpen(false);
        setActiveIndex(-1);
        onSubmit(e);
      }}
      role="search"
      aria-label={ariaLabel}
    >
      <div className={style.searchInputWrapper} style={{ position: "relative" }}>
        <Search size={16} className={style.searchIcon} aria-hidden="true" />
        <label htmlFor={inputId} className="sr-only">
          Pesquisar código Dedalus ou nome do livro
        </label>
        <input
          id={inputId}
          type="search"
          placeholder="Nome, autor ou código (ex: 530)"
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={style.searchInput}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={handleKeyDown}
        />
        {value && (
          <button
            type="button"
            className={style.clearBtn}
            onClick={() => {
              onClear();
              setOpen(false);
              setActiveIndex(-1);
            }}
            aria-label="Limpar busca"
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}
        {open && value.trim().length >= 2 && (
          <SearchAutocompleteDropdown
            entries={entries}
            activeIndex={activeIndex}
            searchValue={value}
            dedalusSearchUrl={dedalusSearchUrl}
            onSelectEntry={(entry) => {
              setOpen(false);
              setActiveIndex(-1);
              onSelectEntry(entry);
            }}
            onHoverIndex={setActiveIndex}
          />
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
  { to: "/vestibular", label: "Vestibular", end: false },
  { to: "/espacoludico", label: "Espaço Lúdico", end: false },
] as const;

/**
 * Barra de navegação principal com acesso às seções e busca rápida por código Dedalus.
 */
export function Nav() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPages, setMenuPages] = useState<CustomPage[]>([]);
  const {
    config,
    getImageSrc,
    activeSeason,
    visitorParticlesEnabled,
    toggleVisitorParticles,
  } = useSiteConfig();
  const { isPanelOpen, activeCount, togglePanel } = useAccessibility();
  const {
    searchValue,
    searchError,
    autocompleteSuggestions,
    nameSuggestions,
    matchedNameOptions,
    dedalusSearchUrl,
    handleSearchChange,
    submitSearch,
    clearSearch,
  } = useBookSearchContext();

  const dropdownEntries: AutocompleteEntry[] = [
    ...nameSuggestions.map((item): AutocompleteEntry => ({ type: "name", item })),
    ...autocompleteSuggestions.map((code): AutocompleteEntry => ({ type: "code", code })),
  ];

  const handleSelectDropdownEntry = (entry: AutocompleteEntry) => {
    setMenuOpen(false);
    if (entry.type === "name") {
      submitSearch(entry.item.code, entry.item);
    } else {
      submitSearch(entry.code);
    }
  };

  useEffect(() => {
    let active = true;
    getCustomPages(true)
      .then((pages) => {
        if (active) setMenuPages(pages.filter((p) => p.mostrarNoMenu));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

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
      {menuPages.map((pg) => (
        <NavLink
          key={pg.id}
          to={`/p/${pg.slug}`}
          className={navLinkClass}
          onClick={onNavigate}
        >
          {pg.titulo}
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
  const resolvedLogo = getImageSrc("bentinho_logo", config.logoUrl || logoCdcc);

  return (
    <header className={style.header}>
      {config.noticeBanner.enabled && config.noticeBanner.text && (
        <div
          role="region"
          aria-label="Aviso importante"
          style={{
            backgroundColor: config.noticeBanner.color || "#145399",
            color: "#ffffff",
            padding: "0.45rem 1rem",
            fontSize: "0.84rem",
            fontWeight: 600,
            textAlign: "center",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.65rem",
          }}
        >
          <span>{config.noticeBanner.text}</span>
          {config.noticeBanner.linkUrl && (
            <Link
              to={config.noticeBanner.linkUrl}
              style={{
                color: "#ffffff",
                textDecoration: "underline",
                fontWeight: 800,
              }}
            >
              {config.noticeBanner.linkLabel || "Saiba mais"} →
            </Link>
          )}
        </div>
      )}
      <nav className={style.navBar} aria-label="Navegação principal">
        <div className={style.navInner}>
          <Link
            to="/"
            className={style.brandLink}
            onClick={closeMenu}
            aria-label={`${config.portalName} — Página inicial`}
          >
            <img src={resolvedLogo} alt={`Logo ${config.portalName}`} className={style.logo} />
          </Link>

          <NavSearchForm
            inputId="nav-search-desktop"
            formClassName={style.desktopSearchForm}
            ariaLabel="Busca rápida por nome ou código Dedalus"
            value={searchValue}
            hasError={Boolean(searchError)}
            errorId={errorBannerId}
            entries={dropdownEntries}
            dedalusSearchUrl={dedalusSearchUrl}
            onChange={handleSearchChange}
            onClear={clearSearch}
            onSubmit={handleSubmit}
            onSelectEntry={handleSelectDropdownEntry}
          />

          <div className={style.desktopLinks}>
            {renderLinks()}
            {activeSeason && (
              <button
                type="button"
                className={style.a11yTriggerBtn}
                onClick={toggleVisitorParticles}
                aria-pressed={visitorParticlesEnabled}
                aria-label={`${SEASON_METADATA[activeSeason].badgeText} — ${
                  visitorParticlesEnabled ? "Desativar" : "Ativar"
                } efeitos visuais da estação`}
                title={`${SEASON_METADATA[activeSeason].badgeText} — Clique para ${
                  visitorParticlesEnabled ? "pausar" : "ativar"
                } os efeitos da estação`}
                style={{
                  minWidth: "40px",
                  padding: "0.35rem 0.65rem",
                  opacity: visitorParticlesEnabled ? 1 : 0.65,
                }}
              >
                <span aria-hidden="true" style={{ fontSize: "1rem", lineHeight: 1 }}>
                  {SEASON_METADATA[activeSeason].emoji}
                </span>
              </button>
            )}
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
              <UniversalAccessibilityIcon size={18} />
              <span className={style.a11yBtnLabel}>Acessibilidade</span>
              {activeCount > 0 && (
                <span className={style.a11yBadge} aria-hidden="true">
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          <div className={style.mobileActionGroup}>
            {activeSeason && (
              <button
                type="button"
                className={style.a11yMobileBtn}
                onClick={toggleVisitorParticles}
                aria-pressed={visitorParticlesEnabled}
                aria-label={`${SEASON_METADATA[activeSeason].badgeText} — ${
                  visitorParticlesEnabled ? "Pausar" : "Ativar"
                } efeitos da estação`}
                title={`${SEASON_METADATA[activeSeason].badgeText} (${
                  visitorParticlesEnabled ? "efeitos ativos" : "efeitos pausados"
                })`}
                style={{ opacity: visitorParticlesEnabled ? 1 : 0.6 }}
              >
                <span aria-hidden="true" style={{ fontSize: "1.05rem", lineHeight: 1 }}>
                  {SEASON_METADATA[activeSeason].emoji}
                </span>
              </button>
            )}
            <button
              type="button"
              className={style.a11yMobileBtn}
              onClick={togglePanel}
              aria-expanded={isPanelOpen}
              aria-controls="a11y-drawer"
              aria-label={`Acessibilidade${activeCount > 0 ? ` (${activeCount} ativos)` : ""}`}
              title="Acessibilidade (Alt + A)"
            >
              <UniversalAccessibilityIcon size={20} />
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

        {searchError && location.pathname !== "/" && (
          <div id={errorBannerId} className={style.errorBanner} role="alert">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", flex: 1 }}>
              <span>{searchError}</span>
              {(matchedNameOptions.length > 0 || searchValue.trim().length >= 2) && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {matchedNameOptions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        submitSearch(item.code, item);
                        setMenuOpen(false);
                      }}
                      style={{
                        padding: "0.25rem 0.6rem",
                        borderRadius: "9999px",
                        border: "1px solid rgba(255,255,255,0.35)",
                        background: "rgba(255,255,255,0.14)",
                        color: "inherit",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {item.title} ({item.code})
                    </button>
                  ))}
                  {searchValue.trim().length >= 2 && (
                    <a
                      href={dedalusSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        padding: "0.25rem 0.6rem",
                        borderRadius: "9999px",
                        border: "1px solid rgba(255,255,255,0.45)",
                        background: "rgba(255,255,255,0.22)",
                        color: "inherit",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      <ExternalLink size={12} aria-hidden="true" />
                      Pesquisar &ldquo;{searchValue.trim()}&rdquo; no Dedalus USP
                    </a>
                  )}
                </div>
              )}
            </div>
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
            entries={dropdownEntries}
            dedalusSearchUrl={dedalusSearchUrl}
            onChange={handleSearchChange}
            onClear={clearSearch}
            onSubmit={handleSubmit}
            onSelectEntry={handleSelectDropdownEntry}
          />

          <div className={style.mobileLinks}>{renderLinks(closeMenu)}</div>
        </div>
      </nav>
    </header>
  );
}
