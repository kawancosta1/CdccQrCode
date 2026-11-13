import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import style from "./style.module.css";

export interface DogEarCardProps {
  title: string;
  footnote: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Card "Orelha de Livro":
 * Dobra triangular no canto inferior direito que expande no hover/clique revelando nota de rodapé.
 */
export function DogEarCard({
  title,
  footnote,
  children,
  className = "",
}: DogEarCardProps) {
  const [pinnedOpen, setPinnedOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isRevealed = pinnedOpen || hovered;

  return (
    <article
      className={`${style.card} ${isRevealed ? style.dogEarOpen : ""} ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <h3 className={style.title}>{title}</h3>
      <div className={style.body}>{children}</div>

      <AnimatePresence initial={false}>
        {isRevealed && (
          <motion.p
            className={style.footnoteReveal}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {footnote}
          </motion.p>
        )}
      </AnimatePresence>

      <div className={style.dogEarWrap}>
        <button
          type="button"
          className={style.dogEarBtn}
          aria-expanded={pinnedOpen}
          aria-label={pinnedOpen ? "Recolher nota de rodapé" : "Expandir orelha e ver nota de rodapé"}
          onClick={() => setPinnedOpen((prev) => !prev)}
        >
          <span className={style.dogEarFold} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
