import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  ExternalLink,
  Layers,
  Link2,
  Map as MapIcon,
  MapPin,
  Maximize2,
  Search,
  X,
} from "lucide-react";
import { getShelfDirectionText, ROOM_CONFIG, ROOM_IDS, type RoomId } from "../../config/rooms";
import { useAccessibility } from "../../context/accessibilityStore";
import type { NameMatchItem } from "../../domain/nameSearch";
import { extractShelves, type SearchResultsByRoom } from "../../domain/searchParser";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { getPhotoOverrides, type PhotoOverrideRecord } from "../../services/mappingService";
import { getShelfMapping } from "../../services/shelfSpotlightService";
import type { ShelfMapping } from "../../types/shelfMapping";
import { BookPagesTransition } from "../BookPagesTransition";
import { ImageLightbox } from "../ImageLightbox";
import { LibraryMap3D } from "../LibraryMap3D";
import { RoomMap } from "../RoomMap";
import { ShelfSpotlightViewer } from "../ShelfSpotlightViewer";
import style from "./style.module.css";

type ViewMode = "summary" | "map3d" | "photo";

interface SearchResultModalProps {
  query: string;
  matchedContext?: NameMatchItem | null;
  relatedMatches?: NameMatchItem[];
  resultsByRoom: SearchResultsByRoom;
  activeRoom: RoomId;
  onSelectRoom: (room: RoomId) => void;
  onSelectMatch?: (item: NameMatchItem) => void;
  onClose: () => void;
  onNewSearch?: () => void;
}

const EASE_EDITORIAL = [0.22, 1, 0.36, 1] as const;

/**
 * Modal compacto de resultado da busca ("above the fold", zero scroll forçado)
 * com 2 botões principais de ação tátil: Localizar no Mapa 3D e Ver Foto da Estante.
 */
export function SearchResultModal({
  query,
  matchedContext,
  relatedMatches = [],
  resultsByRoom,
  activeRoom,
  onSelectRoom,
  onSelectMatch,
  onClose,
  onNewSearch,
}: SearchResultModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("summary");
  const [mapDimension, setMapDimension] = useState<"3d" | "2d">("3d");
  const [transitionTick, setTransitionTick] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { reducedMotion } = useAccessibility();
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
  const [spotlightMapping, setSpotlightMapping] = useState<ShelfMapping | null>(null);

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
      (o.codeKey ?? "").trim().toUpperCase() === normalizedQuery,
  );
  const shelfOverride = photoOverrides.find(
    (o) =>
      o.targetType === "shelf" &&
      o.roomId === activeRoom &&
      activeShelves.some((s) => s.toUpperCase() === (o.shelfKey ?? "").toUpperCase()),
  );
  const currentImages = codeOverride
    ? [codeOverride.imageUrl, ...baseImages]
    : shelfOverride
      ? [shelfOverride.imageUrl, ...baseImages.slice(1)]
      : baseImages;

  const availableRooms = ROOM_IDS.filter((id) => Boolean(resultsByRoom[id]));
  const directionText = getShelfDirectionText(activeRoom, activeShelves);
  const primaryShelfNumber = Number(activeShelves[0]);
  const hasShelfPage =
    !Number.isNaN(primaryShelfNumber) &&
    activeMapConfig.shelfNumbers.includes(primaryShelfNumber);

  useEffect(() => {
    let active = true;
    if (Number.isNaN(primaryShelfNumber)) return;
    getShelfMapping(activeRoom, primaryShelfNumber)
      .then((m) => {
        if (active) setSpotlightMapping(m);
      })
      .catch(() => {
        if (active) setSpotlightMapping(null);
      });
    return () => {
      active = false;
    };
  }, [activeRoom, primaryShelfNumber]);

  const openFocusedView = (target: "map3d" | "photo") => {
    setTransitionTick((t) => t + 1);
    setViewMode(target);
  };

  const handleRoomSwitch = (room: RoomId) => {
    onSelectRoom(room);
    setCurrentImageIndex(0);
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

  const classificationTitle =
    matchedContext?.title ||
    (activeRoomData?.range ? `Faixa ${activeRoomData.range}` : activeMapConfig.areaLabel);

  return (
    <>
      <BookPagesTransition triggerKey={transitionTick} />

      <div
        className={style.backdrop}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          ref={dialogRef}
          className={`${style.dialog} ${viewMode === "summary" ? style.dialogCompact : style.dialogFocused}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-result-title"
        >
          <div className="sr-only" aria-live="polite">
            {directionText}
          </div>

          {/* Cabeçalho compacto */}
          <header className={style.header}>
            <div className={style.headerMain}>
              <div className={style.badgeRow}>
                {query && (
                  <span className={style.codeBadge}>
                    CDU <code>{query}</code>
                  </span>
                )}
                <span className={style.roomBadge}>
                  <MapPin size={13} aria-hidden="true" />
                  {activeMapConfig.label}
                </span>
                {availableRooms.length > 1 && (
                  <div className={style.roomToggle} role="group" aria-label="Alternar sala">
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

              <h2 id="search-result-title" className={style.title}>
                {activeRoomData?.shelf ?? activeMapConfig.label}
                {activeRoomData?.range && (
                  <span className={style.titleRange}> • {activeRoomData.range}</span>
                )}
              </h2>
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

          {/* Múltiplos resultados quando busca por nome retorna mais de 1 item */}
          {relatedMatches.length > 1 && onSelectMatch && (
            <div className={style.relatedMatchesBar} role="region" aria-label="Outros resultados encontrados">
              <p className={style.relatedMatchesTitle}>
                <strong>{relatedMatches.length}</strong> resultados encontrados — toque para alternar:
              </p>
              <div className={style.relatedMatchesList}>
                {relatedMatches.map((item) => {
                  const isSelected = matchedContext?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={isSelected}
                      className={`${style.relatedMatchBtn} ${isSelected ? style.relatedMatchBtnActive : ""}`}
                      onClick={() => onSelectMatch(item)}
                    >
                      <span className={style.relatedMatchTitle}>{item.title}</span>
                      <span className={style.relatedMatchMeta}>
                        {item.subtitle ? `${item.subtitle} • ` : ""}
                        <code>{item.routePath ? "Página" : `CDU ${item.code}`}</code>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODO 1: Resumo Compacto "Above the Fold" (zero scroll forçado) */}
          {viewMode === "summary" && (
            <motion.div
              key="summary-view"
              className={style.summaryBody}
              initial={reducedMotion ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, ease: EASE_EDITORIAL }}
            >
              <div className={style.compactFactsGrid}>
                <div className={style.factItem}>
                  <span className={style.factLabel}>Código CDU</span>
                  <strong className={style.factValueMono}>{query || "—"}</strong>
                </div>
                <div className={style.factItem}>
                  <span className={style.factLabel}>Título / Área</span>
                  <strong className={style.factValue}>{classificationTitle}</strong>
                </div>
                <div className={style.factItem}>
                  <span className={style.factLabel}>Corredor / Setor</span>
                  <strong className={style.factValue}>
                    {activeMapConfig.label} • {directionText}
                  </strong>
                </div>
                <div className={style.factItem}>
                  <span className={style.factLabel}>Estante e Faixa</span>
                  <strong className={style.factValue}>
                    {activeRoomData?.shelf ?? "Consultar mapa"}
                    {activeRoomData?.range ? ` (${activeRoomData.range})` : ""}
                  </strong>
                </div>
              </div>

              {/* 2 Botões Principais de Ação Tátil */}
              <div className={style.primaryActionsRow}>
                <button
                  type="button"
                  className={style.actionPrimary3D}
                  onClick={() => openFocusedView("map3d")}
                >
                  <Compass size={20} aria-hidden="true" />
                  <span className={style.actionBtnText}>
                    <strong>Localizar no Mapa 3D</strong>
                    <small>Rota guiada pelos corredores até a estante</small>
                  </span>
                </button>

                <button
                  type="button"
                  className={style.actionSecondaryPhoto}
                  onClick={() => openFocusedView("photo")}
                >
                  <Camera size={20} aria-hidden="true" />
                  <span className={style.actionBtnText}>
                    <strong>Ver Foto da Estante</strong>
                    <small>Destaque visual da prateleira exata</small>
                  </span>
                </button>
              </div>
            </motion.div>
          )}

          {/* MODO 2: Foco Automático no Mapa 3D (com rota A*) */}
          {viewMode === "map3d" && (
            <motion.div
              key="map3d-view"
              className={style.focusedBody}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reducedMotion ? 0.15 : 0.38, ease: EASE_EDITORIAL }}
            >
              <div className={style.focusedTopBar}>
                <button
                  type="button"
                  className={style.backSummaryBtn}
                  onClick={() => setViewMode("summary")}
                >
                  <ArrowLeft size={15} aria-hidden="true" />
                  Resumo
                </button>

                <div className={style.focusedBarRight}>
                  <div className={style.dimToggle} role="group" aria-label="Modo do mapa">
                    <button
                      type="button"
                      className={`${style.dimBtn} ${mapDimension === "3d" ? style.dimBtnActive : ""}`}
                      onClick={() => setMapDimension("3d")}
                    >
                      3D Interativo
                    </button>
                    <button
                      type="button"
                      className={`${style.dimBtn} ${mapDimension === "2d" ? style.dimBtnActive : ""}`}
                      onClick={() => setMapDimension("2d")}
                    >
                      <MapIcon size={13} aria-hidden="true" />
                      Planta 2D
                    </button>
                  </div>

                  <button
                    type="button"
                    className={style.switchActionBtn}
                    onClick={() => openFocusedView("photo")}
                  >
                    <Camera size={15} aria-hidden="true" />
                    Ver Foto da Estante
                  </button>
                </div>
              </div>

              <div className={style.focusedStage}>
                {mapDimension === "3d" ? (
                  <LibraryMap3D
                    roomId={activeRoom}
                    shelves={activeShelves}
                    className={style.stageFill}
                  />
                ) : (
                  <div className={style.map2dContainer}>
                    <RoomMap
                      roomId={activeRoom}
                      shelves={activeShelves}
                      imageClassName={style.mapImage}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* MODO 3: Foco Automático na Foto da Estante */}
          {viewMode === "photo" && (
            <motion.div
              key="photo-view"
              className={style.focusedBody}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reducedMotion ? 0.15 : 0.38, ease: EASE_EDITORIAL }}
            >
              <div className={style.focusedTopBar}>
                <button
                  type="button"
                  className={style.backSummaryBtn}
                  onClick={() => setViewMode("summary")}
                >
                  <ArrowLeft size={15} aria-hidden="true" />
                  Resumo
                </button>

                <div className={style.focusedBarRight}>
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

                  <button
                    type="button"
                    className={style.switchActionBtnPrimary}
                    onClick={() => openFocusedView("map3d")}
                  >
                    <Compass size={15} aria-hidden="true" />
                    Localizar no Mapa 3D
                  </button>
                </div>
              </div>

              <div className={style.focusedStage}>
                <div className={style.photoStageFrame}>
                  {spotlightMapping?.cleanImageUrl ? (
                    <ShelfSpotlightViewer
                      imageUrl={spotlightMapping.cleanImageUrl}
                      alt={`${activeRoomData?.shelf ?? "Estante"} na ${activeMapConfig.label}`}
                      shelfLabel={activeRoomData?.shelf ?? `Estante ${primaryShelfNumber}`}
                      activeCode={query}
                      regions={spotlightMapping.regions}
                      spatialHint={spotlightMapping.spatialHint || directionText}
                      aspectRatio={spotlightMapping.imageAspectRatio}
                      onOpenLightbox={() => setLightboxOpen(true)}
                    />
                  ) : currentImages.length > 0 ? (
                    <>
                      <img
                        key={`${activeRoom}-${currentImageIndex}`}
                        src={currentImages[currentImageIndex]}
                        alt={`${activeRoomData?.shelf ?? "Estante"} na ${activeMapConfig.label} — imagem ${
                          currentImageIndex + 1
                        } de ${currentImages.length}`}
                        className={`${style.resultImage} ${style.clickableImage}`}
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
              </div>
            </motion.div>
          )}

          {/* Rodapé enxuto de utilidades */}
          <footer className={style.footer}>
            {hasShelfPage ? (
              <Link
                to={`/estantes/${activeMapConfig.slug}/${primaryShelfNumber}`}
                onClick={onClose}
                className={style.secondaryBtn}
              >
                <Layers size={15} aria-hidden="true" />
                Estante {primaryShelfNumber}
              </Link>
            ) : (
              <Link to="/estantes" onClick={onClose} className={style.secondaryBtn}>
                <ExternalLink size={15} aria-hidden="true" />
                Estantes
              </Link>
            )}

            <button type="button" onClick={handleCopyLink} className={style.secondaryBtn}>
              {copiedLink ? <Check size={15} aria-hidden="true" /> : <Link2 size={15} aria-hidden="true" />}
              {copiedLink ? "Copiado!" : "Copiar link"}
            </button>

            <button type="button" onClick={handleNewSearchClick} className={style.primaryBtn}>
              <Search size={15} aria-hidden="true" />
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
    </>
  );
}
