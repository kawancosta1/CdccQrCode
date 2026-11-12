import { Link } from "react-router-dom";
import { ArrowRight, Gamepad2 } from "lucide-react";
import { Container } from "../../components/Container";
import { GAMES } from "../../config/games";
import styles from "./style.module.css";

export function EspacoLudico() {
  return (
    <Container>
      <header className={styles.pageHeader}>
        <span className={styles.eyebrow}>
          <Gamepad2 size={15} aria-hidden="true" />
          Biblioteca CDCC
        </span>
        <h1 className={styles.pageTitle}>Espaço Lúdico</h1>
        <p className={styles.pageSubtitle}>
          Jogos de tabuleiro disponíveis para empréstimo local e recreação na biblioteca.
        </p>
      </header>

      <div className={styles.gamesGrid}>
        {GAMES.map((game) => (
          <article key={game.slug} className={styles.gameCard}>
            <Link to={`/espacoludico/${game.slug}`} className={styles.imageLink}>
              <img
                src={game.image}
                alt={game.title}
                className={styles.gameImage}
                decoding="async"
              />
            </Link>

            <div className={styles.cardBody}>
              <h2 className={styles.gameTitle}>{game.title}</h2>
              <p className={styles.gameDesc}>{game.description}</p>
              <Link to={`/espacoludico/${game.slug}`} className={styles.rulesLink}>
                Ver regras
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </Container>
  );
}
