import { ROOM_CONFIG, type RoomId } from "../../config/rooms";
import style from "./style.module.css";

interface RoomMapProps {
  roomId: RoomId;
  shelves: string[];
  imageClassName?: string;
}

/**
 * Renderiza o mapa da sala com os marcadores posicionados via configuração centralizada.
 */
export function RoomMap({ roomId, shelves, imageClassName }: RoomMapProps) {
  const room = ROOM_CONFIG[roomId];

  return (
    <div className={style.mapWrapper}>
      <img src={room.mapSrc} alt={room.mapAlt} className={imageClassName} />
      {shelves.map((shelfKey) => {
        const pos = room.shelfMarkers[shelfKey];
        if (!pos) return null;

        return (
          <div
            key={shelfKey}
            className={style.mapArrow}
            style={{
              top: pos.top,
              left: pos.left,
              right: pos.right,
              transform: pos.centered ? "translate(-50%, -50%)" : undefined,
            }}
          />
        );
      })}
    </div>
  );
}
