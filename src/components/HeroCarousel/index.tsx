import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useAccessibility } from "../../context/accessibilityStore";
import style from "./style.module.css";

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  to?: string;
  href?: string;
  image: string;
  imageAlt: string;
  objectPosition?: string;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  autoPlayMs?: number;
}

/**
 * Carrossel Hero com reprodução automática, loop infinito, gestos de arrastar e indicadores inferiores.
 */
export function HeroCarousel({ slides, autoPlayMs = 6000 }: HeroCarouselProps) {
  const total = slides.length;
  // Track possui clone do último slide no início e clone do primeiro no fim para loop infinito contínuo.
  const extendedSlides = total > 1 ? [slides[total - 1], ...slides, slides[0]] : slides;

  const [trackIndex, setTrackIndex] = useState(total > 1 ? 1 : 0);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [interactionTick, setInteractionTick] = useState(0);
  const { reducedMotion } = useAccessibility();

  const dragStartXRef = useRef<number | null>(null);

  const activeIndex =
    total <= 1 ? 0 : (trackIndex - 1 + total) % total;

  const goNext = useCallback(() => {
    if (total <= 1) return;
    setIsTransitionEnabled(true);
    setTrackIndex((prev) => (prev >= total + 1 ? total + 1 : prev + 1));
    setInteractionTick((t) => t + 1);
  }, [total]);

  const goPrev = useCallback(() => {
    if (total <= 1) return;
    setIsTransitionEnabled(true);
    setTrackIndex((prev) => (prev <= 0 ? 0 : prev - 1));
    setInteractionTick((t) => t + 1);
  }, [total]);

  const goToSlide = (index: number) => {
    if (total <= 1) return;
    setIsTransitionEnabled(true);
    setTrackIndex(index + 1);
    setInteractionTick((t) => t + 1);
  };

  // Autoplay com reinício após interação manual e pausa em hover/foco/drag/reducedMotion.
  useEffect(() => {
    if (total <= 1 || isPaused || isUserPaused || isDragging || reducedMotion) {
      return;
    }

    const id = window.setInterval(() => {
      setIsTransitionEnabled(true);
      setTrackIndex((prev) => (prev >= total + 1 ? total + 1 : prev + 1));
    }, autoPlayMs);

    return () => window.clearInterval(id);
  }, [total, isPaused, isUserPaused, isDragging, reducedMotion, autoPlayMs, interactionTick]);

  const handleTransitionEnd = () => {
    if (total <= 1) return;
    if (trackIndex === total + 1) {
      setIsTransitionEnabled(false);
      setTrackIndex(1);
    } else if (trackIndex === 0) {
      setIsTransitionEnabled(false);
      setTrackIndex(total);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (total <= 1 || (e.target as HTMLElement).closest("a, button")) return;
    dragStartXRef.current = e.clientX;
    setIsDragging(true);
    setIsTransitionEnabled(false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || dragStartXRef.current === null) return;
    setDragOffset(e.clientX - dragStartXRef.current);
  };

  const finishDrag = () => {
    if (!isDragging) return;
    const threshold = 50;
    const delta = dragOffset;
    dragStartXRef.current = null;
    setIsDragging(false);
    setDragOffset(0);
    setIsTransitionEnabled(true);

    if (delta <= -threshold) {
      goNext();
    } else if (delta >= threshold) {
      goPrev();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    }
  };

  return (
    <section
      className={style.carouselRoot}
      aria-roledescription="carrossel"
      aria-label="Destaques do CDCC"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        className={style.viewport}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      >
        <div
          className={style.track}
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform: `translate3d(calc(-${trackIndex * 100}% + ${dragOffset}px), 0, 0)`,
            transition: isTransitionEnabled
              ? "transform 520ms var(--ease-drawer)"
              : "none",
          }}
        >
          {extendedSlides.map((slide, idx) => (
            <div
              key={`${slide.id}-${idx}`}
              className={style.slide}
              aria-hidden={idx !== trackIndex}
            >
              <img
                src={slide.image}
                alt={slide.imageAlt}
                className={style.slideImage}
                style={{ objectPosition: slide.objectPosition ?? "center center" }}
                loading={idx <= 2 ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
              />

              <div className={style.scrim} aria-hidden="true" />

              <div className={style.overlayContent}>
                <span className={style.eyebrow}>{slide.eyebrow}</span>
                <h2 className={style.title}>{slide.title}</h2>
                <p className={style.description}>{slide.description}</p>

                {slide.href ? (
                  <a
                    href={slide.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={style.ctaButton}
                    tabIndex={idx === trackIndex ? 0 : -1}
                  >
                    <span>{slide.ctaLabel}</span>
                    <ArrowRight size={17} aria-hidden="true" />
                  </a>
                ) : (
                  <Link
                    to={slide.to ?? "/"}
                    className={style.ctaButton}
                    tabIndex={idx === trackIndex ? 0 : -1}
                  >
                    <span>{slide.ctaLabel}</span>
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              className={`${style.arrowBtn} ${style.arrowPrev}`}
              onClick={goPrev}
              aria-label="Banner anterior"
            >
              <ChevronLeft size={22} aria-hidden="true" />
            </button>

            <button
              type="button"
              className={`${style.arrowBtn} ${style.arrowNext}`}
              onClick={goNext}
              aria-label="Próximo banner"
            >
              <ChevronRight size={22} aria-hidden="true" />
            </button>

            <div className={style.indicators} role="tablist" aria-label="Selecionar banner">
              <button
                type="button"
                className={style.playPauseBtn}
                onClick={() => setIsUserPaused((prev) => !prev)}
                aria-pressed={isUserPaused}
                aria-label={isUserPaused ? "Retomar rotação automática do carrossel" : "Pausar rotação automática do carrossel"}
              >
                {isUserPaused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
              </button>
              {slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={idx === activeIndex}
                  aria-label={`Ir para banner ${idx + 1}: ${slide.title}`}
                  className={`${style.indicator} ${
                    idx === activeIndex ? style.indicatorActive : ""
                  }`}
                  onClick={() => goToSlide(idx)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
