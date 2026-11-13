import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import style from "./style.module.css";

export interface BookSpineAccordionProps {
  title: string;
  code?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

const CLOSED_SPINE_PATH = "M 0 6 L 500 6";
const OPEN_SPINE_PATH = "M 0 6 Q 238 6 250 15 Q 262 6 500 6";

/**
 * Acordeão "Lombada Quebrada":
 * SVG morfológico no topo que se curva formando um "V" suave com vinco central quando aberto.
 */
export function BookSpineAccordion({
  title,
  code,
  defaultOpen = false,
  children,
  className = "",
}: BookSpineAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section
      className={`${style.accordion} ${open ? style.accordionOpen : ""} ${className}`}
    >
      <svg
        viewBox="0 0 500 18"
        preserveAspectRatio="none"
        className={style.spineSvg}
        aria-hidden="true"
      >
        <motion.path
          d={open ? OPEN_SPINE_PATH : CLOSED_SPINE_PATH}
          animate={{ d: open ? OPEN_SPINE_PATH : CLOSED_SPINE_PATH }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          fill="none"
          stroke="rgba(44, 34, 24, 0.22)"
          strokeWidth="1.5"
        />
      </svg>

      <button
        type="button"
        className={style.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={style.triggerLeft}>
          {code && <span className={style.codeTag}>{code}</span>}
          <h3 className={style.title}>{title}</h3>
        </span>
        <ChevronDown
          size={18}
          className={`${style.chevron} ${open ? style.chevronOpen : ""}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            className={style.panelOuter}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={style.centerCreaseShadow} aria-hidden="true" />
            <div className={style.panelInner}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
