import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Compass,
  Layers,
  Map as MapIcon,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { Container } from "../../components/Container";
import { StampButton } from "../../components/editorial";
import { RoomMap } from "../../components/RoomMap";
import { ROOM_CONFIG, ROOM_IDS, type RoomId } from "../../config/rooms";
import { SHELF_OVERVIEW_IMAGES } from "../../config/shelfImages";
import {
  imageDatabaseSala1,
  imageDatabaseSala2,
  imageDatabaseSala3,
  type ImageData,
} from "../../data";
import style from "./styles.module.css";

type RoomFilter = "all" | RoomId;

interface ShelfSummary {
  numero: number;
  photoSrc?: string;
  codeCount: number;
  rangeLabel: string;
  sampleCodes: string[];
}

const ROOM_DATABASES: Record<RoomId, Record<string, ImageData>> = {
  1: imageDatabaseSala1,
  2: imageDatabaseSala2,
  3: imageDatabaseSala3,
};

function normalizeShelfNumber(raw: string): number | null {
  const m = raw.match(/\d+/);
  return m ? Number(m[0]) : null;
}

function buildShelfSummaries(roomId: RoomId, shelfNumbers: number[]): Map<number, ShelfSummary> {
  const db = ROOM_DATABASES[roomId] ?? {};
  const overviewImgs = SHELF_OVERVIEW_IMAGES[roomId] ?? {};
  const grouped = new Map<number, Array<{ code: string; range: string }>>();

  for (const [code, data] of Object.entries(db)) {
    const num = normalizeShelfNumber(data.shelf);
    if (num === null) continue;
    const list = grouped.get(num) ?? [];
    list.push({ code, range: data.range });
    grouped.set(num, list);
  }

  const result = new Map<number, ShelfSummary>();
  for (const numero of shelfNumbers) {
    const entries = (grouped.get(numero) ?? []).sort((a, b) =>
      a.code.localeCompare(b.code, "pt-BR", { numeric: true }),
    );
    const firstCode = entries[0]?.code;
    const lastCode = entries[entries.length - 1]?.code;
    const rangeLabel =
      entries.length === 0
        ? "Acervo geral"
        : firstCode === lastCode
          ? firstCode
          : `${firstCode} – ${lastCode}`;

    result.set(numero, {
      numero,
      photoSrc: overviewImgs[String(numero)],
      codeCount: entries.length,
      rangeLabel,
      sampleCodes: entries.slice(0, 3).map((e) => e.code),
    });
  }
  return result;
}

export function Estantes() {
  const [roomFilter, setRoomFilter] = useState<RoomFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [openMaps, setOpenMaps] = useState<Record<number, boolean>>({});

  const roomsWithShelves = useMemo(
    () =>
      ROOM_IDS.map((id) => ({
        ...ROOM_CONFIG[id],
        summaries: buildShelfSummaries(id, ROOM_CONFIG[id].shelfNumbers),
      })).filter((room) => room.shelfNumbers.length > 0),
    [],
  );

  const visibleRooms = useMemo(() => {
    const base =
      roomFilter === "all"
        ? roomsWithShelves
        : roomsWithShelves.filter((room) => room.id === roomFilter);

    const q = searchTerm.trim().toLowerCase();
    if (!q) return base;

    return base
      .map((room) => {
        const filteredShelves = room.shelfNumbers.filter((numero) => {
          const summary = room.summaries.get(numero);
          const shelfText = `estante ${numero}`.toLowerCase();
          const rangeText = summary?.rangeLabel.toLowerCase() ?? "";
          const codesText = summary?.sampleCodes.join(" ").toLowerCase() ?? "";
          const roomText = `${room.label} ${room.areaLabel}`.toLowerCase();
          return (
            shelfText.includes(q) ||
            String(numero) === q ||
            rangeText.includes(q) ||
            codesText.includes(q) ||
            roomText.includes(q)
          );
        });
        return { ...room, shelfNumbers: filteredShelves };
      })
      .filter((room) => room.shelfNumbers.length > 0);
  }, [roomFilter, roomsWithShelves, searchTerm]);

  const totalShelves = roomsWithShelves.reduce((acc, r) => acc + r.shelfNumbers.length, 0);
  const visibleShelfCount = visibleRooms.reduce((acc, r) => acc + r.shelfNumbers.length, 0);

  const toggleRoomMap = (id: RoomId) => {
    setOpenMaps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Container>
      <div className={style.pageWrap}>
        {/* Hero Editorial */}
        <header className={style.heroBanner}>
          <div className={style.heroTop}>
            <div>
              <span className={style.heroEyebrow}>
                <Compass size={14} aria-hidden="true" />
                EXPLORADOR FÍSICO • {roomsWithShelves.length} SALAS • {totalShelves} ESTANTES
              </span>
              <h1 className={style.pageTitle}>Estantes da Biblioteca</h1>
              <p className={style.pageSubtitle}>
                Navegue por sala, filtre por número ou faixa CDU, visualize a foto real de cada
                estante e explore o mapa interativo antes de ir ao corredor.
              </p>
            </div>

            <div className={style.searchBox}>
              <Search size={16} className={style.searchIcon} aria-hidden="true" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar estante, faixa ou código (ex: 530, 8)..."
                aria-label="Filtrar estantes por número ou código"
                className={style.searchInput}
              />
              {searchTerm && (
                <button
                  type="button"
                  className={style.clearSearchBtn}
                  onClick={() => setSearchTerm("")}
                  aria-label="Limpar filtro"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          <div className={style.filterBar}>
            <div className={style.filterGroup} role="group" aria-label="Filtrar por sala">
              <button
                type="button"
                aria-pressed={roomFilter === "all"}
                className={`${style.filterBtn} ${
                  roomFilter === "all" ? style.filterBtnActive : ""
                }`}
                onClick={() => setRoomFilter("all")}
              >
                Todas ({totalShelves})
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
        </header>

        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          Exibindo {visibleRooms.length} {visibleRooms.length === 1 ? "sala" : "salas"} com{" "}
          {visibleShelfCount} estantes disponíveis.
        </div>

        {visibleRooms.length === 0 ? (
          <div className={style.emptyState}>
            <p>
              Nenhuma estante encontrada para <strong>&ldquo;{searchTerm}&rdquo;</strong>.
            </p>
            <StampButton
              type="button"
              stampLabel="LIMPO"
              className={style.resetBtn}
              onClick={() => {
                setSearchTerm("");
                setRoomFilter("all");
              }}
            >
              Mostrar todas as estantes
            </StampButton>
          </div>
        ) : (
          <div className={style.roomsList}>
            {visibleRooms.map((room) => {
              const isMapOpen = Boolean(openMaps[room.id]) || roomFilter === room.id;
              return (
                <section
                  key={room.id}
                  className={style.roomSection}
                  aria-labelledby={`room-${room.id}`}
                >
                  <div className={style.roomHeader}>
                    <div className={style.roomTitleBlock}>
                      <div className={style.roomTitleWrap}>
                        <span className={style.roomIconBadge}>
                          <MapPin size={17} aria-hidden="true" />
                        </span>
                        <div>
                          <h2 id={`room-${room.id}`} className={style.roomTitle}>
                            {room.label}
                          </h2>
                          <p className={style.roomArea}>{room.areaLabel}</p>
                        </div>
                      </div>
                    </div>

                    <div className={style.roomActions}>
                      <span className={style.roomCount}>
                        {room.shelfNumbers.length}{" "}
                        {room.shelfNumbers.length === 1 ? "estante" : "estantes"}
                      </span>
                      <button
                        type="button"
                        className={`${style.mapToggleBtn} ${
                          isMapOpen ? style.mapToggleBtnActive : ""
                        }`}
                        onClick={() => toggleRoomMap(room.id)}
                        aria-expanded={isMapOpen}
                      >
                        <MapIcon size={15} aria-hidden="true" />
                        {isMapOpen ? "Ocultar mapa" : "Mapa interativo"}
                      </button>
                    </div>
                  </div>

                  {isMapOpen && (
                    <div className={style.roomMapCard}>
                      <div className={style.roomMapHint}>
                        Clique diretamente em qualquer número no mapa da{" "}
                        <strong>{room.label}</strong> para abrir a foto e as faixas da estante.
                      </div>
                      <div className={style.roomMapFrame}>
                        <RoomMap roomId={room.id} shelves={[]} interactive />
                      </div>
                    </div>
                  )}

                  <div className={style.gridEstantes}>
                    {room.shelfNumbers.map((numero) => {
                      const summary = room.summaries.get(numero);
                      return (
                        <Link
                          key={numero}
                          to={`/estantes/${room.slug}/${numero}`}
                          className={style.shelfCard}
                        >
                          <div className={style.shelfThumbWrap}>
                            {summary?.photoSrc ? (
                              <img
                                src={summary.photoSrc}
                                alt={`Estante ${numero} da ${room.label}`}
                                className={style.shelfThumb}
                                loading="lazy"
                                decoding="async"
                              />
                            ) : (
                              <div className={style.shelfThumbPlaceholder}>
                                <Layers size={22} aria-hidden="true" />
                              </div>
                            )}
                            <span className={style.shelfNumberPill}>#{numero}</span>
                          </div>

                          <div className={style.shelfCardBody}>
                            <div className={style.shelfCardTopRow}>
                              <span className={style.shelfCardLabel}>Estante {numero}</span>
                              <ArrowUpRight
                                size={15}
                                className={style.shelfCardArrow}
                                aria-hidden="true"
                              />
                            </div>
                            <span className={style.shelfRange}>
                              {summary?.rangeLabel ?? "Acervo"}
                            </span>
                            {summary && summary.codeCount > 0 && (
                              <span className={style.shelfCodeCount}>
                                {summary.codeCount}{" "}
                                {summary.codeCount === 1 ? "faixa mapeada" : "faixas mapeadas"}
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
}
