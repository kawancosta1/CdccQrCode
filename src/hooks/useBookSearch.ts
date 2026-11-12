import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { RoomId } from "../config/roomConstants";
import {
  buildDedalusSearchUrl,
  searchByNameOrSubject,
  type NameMatchItem,
  type SearchableBookRecord,
} from "../domain/nameSearch";
import {
  getDefaultRoom,
  searchBooksByCode,
  suggestMatchingCodes,
  suggestNearestCodes,
  type SearchResultsByRoom,
} from "../domain/searchParser";
import { staticBookCatalogRepository } from "../repositories/bookCatalogRepository";
import {
  CATALOG_INDEX_UPDATED_EVENT,
  getDynamicSearchableBooks,
} from "../services/catalogSearchIndex";

const RECENT_SEARCHES_KEY = "qrcodecdcc_recent_searches";
const MAX_RECENT_SEARCHES = 4;

function loadRecentSearches(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string").slice(0, MAX_RECENT_SEARCHES)
      : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(items: string[]): void {
  try {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items));
  } catch {
    // Ignora falhas de storage em modo privado ou quota excedida.
  }
}

function parseRoomParam(rawRoom: string | null): RoomId | null {
  if (rawRoom === "1") return 1;
  if (rawRoom === "2") return 2;
  if (rawRoom === "3") return 3;
  return null;
}

/**
 * Gerencia o estado, histórico local, sugestões e deep linking de busca por código Dedalus.
 */
export function useBookSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(() => searchParams.get("q") ?? "");
  const [searchError, setSearchError] = useState("");
  const [fallbackSuggestions, setFallbackSuggestions] = useState<string[]>([]);
  const [matchedNameOptions, setMatchedNameOptions] = useState<NameMatchItem[]>([]);
  const [matchedContext, setMatchedContext] = useState<NameMatchItem | null>(null);
  const [dynamicBooks, setDynamicBooks] = useState<SearchableBookRecord[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(loadRecentSearches);
  const [searchKey, setSearchKey] = useState(0);

  useEffect(() => {
    let active = true;
    const loadBooks = () => {
      getDynamicSearchableBooks()
        .then((items) => {
          if (active) setDynamicBooks(items);
        })
        .catch(() => {});
    };
    loadBooks();
    window.addEventListener(CATALOG_INDEX_UPDATED_EVENT, loadBooks);
    return () => {
      active = false;
      window.removeEventListener(CATALOG_INDEX_UPDATED_EVENT, loadBooks);
    };
  }, []);

  const urlQuery = searchParams.get("q")?.trim() ?? "";
  const urlRoom = parseRoomParam(searchParams.get("sala"));

  const activeSearch = useMemo<{
    lastQuery: string;
    resultsByRoom: SearchResultsByRoom | null;
    activeRoom: RoomId | null;
    urlError: string;
    urlFallback: string[];
  }>(() => {
    if (!urlQuery) {
      return {
        lastQuery: "",
        resultsByRoom: null,
        activeRoom: null,
        urlError: "",
        urlFallback: [],
      };
    }

    const results = searchBooksByCode(urlQuery, staticBookCatalogRepository);
    const defaultRoom = getDefaultRoom(results);
    if (!defaultRoom) {
      return {
        lastQuery: "",
        resultsByRoom: null,
        activeRoom: null,
        urlError: `Código "${urlQuery}" do QR Code não encontrado no acervo. Confira o código no Dedalus (ex: 530, 869.3 C500, R).`,
        urlFallback: suggestNearestCodes(urlQuery, staticBookCatalogRepository, 3),
      };
    }

    const resolvedRoom = urlRoom && results[urlRoom] ? urlRoom : defaultRoom;
    return {
      lastQuery: urlQuery,
      resultsByRoom: results,
      activeRoom: resolvedRoom,
      urlError: "",
      urlFallback: [],
    };
  }, [urlQuery, urlRoom]);

  const pushRecentSearch = useCallback((code: string) => {
    setRecentSearches((prev) => {
      const next = [code, ...prev.filter((item) => item.toUpperCase() !== code.toUpperCase())].slice(
        0,
        MAX_RECENT_SEARCHES,
      );
      saveRecentSearches(next);
      return next;
    });
  }, []);

  const clearUrlSearchParams = useCallback(() => {
    if (!searchParams.has("q") && !searchParams.has("sala")) return;
    const next = new URLSearchParams(searchParams);
    next.delete("q");
    next.delete("sala");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    setSearchError((prev) => (prev ? "" : prev));
    setFallbackSuggestions((prev) => (prev.length > 0 ? [] : prev));
    setMatchedNameOptions((prev) => (prev.length > 0 ? [] : prev));
  }, []);

  const setActiveRoom = useCallback(
    (room: RoomId) => {
      if (!searchParams.has("q")) return;
      const next = new URLSearchParams(searchParams);
      next.set("sala", String(room));
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const submitSearch = useCallback(
    (rawQuery: string, contextItem?: NameMatchItem): boolean => {
      const trimmed = rawQuery.trim();
      if (!trimmed) {
        clearUrlSearchParams();
        setFallbackSuggestions([]);
        setMatchedNameOptions([]);
        setMatchedContext(null);
        setSearchError("Digite um código Dedalus (ex: 530, 869.3 C500) ou nome do livro, autor ou assunto.");
        return false;
      }

      const results = searchBooksByCode(rawQuery, staticBookCatalogRepository);
      const defaultRoom = getDefaultRoom(results);

      if (!defaultRoom) {
        const nameMatches = searchByNameOrSubject(
          trimmed,
          staticBookCatalogRepository,
          dynamicBooks,
          6,
        );
        if (nameMatches.length === 1) {
          const matched = nameMatches[0];
          const matchedResults = searchBooksByCode(matched.code, staticBookCatalogRepository);
          const matchedRoom = getDefaultRoom(matchedResults);
          if (matchedRoom) {
            setSearchValue(matched.code);
            setSearchKey((prev) => prev + 1);
            setSearchError("");
            setFallbackSuggestions([]);
            setMatchedNameOptions([]);
            setMatchedContext(matched);
            pushRecentSearch(matched.code);

            const next = new URLSearchParams(searchParams);
            next.set("q", matched.code);
            next.set("sala", String(matchedRoom));
            setSearchParams(next);
            return true;
          }
        }

        clearUrlSearchParams();
        setMatchedContext(null);
        if (nameMatches.length > 1) {
          setMatchedNameOptions(nameMatches);
          setFallbackSuggestions([]);
          setSearchError(
            `Encontramos ${nameMatches.length} opções para "${trimmed}". Escolha abaixo ou pesquise no Dedalus USP:`,
          );
          return false;
        }

        setMatchedNameOptions([]);
        setFallbackSuggestions(suggestNearestCodes(trimmed, staticBookCatalogRepository, 3));
        setSearchError(
          `Não encontramos "${trimmed}" diretamente nas estantes mapeadas. Pesquise no Dedalus USP para obter o código CDU ou tente outro termo:`,
        );
        return false;
      }

      setSearchValue(trimmed);
      setSearchKey((prev) => prev + 1);
      setSearchError("");
      setFallbackSuggestions([]);
      setMatchedNameOptions([]);
      setMatchedContext(contextItem ?? null);
      pushRecentSearch(trimmed);

      const next = new URLSearchParams(searchParams);
      next.set("q", trimmed);
      next.set("sala", String(defaultRoom));
      setSearchParams(next);
      return true;
    },
    [clearUrlSearchParams, dynamicBooks, pushRecentSearch, searchParams, setSearchParams],
  );

  const closeResults = useCallback(() => {
    setMatchedContext(null);
    clearUrlSearchParams();
  }, [clearUrlSearchParams]);

  const clearSearch = useCallback(() => {
    setSearchValue("");
    setSearchError("");
    setFallbackSuggestions([]);
    setMatchedNameOptions([]);
    setMatchedContext(null);
    clearUrlSearchParams();
  }, [clearUrlSearchParams]);

  const autocompleteSuggestions = useMemo(() => {
    if (searchValue.trim().length < 2) return [];
    return suggestMatchingCodes(searchValue, staticBookCatalogRepository, 5);
  }, [searchValue]);

  const nameSuggestions = useMemo<NameMatchItem[]>(() => {
    if (searchValue.trim().length < 2) return [];
    return searchByNameOrSubject(searchValue, staticBookCatalogRepository, dynamicBooks, 5);
  }, [dynamicBooks, searchValue]);

  const dedalusSearchUrl = useMemo(() => {
    return buildDedalusSearchUrl(searchValue || activeSearch.lastQuery);
  }, [searchValue, activeSearch.lastQuery]);

  return {
    searchValue,
    lastQuery: activeSearch.lastQuery,
    searchError: searchError || activeSearch.urlError,
    fallbackSuggestions:
      fallbackSuggestions.length > 0 ? fallbackSuggestions : activeSearch.urlFallback,
    autocompleteSuggestions,
    nameSuggestions,
    matchedNameOptions,
    matchedContext,
    dedalusSearchUrl,
    recentSearches,
    resultsByRoom: activeSearch.resultsByRoom,
    activeRoom: activeSearch.activeRoom,
    searchKey,
    setActiveRoom,
    handleSearchChange,
    submitSearch,
    closeResults,
    clearSearch,
  };
}
