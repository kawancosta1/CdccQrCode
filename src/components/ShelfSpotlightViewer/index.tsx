import { useId, useMemo, useState, type PointerEvent } from "react";
import { Compass, Eye, Layers, Maximize2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import type { ShelfRegion } from "../../types/shelfMapping.ts";
import style from "./style.module.css";

interface ShelfSpotlightViewerProps {
  imageUrl: string;
  alt: string;
  shelfLabel: string;
  activeCode?: string;
  regions: Record<string, ShelfRegion>;
  spatialHint?: string;
  aspectRatio?: number;
  onSelectCode?: (code: string) => void;
  onOpenLightbox?: () => void;
}

export function ShelfSpotlightViewer({
  imageUrl,
  alt,
  shelfLabel,
  activeCode,
  regions,
  spatialHint,
  aspectRatio,
  onSelectCode,
  onOpenLightbox,
}: ShelfSpotlightViewerProps) {
  const maskId = useId();
  const [loaded, setLoaded] = useState(false);
  const [exploreAll, setExploreAll] = useState(false);
  const [selectedCodeOverride, setSelectedCodeOverride] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const effectiveCode = selectedCodeOverride ?? activeCode;

  const activeEntry = useMemo(() => {
    const entries = Object.entries(regions);
    if (entries.length === 0) return null;
    if (!effectiveCode) return null;
    const clean = effectiveCode.trim().toUpperCase();
    const exact = entries.find(([k]) => k.trim().toUpperCase() === clean);
    if (exact) return { code: exact[0], region: exact[1] };

    const prefix = entries
      .filter(([k]) => {
        const up = k.trim().toUpperCase();
        return clean.startsWith(up) || up.startsWith(clean);
      })
      .sort((a, b) => b[0].length - a[0].length);
    return prefix.length > 0 ? { code: prefix[0][0], region: prefix[0][1] } : null;
  }, [effectiveCode, regions]);

  const showSpotlight = !exploreAll && activeEntry !== null;
  const allRegionEntries = useMemo(() => Object.entries(regions), [regions]);

  const handleZoomIn = () => setZoom((z) => Math.min(2.6, Number((z + 0.4).toFixed(2))));
  const handleZoomOut = () => {
    setZoom((z) => {
      const next = Math.max(1, Number((z - 0.4).toFixed(2)));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (zoom <= 1) return;
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragStart || zoom <= 1) return;
    setPan({
      x: Math.max(-160, Math.min(160, e.clientX - dragStart.x)),
      y: Math.max(-160, Math.min(160, e.clientY - dragStart.y)),
    });
  };

  const handlePointerUp = () => setDragStart(null);

  const activeShelfRow = activeEntry?.region.shelfRow;
  const pillAbove = activeEntry ? activeEntry.region.y >= 18 : true;

  return (
    <div className={style.viewerRoot}>
      {/* Barra superior de controle tátil */}
      <div className={style.toolbar}>
        <div className={style.toolbarLeft}>
          {allRegionEntries.length > 0 && (
            <button
              type="button"
              className={`${style.modeBtn} ${exploreAll ? style.modeBtnActive : ""}`}
              onClick={() => setExploreAll((v) => !v)}
              aria-pressed={exploreAll}
            >
              {exploreAll ? <Eye size={14} aria-hidden="true" /> : <Layers size={14} aria-hidden="true" />}
              {exploreAll ? "Focar código alvo" : "Ver estante inteira"}
            </button>
          )}
        </div>

        <div className={style.zoomGroup} role="group" aria-label="Controles de zoom da estante">
          <button
            type="button"
            className={style.iconBtn}
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            aria-label="Diminuir zoom"
          >
            <ZoomOut size={14} aria-hidden="true" />
          </button>
          <span className={style.zoomReadout}>{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            className={style.iconBtn}
            onClick={handleZoomIn}
            disabled={zoom >= 2.6}
            aria-label="Aumentar zoom"
          >
            <ZoomIn size={14} aria-hidden="true" />
          </button>
          {zoom > 1 && (
            <button
              type="button"
              className={style.iconBtn}
              onClick={handleResetView}
              aria-label="Resetar zoom"
            >
              <RotateCcw size={13} aria-hidden="true" />
            </button>
          )}
          {onOpenLightbox && (
            <button
              type="button"
              className={style.iconBtn}
              onClick={onOpenLightbox}
              aria-label="Ampliar foto em tela cheia"
              title="Ampliar"
            >
              <Maximize2 size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Palco da foto + SVG Spotlight */}
      <div
        className={`${style.stage} ${zoom > 1 ? style.stageZoomed : ""}`}
        style={aspectRatio ? { aspectRatio: String(aspectRatio) } : undefined}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {!loaded && <div className={style.skeleton} aria-hidden="true" />}

        <div
          className={style.transformLayer}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          <img
            src={imageUrl}
            alt={alt}
            className={`${style.photo} ${loaded ? style.photoLoaded : ""}`}
            onLoad={() => setLoaded(true)}
            draggable={false}
          />

          {/* SVG Mask Spotlight */}
          {showSpotlight && activeEntry && (
            <svg
              className={style.spotlightSvg}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <mask id={maskId}>
                  <rect x="0" y="0" width="100" height="100" fill="white" />
                  <rect
                    x={activeEntry.region.x}
                    y={activeEntry.region.y}
                    width={activeEntry.region.w}
                    height={activeEntry.region.h}
                    rx="1.8"
                    ry="1.8"
                    fill="black"
                  />
                </mask>
              </defs>

              <rect
                x="0"
                y="0"
                width="100"
                height="100"
                fill="rgba(18, 16, 14, 0.58)"
                mask={`url(#${maskId})`}
              />

              <rect
                x={activeEntry.region.x}
                y={activeEntry.region.y}
                width={activeEntry.region.w}
                height={activeEntry.region.h}
                rx="1.8"
                ry="1.8"
                className={style.focusRing}
              />
            </svg>
          )}

          {/* Floating Pill Inteligente */}
          {showSpotlight && activeEntry && (
            <div
              className={`${style.floatingPill} ${
                pillAbove ? style.floatingPillAbove : style.floatingPillBelow
              }`}
              style={{
                left: `${Math.min(82, Math.max(18, activeEntry.region.x + activeEntry.region.w / 2))}%`,
                top: pillAbove
                  ? `${Math.max(4, activeEntry.region.y - 2)}%`
                  : `${Math.min(92, activeEntry.region.y + activeEntry.region.h + 2)}%`,
              }}
            >
              <span>
                {shelfLabel}
                {activeShelfRow ? ` • Prateleira ${activeShelfRow}` : ""}
                {` • ${activeEntry.region.label || `CDU ${activeEntry.code}`}`}
              </span>
            </div>
          )}

          {/* Modo Explorar Estante Completa */}
          {exploreAll &&
            allRegionEntries.map(([code, reg]) => {
              const isSelected = activeEntry?.code === code;
              return (
                <button
                  key={code}
                  type="button"
                  className={`${style.regionPillOverlay} ${
                    isSelected ? style.regionPillSelected : ""
                  }`}
                  style={{
                    left: `${reg.x}%`,
                    top: `${reg.y}%`,
                    width: `${reg.w}%`,
                    height: `${reg.h}%`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCodeOverride(code);
                    setExploreAll(false);
                    onSelectCode?.(code);
                  }}
                  title={reg.label || `Focar código ${code}`}
                >
                  <span className={style.regionChip}>{code}</span>
                </button>
              );
            })}
        </div>
      </div>

      {/* Micro-guia do Bentinho */}
      {spatialHint && (
        <div className={style.spatialGuide}>
          <Compass size={15} className={style.spatialIcon} aria-hidden="true" />
          <span>{spatialHint}</span>
        </div>
      )}
    </div>
  );
}
