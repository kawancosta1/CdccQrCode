import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  Compass,
  ExternalLink,
  Gamepad2,
  Home,
  Menu,
  Search,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  SearchAutocompleteDropdown,
  type AutocompleteEntry,
} from "../SearchAutocompleteDropdown";
import { EditorialScrollProgress } from "../EditorialScrollProgress";
import { LibraryLampToggle } from "../editorial";
import { UniversalAccessibilityIcon } from "../icons/UniversalAccessibilityIcon";
import { useAccessibility } from "../../context/accessibilityStore";
import { useBookSearchContext } from "../../context/bookSearchStore";
import { useSiteConfig } from "../../context/siteConfigStore";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import { SEASON_METADATA } from "../../domain/seasonEngine";
import { getCustomPages } from "../../services/pagesService";
import type { CustomPage } from "../../types/content";
import {
  isTactileSoundEnabled,
  playPaperClickSound,
  setTactileSoundEnabled,
} from "../../utils/tactileSound";
import logoCdcc from "../img/CdccLogo.webp";
import bentinhoPeekImg from "../img/Mascote/bentinhoPuxando.webp";
import style from "./style.module.css";

interface NavSearchFormProps {
  inputId: string;
  value: string;
  hasError: boolean;
  errorId?: string;
  entries: AutocompleteEntry[];
  dedalusSearchUrl: string;
  autoFocus?: boolean;
  onChange: (value: string) => void;
  onClear: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onSelectEntry: (entry: AutocompleteEntry) => void;
}

function NavSearchForm({
  inputId,
  value,
  hasError,
  errorId,
  entries,
  dedalusSearchUrl,
  autoFocus = false,
  onChange,
  onClear,
  onSubmit,
  onSelectEntry,
}: NavSearchFormProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

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
      className={style.searchForm}
      onSubmit={(e) => {
        setOpen(false);
        setActiveIndex(-1);
        onSubmit(e);
      }}
      role="search"
      aria-label="Busca rápida no acervo"
    >
      <div className={style.searchInputWrapper}>
        <Search size={16} className={style.searchIcon} aria-hidden="true" />
        <label htmlFor={inputId} className="sr-only">
          Pesquisar código Dedalus ou nome do livro
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          placeholder="Título, autor ou código (ex: 530)"
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

interface DesktopNavItemConfig {
  code: string;
  label: string;
  to?: string;
  href?: string;
  end?: boolean;
}

const INTERNAL_DESKTOP_ITEMS: DesktopNavItemConfig[] = [
  { code: "01.", label: "Início", to: "/", end: true },
  { code: "02.", label: "Mapa 3D", to: "/estantes", end: false },
  { code: "03.", label: "Vestibular", to: "/vestibular", end: false },
  { code: "04.", label: "Espaço Lúdico", to: "/espacoludico", end: false },
];

const DEDALUS_NAV_ITEM: Omit<DesktopNavItemConfig, "code"> = {
  label: "Acervo Dedalus",
  href: "https://dedalus.usp.br/",
};

/**
 * Barra de navegação editorial tátil ("Warm Academic Editorial & Tactile UI")
 * com arquitetura distinta para Desktop (Lombadas CDU + Fita Marcadora)
 * e Mobile (Dock "Livro Aberto" + Gaveta "Abertura de Capa Dura").
 */
export function Nav() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchPopoverOpen, setSearchPopoverOpen] = useState(false);
  const [a11yPopoverOpen, setA11yPopoverOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [menuPages, setMenuPages] = useState<CustomPage[]>([]);
  const { progress: scrollProgress, isScrolled } = useScrollProgress();
  const [soundEnabled, setSoundEnabled] = useState(() => isTactileSoundEnabled());
  const utilitiesRef = useRef<HTMLDivElement | null>(null);

  const {
    config,
    getImageSrc,
    activeSeason,
    visitorParticlesEnabled,
    toggleVisitorParticles,
  } = useSiteConfig();
  const {
    fontScale,
    highContrast,
    reducedMotion,
    vlibrasEnabled,
    activeCount,
    openPanel,
    setFontScale,
    setHighContrast,
    setReducedMotion,
    setVlibrasEnabled,
  } = useAccessibility();

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

  // Carrega páginas customizadas marcadas para o menu
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

  // Fecha menus/popovers com Escape ou clique fora
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchPopoverOpen(false);
        setA11yPopoverOpen(false);
        setMobileSearchOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (
        utilitiesRef.current &&
        e.target instanceof Node &&
        !utilitiesRef.current.contains(e.target)
      ) {
        setSearchPopoverOpen(false);
        setA11yPopoverOpen(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const triggerTabSound = () => {
    playPaperClickSound(reducedMotion);
  };

  const handleSelectDropdownEntry = (entry: AutocompleteEntry) => {
    setMenuOpen(false);
    setSearchPopoverOpen(false);
    setMobileSearchOpen(false);
    if (entry.type === "name") {
      submitSearch(entry.item.code, entry.item);
    } else {
      submitSearch(entry.code);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = submitSearch(searchValue);
    if (found) {
      setMenuOpen(false);
      setSearchPopoverOpen(false);
      setMobileSearchOpen(false);
    }
  };

  const closeAllOverlays = () => {
    setMenuOpen(false);
    setSearchPopoverOpen(false);
    setA11yPopoverOpen(false);
    setMobileSearchOpen(false);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setTactileSoundEnabled(next);
    if (next) {
      playPaperClickSound(reducedMotion);
    }
  };

  const errorBannerId = "nav-search-error";
  const resolvedLogo = getImageSrc("bentinho_logo", config.logoUrl || logoCdcc);

  const dynamicMenuItems: DesktopNavItemConfig[] = menuPages.map((pg, idx) => ({
    code: `${String(INTERNAL_DESKTOP_ITEMS.length + idx + 1).padStart(2, "0")}.`,
    label: pg.titulo,
    to: `/p/${pg.slug}`,
    end: false,
  }));

  const allDesktopItems: DesktopNavItemConfig[] = [
    ...INTERNAL_DESKTOP_ITEMS,
    ...dynamicMenuItems,
    {
      ...DEDALUS_NAV_ITEM,
      code: `${String(INTERNAL_DESKTOP_ITEMS.length + dynamicMenuItems.length + 1).padStart(2, "0")}.`,
    },
  ];

  const mobileExtraLinks = [
    { to: "/vestibular", label: "Obras do Vestibular", code: "04." },
    { to: "/novidades", label: "Novos no Acervo", code: "06." },
    { to: "/sugerir", label: "Sugerir Compra de Livro", code: "07." },
    ...menuPages.map((pg, idx) => ({
      to: `/p/${pg.slug}`,
      label: pg.titulo,
      code: `${String(8 + idx).padStart(2, "0")}.`,
    })),
  ];

  return (
    <>
      <header className={style.header}>
        {config.noticeBanner.enabled && config.noticeBanner.text && (
          <div
            role="region"
            aria-label="Aviso importante"
            className={style.noticeBanner}
            style={{ backgroundColor: config.noticeBanner.color || "#8a3354" }}
          >
            <span>{config.noticeBanner.text}</span>
            {config.noticeBanner.linkUrl && (
              <Link to={config.noticeBanner.linkUrl} className={style.noticeLink}>
                {config.noticeBanner.linkLabel || "Saiba mais"} →
              </Link>
            )}
          </div>
        )}

        <nav className={style.navBar} aria-label="Navegação principal">
          <div className={style.navInner}>
            {/* Identidade Editorial + Mascote Bentinho */}
            <div className={style.brandGroup}>
              <Link
                to="/"
                className={style.brandLink}
                data-scrolled={isScrolled ? "true" : "false"}
                onClick={() => {
                  triggerTabSound();
                  closeAllOverlays();
                }}
                aria-label={`${config.portalName} — Página inicial`}
              >
                <img src={resolvedLogo} alt={`Logo ${config.portalName}`} className={style.logo} />
                <span className={style.brandTextBlock}>
                  <span className={style.brandTitle}>Biblioteca CDCC</span>
                  <span className={style.brandSub}>USP São Carlos</span>
                </span>
                <span className={style.bentinhoWrap} aria-hidden="true">
                  <img src={bentinhoPeekImg} alt="" className={style.bentinhoImg} />
                </span>
              </Link>
            </div>

            {/* Arquitetura Desktop: Marcadores de Página & Lombadas CDU */}
            <div className={style.desktopNavList}>
              {allDesktopItems.map((item) =>
                item.href ? (
                  <a
                    key={item.code + item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={style.navItem}
                    onClick={triggerTabSound}
                  >
                    <span className={style.ribbonPeek} aria-hidden="true" />
                    <span className={style.catalogIndex}>{item.code}</span>
                    <span>{item.label}</span>
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                ) : (
                  <NavLink
                    key={item.to}
                    to={item.to ?? "/"}
                    end={item.end}
                    className={({ isActive }) =>
                      `${style.navItem} ${isActive ? style.navItemActive : ""}`
                    }
                    onClick={() => {
                      triggerTabSound();
                      closeAllOverlays();
                    }}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive ? (
                          <motion.span
                            layoutId="nav-active-ribbon"
                            className={style.activeRibbon}
                            transition={{ type: "spring", stiffness: 320, damping: 26 }}
                            aria-hidden="true"
                          />
                        ) : (
                          <span className={style.ribbonPeek} aria-hidden="true" />
                        )}
                        <span className={style.catalogIndex}>{item.code}</span>
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ),
              )}
            </div>

            {/* Utilitários à Direita (Desktop): Carimbo Busca + Popover Acessibilidade */}
            <div className={style.desktopUtilities} ref={utilitiesRef}>
              <button
                type="button"
                className={`${style.stampBtn} ${searchPopoverOpen ? style.stampBtnActive : ""}`}
                onClick={() => {
                  triggerTabSound();
                  setSearchPopoverOpen((prev) => !prev);
                  setA11yPopoverOpen(false);
                }}
                aria-expanded={searchPopoverOpen}
                aria-label="Abrir busca rápida"
              >
                <Search size={15} aria-hidden="true" />
                <span>Buscar</span>
              </button>

              <button
                type="button"
                className={`${style.stampBtn} ${a11yPopoverOpen ? style.stampBtnActive : ""}`}
                onClick={() => {
                  triggerTabSound();
                  setA11yPopoverOpen((prev) => !prev);
                  setSearchPopoverOpen(false);
                }}
                aria-expanded={a11yPopoverOpen}
                aria-label={`Controles de acessibilidade e tema${
                  activeCount > 0 ? ` (${activeCount} ativos)` : ""
                }`}
                title="Acessibilidade e Tema (Alt + A)"
              >
                <UniversalAccessibilityIcon size={17} />
                {activeCount > 0 && (
                  <span className={style.a11yBadge} aria-hidden="true">
                    {activeCount}
                  </span>
                )}
              </button>

              {searchPopoverOpen && (
                <div
                  className={style.popoverPanel}
                  role="dialog"
                  aria-label="Busca rápida no acervo"
                >
                  <div className={style.popoverHeader}>
                    <h2 className={style.popoverTitle}>Busca Rápida Dedalus / CDU</h2>
                    <button
                      type="button"
                      className={style.popoverClose}
                      onClick={() => setSearchPopoverOpen(false)}
                      aria-label="Fechar busca"
                    >
                      <X size={15} aria-hidden="true" />
                    </button>
                  </div>
                  <NavSearchForm
                    inputId="nav-search-desktop"
                    value={searchValue}
                    hasError={Boolean(searchError)}
                    errorId={errorBannerId}
                    entries={dropdownEntries}
                    dedalusSearchUrl={dedalusSearchUrl}
                    autoFocus
                    onChange={handleSearchChange}
                    onClear={clearSearch}
                    onSubmit={handleSubmit}
                    onSelectEntry={handleSelectDropdownEntry}
                  />
                </div>
              )}

              {a11yPopoverOpen && (
                <div
                  className={style.popoverPanel}
                  role="dialog"
                  aria-label="Controles rápidos de acessibilidade"
                >
                  <div className={style.popoverHeader}>
                    <h2 className={style.popoverTitle}>Leitura, Tema &amp; Acessibilidade</h2>
                    <button
                      type="button"
                      className={style.popoverClose}
                      onClick={() => setA11yPopoverOpen(false)}
                      aria-label="Fechar controles"
                    >
                      <X size={15} aria-hidden="true" />
                    </button>
                  </div>

                  <div className={style.a11yGrid}>
                    <div className={style.a11yRow}>
                      <span>Tamanho do texto</span>
                      <div className={style.fontScaleGroup}>
                        {(["100", "115", "130"] as const).map((scale) => (
                          <button
                            key={scale}
                            type="button"
                            className={`${style.miniChoiceBtn} ${
                              fontScale === scale ? style.miniChoiceBtnActive : ""
                            }`}
                            onClick={() => setFontScale(scale)}
                          >
                            {scale}%
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={style.a11yRow}>
                      <span>Alto Contraste</span>
                      <LibraryLampToggle
                        lit={highContrast}
                        onToggle={() => setHighContrast(!highContrast)}
                        label={highContrast ? "Ativo" : "Desativado"}
                      />
                    </div>

                    <div className={style.a11yRow}>
                      <span>Reduzir Movimento</span>
                      <button
                        type="button"
                        className={`${style.miniChoiceBtn} ${
                          reducedMotion ? style.miniChoiceBtnActive : ""
                        }`}
                        aria-pressed={reducedMotion}
                        onClick={() => setReducedMotion(!reducedMotion)}
                      >
                        {reducedMotion ? "Ativo" : "Normal"}
                      </button>
                    </div>

                    <div className={style.a11yRow}>
                      <span>VLibras (Libras)</span>
                      <button
                        type="button"
                        className={`${style.miniChoiceBtn} ${
                          vlibrasEnabled ? style.miniChoiceBtnActive : ""
                        }`}
                        aria-pressed={vlibrasEnabled}
                        onClick={() => setVlibrasEnabled(!vlibrasEnabled)}
                      >
                        {vlibrasEnabled ? "Visível" : "Oculto"}
                      </button>
                    </div>

                    {activeSeason && (
                      <div className={style.a11yRow}>
                        <span>
                          {SEASON_METADATA[activeSeason].emoji}{" "}
                          {SEASON_METADATA[activeSeason].badgeText}
                        </span>
                        <button
                          type="button"
                          className={`${style.miniChoiceBtn} ${
                            visitorParticlesEnabled ? style.miniChoiceBtnActive : ""
                          }`}
                          aria-pressed={visitorParticlesEnabled}
                          onClick={toggleVisitorParticles}
                        >
                          {visitorParticlesEnabled ? "Efeitos ON" : "Pausado"}
                        </button>
                      </div>
                    )}

                    <div className={style.a11yRow}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                        {soundEnabled ? (
                          <Volume2 size={14} aria-hidden="true" />
                        ) : (
                          <VolumeX size={14} aria-hidden="true" />
                        )}
                        Som tátil de papel
                      </span>
                      <button
                        type="button"
                        className={`${style.miniChoiceBtn} ${
                          soundEnabled ? style.miniChoiceBtnActive : ""
                        }`}
                        aria-pressed={soundEnabled}
                        onClick={handleToggleSound}
                      >
                        {soundEnabled ? "Ligado" : "Mudo"}
                      </button>
                    </div>

                    <button
                      type="button"
                      className={style.a11yFullBtn}
                      onClick={() => {
                        setA11yPopoverOpen(false);
                        openPanel();
                      }}
                    >
                      Abrir painel completo de Acessibilidade (Alt + A)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Top Bar Minimalista (< 768px) */}
            <div className={style.mobileTopActions}>
              <button
                type="button"
                className={style.mobileIconBtn}
                onClick={() => {
                  triggerTabSound();
                  setMobileSearchOpen((prev) => !prev);
                }}
                aria-expanded={mobileSearchOpen}
                aria-label="Busca rápida"
              >
                {mobileSearchOpen ? <X size={18} aria-hidden="true" /> : <Search size={18} aria-hidden="true" />}
              </button>

              <button
                type="button"
                className={style.mobileIconBtn}
                onClick={() => {
                  triggerTabSound();
                  openPanel();
                }}
                aria-label={`Acessibilidade${activeCount > 0 ? ` (${activeCount} ativos)` : ""}`}
                title="Acessibilidade"
              >
                <UniversalAccessibilityIcon size={19} />
                {activeCount > 0 && (
                  <span
                    className={style.a11yBadge}
                    style={{ position: "absolute", top: -5, right: -5 }}
                    aria-hidden="true"
                  >
                    {activeCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {mobileSearchOpen && (
            <div className={style.mobileSearchSheet}>
              <NavSearchForm
                inputId="nav-search-mobile"
                value={searchValue}
                hasError={Boolean(searchError)}
                errorId={errorBannerId}
                entries={dropdownEntries}
                dedalusSearchUrl={dedalusSearchUrl}
                autoFocus
                onChange={handleSearchChange}
                onClear={clearSearch}
                onSubmit={handleSubmit}
                onSelectEntry={handleSelectDropdownEntry}
              />
            </div>
          )}

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
                          closeAllOverlays();
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
                    <Link
                      to="/sugerir"
                      onClick={clearSearch}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        padding: "0.25rem 0.6rem",
                        borderRadius: "9999px",
                        border: "1px solid rgba(255,255,255,0.45)",
                        background: "rgba(255,255,255,0.16)",
                        color: "inherit",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Sugerir compra
                    </Link>
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

          {/* Linha dupla editorial + Barra de progresso editorial no Desktop */}
          <div className={style.doubleRuleBottom} aria-hidden="true" />
          <div className={style.desktopShelfWrap}>
            <EditorialScrollProgress
              progress={scrollProgress}
              variant="desktop"
              reducedMotion={reducedMotion}
            />
          </div>
        </nav>
      </header>

      {/* Mobile Bottom Navigation Dock ("Livro Aberto") */}
      <nav className={style.mobileDock} aria-label="Navegação rápida mobile">
        <div className={style.mobileDockEdgeWrap}>
          <EditorialScrollProgress
            progress={scrollProgress}
            variant="mobile"
            reducedMotion={reducedMotion}
          />
        </div>

        <div className={style.mobileDockGrid}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${style.dockItem} ${isActive ? style.dockItemActive : ""}`
            }
            onClick={() => {
              triggerTabSound();
              closeAllOverlays();
            }}
          >
            <Home size={19} aria-hidden="true" />
            <span>Início</span>
          </NavLink>

          <a
            href="https://dedalus.usp.br/"
            target="_blank"
            rel="noopener noreferrer"
            className={style.dockItem}
            onClick={triggerTabSound}
          >
            <BookOpen size={19} aria-hidden="true" />
            <span>Dedalus</span>
          </a>

          <NavLink
            to="/estantes"
            className={({ isActive }) =>
              `${style.dockItem} ${style.dockCenterBtn} ${isActive ? style.dockItemActive : ""}`
            }
            onClick={() => {
              triggerTabSound();
              closeAllOverlays();
            }}
          >
            <Compass size={20} aria-hidden="true" />
            <span>Mapa 3D</span>
          </NavLink>

          <NavLink
            to="/espacoludico"
            className={({ isActive }) =>
              `${style.dockItem} ${isActive ? style.dockItemActive : ""}`
            }
            onClick={() => {
              triggerTabSound();
              closeAllOverlays();
            }}
          >
            <Gamepad2 size={19} aria-hidden="true" />
            <span>Lúdico</span>
          </NavLink>

          <button
            type="button"
            className={`${style.dockItem} ${menuOpen ? style.dockItemActive : ""}`}
            onClick={() => {
              triggerTabSound();
              setMenuOpen((prev) => !prev);
            }}
            aria-expanded={menuOpen}
            aria-controls="mobile-hardcover-drawer"
          >
            {menuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
            <span>Mais</span>
          </button>
        </div>
      </nav>

      {/* Mobile Full Menu ("Abertura de Capa Dura") */}
      <div
        id="mobile-hardcover-drawer"
        className={`${style.hardcoverBackdrop} ${menuOpen ? style.hardcoverBackdropOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu completo da biblioteca"
        aria-hidden={!menuOpen}
        onClick={(e) => {
          if (e.target === e.currentTarget) setMenuOpen(false);
        }}
      >
        <div className={style.hardcoverBook}>
          <div className={style.hardcoverHeader}>
            <h2 className={style.hardcoverTitle}>Índice do Portal</h2>
            <button
              type="button"
              className={style.popoverClose}
              onClick={() => setMenuOpen(false)}
              aria-label="Fechar índice"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          <div className={style.hardcoverList}>
            {mobileExtraLinks.map((item, idx) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${style.staggerPageLink} ${isActive ? style.staggerPageLinkActive : ""}`
                }
                style={{ "--stagger-index": idx } as CSSProperties}
                onClick={() => {
                  triggerTabSound();
                  setMenuOpen(false);
                }}
              >
                <span>
                  <span className={style.catalogIndex} style={{ marginRight: "0.45rem" }}>
                    {item.code}
                  </span>
                  {item.label}
                </span>
              </NavLink>
            ))}

            <button
              type="button"
              className={style.staggerPageLink}
              style={{ "--stagger-index": mobileExtraLinks.length } as CSSProperties}
              onClick={() => {
                triggerTabSound();
                setMenuOpen(false);
                openPanel();
              }}
            >
              <span>Acessibilidade &amp; Leitura</span>
              <UniversalAccessibilityIcon size={17} />
            </button>

            {activeSeason && (
              <button
                type="button"
                className={style.staggerPageLink}
                style={{ "--stagger-index": mobileExtraLinks.length + 1 } as CSSProperties}
                onClick={() => {
                  triggerTabSound();
                  toggleVisitorParticles();
                }}
              >
                <span>
                  {SEASON_METADATA[activeSeason].emoji} {SEASON_METADATA[activeSeason].badgeText}
                </span>
                <Sparkles size={15} aria-hidden="true" />
              </button>
            )}

            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `${style.staggerPageLink} ${isActive ? style.staggerPageLinkActive : ""}`
              }
              style={{ "--stagger-index": mobileExtraLinks.length + 2 } as CSSProperties}
              onClick={() => {
                triggerTabSound();
                setMenuOpen(false);
              }}
            >
              <span>
                <span className={style.catalogIndex} style={{ marginRight: "0.45rem" }}>
                  ADM
                </span>
                Painel Administrativo
              </span>
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
}
