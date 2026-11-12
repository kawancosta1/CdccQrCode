import { Link, useParams } from "react-router-dom";
import { getGameBySlug } from "../../config/games";

/**
 * Página unificada de regras para os jogos do Espaço Lúdico.
 */
export function GameRules() {
  const { jogo } = useParams<{ jogo: string }>();
  const game = getGameBySlug(jogo);

  if (!game) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <h2>Jogo não encontrado</h2>
        <p style={{ marginTop: "12px" }}>
          <Link to="/espacoludico">Voltar ao Espaço Lúdico</Link>
        </p>
      </div>
    );
  }

  return (
    <h1
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: "20%",
        fontSize: "100px",
      }}
    >
      {game.rulesTitle}
    </h1>
  );
}
