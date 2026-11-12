import { Link } from "react-router-dom";
import { ROOM_CONFIG, type RoomId } from "../../config/rooms";
import style from "./style.module.css";

interface RoomMapProps {
  roomId: RoomId;
  shelves: string[];
  imageClassName?: string;
  interactive?: boolean;
}

/**
 * Renderiza o mapa da sala com os marcadores de localização posicionados via configuração centralizada.
 * Quando `interactive` é verdadeiro, permite clicar nas demais estantes da sala para navegar entre elas.
 */
export function RoomMap({ roomId, shelves, imageClassName, interactive = false }: RoomMapProps) {
  const room = ROOM_CONFIG[roomId];
  const activeSet = new Set(shelves.map((s) => s.toUpperCase()));

  const markerKeys = interactive
    ? Array.from(
        new Set([...room.shelfNumbers.map(String), ...shelves]),
      )
    : shelves;

  return (
    <div
      className={style.mapWrapper}
      role="region"
      aria-label={`Mapa interativo da ${room.label}`}
    >
      <div className="sr-only" aria-live="polite">
        {shelves.length > 0
          ? `Estante ${shelves.join(", ")} destacada no mapa da ${room.label}.`
          : `Visão geral do mapa da ${room.label}.`}
      </div>
      <img
        src={room.mapSrc}
        alt={room.mapAlt}
        className={`${style.mapImg} ${imageClassName ?? ""}`}
        decoding="async"
      />
      {markerKeys.map((shelfKey) => {
        const pos = room.shelfMarkers[shelfKey];
        if (!pos) return null;

        const isActive = activeSet.has(shelfKey.toUpperCase());
        const positionStyle = {
          top: pos.top,
          left: pos.left,
          right: pos.right,
          transform: pos.centered ? "translate(-50%, -50%)" : undefined,
        };

        if (interactive && !isActive) {
          return (
            <Link
              key={shelfKey}
              to={`/estantes/${room.slug}/${shelfKey}`}
              className={style.secondaryMarker}
              style={positionStyle}
              aria-label={`Ir para Estante ${shelfKey} na ${room.label}`}
              title={`Estante ${shelfKey}`}
            >
              <span className={style.secondaryCore}>{shelfKey}</span>
            </Link>
          );
        }

        return (
          <div
            key={shelfKey}
            className={style.mapMarker}
            style={positionStyle}
            role="img"
            aria-current={interactive && isActive ? "location" : undefined}
            aria-label={`Localização da Estante ${shelfKey} no mapa da ${room.label}`}
          >
            <span className={style.pulseRing} aria-hidden="true" />
            <span className={style.markerCore} aria-hidden="true">
              {shelfKey}
            </span>
          </div>
        );
      })}
    </div>
  );
}
