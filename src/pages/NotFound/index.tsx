import { Home as HomeIcon, Layers } from "lucide-react";
import { Container } from "../../components/Container";
import { HighlighterLink } from "../../components/editorial";
import BentinhoPensando from "../../components/img/Mascote/pensando.webp";
import style from "./style.module.css";

/**
 * Página de fallback para rotas inexistentes.
 */
export function NotFound() {
  return (
    <Container>
      <div className={style.card} role="region" aria-label="Página não encontrada">
        <img
          src={BentinhoPensando}
          alt="Mascote Bentinho procurando a página"
          style={{ width: "88px", height: "88px", objectFit: "contain", margin: "0 auto 0.5rem" }}
        />
        <span className={style.badge}>404</span>
        <h1 className={style.title}>Página não encontrada</h1>
        <p className={style.description}>
          O endereço acessado não existe ou o QR Code está desatualizado.
        </p>
        <div className={style.actions}>
          <HighlighterLink to="/" className={style.primaryLink}>
            <HomeIcon size={16} aria-hidden="true" />
            Ir para a Home
          </HighlighterLink>
          <HighlighterLink to="/estantes" tone="mint" className={style.secondaryLink}>
            <Layers size={16} aria-hidden="true" />
            Ver Estantes
          </HighlighterLink>
        </div>
      </div>
    </Container>
  );
}
