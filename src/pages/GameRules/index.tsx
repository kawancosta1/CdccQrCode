import { useEffect, useState, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  Dices,
  ListOrdered,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { Container } from "../../components/Container";
import { ChessTable } from "../../components/games/ChessTable";
import { GameEmblemSvg, getGameVisualSignature } from "../../components/games/GameArtwork";
import { LudoTable } from "../../components/games/LudoTable";
import { NavalTable } from "../../components/games/NavalTable";
import { TabletopCompanion } from "../../components/games/TabletopCompanion";
import { getGameBySlug as getStaticGameBySlug } from "../../config/games";
import { DEFAULT_GAMES, GamesService } from "../../services/gamesService";
import type { GameItem } from "../../types/content";
import styles from "./style.module.css";

/**
 * Página unificada de Mesa Interativa + Manual de Regras para os jogos do Espaço Lúdico.
 */
export function GameRules() {
  const { jogo } = useParams<{ jogo: string }>();

  const [game, setGame] = useState<GameItem | null>(() => {
    const staticGame = getStaticGameBySlug(jogo);
    if (staticGame) {
      return {
        id: staticGame.slug,
        slug: staticGame.slug,
        nome: staticGame.title,
        descricao: staticGame.description,
        capaUrl: staticGame.image,
        categoria: "Estratégia",
        ordem: 1,
        disponivel: true,
        regrasTitulo: staticGame.rulesTitle,
        jogadores: staticGame.players,
        objetivo: staticGame.objective,
        preparacao: staticGame.setup,
        regras: staticGame.rules,
        condicaoVitoria: staticGame.winningCondition,
      };
    }
    const match = DEFAULT_GAMES.find((g) => g.slug === jogo);
    return match ?? null;
  });

  const [allGames, setAllGames] = useState<GameItem[]>(() => [...DEFAULT_GAMES]);

  useEffect(() => {
    let isMounted = true;
    if (jogo) {
      GamesService.getBySlug(jogo)
        .then((found) => {
          if (isMounted && found) {
            setGame(found);
          }
        })
        .catch((err) => {
          console.warn("Falha ao buscar jogo dinâmico:", err);
        });
    }

    GamesService.getActive()
      .then((active) => {
        if (isMounted && active.length > 0) {
          setAllGames(active);
        }
      })
      .catch((err) => {
        console.warn("Falha ao buscar catálogo de jogos:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [jogo]);

  if (!game) {
    return (
      <Container>
        <div className={styles.errorCard} role="alert">
          <h1 className={styles.errorTitle}>Jogo não encontrado</h1>
          <p className={styles.errorDesc}>Não encontramos a mesa ou as regras para o jogo solicitado.</p>
          <Link to="/espacoludico" className={styles.backBtn}>
            <ArrowLeft size={16} aria-hidden="true" />
            Voltar ao Espaço Lúdico
          </Link>
        </div>
      </Container>
    );
  }

  const sig = getGameVisualSignature(game.slug);
  const pageVars = {
    "--game-accent": sig.accentColor,
    "--game-soft": sig.accentSoft,
    "--game-border": sig.accentBorder,
    "--game-tint": sig.surfaceTint,
  } as CSSProperties;

  const otherGames = allGames.filter((g) => g.slug !== game.slug);

  return (
    <Container>
      <div className={styles.gamePageWrap} style={pageVars}>
        <nav className={styles.breadcrumb} aria-label="Navegação estrutural">
          <Link to="/espacoludico" className={styles.breadcrumbLink}>
            <ArrowLeft size={15} aria-hidden="true" />
            Espaço Lúdico
          </Link>
          <span aria-hidden="true" className={styles.breadcrumbSep}>
            /
          </span>
          <span className={styles.breadcrumbCurrent}>{game.nome}</span>
        </nav>

        <article className={styles.heroCard}>
          <div className={styles.heroArtworkStage}>
            <GameEmblemSvg themeKey={sig.themeKey} className={styles.heroEmblem} />
            <img
              src={game.capaUrl}
              alt={`Tabuleiro físico de ${game.nome}`}
              className={styles.heroPhotoThumb}
              decoding="async"
            />
          </div>

          <div className={styles.heroBody}>
            <span className={styles.eyebrow}>Espaço Lúdico • Mesa &amp; Guia Oficial</span>
            <h1 className={styles.title}>{game.regrasTitulo || `Mesa de ${game.nome}`}</h1>
            <p className={styles.tagline}>{sig.tagline}</p>
            <p className={styles.description}>{game.descricao}</p>

            <div className={styles.metaRow}>
              {game.jogadores && (
                <span className={styles.metaBadge}>
                  <Users size={14} aria-hidden="true" />
                  {game.jogadores}
                </span>
              )}
              <span className={styles.metaBadge}>
                <Clock size={14} aria-hidden="true" />
                {sig.duration}
              </span>
              <span className={styles.metaBadge}>
                <Sparkles size={14} aria-hidden="true" />
                Complexidade {sig.complexity}
              </span>
            </div>
          </div>
        </article>

        {/* Interactive Game Table */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionHeading}>
            <Dices size={20} aria-hidden="true" />
            Mesa Digital Interativa
          </h2>
          <span className={styles.sectionSub}>Toque nas casas ou peças para jogar no navegador</span>
        </div>

        {sig.themeKey === "chess" && <ChessTable />}
        {sig.themeKey === "ludo" && <LudoTable />}
        {sig.themeKey === "naval" && <NavalTable />}
        {sig.themeKey === "classic" && <TabletopCompanion gameName={game.nome} />}

        {/* Official Rulebook Section */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionHeading}>
            <BookOpen size={20} aria-hidden="true" />
            Manual Rápido de Regras
          </h2>
          <span className={styles.sectionSub}>Consulta rápida para partidas na biblioteca</span>
        </div>

        <div className={styles.detailsGrid}>
          {game.objetivo && (
            <section className={styles.infoCard} aria-labelledby="objective-heading">
              <div className={styles.cardHeader}>
                <Compass size={18} className={styles.cardIcon} aria-hidden="true" />
                <h3 id="objective-heading" className={styles.cardTitle}>
                  Objetivo da Partida
                </h3>
              </div>
              <p className={styles.cardText}>{game.objetivo}</p>
            </section>
          )}

          {game.preparacao && (
            <section className={styles.infoCard} aria-labelledby="setup-heading">
              <div className={styles.cardHeader}>
                <CheckCircle2 size={18} className={styles.cardIcon} aria-hidden="true" />
                <h3 id="setup-heading" className={styles.cardTitle}>
                  Preparação na Mesa
                </h3>
              </div>
              <p className={styles.cardText}>{game.preparacao}</p>
            </section>
          )}
        </div>

        {game.regras && game.regras.length > 0 && (
          <section className={styles.rulesCard} aria-labelledby="rules-heading">
            <div className={styles.cardHeader}>
              <ListOrdered size={18} className={styles.cardIcon} aria-hidden="true" />
              <h3 id="rules-heading" className={styles.cardTitle}>
                Regras Passo a Passo
              </h3>
            </div>

            <ol className={styles.rulesList}>
              {game.regras.map((rule, index) => (
                <li key={`${game.slug}-rule-${index}`} className={styles.ruleItem}>
                  <span className={styles.ruleIndex}>0{index + 1}</span>
                  <span className={styles.ruleText}>{rule}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {game.condicaoVitoria && (
          <section className={styles.winCard} aria-labelledby="win-heading">
            <div className={styles.cardHeader}>
              <Trophy size={18} className={styles.cardIcon} aria-hidden="true" />
              <h3 id="win-heading" className={styles.cardTitle}>
                Condição de Vitória
              </h3>
            </div>
            <p className={styles.cardText}>{game.condicaoVitoria}</p>
          </section>
        )}

        {otherGames.length > 0 && (
          <section className={styles.otherSection} aria-labelledby="other-games-heading">
            <h2 id="other-games-heading" className={styles.otherTitle}>
              Outras mesas disponíveis no Espaço Lúdico
            </h2>
            <div className={styles.otherGrid}>
              {otherGames.map((other) => {
                const otherSig = getGameVisualSignature(other.slug);
                return (
                  <Link
                    key={other.slug}
                    to={`/espacoludico/${other.slug}`}
                    className={styles.otherCard}
                  >
                    <div className={styles.otherCardLeft}>
                      <GameEmblemSvg themeKey={otherSig.themeKey} className={styles.otherEmblem} />
                      <div>
                        <span className={styles.otherName}>{other.nome}</span>
                        <span className={styles.otherMeta}>
                          {other.jogadores || other.categoria} • {otherSig.duration}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </Container>
  );
}
