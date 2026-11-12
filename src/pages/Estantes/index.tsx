import { Link } from "react-router-dom";
import { ROOM_CONFIG, ROOM_IDS } from "../../config/rooms";
import { Container } from "../../components/Container";
import style from "./styles.module.css";

export function Estantes() {
  const roomsWithShelves = ROOM_IDS.map((id) => ROOM_CONFIG[id]).filter(
    (room) => room.shelfNumbers.length > 0,
  );

  return (
    <Container>
      {roomsWithShelves.map((room) => (
        <div key={room.id}>
          <h1>{room.label} - Estantes</h1>
          <p>Selecione uma estante para visualizar as classificações:</p>

          <div className={style.gridEstantes}>
            {room.shelfNumbers.map((numero) => (
              <Link
                key={numero}
                to={`/estantes/${room.slug}/${numero}`}
                className={style.linkEstante}
              >
                <div className={style.buttonEstante}>Estante {numero}</div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </Container>
  );
}
