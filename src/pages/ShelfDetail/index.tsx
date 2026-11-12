import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
import { RoomMap } from "../../components/RoomMap";
import { getRoomIdBySlug, getShelfDirectionText, ROOM_CONFIG } from "../../config/rooms";
import { SHELF_OVERVIEW_IMAGES } from "../../config/shelfImages";
import { getPhotoOverrides, type PhotoOverrideRecord } from "../../services/mappingService";
import style from "./style.module.css";

/**
 * Página unificada de detalhe de estante (foto + mapa) para qualquer sala configurada.
 */
export function ShelfDetail() {
  const [viewMode, setViewMode] = useState<"estante" | "mapa">("estante");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoOverrides, setPhotoOverrides] = useState<PhotoOverrideRecord[]>([]);
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
            <img
              src={imagem}
              alt={`Estante ${numero} da ${room.label}`}
              className={`${style.image} ${style.clickableImage}`}
              onClick={() => setLightboxOpen(true)}
            />
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
          </div>
          <div className={style.mediaBox}>
            <RoomMap
              roomId={room.id}
              shelves={[numero]}
              imageClassName={style.mapImage}
              interactive
            />
          </div>
        </section>
      </div>

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
