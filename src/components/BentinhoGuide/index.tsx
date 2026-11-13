import { useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Lightbulb, Sparkles, X } from "lucide-react";
import { getBentinhoTipsForContext } from "../../data/bentinhoTips";
import style from "./style.module.css";

const DISMISSED_KEY = "qrcodecdcc_bentinho_guide_hidden";

export function BentinhoGuide() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const [tipIndex, setTipIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [hidden, setHidden] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
      return false;
    }
  });

  const tips = useMemo(
    () => getBentinhoTipsForContext(pathname, searchParams.get("q")),
    [pathname, searchParams],
  );

  if (pathname.startsWith("/admin") || hidden || tips.length === 0) return null;

  const activeTip = tips[tipIndex % tips.length];

  return (
    <aside className={style.guideRoot} aria-label="Dica contextual do Bentinho">
      {!expanded ? (
        <button
          type="button"
          className={style.triggerBtn}
          onClick={() => setExpanded(true)}
          title="Ver dica do Bentinho para esta página"
        >
          <Sparkles size={15} aria-hidden="true" />
          <span>Dica do Bentinho</span>
        </button>
      ) : (
        <div className={style.bubble}>
          <div className={style.bubbleHeader}>
            <span className={style.bubbleBadge}>
              <Lightbulb size={13} aria-hidden="true" />
              {activeTip.label}
            </span>
            <button
              type="button"
              className={style.closeBtn}
              onClick={() => {
                setExpanded(false);
                try {
                  sessionStorage.setItem(DISMISSED_KEY, "1");
                } catch {
                  // ignore
                }
                setHidden(true);
              }}
              aria-label="Ocultar dicas do Bentinho nesta sessão"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
          <p className={style.bubbleText}>{activeTip.text}</p>
          <div className={style.bubbleActions}>
            {tips.length > 1 && (
              <button
                type="button"
                className={style.nextBtn}
                onClick={() => setTipIndex((i) => (i + 1) % tips.length)}
              >
                Próxima dica
              </button>
            )}
            <button
              type="button"
              className={style.minBtn}
              onClick={() => setExpanded(false)}
            >
              Minimizar
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
