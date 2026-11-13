import { useEffect, useState } from "react";
import { fetchBookCoverAndMetadata } from "../../services/bookMetadataService.ts";
import type { VestibularBook } from "../../types/content.ts";
import styles from "./style.module.css";

interface BookCoverProps {
  book: VestibularBook;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SCHOOL_COLOR_MAP: Array<[string, string]> = [
  ["realis", "#5c1e36"],
  ["modern", "#0f5298"],
  ["árcad", "#7c4d2b"],
  ["arcad", "#7c4d2b"],
  ["natur", "#991b1b"],
  ["romant", "#4338ca"],
  ["poesia", "#0f766e"],
  ["moçamb", "#15803d"],
  ["afro", "#1d4ed8"],
  ["contemp", "#047857"],
  ["epope", "#1e40af"],
  ["ensaio", "#7c2d45"],
];

function resolveEditorialBgColor(book: VestibularBook): string {
  if (book.corCapa?.trim()) return book.corCapa.trim();
  const hay = `${book.escolaLiteraria ?? ""} ${book.genero}`.toLowerCase();
  for (const [needle, color] of SCHOOL_COLOR_MAP) {
    if (hay.includes(needle)) return color;
  }
  return "#5c1e36";
}

export function BookCover({ book, size = "md", className }: BookCoverProps) {
  const [autoCoverUrl, setAutoCoverUrl] = useState<string | undefined>(undefined);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const manualUrl = book.capaUrl?.trim() || undefined;
  const candidateUrl = manualUrl ?? autoCoverUrl;
  const activeUrl = candidateUrl && failedUrl !== candidateUrl ? candidateUrl : undefined;

  useEffect(() => {
    if (manualUrl) return;
    let active = true;
    fetchBookCoverAndMetadata({
      titulo: book.titulo,
      autor: book.autor,
      isbn: book.isbn,
    }).then((meta) => {
      if (active && meta?.coverUrl) {
        setAutoCoverUrl(meta.coverUrl);
      }
    });
    return () => {
      active = false;
    };
  }, [book.id, book.titulo, book.autor, book.isbn, manualUrl]);

  const sizeClass =
    size === "sm" ? styles.sizeSm : size === "lg" ? styles.sizeLg : styles.sizeMd;

  return (
    <div className={`${styles.coverWrap} ${sizeClass} ${className ?? ""}`}>
      {activeUrl ? (
        <img
          src={activeUrl}
          alt={`Capa de ${book.titulo}`}
          className={styles.coverImg}
          loading="lazy"
          onError={() => setFailedUrl(activeUrl)}
        />
      ) : (
        <div
          className={styles.editorialCover}
          style={{ backgroundColor: resolveEditorialBgColor(book) }}
          aria-hidden="true"
        >
          <div>
            <div className={styles.editorialRule} />
            <div className={styles.editorialTitle}>{book.titulo}</div>
            <div className={styles.editorialAuthor}>{book.autor}</div>
          </div>
          <div className={styles.editorialCdu}>{book.codigoDedalus}</div>
        </div>
      )}
      <div className={styles.spineOverlay} aria-hidden="true" />
    </div>
  );
}
