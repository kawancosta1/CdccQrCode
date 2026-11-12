import { useState } from "react";
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
  Library,
  Maximize2,
  Search,
  X,
} from "lucide-react";
import { HeroCarousel, type HeroSlide } from "../../components/HeroCarousel";
import { ImageLightbox } from "../../components/ImageLightbox";
import arvoreImg from "../../components/img/Carrousel/arvore.webp";
import espacoLudicoImg from "../../components/img/Carrousel/espacoLudico1.webp";
import guiaMangaImg from "../../components/img/Carrousel/guia_manga.webp";
import sala1EspacoImg from "../../components/img/Carrousel/sala1Espaco.webp";
import vestibularImg from "../../components/img/Carrousel/vestibular1.webp";
import dedalus4 from "../../components/img/Dedalus4.webp";
import dedalus5 from "../../components/img/Dedalus5.webp";
import dedalus6 from "../../components/img/Dedalus6.webp";
import BentinhoPensando from "../../components/img/Mascote/pensando.webp";
import { useBookSearchContext } from "../../context/bookSearchStore";
import styles from "./style.module.css";

const EXAMPLE_CODES = [
  { code: "530", label: "530 (Física)" },
  { code: "869.3 C500", label: "869.3 C500 (Literatura)" },
  { code: "809.89283 A", label: "809.89283 A" },
  { code: "R", label: "R (Referência)" },
];

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "sala-biblioteca",
    eyebrow: "Biblioteca CDCC • USP",
    title: "Ciência, leitura e descoberta em um só espaço",
    description:
      "Explore o acervo da Sala 1 e da Sala 2 com localização exata das estantes pelo código Dedalus.",
    ctaLabel: "Explorar estantes",
    to: "/estantes",
    image: sala1EspacoImg,
    imageAlt: "Vista da Sala 1 da Biblioteca do CDCC com mesas de estudo e estantes",
    objectPosition: "center 45%",
  },
  {
    id: "espaco-ludico",
    eyebrow: "Espaço Lúdico",
    title: "Jogos de estratégia para aprender e se divertir",
    description:
      "Xadrez, Ludo, Batalha Naval e livros infantojuvenis em um ambiente pensado para a convivência.",
    ctaLabel: "Conheça os jogos",
    to: "/espacoludico",
    image: espacoLudicoImg,
    imageAlt: "Espaço Lúdico da Biblioteca do CDCC com tabuleiros de xadrez, ludo e batalha naval",
    objectPosition: "center 55%",
  },
  {
    id: "vestibular",
    eyebrow: "Acervo de Vestibular",
    title: "Leituras obrigatórias para Fuvest e Unicamp",
    description:
      "Encontre rapidamente os clássicos e obras cobradas nos principais vestibulares.",
    ctaLabel: "Consultar Dedalus",
    href: "https://dedalus.usp.br/F",
    image: vestibularImg,
    imageAlt: "Estante de leitura obrigatória para vestibulares na Biblioteca do CDCC",
    objectPosition: "center 40%",
  },
  {
    id: "guia-manga",
    eyebrow: "Divulgação Científica",
    title: "Guias Mangá e Audiolivros de Ciência",
    description:
      "Aprenda física, cálculo, estatística e tecnologia de forma visual e acessível.",
    ctaLabel: "Ver estantes",
    to: "/estantes",
    image: guiaMangaImg,
    imageAlt: "Estante com coleção Guias Mangá de ciências e seção de audiolivros",
    objectPosition: "center 45%",
  },
  {
    id: "novidades-quadrinhos",
    eyebrow: "Novidades e HQs",
    title: "Lançamentos, quadrinhos e leitura jovem",
    description:
      "Confira as novidades em destaque na entrada da biblioteca e nossa estante de quadrinhos.",
    ctaLabel: "Explorar acervo",
    to: "/estantes",
    image: arvoreImg,
    imageAlt: "Área de novidades da biblioteca e estante de quadrinhos do CDCC",
    objectPosition: "center 45%",
  },
];

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
  const [lightboxStep, setLightboxStep] = useState<{ src: string; alt: string; title: string } | null>(
    null,
  );
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
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

  const currentPhase = TUTORIAL_PHASES[activePhaseIndex];

  const handleCopyCode = (text: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handlePhaseKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = (index + 1) % TUTORIAL_PHASES.length;
      setActivePhaseIndex(next);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (index - 1 + TUTORIAL_PHASES.length) % TUTORIAL_PHASES.length;
      setActivePhaseIndex(prev);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActivePhaseIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActivePhaseIndex(TUTORIAL_PHASES.length - 1);
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
            <span>Biblioteca do CDCC • USP São Carlos</span>
          </div>

          <h1 id="hero-heading" className={styles.heroTitle}>
            Encontre a estante exata do seu livro
          </h1>

          <p className={styles.heroSubtitle}>
            Informe o código de classificação do Dedalus para visualizar a sala, o mapa de
            localização e a foto da estante.
          </p>

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
                placeholder="Digite o código Dedalus (ex: 530, 869.3 C500, R)"
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
              Dica: utilize apenas o código de classificação (sem o número de tombo).
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

          <div className={styles.examplesRow}>
            <span className={styles.examplesLabel}>Exemplos rápidos:</span>
            <div className={styles.examplesList}>
              {EXAMPLE_CODES.map((item) => (
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
      <section className={styles.section} aria-label="Acesso rápido">
        <div className={styles.quickGrid}>
          <Link to="/estantes" className={styles.quickCard}>
            <div className={styles.quickIcon}>
              <BookOpen size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 className={styles.quickTitle}>Explorar Estantes</h2>
              <p className={styles.quickDesc}>
                Consulte todas as estantes da Sala 1 e da Sala 2 com fotos e mapas.
              </p>
            </div>
          </Link>

          <a
            href="https://dedalus.usp.br/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.quickCard}
          >
            <div className={styles.quickIcon}>
              <ExternalLink size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 className={styles.quickTitle}>Consultar Dedalus USP</h2>
              <p className={styles.quickDesc}>
                Ainda não tem o código? Pesquise o título ou autor no catálogo da USP.
              </p>
            </div>
          </a>

          <Link to="/espacoludico" className={styles.quickCard}>
            <div className={styles.quickIcon}>
              <Gamepad2 size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 className={styles.quickTitle}>Espaço Lúdico</h2>
              <p className={styles.quickDesc}>
                Conheça os jogos de tabuleiro e estratégias disponíveis na biblioteca.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Destaques — Hero Carousel */}
      <HeroCarousel slides={HERO_SLIDES} />

      {/* Tutorial Editorial do Buscador (3 Fases) */}
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
            src={BentinhoPensando}
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
          {TUTORIAL_PHASES.map((phase, idx) => {
            const isActive = activePhaseIndex === idx;
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
                      src: currentPhase.image,
                      alt: currentPhase.imageAlt,
                      title: `Fase ${currentPhase.phaseNumber}: ${currentPhase.title}`,
                    })
                  }
                  aria-label={`Ampliar captura da fase ${currentPhase.phaseNumber}: ${currentPhase.title}`}
                >
                  <img
                    key={currentPhase.id}
                    src={currentPhase.image}
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
              disabled={activePhaseIndex === TUTORIAL_PHASES.length - 1}
              onClick={() =>
                setActivePhaseIndex((prev) => Math.min(TUTORIAL_PHASES.length - 1, prev + 1))
              }
              aria-label="Próxima fase"
            >
              <span>Próxima</span>
              <ChevronRight size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

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
