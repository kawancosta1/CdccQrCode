import { createContext, useContext, type RefObject } from "react";
import type { useBookSearch } from "../hooks/useBookSearch";

export type BookSearchContextValue = ReturnType<typeof useBookSearch> & {
  primaryInputRef: RefObject<HTMLInputElement | null>;
  focusPrimarySearch: () => void;
};

export const BookSearchContext = createContext<BookSearchContextValue | null>(null);

export function useBookSearchContext(): BookSearchContextValue {
  const ctx = useContext(BookSearchContext);
  if (!ctx) {
    throw new Error("useBookSearchContext deve ser usado dentro de BookSearchProvider");
  }
  return ctx;
}
