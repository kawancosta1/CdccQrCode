import style from "./style.module.css";

interface EditorialScrollProgressProps {
  progress: number;
  variant?: "desktop" | "mobile";
  reducedMotion?: boolean;
}

/**
 * Indicador editorial determinístico de progresso de leitura via transform GPU (scaleX),
 * sem ResizeObserver nem recálculos dinâmicos de elementos no DOM.
 */
export function EditorialScrollProgress({
  progress,
  variant = "desktop",
  reducedMotion = false,
}: EditorialScrollProgressProps) {
  const clamped = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));

  return (
    <div
      className={`${style.track} ${variant === "mobile" ? style.trackMobile : ""}`}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      aria-hidden="true"
    >
      <div
        className={style.fill}
        style={{ transform: `scaleX(${clamped.toFixed(4)})` }}
      />
    </div>
  );
}
