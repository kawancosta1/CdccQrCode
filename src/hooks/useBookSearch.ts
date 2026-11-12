import { useState } from "react";
import type { RoomId } from "../config/roomConstants";
import {
  getDefaultRoom,
  searchBooksByCode,
  type SearchResultsByRoom,
} from "../domain/searchParser";
import { staticBookCatalogRepository } from "../repositories/bookCatalogRepository";

/**
 * Gerencia o estado e o fluxo de busca de livros por código de classificação.
 */
export function useBookSearch() {
  const [searchValue, setSearchValue] = useState("");
  const [searchError, setSearchError] = useState("");
  const [resultsByRoom, setResultsByRoom] = useState<SearchResultsByRoom | null>(null);
  const [activeRoom, setActiveRoom] = useState<RoomId | null>(null);
  const [searchKey, setSearchKey] = useState(0);

  const resetResults = () => {
    setResultsByRoom(null);
    setActiveRoom(null);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (searchError) {
      setSearchError("");
    }
  };

  const submitSearch = (rawQuery: string): boolean => {
    if (!rawQuery.trim()) {
      resetResults();
      setSearchError("");
      return false;
    }

    const results = searchBooksByCode(rawQuery, staticBookCatalogRepository);
    const defaultRoom = getDefaultRoom(results);

    if (!defaultRoom) {
      resetResults();
      setSearchError("Código não encontrado. Revise o código digitado.");
      return false;
    }

    setResultsByRoom(results);
    setActiveRoom(defaultRoom);
    setSearchKey((prev) => prev + 1);
    setSearchError("");
    return true;
  };

  const closeResults = () => {
    resetResults();
    setSearchValue("");
  };

  return {
    searchValue,
    searchError,
    resultsByRoom,
    activeRoom,
    searchKey,
    setActiveRoom,
    handleSearchChange,
    submitSearch,
    closeResults,
  };
}
