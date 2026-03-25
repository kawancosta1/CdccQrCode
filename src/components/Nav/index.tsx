import logoCdcc from "../img/CdccLogo.png";
import mapaSala1 from "../img/MapaSala1.png";
import mapaSala2 from "../img/MapaSala2.png";
import mapaSala3 from "../img/MapaSala3.png";
import style from "./style.module.css";
import { useState } from "react";
import { imageDatabaseSala1, imageDatabaseSala2, imageDatabaseSala3 } from "../../data";
import { Link } from "react-router-dom";


type RoomId = 1 | 2 | 3;
type TabType = "photo" | "map";

interface RoomData {
  images: string[];
  shelf: string;
  range: string;
}

type Sala1RangeEntry = RoomData & {
  codeBase?: string;
  cutterPrefixStart?: string;
  cutterNumberStart?: number;
  cutterPrefixEnd?: string;
  cutterNumberEnd?: number;
};

type CutterInput = {
  letter: string;
  number: number;
};


// dentro da room config tem as classes de cada mapa, caso for esse mapa
const ROOM_CONFIG: Record<RoomId,
 { 
  label: string;
  // essa label ai, é o texto que aparece logo acima do mapa 
   mapSrc:
    string; 
    mapAlt: string;
     arrowClassPrefix: string }> = {
  1: {
    label: "Sala 1",
    mapSrc: mapaSala1,
    mapAlt: "Mapa da Sala 1",
    arrowClassPrefix: "arrow-sala1-estante-",
  },
  2: {
    label: "Sala 2",
    mapSrc: mapaSala2,
    mapAlt: "Mapa da Sala 2",
    arrowClassPrefix: "arrow-estante-",
  },
  3: {
    label: "Sala 3",
    mapSrc: mapaSala3,
    mapAlt: "Mapa da Sala 3",
    arrowClassPrefix: "arrow-sala3-estante-",
  },
};


export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchError, setSearchError] = useState("");
  const [showImage, setShowImage] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [, setShelvesInfo] = useState<{ name: string; range: string }>({
    name: "",
    range: "",
  });
  const [activeTab, setActiveTab] = useState<TabType>("photo");
  const [hasSala1, setHasSala1] = useState(false);
  const [hasSala2, setHasSala2] = useState(false);
  const [hasSala3, setHasSala3] = useState(false);
  const [roomDataSala1, setRoomDataSala1] = useState<RoomData | null>(null);
  const [roomDataSala2, setRoomDataSala2] = useState<RoomData | null>(null);
  const [roomDataSala3, setRoomDataSala3] = useState<RoomData | null>(null);
  const [activeRoom, setActiveRoom] = useState<RoomId | null>(null);

  const hasAnyRoom = hasSala1 || hasSala2 || hasSala3;

  let activeRoomData: RoomData | null = null;
  if (activeRoom === 1) {
    activeRoomData = roomDataSala1;
  }
  if (activeRoom === 2) {
    activeRoomData = roomDataSala2;
  }
  if (activeRoom === 3) {
    activeRoomData = roomDataSala3;
  }

  let activeMapConfig: { label: string; mapSrc: string; mapAlt: string; arrowClassPrefix: string } | null = null;
  if (activeRoom !== null) {
    activeMapConfig = ROOM_CONFIG[activeRoom];
  }

  // Reseta completamente o resultado da busca atual.
  const resetSearchResults = () => {
    setShowImage(false);
    setHasSala1(false);
    setHasSala2(false);
    setHasSala3(false);
    setRoomDataSala1(null);
    setRoomDataSala2(null);
    setRoomDataSala3(null);
    setCurrentImages([]);
    setCurrentImageIndex(0);
    setActiveRoom(null);
  };

  const normalizeSearchValue = (rawValue: string) => {
    let value = rawValue.trim();

    // Para códigos 809.8928x, mantém apenas a primeira letra após o espaço.
    if (
      (value.startsWith("809.89283") || value.startsWith("809.89282")) &&
      value.includes(" ")
    ) {
      const parts = value.split(" ");
      if (parts.length >= 2) {
        value = `${parts[0]} ${parts[1].charAt(0)}`;
      }
      return value;
    }

    if(value.startsWith("R")){

     value = value.charAt(0);

     return value;

    }

    // Para os demais, usa só o trecho antes do espaço.
    if (value.includes(" ")) {
      return value.split(" ")[0];
    }

    return value;
  };

  const parse8693Cutter = (rawValue: string): CutterInput | null => {
    const value = rawValue.trim().toUpperCase();
    if (!value.startsWith("869.3")) return null;

    const parts = value.split(" ").filter(Boolean);
    if (parts.length < 2) return null;

    const cutterText = parts[1];
    const letter = cutterText.charAt(0);
    const numberText = cutterText.slice(1);
    const number = Number(numberText);

    if (letter < "A" || letter > "Z") return null;
    if (numberText.length === 0 || Number.isNaN(number)) return null;

    return { letter, number };
  };

  const isInsideCutterRange = (
    inputLetter: string,
    inputNumber: number,
    startLetter: string,
    startNumber: number,
    endLetter: string,
    endNumber: number,
  ) => {
    if (inputLetter < startLetter || inputLetter > endLetter) return false;
    if (inputLetter === startLetter && inputNumber < startNumber) return false;
    if (inputLetter === endLetter && inputNumber > endNumber) return false;
    return true;
  };

  const findSala1ByCutterRange = (rawValue: string): RoomData | null => {
    const parsed = parse8693Cutter(rawValue);
    if (!parsed) return null;

    for (const entry of Object.values(imageDatabaseSala1) as Sala1RangeEntry[]) {
      if (
        entry.codeBase !== "869.3" ||
        !entry.cutterPrefixStart ||
        entry.cutterNumberStart === undefined ||
        !entry.cutterPrefixEnd ||
        entry.cutterNumberEnd === undefined
      ) {
        continue;
      }

      const startLetter = entry.cutterPrefixStart.toUpperCase();
      const endLetter = entry.cutterPrefixEnd.toUpperCase();

      if (
        isInsideCutterRange(
          parsed.letter,
          parsed.number,
          startLetter,
          entry.cutterNumberStart,
          endLetter,
          entry.cutterNumberEnd,
        )
      ) {
        return entry;
      }
    }

    return null;
  };

  const toggleMenu = () => {
    //se ele está falso, vai pra true, se é true vai pra false
    setMenuOpen(!menuOpen);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    if (searchError) {
      setSearchError("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    const rawInput = (e.target as HTMLInputElement).value;
    const normalizedValue = normalizeSearchValue(rawInput);
    const parsed8693Cutter = parse8693Cutter(rawInput);

    let sala1Entry: RoomData | null = null;
    if (parsed8693Cutter) {
      // Para 869.3 com cutter (ex: 869.3 C500), usa busca por faixa.
      sala1Entry = findSala1ByCutterRange(rawInput);
    } else {
      sala1Entry = imageDatabaseSala1[normalizedValue] ?? null;
    }

    let sala2Entry: RoomData | null = null;
    let sala3Entry: RoomData | null = null;

    // Quando for 869.3 com cutter, ignora Sala 2 e Sala 3.
    if (!parsed8693Cutter) {
      sala2Entry = imageDatabaseSala2[normalizedValue] ?? null;
      sala3Entry = imageDatabaseSala3[normalizedValue] ?? null;
    }

    if (sala1Entry) {
      setRoomDataSala1(sala1Entry);
    } else {
      setRoomDataSala1(null);
    }

    if (sala2Entry) {
      setRoomDataSala2(sala2Entry);
    } else {
      setRoomDataSala2(null);
    }

    if (sala3Entry) {
      setRoomDataSala3(sala3Entry);
    } else {
      setRoomDataSala3(null);
    }

    // true ou false para o HasSalax
    setHasSala1(Boolean(sala1Entry));
    setHasSala2(Boolean(sala2Entry));
    setHasSala3(Boolean(sala3Entry));

    // Prioridade visual: Sala 3 -> Sala 2 -> Sala 1.
    let defaultRoom: RoomId | null = null;
    if (sala3Entry) {
      defaultRoom = 3;
    } else if (sala2Entry) {
      defaultRoom = 2;
    } else if (sala1Entry) {
      defaultRoom = 1;
    }

    if (!defaultRoom) {
      resetSearchResults();
      setSearchError("Código não encontrado. Revise o código digitado.");
      return;
    }

    let defaultEntry: RoomData | null = null;
    if (defaultRoom === 3) {
      defaultEntry = sala3Entry;
    } else if (defaultRoom === 2) {
      defaultEntry = sala2Entry;
    } else if (defaultRoom === 1) {
      defaultEntry = sala1Entry;
    }

    if (defaultEntry) {
      applyRoomSelection(defaultRoom, defaultEntry);
      setShowImage(true);

      setSearchError("");
    }
  };

  const nextImage = () => {
    if (currentImageIndex < currentImages.length - 1) {
      setCurrentImageIndex((prev) => prev + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex((prev) => prev - 1);
    }
  };

  // Aplica todos os estados necessários ao trocar a sala ativa.
  const applyRoomSelection = (room: RoomId, roomData: RoomData) => {
    setActiveRoom(room);
    setCurrentImages(roomData.images);
    setShelvesInfo({ name: roomData.shelf, range: roomData.range });
    setCurrentImageIndex(0);
    setActiveTab("photo");
  };

  // Lê "Estante 1 / Estante 2" ou "Estante R" e devolve os identificadores para desenhar setas no mapa.
  const extractShelves = (roomData: RoomData | null) => {
    if (!roomData) return ["1"];

    const matches = Array.from(
      roomData.shelf.matchAll(/Estante\s+([A-Za-z0-9]+)/gi),
      (match) => match[1].toUpperCase(),
    );

    if (matches.length > 0) {
      return matches;
    }

    return ["1"];
  };

  const switchActiveRoom = (room: RoomId) => {
    if (room === 1 && roomDataSala1) {
      applyRoomSelection(1, roomDataSala1);
      return;
    }

    if (room === 2 && roomDataSala2) {
      applyRoomSelection(2, roomDataSala2);
      return;
    }

    if (room === 3 && roomDataSala3) {
      applyRoomSelection(3, roomDataSala3);
    }
  };

  // ai ela vai receber, e no mapa, vai ter um "map" para caso  tenha mais de uma estante e ele repetir o mesmo processo para outra estante
  const activeShelves = extractShelves(activeRoomData);

  let otherRoomLabel = "";
  let otherRoomShelf = "";
  let otherRoomRange = "";
  if (activeRoom === 1 && roomDataSala2) {
    otherRoomLabel = "2";
    otherRoomShelf = roomDataSala2.shelf;
    otherRoomRange = roomDataSala2.range;
  } else if (activeRoom === 2 && roomDataSala1) {
    otherRoomLabel = "1";
    otherRoomShelf = roomDataSala1.shelf;
    otherRoomRange = roomDataSala1.range;
  }

  let hamburgerClass = style.hamburger;
  let line1Class = style.line1;
  let line2Class = style.line2;
  let line3Class = style.line3;
  let menuContainerClass = style.menuContainer;

  if (menuOpen) {
    hamburgerClass += ` ${style.open}`;
    line1Class += ` ${style.open}`;
    line2Class += ` ${style.open}`;
    line3Class += ` ${style.open}`;
    menuContainerClass += ` ${style.menuOpen}`;
  }

  let sala1ButtonClass = style.roomToggleBtn;
  let sala2ButtonClass = style.roomToggleBtn;
  let sala3ButtonClass = style.roomToggleBtn;

  if (activeRoom === 1) {
    sala1ButtonClass += ` ${style.roomToggleBtnActive}`;
  }
  if (activeRoom === 2) {
    sala2ButtonClass += ` ${style.roomToggleBtnActive}`;
  }
  if (activeRoom === 3) {
    sala3ButtonClass += ` ${style.roomToggleBtnActive}`;
  }

  let photoTabClass = style.tabButton;
  let mapTabClass = style.tabButton;
  if (activeTab === "photo") {
    photoTabClass += ` ${style.tabActive}`;
  }
  if (activeTab === "map") {
    mapTabClass += ` ${style.tabActive}`;
  }

  let photoContainerClass = style.photoContainer;
  if (activeTab !== "photo") {
    photoContainerClass += ` ${style.hidden}`;
  }

  let navButtonsOpacity = 1;
  if (activeTab === "map") {
    navButtonsOpacity = 0;
  }

  return (
    <>
      <nav className={style.navBar}>
        <Link to={"/"}>
          <img src={logoCdcc} alt="Logo Oficial do CDCC" />
        </Link>

        {/* Menu Hamburger */}
        <button
          className={hamburgerClass}
          onClick={toggleMenu}
        >
          <span className={line1Class}></span>
          <span className={line2Class}></span>
          <span className={line3Class}></span>
        </button>

        {/* Menu Desktop/Tablet */}
        <div className={menuContainerClass}>
          <input
            type="text"
            placeholder="Pesquisar..."
            className={style.searchBar}
            value={searchValue}
            // o on chance ativa se o texto mudar
            onChange={handleSearchChange}
            onKeyDown={handleKeyPress}
          />
          {searchError && <span className={style.searchError}>{searchError}</span>}

          <p className={style.itens} id="contato-mobile">
            Contato
          </p>

          <Link to="/estantes">
            <p className={style.itens} id="contato-mobile">
              Estantes
            </p>
          </Link>
        </div>
      </nav>

      {/* Exibir imagem quando encontrar o código */}
      {showImage && (
        <div className={style.imageContainer}>
          {/* Info da Estante */}
          <div className={style.shelfInfo}>
            {activeRoom && <div className={style.roomLabel}>Sala {activeRoom}</div>}
            {activeRoomData && <div className={style.shelfName}>{activeRoomData.shelf}</div>}
            {hasSala1 && hasSala2 && roomDataSala1 && roomDataSala2 && (
              <div className={style.otherRoomInfo}>
                Também em Sala {otherRoomLabel}:{" "}
                {otherRoomShelf} — Números: {otherRoomRange}
              </div>
            )}
          </div>

          {/* Troca rápida entre as salas quando existir em múltiplas */}
          {hasAnyRoom && (
            <div className={style.roomToggle}>
              {hasSala1 && (
                <button
                  className={sala1ButtonClass}
                  onClick={() => switchActiveRoom(1)}
                >
                  Ver Sala 1
                </button>
              )}
              {/* ele só renderiza se tiver a sala 2 */}
              {hasSala2 && (
                <button
                  className={sala2ButtonClass}
                  // ele passa o 2 como novo room, ai esse switch room vai chamar a outra função de "setar" a sala
                  onClick={() => switchActiveRoom(2)}
                >
                  Ver Sala 2
                </button>
              )}
              {hasSala3 && (
                <button
                  className={sala3ButtonClass}
                  onClick={() => switchActiveRoom(3)}
                >
                  Ver Sala 3
                </button>
              )}
            </div>
          )}

          {/* Abas para mobile */}
          <div className={style.tabsContainer}>
            <button className={photoTabClass} onClick={() => setActiveTab("photo")}>
              Foto
            </button>
            {hasAnyRoom && (
              <button className={mapTabClass} onClick={() => setActiveTab("map")}>
                Mapa
              </button>
            )}
          </div>

          <div className={style.contentWrapper}>
            {/* Foto - mostrada em desktop sempre, em mobile apenas quando activeTab === 'photo' */}
            <div className={photoContainerClass}>
              <img
                src={currentImages[currentImageIndex]}
                alt=""
                className={style.resultImage}
              />
            </div>

            {/* Mapa - mostra o mapa da sala atualmente ativa, se existir dados para ela */}
            {activeTab === "map" && activeMapConfig && activeRoomData && (
              <div className={style.mapContainer}>
                <div className={style.mapLabel}>{activeMapConfig.label}</div>
                <div className={style.mapWrapper}>
                  <img
                    src={activeMapConfig.mapSrc}
                    alt={activeMapConfig.mapAlt}
                    className={style.mapImage}
                  />
                  {activeShelves.map((shelfNum) => (
                    <div
                      key={shelfNum}
                      // é assim que ele pega a estante e coloca na classe, ele junta o prefixo da arrow do mapConfig + shelfNum
                      className={`${style.mapArrow} ${style[`${activeMapConfig.arrowClassPrefix}${shelfNum}`]}`}
                    ></div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botões de navegação sempre visíveis quando existe imagem */}
          {currentImages.length > 0 && (
            <>
              <button
                className={style.prevButton}
                onClick={prevImage}
                disabled={currentImageIndex === 0}
                // se a active tab for map, a opcadidade é 0
                style={{ opacity: navButtonsOpacity }}
              >
                ◀
              </button>
              <button
                className={style.nextButton}
                onClick={nextImage}
                disabled={currentImageIndex === currentImages.length - 1}
                style={{ opacity: navButtonsOpacity }}
              >
                ▶
              </button>
              <div className={style.imageCounter}>
                {currentImageIndex + 1} / {currentImages.length}
              </div>
            </>
          )}

          <button
            className={style.closeButton}
            onClick={() => {
              resetSearchResults();
              setSearchValue("");
            }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
