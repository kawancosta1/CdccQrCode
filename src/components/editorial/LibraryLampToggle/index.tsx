import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import style from "./style.module.css";

export interface LibraryLampToggleProps {
  lit: boolean;
  onToggle: () => void;
  label?: string;
  className?: string;
}

/**
 * Luminária clássica de biblioteca:
 * Cordinha elástica com spring (scaleY) que projeta um feixe cônico de luz quente (clip-path).
 */
export function LibraryLampToggle({
  lit,
  onToggle,
  label,
  className = "",
}: LibraryLampToggleProps) {
  const [pulling, setPulling] = useState(false);

  const handleClick = () => {
    setPulling(true);
    onToggle();
    window.setTimeout(() => setPulling(false), 260);
  };

  return (
    <button
      type="button"
      aria-pressed={lit}
      aria-label={label ?? (lit ? "Apagar luminária de leitura" : "Acender luminária de leitura")}
      className={`${style.lampBtn} ${lit ? style.lampBtnLit : ""} ${className}`}
      onClick={handleClick}
    >
      <span className={style.lampIconWrap} aria-hidden="true">
        <AnimatePresence>
          {lit && (
            <motion.span
              className={style.lightBeam}
              initial={{ opacity: 0, scaleY: 0.6 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0.6 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        <svg viewBox="0 0 28 28" className={style.lampSvg}>
          {/* Haste */}
          <path
            d="M 14 25 L 14 14 Q 14 7 18 7"
            fill="none"
            stroke="#5c4738"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <rect x="9" y="24" width="10" height="2.4" rx="1" fill="#5c4738" />
          {/* Cúpula verde clássica */}
          <path
            d="M 10 13 L 24 13 L 21.5 7.5 L 12.5 7.5 Z"
            fill={lit ? "#1f6e4a" : "#2d5a45"}
            stroke="#3a2c22"
            strokeWidth="1"
          />
          {/* Cordinha elástica com spring */}
          <motion.g
            style={{ transformOrigin: "13px 13px" }}
            animate={{ scaleY: pulling ? 1.55 : 1 }}
            transition={{ type: "spring", stiffness: 520, damping: 16 }}
          >
            <line
              x1="13"
              y1="13"
              x2="13"
              y2="19"
              stroke="#b7791f"
              strokeWidth="1.2"
            />
            <circle cx="13" cy="19.5" r="1.4" fill="#b7791f" />
          </motion.g>
        </svg>
      </span>

      {label && <span className={style.label}>{label}</span>}
    </button>
  );
}
