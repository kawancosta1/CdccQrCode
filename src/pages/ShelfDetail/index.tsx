import { useState } from "react";
import { useParams } from "react-router-dom";
import { RoomMap } from "../../components/RoomMap";
import { getRoomIdBySlug, ROOM_CONFIG } from "../../config/rooms";
import { SHELF_OVERVIEW_IMAGES } from "../../config/shelfImages";
import style from "./style.module.css";

/**
 * Página unificada de detalhe de estante (foto + mapa) para qualquer sala configurada.
 */
export function ShelfDetail() {
  const [viewMode, setViewMode] = useState<"estante" | "mapa">("estante");
  const { sala, numero } = useParams<{ sala: string; numero: string }>();

  const roomId = getRoomIdBySlug(sala);
  const room = roomId ? ROOM_CONFIG[roomId] : null;
  const roomImages = roomId ? SHELF_OVERVIEW_IMAGES[roomId] : undefined;
  const imagem = numero && roomImages ? roomImages[numero] : undefined;

  if (!room || !numero || !imagem) {
    const maxShelves = room?.shelfNumbers.length ?? 0;
    return (
      <div className={style.error}>
        <h2>Estante não encontrada</h2>
        <p>
          A estante número {numero ?? "-"} não existe em {room ? room.label : "esta sala"}.
        </p>
        {maxShelves > 0 && <p>Estantes disponíveis: 1 a {maxShelves}</p>}
      </div>
    );
  }

  return (
    <div className={style.contentWrapper}>
      <div className={style.ContainerTitulo}>
        <h1 className={style.title}>{room.label}</h1>
        <h2 className={style.title}>Estante {numero}</h2>
        <div className={style.tabButtons}>
          <button
            onClick={() => setViewMode("estante")}
            className={`${style.tabButton} ${viewMode === "estante" ? style.activeTab : ""}`}
          >
            📷 Estante
          </button>
          <button
            onClick={() => setViewMode("mapa")}
            className={`${style.tabButton} ${viewMode === "mapa" ? style.activeTab : ""}`}
          >
            🗺️ Mapa
          </button>
        </div>
      </div>

      {viewMode === "estante" ? (
        <img src={imagem} alt={`Estante ${numero}`} className={style.image} />
      ) : (
        <div className={style.mapContainer}>
          <RoomMap roomId={room.id} shelves={[numero]} imageClassName={style.mapImage} />
        </div>
      )}
    </div>
  );
}
