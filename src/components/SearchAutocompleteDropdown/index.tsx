import { BookOpen, ExternalLink, Hash, Tag } from "lucide-react";
import type { NameMatchItem } from "../../domain/nameSearch";
import style from "./style.module.css";

export type AutocompleteEntry =
  | { type: "name"; item: NameMatchItem }
  | { type: "code"; code: string };

interface SearchAutocompleteDropdownProps {
  entries: AutocompleteEntry[];
  activeIndex: number;
  searchValue: string;
  dedalusSearchUrl: string;
  onSelectEntry: (entry: AutocompleteEntry) => void;
  onHoverIndex: (index: number) => void;
}

/**
 * Dropdown unificado de sugestões (obras, assuntos, códigos CDU e atalho Dedalus USP)
 * com suporte a navegação por teclado.
 */
export function SearchAutocompleteDropdown({
  entries,
  activeIndex,
  searchValue,
  dedalusSearchUrl,
  onSelectEntry,
  onHoverIndex,
}: SearchAutocompleteDropdownProps) {
  if (entries.length === 0 && searchValue.trim().length < 2) {
    return null;
  }

  return (
    <div className={style.dropdown} role="listbox" aria-label="Sugestões de livros e códigos">
      {entries.length > 0 && (
        <div className={style.sectionLabel}>Obras, assuntos e códigos</div>
      )}

      {entries.map((entry, index) => {
        const isActive = index === activeIndex;
        if (entry.type === "name") {
          const { item } = entry;
          return (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={isActive}
              className={`${style.optionBtn} ${isActive ? style.optionActive : ""}`}
              onMouseEnter={() => onHoverIndex(index)}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelectEntry(entry);
              }}
            >
              <span className={style.optionLeft}>
                <span className={style.optionIcon} aria-hidden="true">
                  {item.kind === "livro" ? <BookOpen size={15} /> : <Tag size={15} />}
                </span>
                <span className={style.optionText}>
                  <span className={style.optionTitle}>{item.title}</span>
                  <span className={style.optionSub}>{item.subtitle}</span>
                </span>
              </span>
              <span className={style.codePill}>{item.code}</span>
            </button>
          );
        }

        return (
          <button
            key={`code-${entry.code}`}
            type="button"
            role="option"
            aria-selected={isActive}
            className={`${style.optionBtn} ${isActive ? style.optionActive : ""}`}
            onMouseEnter={() => onHoverIndex(index)}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelectEntry(entry);
            }}
          >
            <span className={style.optionLeft}>
              <span className={style.optionIcon} aria-hidden="true">
                <Hash size={15} />
              </span>
              <span className={style.optionText}>
                <span className={style.optionTitle}>Código CDU {entry.code}</span>
                <span className={style.optionSub}>Localizar estante no mapa</span>
              </span>
            </span>
            <span className={style.codePill}>{entry.code}</span>
          </button>
        );
      })}

      {searchValue.trim().length >= 2 && (
        <a
          href={dedalusSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={style.dedalusFooter}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <span>Pesquisar &ldquo;{searchValue.trim()}&rdquo; no Dedalus USP</span>
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}
