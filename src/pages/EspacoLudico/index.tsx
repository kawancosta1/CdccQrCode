import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Dices, Sparkles, Users } from "lucide-react";
import { Container } from "../../components/Container";
import { GameEmblemSvg, getGameVisualSignature } from "../../components/games/GameArtwork";
import BentinhoPensando from "../../components/img/Mascote/pensando.webp";
import { DEFAULT_GAMES, GamesService } from "../../services/gamesService";
import type { GameItem } from "../../types/content";
import styles from "./style.module.css";

export function EspacoLudico() {
  const [games, setGames] = useState<GameItem[]>(() => [...DEFAULT_GAMES]);

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
        <h2 className={styles.sectionTitle}>Jogos disponíveis na bancada</h2>
        <span className={styles.sectionHint}>
          {games.length} {games.length === 1 ? "jogo catalogado" : "jogos catalogados"}
        </span>
      </div>

      <div className={styles.gamesGrid}>
        {games.map((game, index) => {
          const sig = getGameVisualSignature(game.slug);
          const cardVars = {
            "--card-accent": sig.accentColor,
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
                  <span className={styles.complexityTag}>Nível: {sig.complexity}</span>
                </div>

                <h3 className={styles.gameTitle}>{game.nome}</h3>
                <p className={styles.gameTagline}>{sig.tagline}</p>
                <p className={styles.gameDesc}>{game.descricao}</p>

                <div className={styles.specsBar} aria-label="Especificações da partida">
                  <div className={styles.specItem}>
                    <Users size={14} className={styles.specIcon} aria-hidden="true" />
                    <span>{game.jogadores || "2 jogadores"}</span>
                  </div>
                  <div className={styles.specItem}>
                    <Clock size={14} className={styles.specIcon} aria-hidden="true" />
                    <span>{sig.duration}</span>
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
