import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Clock, Coins, Dices, Search, Shuffle, Sparkles, Users, X } from "lucide-react";
import { Container } from "../../components/Container";
import { StampButton } from "../../components/editorial";
import { GameEmblemSvg, getGameVisualSignature } from "../../components/games/GameArtwork";
import BentinhoPensando from "../../components/img/Mascote/pensando.webp";
import { DEFAULT_GAMES, GamesService } from "../../services/gamesService";
import type { GameItem } from "../../types/content";
import styles from "./style.module.css";

const DIGITAL_BOARD_SLUGS = new Set(["xadrez", "ludo", "batalhanaval", "batalha-naval"]);

export function EspacoLudico() {
  const navigate = useNavigate();
  const [games, setGames] = useState<GameItem[]>(() => [...DEFAULT_GAMES]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [quickRollResult, setQuickRollResult] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    GamesService.getActive()
      .then((data) => {
        if (isMounted && data.length > 0) {
          setGames(data);
        }
      })
      .catch((err) => {
        console.warn("Falha ao carregar jogos dinâmicos, mantendo fallback:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(games.map((g) => g.categoria).filter(Boolean)));
    return ["Todos", ...unique];
  }, [games]);

  const filteredGames = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return games.filter((g) => {
      if (selectedCategory !== "Todos" && g.categoria !== selectedCategory) return false;
      if (onlyAvailable && g.emprStatus === "emprestado") return false;
      if (!q) return true;
      return (
        g.nome.toLowerCase().includes(q) ||
        g.descricao.toLowerCase().includes(q) ||
        g.categoria.toLowerCase().includes(q)
      );
    });
  }, [games, onlyAvailable, searchTerm, selectedCategory]);

  const handleDrawRandomGame = () => {
    const pool = filteredGames.length > 0 ? filteredGames : games;
    if (pool.length === 0) return;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    navigate(`/espacoludico/${picked.slug}`);
  };

  return (
    <Container>
      <header className={styles.showcaseHero}>
        <div className={styles.heroContent}>
          <div className={styles.eyebrowRow}>
            <span className={styles.eyebrow}>
              <Dices size={14} aria-hidden="true" />
              Acervo de Mesa • CDCC USP
            </span>
            <span className={styles.eyebrowNote}>Empréstimo local gratuito + Mesa Digital</span>
          </div>

          <h1 className={styles.pageTitle}>Espaço Lúdico</h1>
          <p className={styles.pageSubtitle}>
            Escolha um clássico de estratégia ou percurso, consulte o guia rápido de regras na mesa da biblioteca ou jogue uma partida rápida direto pelo celular.
          </p>

          <div className={styles.heroPills}>
            <span className={styles.heroPill}>
              <Sparkles size={14} aria-hidden="true" />
              Tabuleiros interativos integrados
            </span>
            <span className={styles.heroPill}>
              <Users size={14} aria-hidden="true" />
              2 a 4 jogadores por mesa
            </span>
          </div>
        </div>

        <aside className={styles.heroMascotBox} aria-label="Dica do mascote Bentinho">
          <img
            src={BentinhoPensando}
            alt="Mascote Bentinho pensando na próxima jogada"
            className={styles.mascotAvatar}
            decoding="async"
          />
          <div className={styles.mascotQuote}>
            <span className={styles.mascotLabel}>Dica do Bentinho</span>
            <p className={styles.mascotText}>
              Retire a caixa física no balcão da Biblioteca com seu documento ou teste sua estratégia no tabuleiro digital de cada jogo abaixo!
            </p>
          </div>
        </aside>
      </header>

      <div className={styles.sectionBar}>
        <div>
          <h2 className={styles.sectionTitle}>Jogos disponíveis na bancada</h2>
          <span className={styles.sectionHint}>
            Exibindo {filteredGames.length} de {games.length}{" "}
            {games.length === 1 ? "jogo catalogado" : "jogos catalogados"}
          </span>
        </div>

        <StampButton
          type="button"
          variant="primary"
          stampLabel="SORTEADO!"
          className={styles.drawBtn}
          onClick={handleDrawRandomGame}
          title="Sortear um jogo aleatório para jogar agora"
        >
          <Shuffle size={15} aria-hidden="true" />
          Sortear Jogo da Mesa
        </StampButton>
      </div>

      {/* Barra de Filtros + Utilitário Rápido de Mesa */}
      <div className={styles.controlsBar}>
        <div className={styles.filterPills} role="group" aria-label="Filtrar jogos por categoria">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`${styles.filterPill} ${
                selectedCategory === cat ? styles.filterPillActive : ""
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
          <button
            type="button"
            className={`${styles.filterPill} ${onlyAvailable ? styles.filterPillActive : ""}`}
            onClick={() => setOnlyAvailable((v) => !v)}
            aria-pressed={onlyAvailable}
          >
            Só na bancada
          </button>
        </div>

        <div className={styles.searchInline}>
          <Search size={15} className={styles.searchIcon} aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar jogo..."
            aria-label="Buscar jogo no Espaço Lúdico"
          />
          {searchTerm && (
            <button
              type="button"
              className={styles.clearInlineBtn}
              onClick={() => setSearchTerm("")}
              aria-label="Limpar busca de jogo"
            >
              <X size={13} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Utilitário Rápido: Decida quem começa */}
      <section className={styles.quickDiceBar} aria-label="Utilitário rápido de mesa">
        <span className={styles.quickDiceLabel}>
          <Dices size={15} aria-hidden="true" />
          Decida quem começa:
        </span>
        <div className={styles.quickDiceBtns}>
          <button
            type="button"
            className={styles.diceBtn}
            onClick={() => setQuickRollResult(`Dado D6: ${Math.floor(Math.random() * 6) + 1}`)}
          >
            <Dices size={14} aria-hidden="true" /> D6
          </button>
          <button
            type="button"
            className={styles.diceBtn}
            onClick={() => setQuickRollResult(`Dado D20: ${Math.floor(Math.random() * 20) + 1}`)}
          >
            <Dices size={14} aria-hidden="true" /> D20
          </button>
          <button
            type="button"
            className={styles.diceBtn}
            onClick={() =>
              setQuickRollResult(`Moeda: ${Math.random() < 0.5 ? "Cara" : "Coroa"}`)
            }
          >
            <Coins size={14} aria-hidden="true" /> Cara/Coroa
          </button>
        </div>
        {quickRollResult && (
          <span className={styles.diceResultBadge} role="status" aria-live="polite">
            {quickRollResult}
          </span>
        )}
      </section>

      <div className={styles.gamesGrid}>
        {filteredGames.map((game, index) => {
          const sig = getGameVisualSignature(game.slug);
          const accent = game.accentColor || sig.accentColor;
          const complexity = game.complexity || sig.complexity;
          const duration = game.duration || sig.duration;
          const isEmprestado = game.emprStatus === "emprestado";
          const cardVars = {
            "--card-accent": accent,
            "--card-soft": sig.accentSoft,
            "--card-border": sig.accentBorder,
            "--card-tint": sig.surfaceTint,
          } as CSSProperties;

          return (
            <article key={game.slug} className={styles.gameCard} style={cardVars}>
              <Link
                to={`/espacoludico/${game.slug}`}
                className={styles.cardStageLink}
                aria-label={`Abrir mesa e regras de ${game.nome}`}
              >
                <span className={styles.stageIndexBadge}>Mesa 0{index + 1}</span>
                <div className={styles.stageEmblemWrap}>
                  <GameEmblemSvg themeKey={sig.themeKey} className={styles.stageEmblemSvg} />
                </div>
                <div className={styles.stagePhotoFrame}>
                  <img
                    src={game.capaUrl}
                    alt={`Tabuleiro de ${game.nome}`}
                    className={styles.gameImage}
                    decoding="async"
                  />
                </div>
              </Link>

              <div className={styles.cardBody}>
                <div className={styles.cardHeaderMeta}>
                  <span className={styles.categoryTag}>{game.categoria}</span>
                  {DIGITAL_BOARD_SLUGS.has(game.slug) && (
                    <span className={styles.digitalTag}>Mesa Digital</span>
                  )}
                  <span className={styles.complexityTag}>Nível: {complexity}</span>
                </div>

                <h3 className={styles.gameTitle}>{game.nome}</h3>
                <p className={styles.gameTagline}>
                  {sig.tagline} •{" "}
                  <strong style={{ color: isEmprestado ? "#b91c1c" : "#15803d" }}>
                    {isEmprestado ? "Emprestado no momento" : "Na bancada"}
                  </strong>
                </p>
                <p className={styles.gameDesc}>{game.descricao}</p>

                <div className={styles.specsBar} aria-label="Especificações da partida">
                  <div className={styles.specItem}>
                    <Users size={14} className={styles.specIcon} aria-hidden="true" />
                    <span>{game.jogadores || "2 jogadores"}</span>
                  </div>
                  <div className={styles.specItem}>
                    <Clock size={14} className={styles.specIcon} aria-hidden="true" />
                    <span>{duration}</span>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <Link to={`/espacoludico/${game.slug}`} className={styles.rulesLink}>
                    <span>Abrir Mesa &amp; Regras</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <section className={styles.loanBanner} aria-label="Como funciona o empréstimo na biblioteca">
        <div className={styles.loanStep}>
          <span className={styles.loanStepNum}>01</span>
          <div>
            <h3 className={styles.loanStepTitle}>Retirada no balcão</h3>
            <p className={styles.loanStepDesc}>
              Solicite o tabuleiro desejado na recepção da biblioteca para jogar nas mesas de convivência.
            </p>
          </div>
        </div>

        <div className={styles.loanStep}>
          <span className={styles.loanStepNum}>02</span>
          <div>
            <h3 className={styles.loanStepTitle}>Manual &amp; Mesa no celular</h3>
            <p className={styles.loanStepDesc}>
              Abra qualquer jogo acima para consultar lances permitidos ou jogar no tabuleiro interativo.
            </p>
          </div>
        </div>

        <div className={styles.loanStep}>
          <span className={styles.loanStepNum}>03</span>
          <div>
            <h3 className={styles.loanStepTitle}>Conferência das peças</h3>
            <p className={styles.loanStepDesc}>
              Ao finalizar a partida, guarde os peões, dados e navios na caixa original antes de devolver.
            </p>
          </div>
        </div>
      </section>
    </Container>
  );
}
