import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Gamepad2, Users } from "lucide-react";
import { Container } from "../../components/Container";
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
      <header className={styles.pageHeader}>
        <span className={styles.eyebrow}>
          <Gamepad2 size={15} aria-hidden="true" />
          Biblioteca CDCC • Jogos de Tabuleiro
        </span>
        <h1 className={styles.pageTitle}>Espaço Lúdico</h1>
        <p className={styles.pageSubtitle}>
          Jogos de raciocínio, lógica e recreação disponíveis para empréstimo local na biblioteca.
        </p>
      </header>

      <div className={styles.gamesGrid}>
        {games.map((game) => (
          <article key={game.slug} className={styles.gameCard}>
            <Link to={`/espacoludico/${game.slug}`} className={styles.imageLink}>
              <img
                src={game.capaUrl}
                alt={game.nome}
                className={styles.gameImage}
                decoding="async"
              />
            </Link>

            <div className={styles.cardBody}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "var(--color-brand)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {game.categoria}
                </span>
                {game.jogadores && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontSize: "0.75rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <Users size={12} aria-hidden="true" />
                    {game.jogadores}
                  </span>
                )}
              </div>

              <h2 className={styles.gameTitle}>{game.nome}</h2>
              <p className={styles.gameDesc}>{game.descricao}</p>
              <Link to={`/espacoludico/${game.slug}`} className={styles.rulesLink}>
                Ver regras oficiais
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </Container>
  );
}
