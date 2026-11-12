import { useEffect, useState } from "react";
import { ROOM_CONFIG, ROOM_IDS, type RoomId } from "../../config/rooms";
import { extractShelves, type SearchResultsByRoom } from "../../domain/searchParser";
import style from "../Nav/style.module.css";
import { RoomMap } from "../RoomMap";

type TabType = "photo" | "map";

interface SearchResultModalProps {
  resultsByRoom: SearchResultsByRoom;
  activeRoom: RoomId;
  onSelectRoom: (room: RoomId) => void;
  onClose: () => void;
}

/**
 * Exibe o resultado da busca com alternância entre salas, carrossel de fotos e mapa.
 */
export function SearchResultModal({
  resultsByRoom,
  activeRoom,
  onSelectRoom,
  onClose,
}: SearchResultModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("photo");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const activeRoomData = resultsByRoom[activeRoom] ?? null;
  const activeMapConfig = ROOM_CONFIG[activeRoom];
  const currentImages = activeRoomData?.images ?? [];
  const availableRooms = ROOM_IDS.filter((id) => Boolean(resultsByRoom[id]));
  const otherRooms = availableRooms.filter((id) => id !== activeRoom);
  const activeShelves = extractShelves(activeRoomData);

  const handleRoomSwitch = (room: RoomId) => {
    onSelectRoom(room);
    setCurrentImageIndex(0);
    setActiveTab("photo");
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

  const photoTabClass = `${style.tabButton} ${activeTab === "photo" ? style.tabActive : ""}`;
  const mapTabClass = `${style.tabButton} ${activeTab === "map" ? style.tabActive : ""}`;
  const photoContainerClass = `${style.photoContainer} ${activeTab !== "photo" ? style.hidden : ""}`;
  const navButtonsOpacity = activeTab === "map" ? 0 : 1;

  return (
    <div className={style.imageContainer}>
      {/* Info da Estante */}
      <div className={style.shelfInfo}>
        <div className={style.roomLabel}>Sala {activeRoom}</div>
        {activeRoomData && <div className={style.shelfName}>{activeRoomData.shelf}</div>}
        {otherRooms.map((roomId) => {
          const otherData = resultsByRoom[roomId];
          if (!otherData) return null;
          return (
            <div key={roomId} className={style.otherRoomInfo}>
              Também em Sala {roomId}: {otherData.shelf} — Números: {otherData.range}
            </div>
          );
        })}
      </div>

      {/* Troca rápida entre as salas */}
      {availableRooms.length > 0 && (
        <div className={style.roomToggle}>
          {availableRooms.map((roomId) => (
            <button
              key={roomId}
              className={`${style.roomToggleBtn} ${activeRoom === roomId ? style.roomToggleBtnActive : ""}`}
              onClick={() => handleRoomSwitch(roomId)}
            >
              Ver Sala {roomId}
            </button>
          ))}
        </div>
      )}

      {/* Abas para mobile */}
      <div className={style.tabsContainer}>
        <button className={photoTabClass} onClick={() => setActiveTab("photo")}>
          Foto
        </button>
        {availableRooms.length > 0 && (
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
            alt={activeRoomData ? `${activeRoomData.shelf} - Sala ${activeRoom}` : ""}
            className={style.resultImage}
          />
        </div>

        {/* Mapa - mostra o mapa da sala atualmente ativa */}
        {activeTab === "map" && activeRoomData && (
          <div className={style.mapContainer}>
            <div className={style.mapLabel}>{activeMapConfig.label}</div>
            <RoomMap
              roomId={activeRoom}
              shelves={activeShelves}
              imageClassName={style.mapImage}
            />
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
            style={{ opacity: navButtonsOpacity }}
            aria-label="Imagem anterior"
          >
            ◀
          </button>
          <button
            className={style.nextButton}
            onClick={nextImage}
            disabled={currentImageIndex === currentImages.length - 1}
            style={{ opacity: navButtonsOpacity }}
            aria-label="Próxima imagem"
          >
            ▶
          </button>
          <div className={style.imageCounter}>
            {currentImageIndex + 1} / {currentImages.length}
          </div>
        </>
      )}

      <button className={style.closeButton} onClick={onClose} aria-label="Fechar resultado">
        ✕
      </button>
    </div>
  );
}
