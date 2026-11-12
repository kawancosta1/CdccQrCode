import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Layers, MapPin } from "lucide-react";
import { Container } from "../../components/Container";
import { ROOM_CONFIG, ROOM_IDS, type RoomId } from "../../config/rooms";
import style from "./styles.module.css";

type RoomFilter = "all" | RoomId;

export function Estantes() {
  const [roomFilter, setRoomFilter] = useState<RoomFilter>("all");

  const roomsWithShelves = ROOM_IDS.map((id) => ROOM_CONFIG[id]).filter(
    (room) => room.shelfNumbers.length > 0,
  );

  const visibleRooms =
    roomFilter === "all"
      ? roomsWithShelves
      : roomsWithShelves.filter((room) => room.id === roomFilter);

  return (
    <Container>
      <div className={style.pageHeader}>
        <div>
          <h1 className={style.pageTitle}>Estantes da Biblioteca</h1>
          <p className={style.pageSubtitle}>
            Selecione uma estante para visualizar a foto geral e a localização exata no mapa da
            sala.
          </p>
        </div>

        <div className={style.filterGroup} role="group" aria-label="Filtrar por sala">
          <button
            type="button"
            aria-pressed={roomFilter === "all"}
            className={`${style.filterBtn} ${roomFilter === "all" ? style.filterBtnActive : ""}`}
            onClick={() => setRoomFilter("all")}
          >
            Todas
          </button>
          {roomsWithShelves.map((room) => (
            <button
              key={room.id}
              type="button"
              aria-pressed={roomFilter === room.id}
              className={`${style.filterBtn} ${
                roomFilter === room.id ? style.filterBtnActive : ""
              }`}
              onClick={() => setRoomFilter(room.id)}
            >
              {room.label} ({room.shelfNumbers.length})
            </button>
          ))}
        </div>
      </div>

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Exibindo {visibleRooms.length}{" "}
        {visibleRooms.length === 1 ? "sala" : "salas"} com{" "}
        {visibleRooms.reduce((acc, r) => acc + r.shelfNumbers.length, 0)} estantes disponíveis.
      </div>

      <div className={style.roomsList}>
        {visibleRooms.map((room) => (
          <section key={room.id} className={style.roomSection} aria-labelledby={`room-${room.id}`}>
            <div className={style.roomHeader}>
              <div className={style.roomTitleWrap}>
                <MapPin size={18} className={style.roomIcon} aria-hidden="true" />
                <h2 id={`room-${room.id}`} className={style.roomTitle}>
                  {room.label}
                </h2>
              </div>
              <span className={style.roomCount}>{room.shelfNumbers.length} estantes</span>
            </div>

            <div className={style.gridEstantes}>
              {room.shelfNumbers.map((numero) => (
                <Link
                  key={numero}
                  to={`/estantes/${room.slug}/${numero}`}
                  className={style.shelfCard}
                >
                  <span className={style.shelfCardIcon}>
                    <Layers size={16} aria-hidden="true" />
                  </span>
                  <span className={style.shelfCardLabel}>Estante {numero}</span>
                  <ArrowUpRight size={15} className={style.shelfCardArrow} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Container>
  );
}
