import { useEffect, useMemo, useRef, useState } from "react";
import style from "./style.module.css";

interface BookSpec {
  id: number;
  width: number;
  height: number;
  color: string;
  detail: "band" | "cdu" | "plain";
}

const BOOK_PALETTE = [
  "#8a3354", // Vinho editorial / marca
  "#145399", // Azul profundo USP
  "#2d6a4f", // Verde folha
  "#b7791f", // Ocre / Dourado escuro
  "#9c4221", // Terracota / Couro
  "#6b4f3a", // Marrom sépia
  "#d6c7b2", // Creme encadernação
  "#3b4f6b", // Azul ardósia
] as const;

function deterministicHash(seed: number): number {
  let x = (seed + 1) * 2654435761;
  x = ((x >>> 16) ^ x) * 0x45d9f3b;
  x = ((x >>> 16) ^ x) * 0x45d9f3b;
  return (x >>> 16) ^ x;
}

function generateBooksForWidth(availableWidth: number, isMobile: boolean): BookSpec[] {
  const usable = Math.max(120, availableWidth - 24);
  const gap = 1;
  const maxBooks = isMobile ? 34 : 96;
  const books: BookSpec[] = [];
  let usedWidth = 0;
  let index = 0;

  while (usedWidth < usable && books.length < maxBooks) {
    const h1 = Math.abs(deterministicHash(index * 3 + 1));
    const h2 = Math.abs(deterministicHash(index * 3 + 2));
    const h3 = Math.abs(deterministicHash(index * 3 + 3));

    const width = 5 + (h1 % 5); // 5px a 9px
    if (usedWidth + width > usable) break;

    const height = 10 + (h2 % 7); // 10px a 16px
    const color = BOOK_PALETTE[h3 % BOOK_PALETTE.length];
    const detailMod = (h1 + h2) % 5;
    const detail: BookSpec["detail"] =
      detailMod === 0 || detailMod === 1
        ? "cdu"
        : detailMod === 2 || detailMod === 3
          ? "band"
          : "plain";

    books.push({ id: index, width, height, color, detail });
    usedWidth += width + gap;
    index += 1;
  }

  return books;
}

interface BookshelfScrollProgressProps {
  progress: number;
  variant?: "desktop" | "mobile";
  reducedMotion?: boolean;
}

/**
 * Barra de progresso de leitura em forma de estante em miniatura ("Estante Progressiva de Livros"):
 * preenche lombadas determinísticas da esquerda para a direita conforme o scroll (0% a 100%).
 */
export function BookshelfScrollProgress({
  progress,
  variant = "desktop",
  reducedMotion = false,
}: BookshelfScrollProgressProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(() =>
    variant === "mobile" ? 320 : 960,
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const next = Math.round(el.getBoundingClientRect().width);
      if (next > 0) {
        setContainerWidth(next);
      }
    };

    updateWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth, { passive: true });
      return () => window.removeEventListener("resize", updateWidth);
    }

    const observer = new ResizeObserver(() => {
      updateWidth();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const books = useMemo(
    () => generateBooksForWidth(containerWidth, variant === "mobile"),
    [containerWidth, variant],
  );

  const clamped = Math.min(1, Math.max(0, progress));
  const visibleCount = Math.round(clamped * books.length);
  const tipIndex =
    visibleCount > 1 && visibleCount < books.length ? visibleCount - 1 : -1;

  return (
    <div
      ref={containerRef}
      className={`${style.shelfRoot} ${variant === "mobile" ? style.shelfRootMobile : ""}`}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      aria-hidden="true"
    >
      <span className={style.bookendLeft} />
      <div className={style.booksRow}>
        {books.map((book, idx) => {
          const isVisible = idx < visibleCount;
          const isTip = idx === tipIndex;
          return (
            <span
              key={book.id}
              className={style.book}
              data-visible={isVisible ? "true" : "false"}
              data-tip={isTip ? "true" : "false"}
              data-detail={book.detail}
              style={{
                width: `${book.width}px`,
                height: `${book.height}px`,
                backgroundColor: book.color,
              }}
            />
          );
        })}
      </div>
      <span className={style.bookendRight} />
    </div>
  );
}
