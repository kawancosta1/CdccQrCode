import { Link } from "react-router-dom";
import style from "./style.module.css";

export interface HighlighterLinkProps {
  to?: string;
  href?: string;
  tone?: "yellow" | "pink" | "mint";
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
}

/**
 * Link "Marca-Texto Chanfrado":
 * Traço pastel inclinado (-1deg) que preenche da esquerda para a direita em 200ms no hover/foco.
 */
export function HighlighterLink({
  to,
  href,
  tone = "yellow",
  children,
  className = "",
  target,
  rel,
  onClick,
}: HighlighterLinkProps) {
  const toneClass =
    tone === "pink"
      ? style.highlightPink
      : tone === "mint"
        ? style.highlightMint
        : "";

  const content = (
    <>
      <span className={`${style.highlight} ${toneClass}`} aria-hidden="true" />
      <span>{children}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`${style.link} ${className}`} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href ?? "#"}
      target={target}
      rel={rel}
      className={`${style.link} ${className}`}
      onClick={onClick}
    >
      {content}
    </a>
  );
}
