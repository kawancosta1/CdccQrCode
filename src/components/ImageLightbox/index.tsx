import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import style from "./style.module.css";

interface ImageLightboxProps {
  src: string;
  alt: string;
  caption?: string;
  onClose: () => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const SCALE_STEP = 0.5;

function clampScale(value: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number(value.toFixed(2))));
}

/**
 * Visualizador em tela cheia com zoom contínuo (100%–300%) e arraste livre para fotos e mapas.
 */
export function ImageLightbox({ src, alt, caption, onClose }: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; originX: number; originY: number } | null>(
    null,
  );
  const movedDuringDragRef = useRef(false);

  useFocusTrap(overlayRef, true);

  const resetZoom = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const zoomIn = useCallback(() => {
    setScale((prev) => clampScale(prev + SCALE_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => {
      const next = clampScale(prev - SCALE_STEP);
      if (next === 1) {
        setOffset({ x: 0, y: 0 });
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const previousActiveElement = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomIn();
      } else if (e.key === "-") {
        e.preventDefault();
        zoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        resetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      if (previousActiveElement?.isConnected) {
        previousActiveElement.focus();
      }
    };
  }, [onClose, zoomIn, zoomOut, resetZoom]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY < 0) {
      zoomIn();
    } else if (e.deltaY > 0) {
      zoomOut();
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLImageElement>) => {
    if (scale <= 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      originX: offset.x,
      originY: offset.y,
    };
    movedDuringDragRef.current = false;
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.hypot(dx, dy) > 4) {
      movedDuringDragRef.current = true;
    }
    setOffset({
      x: dragStartRef.current.originX + dx,
      y: dragStartRef.current.originY + dy,
    });
  };

  const finishDrag = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const handleImageClick = () => {
    if (movedDuringDragRef.current) {
      movedDuringDragRef.current = false;
      return;
    }
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2);
    }
  };

  return (
    <div
      ref={overlayRef}
      className={style.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={caption || alt}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={style.topBar}>
        <p className={style.caption}>{caption || alt}</p>
        <div className={style.actions}>
          <button
            type="button"
            className={style.iconBtn}
            onClick={zoomOut}
            disabled={scale <= MIN_SCALE}
            aria-label="Reduzir zoom"
          >
            <ZoomOut size={18} aria-hidden="true" />
          </button>
          <span className={style.zoomBadge} aria-live="polite">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            className={style.iconBtn}
            onClick={zoomIn}
            disabled={scale >= MAX_SCALE}
            aria-label="Ampliar zoom"
          >
            <ZoomIn size={18} aria-hidden="true" />
          </button>
          {scale > 1 && (
            <button
              type="button"
              className={style.iconBtn}
              onClick={resetZoom}
              aria-label="Restaurar zoom para 100%"
            >
              <RotateCcw size={18} aria-hidden="true" />
            </button>
          )}
          <button
            ref={closeRef}
            type="button"
            className={style.iconBtn}
            onClick={onClose}
            aria-label="Fechar visualização ampliada"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        className={style.stage}
        onWheel={handleWheel}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className={`${style.image} ${scale > 1 ? style.imagePan : ""} ${
            isDragging ? style.imageDragging : ""
          }`}
          style={{
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          onClick={handleImageClick}
        />
      </div>
    </div>
  );
}
