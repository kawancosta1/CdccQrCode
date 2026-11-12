import styles from "./style.module.css";

interface PageSkeletonProps {
  label?: string;
}

export function PageSkeleton({ label = "Carregando conteúdo..." }: PageSkeletonProps) {
  return (
    <div className={styles.skeletonPage} role="status" aria-live="polite" aria-label={label}>
      <div className={styles.skeletonHero} aria-hidden="true" />
      <div className={styles.skeletonGrid} aria-hidden="true">
        <div className={styles.skeletonCard} />
        <div className={styles.skeletonCard} />
        <div className={styles.skeletonCard} />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
