import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Gamepad2,
  GraduationCap,
  Library,
  Maximize2,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { HeroCarousel, type HeroSlide } from "../../components/HeroCarousel";
import { ImageLightbox } from "../../components/ImageLightbox";
import dedalus4 from "../../components/img/Dedalus4.webp";
import dedalus5 from "../../components/img/Dedalus5.webp";
import dedalus6 from "../../components/img/Dedalus6.webp";
import BentinhoPensando from "../../components/img/Mascote/pensando.webp";
import { useBookSearchContext } from "../../context/bookSearchStore";
import { useSiteConfig } from "../../context/siteConfigStore";
import { CarouselService, DEFAULT_CAROUSEL_SLIDES } from "../../services/carouselService";
import type { CarouselSlide } from "../../types/content";
import styles from "./style.module.css";

const EXAMPLE_CODES = [
  { code: "530", label: "530 (Física)" },
  { code: "869.3 C500", label: "869.3 C500 (Literatura)" },
  { code: "809.89283 A", label: "809.89283 A" },
  { code: "R", label: "R (Referência)" },
];

function toHeroSlide(slide: CarouselSlide): HeroSlide {
  const isExternal =
    slide.linkDestino.startsWith("http://") || slide.linkDestino.startsWith("https://");
  return {
    id: slide.id,
    eyebrow: slide.eyebrow || "Biblioteca CDCC • USP",
    title: slide.titulo,
    description: slide.descricao || "",
    ctaLabel: slide.textoBotao || "Explorar",
    ...(isExternal ? { href: slide.linkDestino } : { to: slide.linkDestino }),
    image: slide.imagemUrl,
    imageAlt: slide.imagemAlt || slide.titulo,
    objectPosition: slide.posicaoObjeto || "center 45%",
    overlayOpacity: slide.overlayOpacity,
    textAlign: slide.textAlign,
    accentColor: slide.accentColor,
    openInNewTab: slide.openInNewTab,
    hideButton: slide.hideButton,
  };
}

interface TutorialPhase {
  id: string;
  phaseNumber: string;
  tabLabel: string;
  tagline: string;
  title: string;
  description: string;
  bullets: string[];
  callout: {
    label: string;
    value: string;
  };
  image: string;
  imageAlt: string;
  badge: string;
  primaryAction: {
    type: "copy" | "search" | "link";
    label: string;
    payload?: string;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}

const TUTORIAL_PHASES: TutorialPhase[] = [
  {
    id: "fase-dedalus",
    phaseNumber: "01",
    tabLabel: "Catálogo Dedalus",
    tagline: "Fase 01 • Consulta Bibliográfica",
    title: "Localize a obra e anote o código CDU",
    description:
      "No catálogo Dedalus da USP, busque pelo título ou autor. Na ficha catalográfica do exemplar da Unidade CDCC, copie a classificação temática que orienta sua localização física.",
    bullets: [
      "Selecione Catálogo Geral para pesquisar no sistema integrado da USP",
      "Confirme se a biblioteca indicada nos resultados é a Unidade CDCC",
      "Copie apenas o código numérico (ex: 530), sem necessidade do número de tombo",
    ],
    callout: {
      label: "Código CDU identificado",
      value: "530 (Física)",
    },
    image: dedalus4,
    imageAlt: "Ficha catalográfica do Dedalus destacando o código de classificação 530",
    badge: "dedalus.usp.br / catalogo",
    primaryAction: {
      type: "copy",
      label: "Copiar código de exemplo (530)",
      payload: "530",
    },
    secondaryAction: {
      label: "Abrir Dedalus USP",
      href: "https://dedalus.usp.br/",
    },
  },
  {
    id: "fase-qrcodecdcc",
    phaseNumber: "02",
    tabLabel: "Busca Inteligente",
    tagline: "Fase 02 • Processamento em Milissegundos",
    title: "Insira o código no nosso buscador",
    description:
      "Cole o código na barra principal do QRCodeCDCC. Nosso motor inteligente normaliza letras de Cutter, filtra complementos secundários e determina a sala e a estante exatas instantaneamente.",
    bullets: [
      "Compatível com códigos simples, decimais e cutters (ex: 869.3 C500)",
      "Sugestões por proximidade numérica quando houver variações na numeração",
      "Histórico de consultas recentes salvo localmente para agilidade",
    ],
    callout: {
      label: "Interpretação automática",
      value: "Sala 1 • Estante 17",
    },
    image: dedalus5,
    imageAlt: "Barra de busca do QRCodeCDCC recebendo o código e processando o resultado",
    badge: "qrcodecdcc.usp.br / busca",
    primaryAction: {
      type: "search",
      label: "Testar busca com 530 agora",
      payload: "530",
    },
  },
  {
    id: "fase-estante",
    phaseNumber: "03",
    tabLabel: "Estante Física",
    tagline: "Fase 03 • Localização Presencial",
    title: "Siga o mapa da sala e veja a foto real",
    description:
      "Chega de dúvidas nos corredores. O QRCodeCDCC abre a planta baixa da sala com o ponto marcado e exibe a fotografia da estante física para você encontrar o exemplar de primeira.",
    bullets: [
      "Mapa visual interativo destacando a estante em destaque",
      "Fotografia real em alta definição de cada corredor e prateleira",
      "Acesso direto a regras de jogos e acervo do Espaço Lúdico",
    ],
    callout: {
      label: "Ponto físico exato",
      value: "Corredor Ciências Exatas",
    },
    image: dedalus6,
    imageAlt: "Resultado na tela com mapa da Sala 1 e fotografia da estante física",
    badge: "biblioteca / localizador",
    primaryAction: {
      type: "link",
      label: "Explorar catálogo de estantes",
      href: "/estantes",
    },
  },
];

export function Home() {
  const { config, getImageSrc } = useSiteConfig();
  const homeCfg = config.homeConfig;
  const exampleCodes =
    homeCfg.exampleCodes.length > 0 ? homeCfg.exampleCodes : EXAMPLE_CODES;
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() =>
    DEFAULT_CAROUSEL_SLIDES.map(toHeroSlide),
  );
  const [lightboxStep, setLightboxStep] = useState<{ src: string; alt: string; title: string } | null>(
    null,
  );
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    let isMounted = true;
    CarouselService.getActive()
      .then((slides) => {
        if (isMounted && slides.length > 0) {
          setHeroSlides(slides.map(toHeroSlide));
        }
      })
      .catch((err) => {
        console.warn("Falha ao carregar carrossel dinâmico:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);
  const {
    searchValue,
    searchError,
    fallbackSuggestions,
    autocompleteSuggestions,
    recentSearches,
    resultsByRoom,
    handleSearchChange,
    submitSearch,
    clearSearch,
    primaryInputRef,
  } = useBookSearchContext();

  const defaultImages = [dedalus4, dedalus5, dedalus6];
  const activeTutorialPhases: TutorialPhase[] = (
    homeCfg.tutorialPhases.filter((p) => p.enabled !== false)
  ).map((p, idx) => {
    const base = TUTORIAL_PHASES[idx];
    const resolvedImage =
      p.imageUrl ||
      getImageSrc(`tutorial_fase_${idx + 1}`, base?.image ?? defaultImages[idx % defaultImages.length]);
    return {
      id: p.id,
      phaseNumber: p.phaseNumber,
      tabLabel: p.tabLabel,
      tagline: p.tagline,
      title: p.title,
      description: p.description,
      bullets: p.bullets.length > 0 ? p.bullets : (base?.bullets ?? []),
      callout: {
        label: p.calloutLabel || base?.callout.label || "Biblioteca CDCC",
        value: p.calloutValue || base?.callout.value || "USP São Carlos",
      },
      image: resolvedImage,
      imageAlt: p.imageAlt || p.title,
      badge: p.badge || "CDCC-USP",
      primaryAction:
        p.actionLabel && p.actionUrl
          ? { type: "link", label: p.actionLabel, href: p.actionUrl }
          : (base?.primaryAction ?? { type: "link", label: "Explorar estantes", href: "/estantes" }),
      secondaryAction: base?.secondaryAction,
    };
  });

  const safePhaseIndex = Math.min(activePhaseIndex, Math.max(0, activeTutorialPhases.length - 1));
  const currentPhase = activeTutorialPhases[safePhaseIndex] ?? TUTORIAL_PHASES[0];

  const handleCopyCode = (text: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handlePhaseKeyDown = (e: React.KeyboardEvent, index: number) => {
    const total = activeTutorialPhases.length;
    if (total === 0) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setActivePhaseIndex((index + 1) % total);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setActivePhaseIndex((index - 1 + total) % total);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActivePhaseIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActivePhaseIndex(total - 1);
    }
  };

  const handleActionClick = (code?: string) => {
    if (!code) return;
    submitSearch(code);
    primaryInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    primaryInputRef.current?.focus();
  };

  const handleHeroSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitSearch(searchValue);
  };

  const handleExampleClick = (code: string) => {
    submitSearch(code);
  };

  return (
    <div className={styles.page}>
      {/* Hero Search-First */}
      <section className={styles.heroSection} aria-labelledby="hero-heading">
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>
            <Library size={15} aria-hidden="true" />
            <span>{homeCfg.heroBadge}</span>
          </div>

          <h1 id="hero-heading" className={styles.heroTitle}>
            {homeCfg.heroTitle}
          </h1>

          <p className={styles.heroSubtitle}>{homeCfg.heroSubtitle}</p>

          <form
            className={styles.heroSearchForm}
            onSubmit={handleHeroSubmit}
            role="search"
            aria-label="Localizar livro por código Dedalus"
          >
            <div className={styles.heroInputWrap}>
              <Search size={20} className={styles.heroSearchIcon} aria-hidden="true" />
              <label htmlFor="hero-book-search" className="sr-only">
                Código de classificação Dedalus
              </label>
              <input
                id="hero-book-search"
                ref={primaryInputRef}
                type="search"
                className={styles.heroInput}
                placeholder={homeCfg.searchPlaceholder}
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                aria-invalid={Boolean(searchError)}
                aria-describedby={searchError ? "hero-search-error" : "hero-search-hint"}
              />
              {searchValue && (
                <button
                  type="button"
                  className={styles.heroClearBtn}
                  onClick={clearSearch}
                  aria-label="Limpar código digitado"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              )}
            </div>

            <button type="submit" className={styles.heroSubmitBtn}>
              Localizar livro
            </button>
          </form>

          {searchError ? (
            <div id="hero-search-error" className={styles.heroError} role="alert">
              <p>{searchError}</p>
              {fallbackSuggestions.length > 0 && (
                <div className={styles.fallbackRow}>
                  <span className={styles.fallbackLabel}>Códigos próximos:</span>
                  <div className={styles.examplesList}>
                    {fallbackSuggestions.map((code) => (
                      <button
                        key={code}
                        type="button"
                        className={styles.exampleChip}
                        onClick={() => handleExampleClick(code)}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p id="hero-search-hint" className={styles.heroHint}>
              {homeCfg.searchHint}
            </p>
          )}

          {!searchError && !resultsByRoom && autocompleteSuggestions.length > 0 && (
            <div className={styles.examplesRow} aria-label="Sugestões de códigos compatíveis">
              <span className={styles.examplesLabel}>Sugestões:</span>
              <div className={styles.examplesList} role="listbox" aria-label="Códigos sugeridos">
                {autocompleteSuggestions.map((code) => (
                  <button
                    key={code}
                    type="button"
                    role="option"
                    aria-selected={false}
                    className={styles.exampleChip}
                    onClick={() => handleExampleClick(code)}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Anúncio dinâmico para leitores de tela sobre resultados ou sugestões */}
          <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {resultsByRoom
              ? `Resultados encontrados para o código ${searchValue} em ${
                  Object.keys(resultsByRoom).length
                } sala(s).`
              : autocompleteSuggestions.length > 0
                ? `${autocompleteSuggestions.length} sugestões de códigos compatíveis disponíveis.`
                : ""}
          </div>

          <div className={styles.examplesRow}>
            <span className={styles.examplesLabel}>Exemplos rápidos:</span>
            <div className={styles.examplesList}>
              {exampleCodes.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  className={styles.exampleChip}
                  onClick={() => handleExampleClick(item.code)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {recentSearches.length > 0 && (
            <div className={styles.recentRow}>
              <span className={styles.examplesLabel}>Buscas recentes:</span>
              <div className={styles.examplesList}>
                {recentSearches.map((code) => (
                  <button
                    key={code}
                    type="button"
                    className={styles.exampleChip}
                    onClick={() => handleExampleClick(code)}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Atalhos Principais */}
      {homeCfg.sectionsVisibility.quickAccess && (
        <section className={styles.section} aria-label="Acesso rápido">
          <div className={styles.quickGrid}>
            {homeCfg.quickCards.map((card) => {
              const iconEl =
                card.icon === "graduation" ? (
                  <GraduationCap size={20} aria-hidden="true" />
                ) : card.icon === "gamepad" ? (
                  <Gamepad2 size={20} aria-hidden="true" />
                ) : card.icon === "external" ? (
                  <ExternalLink size={20} aria-hidden="true" />
                ) : card.icon === "sparkles" ? (
                  <Sparkles size={20} aria-hidden="true" />
                ) : (
                  <BookOpen size={20} aria-hidden="true" />
                );
              const content = (
                <>
                  <div className={styles.quickIcon}>{iconEl}</div>
                  <div>
                    <h2 className={styles.quickTitle}>{card.title}</h2>
                    <p className={styles.quickDesc}>{card.description}</p>
                  </div>
                </>
              );
              if (card.href) {
                return (
                  <a
                    key={card.id}
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.quickCard}
                  >
                    {content}
                  </a>
                );
              }
              return (
                <Link key={card.id} to={card.to || "/estantes"} className={styles.quickCard}>
                  {content}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Destaques — Hero Carousel */}
      {homeCfg.sectionsVisibility.carousel && (
        <HeroCarousel
          slides={heroSlides}
          autoPlayEnabled={homeCfg.carouselConfig?.autoPlayEnabled ?? true}
          autoPlayMs={(homeCfg.carouselConfig?.autoPlaySeconds ?? 6) * 1000}
          showArrows={homeCfg.carouselConfig?.showArrows ?? true}
          showDots={homeCfg.carouselConfig?.showDots ?? true}
          showPauseButton={homeCfg.carouselConfig?.showPauseButton ?? true}
          heightMode={homeCfg.carouselConfig?.heightMode ?? "default"}
        />
      )}

      {/* Tutorial Editorial do Buscador (3 Fases) */}
      {homeCfg.sectionsVisibility.tutorial && (
        <section className={styles.section} aria-labelledby="tutorial-heading">
        <div className={styles.tutorialHeader}>
          <div className={styles.tutorialHeaderText}>
            <span className={styles.tutorialEyebrow}>Guia de localização</span>
            <h2 id="tutorial-heading" className={styles.sectionTitle}>
              Do catálogo da USP à estante em três passos
            </h2>
            <p className={styles.sectionSubtitle}>
              Uma experiência fluida e sem esforço para localizar qualquer livro físico no acervo do CDCC.
            </p>
          </div>
          <img
            src={getImageSrc("bentinho_logo", BentinhoPensando)}
            alt=""
            aria-hidden="true"
            className={styles.mascotHelper}
          />
        </div>

        {/* Segmented Control / Apple-style Tab Bar */}
        <div
          className={styles.segmentedControl}
          role="tablist"
          aria-label="Fases do tutorial para localizar livros"
        >
          {activeTutorialPhases.map((phase, idx) => {
            const isActive = safePhaseIndex === idx;
            return (
              <button
                key={phase.id}
                id={`phase-tab-${phase.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`phase-panel-${phase.id}`}
                tabIndex={isActive ? 0 : -1}
                className={`${styles.segmentedTab} ${isActive ? styles.segmentedTabActive : ""}`}
                onClick={() => setActivePhaseIndex(idx)}
                onKeyDown={(e) => handlePhaseKeyDown(e, idx)}
              >
                <span className={styles.segmentedNumber}>{phase.phaseNumber}</span>
                <span className={styles.segmentedLabel}>{phase.tabLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Stage Card Principal (Apple Studio Stage) */}
        <div
          id={`phase-panel-${currentPhase.id}`}
          role="tabpanel"
          aria-labelledby={`phase-tab-${currentPhase.id}`}
          className={styles.stageCard}
        >
          {/* Coluna 1: Informações e Ações */}
          <div className={styles.stageContent}>
            <div className={styles.stageHeader}>
              <span className={styles.stageTagline}>{currentPhase.tagline}</span>
              <h3 className={styles.stageTitle}>{currentPhase.title}</h3>
              <p className={styles.stageDesc}>{currentPhase.description}</p>
            </div>

            <ul className={styles.stageBullets} aria-label="Pontos essenciais">
              {currentPhase.bullets.map((bullet) => (
                <li key={bullet} className={styles.stageBulletItem}>
                  <span className={styles.bulletCheck} aria-hidden="true">
                    <Check size={14} />
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className={styles.stageActions}>
              {currentPhase.primaryAction.type === "copy" && (
                <button
                  type="button"
                  className={`${styles.primaryBtnAction} ${copiedCode ? styles.copiedBtn : ""}`}
                  onClick={() => handleCopyCode(currentPhase.primaryAction.payload || "530")}
                  aria-live="polite"
                >
                  {copiedCode ? (
                    <>
                      <Check size={15} aria-hidden="true" />
                      <span>Código 530 copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={15} aria-hidden="true" />
                      <span>{currentPhase.primaryAction.label}</span>
                    </>
                  )}
                </button>
              )}

              {currentPhase.primaryAction.type === "search" && (
                <button
                  type="button"
                  className={styles.primaryBtnAction}
                  onClick={() => handleActionClick(currentPhase.primaryAction.payload)}
                >
                  <span>{currentPhase.primaryAction.label}</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              )}

              {currentPhase.primaryAction.type === "link" && (
                <Link to="/estantes" className={styles.primaryBtnAction}>
                  <span>{currentPhase.primaryAction.label}</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              )}

              {currentPhase.secondaryAction && (
                <a
                  href={currentPhase.secondaryAction.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.secondaryBtnAction}
                >
                  <span>{currentPhase.secondaryAction.label}</span>
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          {/* Coluna 2: Mockup Visual Limpo (Studio Canvas) */}
          <div className={styles.stageVisual}>
            <div className={styles.studioFrame}>
              <div className={styles.studioBar}>
                <div className={styles.windowControls} aria-hidden="true">
                  <span className={styles.windowDot} />
                  <span className={styles.windowDot} />
                  <span className={styles.windowDot} />
                </div>
                <div className={styles.studioBadge}>{currentPhase.badge}</div>
                <button
                  type="button"
                  className={styles.studioZoomBtn}
                  onClick={() =>
                    setLightboxStep({
                      src: currentPhase.image,
                      alt: currentPhase.imageAlt,
                      title: `Fase ${currentPhase.phaseNumber}: ${currentPhase.title}`,
                    })
                  }
                  aria-label={`Ampliar captura da fase ${currentPhase.phaseNumber}: ${currentPhase.title}`}
                >
                  <Maximize2 size={14} aria-hidden="true" />
                  <span className={styles.zoomLabel}>Ampliar</span>
                </button>
              </div>

              <div className={styles.studioCanvas}>
                <button
                  type="button"
                  className={styles.studioImageBtn}
                  onClick={() =>
                    setLightboxStep({
                      src: getImageSrc(`tutorial_fase_${activePhaseIndex + 1}`, currentPhase.image),
                      alt: currentPhase.imageAlt,
                      title: `Fase ${currentPhase.phaseNumber}: ${currentPhase.title}`,
                    })
                  }
                  aria-label={`Ampliar captura da fase ${currentPhase.phaseNumber}: ${currentPhase.title}`}
                >
                  <img
                    key={currentPhase.id}
                    src={getImageSrc(`tutorial_fase_${activePhaseIndex + 1}`, currentPhase.image)}
                    alt={currentPhase.imageAlt}
                    className={`${styles.studioImg} ${styles.fadeIn}`}
                    loading="lazy"
                    decoding="async"
                  />
                </button>

                {/* Floating Callout Pill */}
                <div className={styles.floatingCallout} aria-hidden="true">
                  <span className={styles.calloutDot} />
                  <div className={styles.calloutText}>
                    <span className={styles.calloutLabel}>{currentPhase.callout.label}</span>
                    <strong className={styles.calloutValue}>{currentPhase.callout.value}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé da Fase: Indicador e Stepper */}
        <div className={styles.stageFooterNav}>
          <div className={styles.phaseIndicatorDots} aria-label="Indicadores de fase">
            {TUTORIAL_PHASES.map((phase, idx) => (
              <button
                key={phase.id}
                type="button"
                className={`${styles.phaseDot} ${activePhaseIndex === idx ? styles.phaseDotActive : ""}`}
                onClick={() => setActivePhaseIndex(idx)}
                aria-label={`Ir para ${phase.tabLabel}`}
              />
            ))}
          </div>

          <div className={styles.stageStepperControls}>
            <button
              type="button"
              className={styles.stepperArrowBtn}
              disabled={activePhaseIndex === 0}
              onClick={() => setActivePhaseIndex((prev) => Math.max(0, prev - 1))}
              aria-label="Fase anterior"
            >
              <ChevronLeft size={17} aria-hidden="true" />
              <span>Anterior</span>
            </button>
            <button
              type="button"
              className={styles.stepperArrowBtn}
              disabled={safePhaseIndex >= activeTutorialPhases.length - 1}
              onClick={() =>
                setActivePhaseIndex((prev) =>
                  Math.min(activeTutorialPhases.length - 1, prev + 1)
                )
              }
              aria-label="Próxima fase"
            >
              <span>Próxima</span>
              <ChevronRight size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
      )}

      {lightboxStep && (
        <ImageLightbox
          src={lightboxStep.src}
          alt={lightboxStep.alt}
          caption={lightboxStep.title}
          onClose={() => setLightboxStep(null)}
        />
      )}
    </div>
  );
}
