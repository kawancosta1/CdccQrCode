import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ROOM_CONFIG, type RoomId } from "../../config/rooms";
import { useSiteConfig } from "../../context/siteConfigStore";
import {
  buildRoundedSvgPath,
  findRoomPath,
  resolveShelfPercentPoint,
  ROOM_ENTRANCE_POINT,
  type Point2D,
} from "../../domain/roomPathfinding";
import { getMarkerOverrides } from "../../services/mappingService";
import type { DynamicMarkerOverride } from "../../types/content";
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

  const allShelfObstacles = useMemo(() => {
    const pts: Point2D[] = [];
    for (const key of Object.keys(room.shelfMarkers)) {
      const override = overrides.find(
        (o) => o.shelfKey.toUpperCase() === key.toUpperCase(),
      );
      const pos = override
        ? { top: override.top, left: override.left, right: undefined }
        : room.shelfMarkers[key];
      const pt = pos ? resolveShelfPercentPoint(pos) : null;
      if (pt) pts.push(pt);
    }
    return pts;
  }, [overrides, room.shelfMarkers]);

  const activeRoutePaths = useMemo(() => {
    return shelves
      .map((shelfKey) => {
        const override = overrides.find(
          (o) => o.shelfKey.toUpperCase() === shelfKey.toUpperCase(),
        );
        const pos = override
          ? { top: override.top, left: override.left, right: undefined }
          : room.shelfMarkers[shelfKey];
        const pt = pos ? resolveShelfPercentPoint(pos) : null;
        if (!pt) return null;
        const obstacles = allShelfObstacles.filter(
          (obs) => Math.hypot(obs.x - pt.x, obs.y - pt.y) > 2,
        );
        const waypoints = findRoomPath(entrance, pt, obstacles);
        return buildRoundedSvgPath(waypoints);
      })
      .filter((d): d is string => Boolean(d));
  }, [allShelfObstacles, entrance, overrides, room.shelfMarkers, shelves]);

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
      {activeRoutePaths.length > 0 && (
        <>
          <svg
            className={style.routeSvg}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {activeRoutePaths.map((d, idx) => (
              <g key={idx}>
                <path d={d} className={style.routePathGlow} />
                <path d={d} className={style.routePath} />
              </g>
            ))}
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
