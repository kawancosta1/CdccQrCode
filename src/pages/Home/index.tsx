import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
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
import dedalus from "../../components/img/Dedalus.webp";
import dedalus2 from "../../components/img/Dedalus2.webp";
import dedalus3 from "../../components/img/Dedalus3.webp";
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

interface TutorialStep {
  id: string;
  stepNumber: string;
  title: string;
  shortDesc: string;
  details: string;
  src: string;
  alt: string;
  badge: string;
  action?: {
    label: string;
    href?: string;
    code?: string;
  };
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "step-1",
    stepNumber: "01",
    title: "Acesse o Catálogo Dedalus",
    shortDesc: "Inicie a pesquisa no catálogo integrado da USP.",
    details:
      "Abra o portal do Dedalus e selecione Catálogo Geral para consultar obras catalogadas em todo o sistema integrado de bibliotecas da universidade.",
    src: dedalus,
    alt: "Página inicial do Dedalus USP com a opção Catálogo Geral destacada",
    badge: "dedalus.usp.br",
    action: {
      label: "Abrir Dedalus USP",
      href: "https://dedalus.usp.br/",
    },
  },
  {
    id: "step-2",
    stepNumber: "02",
    title: "Pesquise por título ou autor",
    shortDesc: "Localize a obra pelo nome, autor ou assunto.",
    details:
      "Digite o termo de busca no campo principal do Dedalus para listar os exemplares disponíveis no acervo.",
    src: dedalus2,
    alt: "Formulário de pesquisa do Dedalus com exemplo de busca",
    badge: "Busca bibliográfica",
  },
  {
    id: "step-3",
    stepNumber: "03",
    title: "Confirme a unidade CDCC",
    shortDesc: "Verifique se o exemplar pertence à biblioteca de São Carlos.",
    details:
      "Na listagem de resultados, abra o livro desejado e confira se a biblioteca indicada é a Unidade CDCC.",
    src: dedalus3,
    alt: "Lista de resultados com a unidade CDCC selecionada",
    badge: "Unidade CDCC",
  },
  {
    id: "step-4",
    stepNumber: "04",
    title: "Copie o código de classificação",
    shortDesc: "Identifique a numeração CDU na ficha catalográfica.",
    details:
      "Localize o código de classificação (ex: 530 ou 869.3 C500). Você só precisa dessa sequência, sem o tombo.",
    src: dedalus4,
    alt: "Ficha do livro com o código de classificação destacado",
    badge: "Código CDU",
    action: {
      label: "Experimentar código 530",
      code: "530",
    },
  },
  {
    id: "step-5",
    stepNumber: "05",
    title: "Insira no buscador do QRCodeCDCC",
    shortDesc: "Cole o código na barra no topo desta página.",
    details:
      "Nosso sistema normaliza o código automaticamente e indica exatamente a sala e a estante correspondentes.",
    src: dedalus5,
    alt: "Barra de busca do QRCodeCDCC recebendo o código",
    badge: "QRCodeCDCC",
    action: {
      label: "Testar código 869.3 C500",
      code: "869.3 C500",
    },
  },
  {
    id: "step-6",
    stepNumber: "06",
    title: "Siga o mapa até a estante",
    shortDesc: "Consulte o mapa interativo e a foto real da estante.",
    details:
      "O resultado destaca a localização exata da estante na planta da sala e exibe a fotografia do móvel para orientar seus passos.",
    src: dedalus6,
    alt: "Visualização do mapa da sala e foto da estante física",
    badge: "Localização física",
  },
];

export function Home() {
  const [lightboxStep, setLightboxStep] = useState<{ src: string; alt: string; title: string } | null>(
    null,
  );
  const [activeStepIndex, setActiveStepIndex] = useState(0);
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

  const currentStep = TUTORIAL_STEPS[activeStepIndex];

  const handleStepKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      const next = (index + 1) % TUTORIAL_STEPS.length;
      setActiveStepIndex(next);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = (index - 1 + TUTORIAL_STEPS.length) % TUTORIAL_STEPS.length;
      setActiveStepIndex(prev);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveStepIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveStepIndex(TUTORIAL_STEPS.length - 1);
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

      {/* Tutorial Interativo do Buscador */}
      <section className={styles.section} aria-labelledby="tutorial-heading">
        <div className={styles.tutorialHeader}>
          <div className={styles.tutorialHeaderText}>
            <span className={styles.tutorialEyebrow}>Fluxo de localização</span>
            <h2 id="tutorial-heading" className={styles.sectionTitle}>
              Do catálogo Dedalus à estante em 6 passos
            </h2>
            <p className={styles.sectionSubtitle}>
              Como transformar a ficha bibliográfica da USP na localização física do exemplar no CDCC.
            </p>
          </div>
          <img
            src={BentinhoPensando}
            alt=""
            aria-hidden="true"
            className={styles.mascotHelper}
          />
        </div>

        {/* Seletor rápido para telas menores */}
        <div
          className={styles.mobileStepper}
          role="tablist"
          aria-label="Etapas para encontrar um livro (mobile)"
        >
          {TUTORIAL_STEPS.map((step, idx) => {
            const isActive = activeStepIndex === idx;
            return (
              <button
                key={step.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`tutorial-panel-${step.id}`}
                className={`${styles.mobileStepChip} ${isActive ? styles.mobileStepChipActive : ""}`}
                onClick={() => setActiveStepIndex(idx)}
              >
                <span className={styles.mobileStepMono}>{step.stepNumber}</span>
                <span className={styles.mobileStepText}>{step.title}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.tutorialWorkspace}>
          {/* Coluna 1: Lista navegável com indicador progressivo */}
          <div
            className={styles.tutorialNavList}
            role="tablist"
            aria-label="Etapas do tutorial para localizar livros"
          >
            {TUTORIAL_STEPS.map((step, index) => {
              const isActive = activeStepIndex === index;
              return (
                <button
                  key={step.id}
                  id={`tutorial-tab-${step.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tutorial-panel-${step.id}`}
                  tabIndex={isActive ? 0 : -1}
                  type="button"
                  className={`${styles.tutorialStepCard} ${
                    isActive ? styles.tutorialStepCardActive : ""
                  }`}
                  onClick={() => setActiveStepIndex(index)}
                  onKeyDown={(e) => handleStepKeyDown(e, index)}
                >
                  <div className={styles.stepIndexBadge}>
                    <span className={styles.stepIndexMono}>{step.stepNumber}</span>
                  </div>
                  <div className={styles.stepNavBody}>
                    <strong className={styles.stepNavTitle}>{step.title}</strong>
                    <p className={styles.stepNavDesc}>{step.shortDesc}</p>
                  </div>
                  {isActive && <div className={styles.activePillIndicator} aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          {/* Coluna 2: Preview contextual em frame limpo */}
          <div
            id={`tutorial-panel-${currentStep.id}`}
            role="tabpanel"
            aria-labelledby={`tutorial-tab-${currentStep.id}`}
            className={styles.tutorialPreviewArea}
          >
            <div className={styles.browserFrame}>
              <div className={styles.browserHeader}>
                <div className={styles.windowControls} aria-hidden="true">
                  <span className={styles.windowDot} />
                  <span className={styles.windowDot} />
                  <span className={styles.windowDot} />
                </div>
                <div className={styles.browserAddress}>
                  <span className={styles.addressBadge}>{currentStep.badge}</span>
                  <span className={styles.addressStep}>
                    Etapa {currentStep.stepNumber} de 0{TUTORIAL_STEPS.length}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.browserZoomBtn}
                  onClick={() =>
                    setLightboxStep({
                      src: currentStep.src,
                      alt: currentStep.alt,
                      title: `Passo ${currentStep.stepNumber}: ${currentStep.title}`,
                    })
                  }
                  aria-label={`Ampliar captura da etapa ${currentStep.stepNumber}: ${currentStep.title}`}
                >
                  <Maximize2 size={15} aria-hidden="true" />
                  <span className={styles.zoomText}>Ampliar</span>
                </button>
              </div>

              <div className={styles.browserMedia}>
                <button
                  type="button"
                  className={styles.browserImageBtn}
                  onClick={() =>
                    setLightboxStep({
                      src: currentStep.src,
                      alt: currentStep.alt,
                      title: `Passo ${currentStep.stepNumber}: ${currentStep.title}`,
                    })
                  }
                  aria-label={`Ampliar captura da etapa ${currentStep.stepNumber}: ${currentStep.title}`}
                >
                  <img
                    key={currentStep.id}
                    src={currentStep.src}
                    alt={currentStep.alt}
                    className={`${styles.browserImg} ${styles.fadeIn}`}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className={styles.imageZoomOverlay} aria-hidden="true">
                    <Maximize2 size={14} />
                    Clique para tela cheia
                  </span>
                </button>
              </div>

              <div className={styles.browserFooter}>
                <div className={styles.browserFooterDetails}>
                  <h3 className={styles.previewStepTitle}>
                    <span className={styles.previewMonoStep}>{currentStep.stepNumber}</span>
                    {currentStep.title}
                  </h3>
                  <p className={styles.previewStepDetails}>{currentStep.details}</p>
                </div>

                <div className={styles.browserFooterActions}>
                  {currentStep.action &&
                    (currentStep.action.href ? (
                      <a
                        href={currentStep.action.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.stepActionBtn}
                      >
                        <span>{currentStep.action.label}</span>
                        <ExternalLink size={14} aria-hidden="true" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        className={styles.stepActionBtn}
                        onClick={() => handleActionClick(currentStep.action?.code)}
                      >
                        <span>{currentStep.action.label}</span>
                        <ArrowRight size={14} aria-hidden="true" />
                      </button>
                    ))}

                  <div className={styles.stepperNav} aria-label="Navegar pelas etapas">
                    <button
                      type="button"
                      className={styles.stepperBtn}
                      disabled={activeStepIndex === 0}
                      onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                      aria-label="Etapa anterior"
                    >
                      <ChevronLeft size={18} aria-hidden="true" />
                    </button>
                    <span className={styles.stepperCount} aria-live="polite">
                      {currentStep.stepNumber} / 0{TUTORIAL_STEPS.length}
                    </span>
                    <button
                      type="button"
                      className={styles.stepperBtn}
                      disabled={activeStepIndex === TUTORIAL_STEPS.length - 1}
                      onClick={() =>
                        setActiveStepIndex((prev) => Math.min(TUTORIAL_STEPS.length - 1, prev + 1))
                      }
                      aria-label="Próxima etapa"
                    >
                      <ChevronRight size={18} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
