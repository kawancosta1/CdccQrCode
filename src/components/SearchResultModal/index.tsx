import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  ExternalLink,
  Link2,
  Map as MapIcon,
  MapPin,
  Maximize2,
  Search,
  X,
} from "lucide-react";
import { getShelfDirectionText, ROOM_CONFIG, ROOM_IDS, type RoomId } from "../../config/rooms";
import { extractShelves, type SearchResultsByRoom } from "../../domain/searchParser";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { getPhotoOverrides, type PhotoOverrideRecord } from "../../services/mappingService";
import { ImageLightbox } from "../ImageLightbox";
import { RoomMap } from "../RoomMap";
import style from "./style.module.css";

type TabType = "photo" | "map";

interface SearchResultModalProps {
  query: string;
  resultsByRoom: SearchResultsByRoom;
  activeRoom: RoomId;
  onSelectRoom: (room: RoomId) => void;
  onClose: () => void;
  onNewSearch?: () => void;
}

/**
 * Modal de resultado da busca com orientação física passo a passo, foto da estante e mapa da sala.
 */
export function SearchResultModal({
  query,
  resultsByRoom,
  activeRoom,
  onSelectRoom,
  onClose,
  onNewSearch,
}: SearchResultModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("photo");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const skipFocusRestoreRef = useRef(false);

  useFocusTrap(dialogRef, !lightboxOpen);

  useEffect(() => {
    const previousActiveElement = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
      if (!skipFocusRestoreRef.current && previousActiveElement?.isConnected) {
        previousActiveElement.focus();
      }
    };
  }, [onClose]);

  const [photoOverrides, setPhotoOverrides] = useState<PhotoOverrideRecord[]>([]);

  useEffect(() => {
    let active = true;
    getPhotoOverrides()
      .then((list) => {
        if (active) setPhotoOverrides(list);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const activeRoomData = resultsByRoom[activeRoom] ?? null;
  const activeMapConfig = ROOM_CONFIG[activeRoom];
  const baseImages = activeRoomData?.images ?? [];
  const activeShelves = extractShelves(activeRoomData);
  const normalizedQuery = query.trim().toUpperCase();
  const codeOverride = photoOverrides.find(
    (o) =>
      o.targetType === "code" &&
      (o.codeKey ?? "").trim().toUpperCase() === normalizedQuery
  );
  const shelfOverride = photoOverrides.find(
    (o) =>
      o.targetType === "shelf" &&
      o.roomId === activeRoom &&
      activeShelves.some((s) => s.toUpperCase() === (o.shelfKey ?? "").toUpperCase())
  );
  const currentImages = codeOverride
    ? [codeOverride.imageUrl, ...baseImages]
    : shelfOverride
      ? [shelfOverride.imageUrl, ...baseImages.slice(1)]
      : baseImages;
  const availableRooms = ROOM_IDS.filter((id) => Boolean(resultsByRoom[id]));
  const otherRooms = availableRooms.filter((id) => id !== activeRoom);
  const directionText = getShelfDirectionText(activeRoom, activeShelves);

  const primaryShelfNumber = Number(activeShelves[0]);
  const hasShelfPage =
    !Number.isNaN(primaryShelfNumber) &&
    activeMapConfig.shelfNumbers.includes(primaryShelfNumber);

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

  const handleNewSearchClick = () => {
    skipFocusRestoreRef.current = Boolean(onNewSearch);
    onClose();
    onNewSearch?.();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      setCopiedLink(false);
    }
  };

  return (
    <div
      className={style.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={style.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-result-title"
      >
        <div className="sr-only" aria-live="polite">
          {directionText}
          {currentImages.length > 1
            ? ` Foto ${currentImageIndex + 1} de ${currentImages.length}.`
            : ""}
        </div>
        {/* Cabeçalho do Resultado */}
        <header className={style.header}>
          <div className={style.headerMain}>
            <div className={style.badgeRow}>
              {query && (
                <span className={style.codeBadge}>
                  Código: <code>{query}</code>
                </span>
              )}
              <span className={style.roomBadge}>
                <MapPin size={14} aria-hidden="true" />
                {activeMapConfig.label}
              </span>
            </div>

            <h2 id="search-result-title" className={style.title}>
              {activeRoomData?.shelf ?? activeMapConfig.label}
            </h2>

            {activeRoomData?.range && (
              <p className={style.rangeText}>
                Faixa na estante: <strong>{activeRoomData.range}</strong>
              </p>
            )}
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className={style.closeButton}
            onClick={onClose}
            aria-label="Fechar resultado da busca"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        {/* Orientação prática + Seletor de salas */}
        <div className={style.wayfindingBar}>
          <div className={style.wayfindingSteps}>
            <Compass size={18} className={style.wayfindingIcon} aria-hidden="true" />
            <p className={style.wayfindingText}>
              {directionText} Confira a porção indicada na foto para localizar a prateleira exata.
            </p>
          </div>

          {availableRooms.length > 1 && (
            <div className={style.roomToggle} role="group" aria-label="Salas com resultados">
              {availableRooms.map((roomId) => (
                <button
                  key={roomId}
                  type="button"
                  aria-pressed={activeRoom === roomId}
                  className={`${style.roomToggleBtn} ${
                    activeRoom === roomId ? style.roomToggleBtnActive : ""
                  }`}
                  onClick={() => handleRoomSwitch(roomId)}
                >
                  Sala {roomId}
                </button>
              ))}
            </div>
          )}
        </div>

        {otherRooms.length > 0 && (
          <div className={style.otherRoomsBanner}>
            {otherRooms.map((roomId) => {
              const otherData = resultsByRoom[roomId];
              if (!otherData) return null;
              return (
                <button
                  key={roomId}
                  type="button"
                  className={style.otherRoomChip}
                  onClick={() => handleRoomSwitch(roomId)}
                >
                  Também disponível na <strong>Sala {roomId}</strong> ({otherData.shelf} •{" "}
                  {otherData.range})
                </button>
              );
            })}
          </div>
        )}

        {/* Abas exclusivas para Mobile/Tablet */}
        <div className={style.mobileTabs} role="tablist" aria-label="Visualização da localização">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "photo"}
            className={`${style.tabButton} ${activeTab === "photo" ? style.tabActive : ""}`}
            onClick={() => setActiveTab("photo")}
          >
            <Camera size={16} aria-hidden="true" />
            Foto da estante
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "map"}
            className={`${style.tabButton} ${activeTab === "map" ? style.tabActive : ""}`}
            onClick={() => setActiveTab("map")}
          >
            <MapIcon size={16} aria-hidden="true" />
            Mapa da sala
          </button>
        </div>

        {/* Conteúdo Principal: Lado a lado no Desktop, por aba no Mobile */}
        <div className={style.bodyGrid}>
          {/* Painel da Foto */}
          <section
            className={`${style.panel} ${activeTab !== "photo" ? style.mobileHidden : ""}`}
            aria-label="Foto da estante"
          >
            <div className={style.panelHeader}>
              <span className={style.panelTitle}>
                <Camera size={16} aria-hidden="true" />
                Foto da estante
              </span>
              <div className={style.panelHeaderActions}>
                {currentImages.length > 1 && (
                  <span className={style.imageCounter}>
                    {currentImageIndex + 1} de {currentImages.length}
                  </span>
                )}
                {currentImages.length > 0 && (
                  <button
                    type="button"
                    className={style.expandBtn}
                    onClick={() => setLightboxOpen(true)}
                    aria-label="Ampliar foto da estante"
                  >
                    <Maximize2 size={14} aria-hidden="true" />
                    Ampliar
                  </button>
                )}
              </div>
            </div>

            <div className={style.mediaFrame}>
              {currentImages.length > 0 ? (
                <>
                  <img
                    key={`${activeRoom}-${currentImageIndex}`}
                    src={currentImages[currentImageIndex]}
                    alt={`${activeRoomData?.shelf ?? "Estante"} na ${activeMapConfig.label} — imagem ${
                      currentImageIndex + 1
                    } de ${currentImages.length}`}
                    className={`${style.resultImage} ${style.clickableImage} ${style.imageEnter}`}
                    decoding="async"
                    onClick={() => setLightboxOpen(true)}
                  />

                  {currentImages.length > 1 && (
                    <div className={style.carouselControls}>
                      <button
                        type="button"
                        className={style.navCircleBtn}
                        onClick={prevImage}
                        disabled={currentImageIndex === 0}
                        aria-label="Foto anterior"
                      >
                        <ChevronLeft size={20} aria-hidden="true" />
                      </button>

                      <div className={style.dotsRow} aria-hidden="true">
                        {currentImages.map((_, idx) => (
                          <span
                            key={idx}
                            className={`${style.dot} ${
                              idx === currentImageIndex ? style.dotActive : ""
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        className={style.navCircleBtn}
                        onClick={nextImage}
                        disabled={currentImageIndex === currentImages.length - 1}
                        aria-label="Próxima foto"
                      >
                        <ChevronRight size={20} aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className={style.emptyMedia}>Nenhuma foto disponível para esta estante.</p>
              )}
            </div>
          </section>

          {/* Painel do Mapa */}
          <section
            className={`${style.panel} ${activeTab !== "map" ? style.mobileHidden : ""}`}
            aria-label="Mapa da sala"
          >
            <div className={style.panelHeader}>
              <span className={style.panelTitle}>
                <MapIcon size={16} aria-hidden="true" />
                Mapa da {activeMapConfig.label}
              </span>
              <span className={style.markerLegend}>
                <span className={style.legendDot} aria-hidden="true" />
                Estante {activeShelves.join(", ")}
              </span>
            </div>

            <div className={style.mediaFrame}>
              {activeRoomData && (
                <RoomMap
                  roomId={activeRoom}
                  shelves={activeShelves}
                  imageClassName={style.mapImage}
                />
              )}
            </div>
          </section>
        </div>

        {/* Rodapé de Ações */}
        <footer className={style.footer}>
          {hasShelfPage ? (
            <Link
              to={`/estantes/${activeMapConfig.slug}/${primaryShelfNumber}`}
              onClick={onClose}
              className={style.secondaryBtn}
            >
              <ExternalLink size={16} aria-hidden="true" />
              Abrir página da Estante {primaryShelfNumber}
            </Link>
          ) : (
            <Link to="/estantes" onClick={onClose} className={style.secondaryBtn}>
              <ExternalLink size={16} aria-hidden="true" />
              Ver todas as estantes
            </Link>
          )}

          <button type="button" onClick={handleCopyLink} className={style.secondaryBtn}>
            {copiedLink ? <Check size={16} aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />}
            {copiedLink ? "Link copiado!" : "Copiar link"}
          </button>

          <button type="button" onClick={handleNewSearchClick} className={style.primaryBtn}>
            <Search size={16} aria-hidden="true" />
            Nova busca
          </button>
        </footer>
      </div>

      {lightboxOpen && currentImages[currentImageIndex] && (
        <ImageLightbox
          src={currentImages[currentImageIndex]}
          alt={`${activeRoomData?.shelf ?? "Estante"} — ${activeMapConfig.label}`}
          caption={`${activeMapConfig.label} • ${activeRoomData?.shelf ?? ""} (${
            activeRoomData?.range ?? ""
          })`}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
