import { useState } from "react";
import { Link } from "react-router-dom";
import type { RoomId } from "../../config/rooms";
import {
  getDefaultRoom,
  searchBooksByCode,
  type SearchResultsByRoom,
} from "../../domain/searchParser";
import logoCdcc from "../img/CdccLogo.png";
import { SearchResultModal } from "../SearchResultModal";
import style from "./style.module.css";

/**
 * Barra de navegação principal com campo de pesquisa de códigos CDU.
 */
export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchError, setSearchError] = useState("");
  const [resultsByRoom, setResultsByRoom] = useState<SearchResultsByRoom | null>(null);
  const [activeRoom, setActiveRoom] = useState<RoomId | null>(null);
  const [searchKey, setSearchKey] = useState(0);

  const resetSearchResults = () => {
    setResultsByRoom(null);
    setActiveRoom(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    if (searchError) {
      setSearchError("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    const results = searchBooksByCode(e.currentTarget.value);
    const defaultRoom = getDefaultRoom(results);

    if (!defaultRoom) {
      resetSearchResults();
      setSearchError("Código não encontrado. Revise o código digitado.");
      return;
    }

    setResultsByRoom(results);
    setActiveRoom(defaultRoom);
    setSearchKey((prev) => prev + 1);
    setSearchError("");
    setMenuOpen(false);
  };

  const handleCloseResults = () => {
    resetSearchResults();
    setSearchValue("");
  };

  const openStateClass = menuOpen ? ` ${style.open}` : "";

  return (
    <>
      <nav className={style.navBar}>
        <Link to="/">
          <img src={logoCdcc} alt="Logo Oficial do CDCC" />
        </Link>

        {/* Menu Hamburger */}
        <button
          className={`${style.hamburger}${openStateClass}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Abrir menu"
        >
          <span className={`${style.line1}${openStateClass}`}></span>
          <span className={`${style.line2}${openStateClass}`}></span>
          <span className={`${style.line3}${openStateClass}`}></span>
        </button>

        {/* Menu Desktop/Tablet */}
        <div className={`${style.menuContainer}${menuOpen ? ` ${style.menuOpen}` : ""}`}>
          <input
            type="text"
            placeholder="Pesquisar..."
            aria-label="Pesquisar código de classificação"
            className={style.searchBar}
            value={searchValue}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
          {searchError && <span className={style.searchError}>{searchError}</span>}

          <p className={style.itens}>Contato</p>

          <Link to="/estantes" onClick={() => setMenuOpen(false)}>
            <p className={style.itens}>Estantes</p>
          </Link>
        </div>
      </nav>

      {resultsByRoom && activeRoom !== null && (
        <SearchResultModal
          key={searchKey}
          resultsByRoom={resultsByRoom}
          activeRoom={activeRoom}
          onSelectRoom={setActiveRoom}
          onClose={handleCloseResults}
        />
      )}
    </>
  );
}
