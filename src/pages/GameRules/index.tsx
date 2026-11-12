import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Compass, ListOrdered, Trophy, Users } from "lucide-react";
import { Container } from "../../components/Container";
import { getGameBySlug as getStaticGameBySlug } from "../../config/games";
import { DEFAULT_GAMES, GamesService } from "../../services/gamesService";
import type { GameItem } from "../../types/content";
import styles from "./style.module.css";

/**
 * Página unificada de regras para os jogos do Espaço Lúdico (estático + dinâmico via Firebase).
 */
export function GameRules() {
  const { jogo } = useParams<{ jogo: string }>();

  // Inicia com o fallback síncrono para renderizar instantaneamente
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
          <p className={styles.errorDesc}>Não encontramos as regras para o jogo solicitado.</p>
          <Link to="/espacoludico" className={styles.backBtn}>
            <ArrowLeft size={16} aria-hidden="true" />
            Voltar ao Espaço Lúdico
          </Link>
        </div>
      </Container>
    );
  }

  const otherGames = allGames.filter((g) => g.slug !== game.slug);

  return (
    <Container>
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
        <img src={game.capaUrl} alt={game.nome} className={styles.heroImage} decoding="async" />

        <div className={styles.heroBody}>
          <span className={styles.eyebrow}>Espaço Lúdico • Regras Oficiais</span>
          <h1 className={styles.title}>{game.regrasTitulo || `Regras do ${game.nome}`}</h1>
          <p className={styles.description}>{game.descricao}</p>

          <div className={styles.metaRow}>
            {game.jogadores && (
              <span className={styles.metaBadge}>
                <Users size={15} aria-hidden="true" />
                {game.jogadores}
              </span>
            )}
            {game.categoria && (
              <span className={styles.metaBadge} style={{ fontWeight: 600 }}>
                {game.categoria}
              </span>
            )}
          </div>
        </div>
      </article>

      <div className={styles.detailsGrid}>
        {game.objetivo && (
          <section className={styles.infoCard} aria-labelledby="objective-heading">
            <div className={styles.cardHeader}>
              <Compass size={18} className={styles.cardIcon} aria-hidden="true" />
              <h2 id="objective-heading" className={styles.cardTitle}>
                Objetivo
              </h2>
            </div>
            <p className={styles.cardText}>{game.objetivo}</p>
          </section>
        )}

        {game.preparacao && (
          <section className={styles.infoCard} aria-labelledby="setup-heading">
            <div className={styles.cardHeader}>
              <CheckCircle2 size={18} className={styles.cardIcon} aria-hidden="true" />
              <h2 id="setup-heading" className={styles.cardTitle}>
                Preparação
              </h2>
            </div>
            <p className={styles.cardText}>{game.preparacao}</p>
          </section>
        )}
      </div>

      {game.regras && game.regras.length > 0 && (
        <section className={styles.rulesCard} aria-labelledby="rules-heading">
          <div className={styles.cardHeader}>
            <ListOrdered size={18} className={styles.cardIcon} aria-hidden="true" />
            <h2 id="rules-heading" className={styles.cardTitle}>
              Regras principais
            </h2>
          </div>

          <ol className={styles.rulesList}>
            {game.regras.map((rule, index) => (
              <li key={`${game.slug}-rule-${index}`} className={styles.ruleItem}>
                <span className={styles.ruleIndex}>{index + 1}</span>
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
            <h2 id="win-heading" className={styles.cardTitle}>
              Condição de vitória
            </h2>
          </div>
          <p className={styles.cardText}>{game.condicaoVitoria}</p>
        </section>
      )}

      {otherGames.length > 0 && (
        <section className={styles.otherSection} aria-labelledby="other-games-heading">
          <h2 id="other-games-heading" className={styles.otherTitle}>
            Outros jogos do Espaço Lúdico
          </h2>
          <div className={styles.otherGrid}>
            {otherGames.map((other) => (
              <Link key={other.slug} to={`/espacoludico/${other.slug}`} className={styles.otherCard}>
                <span className={styles.otherName}>{other.nome}</span>
                <span className={styles.otherMeta}>{other.jogadores || other.categoria}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
