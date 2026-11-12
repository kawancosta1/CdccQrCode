import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { RoomId } from "../config/roomConstants";
import {
  getDefaultRoom,
  searchBooksByCode,
  suggestMatchingCodes,
  suggestNearestCodes,
  type SearchResultsByRoom,
} from "../domain/searchParser";
import { staticBookCatalogRepository } from "../repositories/bookCatalogRepository";

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
  const [recentSearches, setRecentSearches] = useState<string[]>(loadRecentSearches);
  const [searchKey, setSearchKey] = useState(0);

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
    (rawQuery: string): boolean => {
      const trimmed = rawQuery.trim();
      if (!trimmed) {
        clearUrlSearchParams();
        setFallbackSuggestions([]);
        setSearchError("Digite um código de classificação Dedalus (ex: 530 ou 869.3 C500).");
        return false;
      }

      const results = searchBooksByCode(rawQuery, staticBookCatalogRepository);
      const defaultRoom = getDefaultRoom(results);

      if (!defaultRoom) {
        clearUrlSearchParams();
        setFallbackSuggestions(suggestNearestCodes(trimmed, staticBookCatalogRepository, 3));
        setSearchError(
          `Código "${trimmed}" não encontrado. Verifique os números no Dedalus (ex: 530, 869.3 C500, R).`,
        );
        return false;
      }

      setSearchValue(trimmed);
      setSearchKey((prev) => prev + 1);
      setSearchError("");
      setFallbackSuggestions([]);
      pushRecentSearch(trimmed);

      const next = new URLSearchParams(searchParams);
      next.set("q", trimmed);
      next.set("sala", String(defaultRoom));
      setSearchParams(next);
      return true;
    },
    [clearUrlSearchParams, pushRecentSearch, searchParams, setSearchParams],
  );

  const closeResults = useCallback(() => {
    clearUrlSearchParams();
  }, [clearUrlSearchParams]);

  const clearSearch = useCallback(() => {
    setSearchValue("");
    setSearchError("");
    setFallbackSuggestions([]);
    clearUrlSearchParams();
  }, [clearUrlSearchParams]);

  const autocompleteSuggestions = useMemo(() => {
    if (searchValue.trim().length < 2) return [];
    return suggestMatchingCodes(searchValue, staticBookCatalogRepository, 5);
  }, [searchValue]);

  return {
    searchValue,
    lastQuery: activeSearch.lastQuery,
    searchError: searchError || activeSearch.urlError,
    fallbackSuggestions:
      fallbackSuggestions.length > 0 ? fallbackSuggestions : activeSearch.urlFallback,
    autocompleteSuggestions,
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
