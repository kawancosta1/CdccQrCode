import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Eye,
  HelpCircle,
  ListChecks,
  X,
} from "lucide-react";
import type { AdminSectionGuide as AdminSectionGuideData } from "../../data/adminSectionGuides.ts";
import style from "./style.module.css";

const SEEN_STORAGE_KEY = "qrcodecdcc_admin_guide_seen_v1";

function readSeenSections(): string[] {
  try {
    const raw = window.localStorage.getItem(SEEN_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function markSectionSeen(sectionId: string): void {
  try {
    const current = readSeenSections();
    if (current.includes(sectionId)) return;
    window.localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify([...current, sectionId]));
  } catch {
    // Ignore storage quota or private mode failures
  }
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface AdminSectionGuideProps {
  guide: AdminSectionGuideData;
}

export function AdminSectionGuide({ guide }: AdminSectionGuideProps) {
  const cardId = useId();
  const tourTitleId = useId();
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(
    () => !readSeenSections().includes(guide.id),
  );
  const [expanded, setExpanded] = useState<boolean>(
    () => !readSeenSections().includes(guide.id),
  );

  const [tourOpen, setTourOpen] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const tourSteps = guide.tourSteps ?? [];
  const activeTourStep = tourOpen ? tourSteps[tourIndex] ?? null : null;

  const handleDismissWelcome = useCallback(() => {
    markSectionSeen(guide.id);
    setIsFirstVisit(false);
    setExpanded(false);
  }, [guide.id]);

  const handleToggleGuide = () => {
    if (expanded) {
      handleDismissWelcome();
    } else {
      setExpanded(true);
    }
  };

  const closeTour = useCallback(() => {
    markSectionSeen(guide.id);
    setIsFirstVisit(false);
    setTourOpen(false);
    setTargetRect(null);
  }, [guide.id]);

  const startTour = () => {
    if (tourSteps.length === 0) return;
    setTourIndex(0);
    setTourOpen(true);
  };

  const measureCurrentTarget = useCallback(() => {
    if (!activeTourStep) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(activeTourStep.selector);
    if (!(el instanceof HTMLElement)) {
      setTargetRect(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setTargetRect(null);
      return;
    }
    const pad = 6;
    setTargetRect({
      top: Math.max(4, rect.top - pad),
      left: Math.max(4, rect.left - pad),
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    });
  }, [activeTourStep]);

  useEffect(() => {
    if (!tourOpen || !activeTourStep) return;

    const el = document.querySelector(activeTourStep.selector);
    if (el instanceof HTMLElement) {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }

    const frame = window.requestAnimationFrame(measureCurrentTarget);
    const timer = window.setTimeout(measureCurrentTarget, 260);

    window.addEventListener("resize", measureCurrentTarget);
    window.addEventListener("scroll", measureCurrentTarget, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.removeEventListener("resize", measureCurrentTarget);
      window.removeEventListener("scroll", measureCurrentTarget, true);
    };
  }, [tourOpen, activeTourStep, measureCurrentTarget]);

  useEffect(() => {
    if (!tourOpen) return;
    popoverRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeTour();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        if (tourIndex < tourSteps.length - 1) {
          setTourIndex((prev) => prev + 1);
        }
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (tourIndex > 0) {
          setTourIndex((prev) => prev - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tourOpen, tourIndex, tourSteps.length, closeTour]);

  const computePopoverStyle = (): CSSProperties => {
    if (!targetRect) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;
    const popoverWidth = Math.min(390, viewportW - 24);
    const spaceBelow = viewportH - (targetRect.top + targetRect.height);
    const placeBelow = spaceBelow >= 220 || targetRect.top < 220;

    const top = placeBelow
      ? Math.min(viewportH - 220, targetRect.top + targetRect.height + 14)
      : Math.max(12, targetRect.top - 220);

    const left = Math.min(
      Math.max(12, targetRect.left),
      Math.max(12, viewportW - popoverWidth - 12),
    );

    return { top, left };
  };

  return (
    <div className={style.wrapper}>
      <div className={style.topStrip}>
        <div className={style.topStripLeft}>
          <span className={style.sectionBadge}>{guide.title}</span>
          <p className={style.sectionSubtitle}>{guide.subtitle}</p>
        </div>

        <div className={style.topStripActions}>
          {tourSteps.length > 0 && (
            <button
              type="button"
              className={style.tourStartBtn}
              onClick={startTour}
            >
              <Compass size={15} aria-hidden="true" />
              Tour Guiado ({tourSteps.length} passos)
            </button>
          )}

          <button
            type="button"
            className={style.helpToggleBtn}
            aria-expanded={expanded}
            aria-controls={cardId}
            onClick={handleToggleGuide}
          >
            <HelpCircle size={15} aria-hidden="true" />
            {expanded ? "Ocultar ajuda" : "Como usar esta seção"}
          </button>
        </div>
      </div>

      {expanded && (
        <section
          id={cardId}
          className={style.guideCard}
          aria-label={`Guia da seção ${guide.title}`}
        >
          <div className={style.guideHeader}>
            <h2 className={style.guideTitle}>
              <HelpCircle size={18} aria-hidden="true" />
              Guia rápido: {guide.title}
              {isFirstVisit && (
                <span className={style.firstVisitPill}>Primeira visita</span>
              )}
            </h2>

            <button
              type="button"
              className={style.dismissBtn}
              onClick={handleDismissWelcome}
            >
              <Check size={14} aria-hidden="true" />
              Entendi, ocultar guia
            </button>
          </div>

          <div className={style.guideGrid}>
            <div className={style.guideBlock}>
              <h3 className={style.guideBlockTitle}>
                <Eye size={15} aria-hidden="true" />
                O que altera no site público
              </h3>
              <p className={style.guideText}>{guide.publicImpact}</p>
            </div>

            <div className={style.guideBlock}>
              <h3 className={style.guideBlockTitle}>
                <ListChecks size={15} aria-hidden="true" />
                Passo a passo rápido
              </h3>
              <ol className={style.guideList}>
                {guide.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>

            <div className={style.guideBlock}>
              <h3 className={style.guideBlockTitle}>
                <AlertTriangle size={15} aria-hidden="true" />
                Boas práticas e alertas
              </h3>
              <ul className={style.guideList}>
                {guide.tipsAndWarnings.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {tourOpen && activeTourStep && (
        <div
          className={style.tourBackdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby={tourTitleId}
        >
          {!targetRect && <div className={style.tourDimFull} onClick={closeTour} />}

          {targetRect && (
            <div
              className={style.tourSpotlight}
              style={{
                top: targetRect.top,
                left: targetRect.left,
                width: targetRect.width,
                height: targetRect.height,
              }}
              aria-hidden="true"
            />
          )}

          <div
            ref={popoverRef}
            tabIndex={-1}
            className={style.tourPopover}
            style={computePopoverStyle()}
          >
            <div className={style.tourPopoverHeader}>
              <span className={style.tourStepCounter} aria-live="polite">
                Passo {tourIndex + 1} de {tourSteps.length}
              </span>
              <button
                type="button"
                className={style.tourCloseBtn}
                onClick={closeTour}
                aria-label="Fechar tour guiado (Esc)"
                title="Fechar tour (Esc)"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <h3 id={tourTitleId} className={style.tourTitle}>
              {activeTourStep.title}
            </h3>
            <p className={style.tourDescription}>{activeTourStep.description}</p>

            {!targetRect && (
              <p className={style.tourFallbackNote}>
                Este controle pode estar em outra aba ou ainda carregando na tela.
              </p>
            )}

            <div className={style.tourFooter}>
              <button
                type="button"
                className={style.tourNavBtn}
                onClick={() => setTourIndex((prev) => Math.max(0, prev - 1))}
                disabled={tourIndex === 0}
              >
                <ChevronLeft size={15} aria-hidden="true" />
                Anterior
              </button>

              <div className={style.tourActionsRight}>
                {tourIndex < tourSteps.length - 1 ? (
                  <button
                    type="button"
                    className={style.tourPrimaryBtn}
                    onClick={() =>
                      setTourIndex((prev) => Math.min(tourSteps.length - 1, prev + 1))
                    }
                  >
                    Próximo
                    <ChevronRight size={15} aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className={style.tourPrimaryBtn}
                    onClick={closeTour}
                  >
                    <Check size={15} aria-hidden="true" />
                    Concluir
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
