import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ROOM_CONFIG, type RoomId } from "../../config/rooms";
import { useSiteConfig } from "../../context/siteConfigStore";
import { getMarkerOverrides } from "../../services/mappingService";
import type { DynamicMarkerOverride } from "../../types/content";
import style from "./style.module.css";

interface RoomMapProps {
  roomId: RoomId;
  shelves: string[];
  imageClassName?: string;
  interactive?: boolean;
}

const ROOM_ENTRANCE_POINT: Record<RoomId, { x: number; y: number; label: string }> = {
  1: { x: 50, y: 92, label: "Entrada" },
  2: { x: 50, y: 92, label: "Entrada" },
  3: { x: 50, y: 90, label: "Entrada" },
};

function parsePercent(value?: string): number | null {
  if (!value) return null;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

function resolveMarkerPoint(pos: { top: string; left?: string; right?: string }): { x: number; y: number } | null {
  const y = parsePercent(pos.top);
  if (y === null) return null;
  const left = parsePercent(pos.left);
  if (left !== null) return { x: left, y };
  const right = parsePercent(pos.right);
  if (right !== null) return { x: 100 - right, y };
  return null;
}

/**
 * Renderiza o mapa da sala com os marcadores de localização posicionados via configuração centralizada.
 * Quando `interactive` é verdadeiro, permite clicar nas demais estantes da sala para navegar entre elas.
 */
export function RoomMap({ roomId, shelves, imageClassName, interactive = false }: RoomMapProps) {
  const room = ROOM_CONFIG[roomId];
  const { getImageSrc } = useSiteConfig();
  const [overrides, setOverrides] = useState<DynamicMarkerOverride[]>([]);

  useEffect(() => {
    let active = true;
    getMarkerOverrides()
      .then((list) => {
        if (active) setOverrides(list.filter((o) => o.roomId === roomId));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [roomId]);

  const activeSet = new Set(shelves.map((s) => s.toUpperCase()));
  const entrance = ROOM_ENTRANCE_POINT[roomId];

  const activeRoutePoints = shelves
    .map((shelfKey) => {
      const override = overrides.find(
        (o) => o.shelfKey.toUpperCase() === shelfKey.toUpperCase(),
      );
      const pos = override
        ? { top: override.top, left: override.left, right: undefined }
        : room.shelfMarkers[shelfKey];
      return pos ? resolveMarkerPoint(pos) : null;
    })
    .filter((pt): pt is { x: number; y: number } => pt !== null);

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
        src={getImageSrc(`mapa_sala_${roomId}`, room.mapSrc)}
        alt={room.mapAlt}
        className={`${style.mapImg} ${imageClassName ?? ""}`}
        decoding="async"
      />
      {activeRoutePoints.length > 0 && (
        <>
          <svg
            className={style.routeSvg}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {activeRoutePoints.map((pt, idx) => {
              const ctrlX = entrance.x;
              const ctrlY = Math.round((entrance.y + pt.y) / 2);
              const d = `M ${entrance.x} ${entrance.y} Q ${ctrlX} ${ctrlY} ${pt.x} ${pt.y}`;
              return (
                <g key={idx}>
                  <path d={d} className={style.routePathGlow} />
                  <path d={d} className={style.routePath} />
                </g>
              );
            })}
          </svg>
          <span
            className={style.entranceBadge}
            style={{ top: `${entrance.y}%`, left: `${entrance.x}%` }}
          >
            {entrance.label}
          </span>
        </>
      )}
      {markerKeys.map((shelfKey) => {
        const override = overrides.find(
          (o) => o.shelfKey.toUpperCase() === shelfKey.toUpperCase()
        );
        const pos = override
          ? { top: override.top, left: override.left, right: undefined, centered: true }
          : room.shelfMarkers[shelfKey];
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
