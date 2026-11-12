import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Compass, ListOrdered, Trophy, Users } from "lucide-react";
import { Container } from "../../components/Container";
import { GAMES, getGameBySlug } from "../../config/games";
import styles from "./style.module.css";

/**
 * Página unificada de regras para os jogos do Espaço Lúdico.
 */
export function GameRules() {
  const { jogo } = useParams<{ jogo: string }>();
  const game = getGameBySlug(jogo);

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

  const otherGames = GAMES.filter((g) => g.slug !== game.slug);

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
        <span className={styles.breadcrumbCurrent}>{game.title}</span>
      </nav>

      <article className={styles.heroCard}>
        <img src={game.image} alt={game.title} className={styles.heroImage} decoding="async" />

        <div className={styles.heroBody}>
          <span className={styles.eyebrow}>Espaço Lúdico • Regras Oficiais</span>
          <h1 className={styles.title}>{game.rulesTitle}</h1>
          <p className={styles.description}>{game.description}</p>

          <div className={styles.metaRow}>
            <span className={styles.metaBadge}>
              <Users size={15} aria-hidden="true" />
              {game.players}
            </span>
          </div>
        </div>
      </article>

      <div className={styles.detailsGrid}>
        <section className={styles.infoCard} aria-labelledby="objective-heading">
          <div className={styles.cardHeader}>
            <Compass size={18} className={styles.cardIcon} aria-hidden="true" />
            <h2 id="objective-heading" className={styles.cardTitle}>
              Objetivo
            </h2>
          </div>
          <p className={styles.cardText}>{game.objective}</p>
        </section>

        <section className={styles.infoCard} aria-labelledby="setup-heading">
          <div className={styles.cardHeader}>
            <CheckCircle2 size={18} className={styles.cardIcon} aria-hidden="true" />
            <h2 id="setup-heading" className={styles.cardTitle}>
              Preparação
            </h2>
          </div>
          <p className={styles.cardText}>{game.setup}</p>
        </section>
      </div>

      <section className={styles.rulesCard} aria-labelledby="rules-heading">
        <div className={styles.cardHeader}>
          <ListOrdered size={18} className={styles.cardIcon} aria-hidden="true" />
          <h2 id="rules-heading" className={styles.cardTitle}>
            Regras principais
          </h2>
        </div>

        <ol className={styles.rulesList}>
          {game.rules.map((rule, index) => (
            <li key={`${game.slug}-rule-${index}`} className={styles.ruleItem}>
              <span className={styles.ruleIndex}>{index + 1}</span>
              <span className={styles.ruleText}>{rule}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.winCard} aria-labelledby="win-heading">
        <div className={styles.cardHeader}>
          <Trophy size={18} className={styles.cardIcon} aria-hidden="true" />
          <h2 id="win-heading" className={styles.cardTitle}>
            Condição de vitória
          </h2>
        </div>
        <p className={styles.cardText}>{game.winningCondition}</p>
      </section>

      {otherGames.length > 0 && (
        <section className={styles.otherSection} aria-labelledby="other-games-heading">
          <h2 id="other-games-heading" className={styles.otherTitle}>
            Outros jogos do Espaço Lúdico
          </h2>
          <div className={styles.otherGrid}>
            {otherGames.map((other) => (
              <Link key={other.slug} to={`/espacoludico/${other.slug}`} className={styles.otherCard}>
                <span className={styles.otherName}>{other.title}</span>
                <span className={styles.otherMeta}>{other.players}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
