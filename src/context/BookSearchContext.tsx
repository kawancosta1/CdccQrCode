import { useCallback, useEffect, useMemo, useRef } from "react";
import { useBookSearch } from "../hooks/useBookSearch";
import { BookSearchContext } from "./bookSearchStore";

export function BookSearchProvider({ children }: { children: React.ReactNode }) {
  const search = useBookSearch();
  const primaryInputRef = useRef<HTMLInputElement | null>(null);
  const focusTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (focusTimerRef.current !== null) {
        window.clearTimeout(focusTimerRef.current);
      }
    };
  }, []);

  const focusPrimarySearch = useCallback(() => {
    if (focusTimerRef.current !== null) {
      window.clearTimeout(focusTimerRef.current);
    }
    focusTimerRef.current = window.setTimeout(() => {
      primaryInputRef.current?.focus();
      focusTimerRef.current = null;
    }, 40);
  }, []);

  const value = useMemo(
    () => ({ ...search, primaryInputRef, focusPrimarySearch }),
    [search, focusPrimarySearch],
  );

  return <BookSearchContext.Provider value={value}>{children}</BookSearchContext.Provider>;
}
