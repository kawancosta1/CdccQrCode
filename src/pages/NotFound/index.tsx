import { Link } from "react-router-dom";

/**
 * Página de fallback para rotas inexistentes.
 */
export function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", fontSize: "1.8rem" }}>
      <h1>Página não encontrada</h1>
      <p style={{ margin: "16px 0" }}>
        O endereço acessado não existe ou o QR Code está desatualizado.
      </p>
      <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
        <Link to="/">Ir para a Home</Link>
        <Link to="/estantes">Ver Estantes</Link>
      </div>
    </div>
  );
}
