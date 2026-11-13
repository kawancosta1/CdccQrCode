import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  ChevronLeft,
  ChevronRight,
  Map as MapIcon,
  MapPin,
  Maximize2,
} from "lucide-react";
import { Container } from "../../components/Container";
import { ImageLightbox } from "../../components/ImageLightbox";
import { LibraryMap3D } from "../../components/LibraryMap3D";
import { RoomMap } from "../../components/RoomMap";
import { ShelfRackGuide } from "../../components/ShelfRackGuide";
import { ShelfSpotlightViewer } from "../../components/ShelfSpotlightViewer";
import { getRoomIdBySlug, getShelfDirectionText, ROOM_CONFIG } from "../../config/rooms";
import { SHELF_OVERVIEW_IMAGES } from "../../config/shelfImages";
import { AnalyticsService } from "../../services/analyticsService";
import { getPhotoOverrides, type PhotoOverrideRecord } from "../../services/mappingService";
import { getShelfMapping } from "../../services/shelfSpotlightService";
import type { ShelfMapping } from "../../types/shelfMapping";
import style from "./style.module.css";

/**
 * Página unificada de detalhe de estante (foto + mapa) para qualquer sala configurada.
 */
export function ShelfDetail() {
  const [viewMode, setViewMode] = useState<"estante" | "mapa">("estante");
  const [mapMode, setMapMode] = useState<"2d" | "3d">("3d");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoOverrides, setPhotoOverrides] = useState<PhotoOverrideRecord[]>([]);
  const [spotlightMapping, setSpotlightMapping] = useState<ShelfMapping | null>(null);
  const navigate = useNavigate();
  const { sala, numero } = useParams<{ sala: string; numero: string }>();

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

  const roomId = getRoomIdBySlug(sala);

  useEffect(() => {
    let active = true;
    if (roomId && numero) {
      void AnalyticsService.trackShelfView(roomId, numero);
      const parsedNum = Number(numero);
      if (!Number.isNaN(parsedNum)) {
        getShelfMapping(roomId, parsedNum)
          .then((m) => {
            if (active) setSpotlightMapping(m);
          })
          .catch(() => {});
      }
    }
    return () => {
      active = false;
    };
  }, [numero, roomId]);
  const room = roomId ? ROOM_CONFIG[roomId] : null;
  const roomImages = roomId ? SHELF_OVERVIEW_IMAGES[roomId] : undefined;
  const baseImagem = numero && roomImages ? roomImages[numero] : undefined;
  const shelfOverride =
    roomId && numero
      ? photoOverrides.find(
          (o) =>
            o.targetType === "shelf" &&
            o.roomId === roomId &&
            (o.shelfKey ?? "").toUpperCase() === numero.toUpperCase()
        )
      : undefined;
  const imagem = shelfOverride?.imageUrl || baseImagem;

  if (!room || !numero || !imagem) {
    const maxShelves = room?.shelfNumbers.length ?? 0;
    return (
      <Container>
        <div className={style.errorCard} role="alert">
          <h1 className={style.errorTitle}>Estante não encontrada</h1>
          <p className={style.errorDesc}>
            A estante número <strong>{numero ?? "-"}</strong> não existe em{" "}
            <strong>{room ? room.label : "esta sala"}</strong>.
          </p>
          {maxShelves > 0 && (
            <p className={style.errorHint}>
              Estantes disponíveis nesta sala: 1 a {maxShelves}.
            </p>
          )}
          <Link to="/estantes" className={style.backBtn}>
            <ArrowLeft size={16} aria-hidden="true" />
            Voltar para Estantes
          </Link>
        </div>
      </Container>
    );
  }

  const currentNum = Number(numero);
  const currentIndex = room.shelfNumbers.indexOf(currentNum);
  const prevShelf = currentIndex > 0 ? room.shelfNumbers[currentIndex - 1] : null;
  const nextShelf =
    currentIndex >= 0 && currentIndex < room.shelfNumbers.length - 1
      ? room.shelfNumbers[currentIndex + 1]
      : null;

  return (
    <Container>
      <nav className={style.breadcrumb} aria-label="Navegação estrutural">
        <Link to="/estantes" className={style.breadcrumbLink}>
          <ArrowLeft size={15} aria-hidden="true" />
          Estantes
        </Link>
        <span aria-hidden="true" className={style.breadcrumbSep}>
          /
        </span>
        <span className={style.breadcrumbCurrent}>
          {room.label} • Estante {numero}
        </span>
      </nav>

      <header className={style.header}>
        <div className={style.headerInfo}>
          <span className={style.roomBadge}>
            <MapPin size={14} aria-hidden="true" />
            {room.label}
          </span>
          <h1 className={style.title}>Estante {numero}</h1>
          <p className={style.subtitle}>{getShelfDirectionText(room.id, [numero])}</p>
        </div>

        <div className={style.shelfPager}>
          {prevShelf !== null ? (
            <Link to={`/estantes/${room.slug}/${prevShelf}`} className={style.pagerBtn}>
              <ChevronLeft size={16} aria-hidden="true" />
              Estante {prevShelf}
            </Link>
          ) : (
            <span className={style.pagerBtnDisabled} aria-disabled="true">
              <ChevronLeft size={16} aria-hidden="true" />
              Anterior
            </span>
          )}

          {nextShelf !== null ? (
            <Link to={`/estantes/${room.slug}/${nextShelf}`} className={style.pagerBtn}>
              Estante {nextShelf}
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
          ) : (
            <span className={style.pagerBtnDisabled} aria-disabled="true">
              Próxima
              <ChevronRight size={16} aria-hidden="true" />
            </span>
          )}
        </div>
      </header>

      {/* Abas para Mobile/Tablet */}
      <div className={style.mobileTabs} role="tablist" aria-label="Modo de visualização">
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === "estante"}
          onClick={() => setViewMode("estante")}
          className={`${style.tabButton} ${viewMode === "estante" ? style.activeTab : ""}`}
        >
          <Camera size={16} aria-hidden="true" />
          Foto da estante
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === "mapa"}
          onClick={() => setViewMode("mapa")}
          className={`${style.tabButton} ${viewMode === "mapa" ? style.activeTab : ""}`}
        >
          <MapIcon size={16} aria-hidden="true" />
          Mapa da sala
        </button>
      </div>

      {/* Lado a lado no Desktop, alternado por aba no Mobile */}
      <div className={style.panelsGrid}>
        <section
          className={`${style.panelCard} ${viewMode !== "estante" ? style.mobileHidden : ""}`}
          aria-label="Foto da estante"
        >
          <div className={style.panelHeader}>
            <span className={style.panelTitle}>
              <Camera size={16} aria-hidden="true" />
              <span>Foto da Estante {numero}</span>
            </span>
            <button
              type="button"
              className={style.expandBtn}
              onClick={() => setLightboxOpen(true)}
              aria-label={`Ampliar foto da Estante ${numero}`}
            >
              <Maximize2 size={14} aria-hidden="true" />
              Ampliar
            </button>
          </div>
          <div className={style.mediaBox}>
            {spotlightMapping?.cleanImageUrl ? (
              <ShelfSpotlightViewer
                imageUrl={spotlightMapping.cleanImageUrl}
                alt={`Estante ${numero} da ${room.label}`}
                shelfLabel={`Estante ${numero}`}
                regions={spotlightMapping.regions}
                spatialHint={spotlightMapping.spatialHint}
                aspectRatio={spotlightMapping.imageAspectRatio}
                onSelectCode={(code) => navigate(`/?q=${encodeURIComponent(code)}`)}
                onOpenLightbox={() => setLightboxOpen(true)}
              />
            ) : (
              <img
                src={imagem}
                alt={`Estante ${numero} da ${room.label}`}
                className={`${style.image} ${style.clickableImage}`}
                onClick={() => setLightboxOpen(true)}
              />
            )}
          </div>
        </section>

        <section
          className={`${style.panelCard} ${viewMode !== "mapa" ? style.mobileHidden : ""}`}
          aria-label="Mapa da sala"
        >
          <div className={style.panelHeader}>
            <span className={style.panelTitle}>
              <MapIcon size={16} aria-hidden="true" />
              <span>Localização no mapa — {room.label}</span>
            </span>
            <div style={{ display: "inline-flex", gap: "0.35rem" }}>
              <button
                type="button"
                className={style.expandBtn}
                aria-pressed={mapMode === "3d"}
                onClick={() => setMapMode("3d")}
              >
                Mapa 3D
              </button>
              <button
                type="button"
                className={style.expandBtn}
                aria-pressed={mapMode === "2d"}
                onClick={() => setMapMode("2d")}
              >
                Planta 2D
              </button>
            </div>
          </div>
          <div className={style.mediaBox}>
            {mapMode === "3d" ? (
              <div style={{ width: "100%", height: "340px" }}>
                <LibraryMap3D roomId={room.id} shelves={[numero]} />
              </div>
            ) : (
              <RoomMap
                roomId={room.id}
                shelves={[numero]}
                imageClassName={style.mapImage}
                interactive
              />
            )}
          </div>
        </section>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <ShelfRackGuide
          roomId={room.id}
          shelfNumberOrLabel={numero}
          onSelectCode={(code) => navigate(`/?q=${encodeURIComponent(code)}`)}
        />
      </div>

      {/* Validador rápido de corredor: estantes vizinhas */}
      {(prevShelf !== null || nextShelf !== null) && (
        <section
          aria-label="Confirmar corredor pelas estantes vizinhas"
          style={{
            marginTop: "0.85rem",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface-subtle)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.6rem",
          }}
        >
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
            Estou na estante certa? Confira as vizinhas no corredor:
          </span>
          <div style={{ display: "inline-flex", flexWrap: "wrap", gap: "0.45rem", alignItems: "center" }}>
            {prevShelf !== null && (
              <Link to={`/estantes/${room.slug}/${prevShelf}`} className={style.pagerBtn}>
                ← Estante {prevShelf}
              </Link>
            )}
            <span
              style={{
                padding: "0.3rem 0.65rem",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--color-brand)",
                color: "#fff",
                fontSize: "0.78rem",
                fontWeight: 700,
              }}
            >
              Estante {numero} (atual)
            </span>
            {nextShelf !== null && (
              <Link to={`/estantes/${room.slug}/${nextShelf}`} className={style.pagerBtn}>
                Estante {nextShelf} →
              </Link>
            )}
          </div>
        </section>
      )}

      {lightboxOpen && (
        <ImageLightbox
          src={imagem}
          alt={`Estante ${numero} da ${room.label}`}
          caption={`${room.label} • Estante ${numero}`}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </Container>
  );
}
