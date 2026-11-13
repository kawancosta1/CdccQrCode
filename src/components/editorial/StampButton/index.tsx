import { useState, type ButtonHTMLAttributes, type MouseEvent } from "react";
import { AnimatePresence, motion, type HTMLMotionProps } from "framer-motion";
import style from "./style.module.css";

interface StampMark {
  id: number;
  x: number;
  y: number;
  rotate: number;
}

export interface StampButtonProps
  extends Omit<HTMLMotionProps<"button">, "onClick" | "children"> {
  children: React.ReactNode;
  variant?: "paper" | "primary";
  stampLabel?: string;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
}

/**
 * Botão tátil estilo carimbo Ex-Libris:
 * no clique, imprime uma marca texturizada no ponto do cursor que seca em 1s.
 */
export function StampButton({
  children,
  variant = "paper",
  stampLabel = "EX LIBRIS • CDCC",
  className = "",
  onClick,
  type = "button",
  ...rest
}: StampButtonProps) {
  const [stamps, setStamps] = useState<StampMark[]>([]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX > 0 ? e.clientX - rect.left : rect.width / 2;
    const y = e.clientY > 0 ? e.clientY - rect.top : rect.height / 2;
    const rotate = Number((Math.random() * 10 - 5).toFixed(2));
    const id = Date.now() + Math.floor(Math.random() * 1000);

    setStamps((prev) => [...prev.slice(-3), { id, x, y, rotate }]);
    window.setTimeout(() => {
      setStamps((prev) => prev.filter((item) => item.id !== id));
    }, 1020);

    onClick?.(e);
  };

  return (
    <motion.button
      type={type}
      whileTap={{ y: 2, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 520, damping: 28 }}
      className={`${style.stampBtn} ${variant === "primary" ? style.stampBtnPrimary : ""} ${className}`}
      onClick={handleClick}
      {...rest}
    >
      {children}

      <AnimatePresence>
        {stamps.map((stamp) => (
          <motion.span
            key={stamp.id}
            aria-hidden="true"
            className={style.stampMark}
            initial={{
              opacity: 0.96,
              scale: 1.18,
              rotate: stamp.rotate,
              x: "-50%",
              y: "-50%",
            }}
            animate={{
              opacity: 0,
              scale: 0.96,
              rotate: stamp.rotate,
              x: "-50%",
              y: "-62%",
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ left: stamp.x, top: stamp.y }}
          >
            {stampLabel}
          </motion.span>
        ))}
      </AnimatePresence>
    </motion.button>
  );
}
