import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
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

const DEDALUS_STEPS = [
  {
    step: 1,
    src: dedalus,
    alt: "Passo 1: Acessar o Dedalus e selecionar Catálogo Geral",
    title: "Acesse o Dedalus USP",
    content: (
      <>
        Acesse o{" "}
        <a
          href="https://dedalus.usp.br/"
          className={styles.inlineLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          Dedalus
        </a>{" "}
        e clique em &quot;Catálogo Geral&quot; para selecionar a unidade.
      </>
    ),
  },
  {
    step: 2,
    src: dedalus2,
    alt: "Passo 2: Pesquisar pelo título do livro ou autor",
    title: "Busque o livro ou autor",
    content: "Após selecionar a unidade, pesquise pelo título da obra ou pelo nome do autor.",
  },
  {
    step: 3,
    src: dedalus3,
    alt: "Passo 3: Verificar se a unidade é o CDCC",
    title: "Confirme a unidade CDCC",
    content: "Nos resultados da busca, selecione o livro desejado e confira se a unidade é o CDCC.",
  },
  {
    step: 4,
    src: dedalus4,
    alt: "Passo 4: Copiar o código de classificação na página do livro",
    title: "Copie o código de classificação",
    content: "Na ficha do livro, localize e copie o código de classificação (ex: 530 ou 869.3 C500).",
  },
  {
    step: 5,
    src: dedalus5,
    alt: "Passo 5: Inserir o código na barra de pesquisa do QRCodeCDCC",
    title: "Cole no QRCodeCDCC",
    content: "Digite ou cole o código na barra de pesquisa acima e clique em Localizar livro.",
  },
  {
    step: 6,
    src: dedalus6,
    alt: "Passo 6: Visualizar a estante, a foto e o mapa da sala",
    title: "Siga o mapa até a estante",
    content: "O resultado mostra a sala, o ponto exato no mapa e a foto da estante onde o livro está.",
  },
];

export function Home() {
  const [lightboxStep, setLightboxStep] = useState<{ src: string; alt: string; title: string } | null>(
    null,
  );
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

      {/* Guia Passo a Passo */}
      <section className={styles.section} aria-labelledby="guide-heading">
        <div className={styles.guideHeader}>
          <div className={styles.guideHeaderText}>
            <h2 id="guide-heading" className={styles.sectionTitle}>
              Como encontrar um livro passo a passo
            </h2>
            <p className={styles.sectionSubtitle}>
              Siga estas 6 etapas para ir do catálogo Dedalus até a estante correta no CDCC.
            </p>
          </div>
          <img
            src={BentinhoPensando}
            alt=""
            aria-hidden="true"
            className={styles.mascotHelper}
          />
        </div>

        <ol className={styles.stepsGrid}>
          {DEDALUS_STEPS.map((item) => (
            <li key={item.step} className={styles.stepCard}>
              <div className={styles.stepTop}>
                <span className={styles.stepNumber}>Passo {item.step}</span>
                <h3 className={styles.stepTitle}>{item.title}</h3>
              </div>
              <p className={styles.stepContent}>{item.content}</p>
              <div className={styles.stepImageWrap}>
                <button
                  type="button"
                  className={styles.stepImageBtn}
                  onClick={() =>
                    setLightboxStep({
                      src: item.src,
                      alt: item.alt,
                      title: `Passo ${item.step}: ${item.title}`,
                    })
                  }
                  aria-label={`Ampliar imagem do Passo ${item.step}: ${item.title}`}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    className={styles.stepImage}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className={styles.stepZoomTag} aria-hidden="true">
                    <Maximize2 size={14} />
                    Ampliar
                  </span>
                </button>
              </div>
            </li>
          ))}
        </ol>
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
