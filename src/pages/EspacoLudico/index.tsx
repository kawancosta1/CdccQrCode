import { Link } from "react-router-dom";
import { GAMES } from "../../config/games";
import styles from "./style.module.css";

export function EspacoLudico() {
  return (
    <div className={styles.container}>
      {GAMES.map((game) => (
        <div key={game.slug} className={styles[game.containerClassKey]}>
          <h1 className={styles.title}>{game.title}</h1>
          <p className={styles.paragrafo}>{game.description}</p>
          <Link to={`/espacoludico/${game.slug}`}>
            <img
              src={game.image}
              alt={game.title}
              className={styles.jogos}
              loading="lazy"
              decoding="async"
            />
          </Link>
        </div>
      ))}
    </div>
  );
}
