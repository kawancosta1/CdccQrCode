import { useState } from "react";
import { motion } from "framer-motion";
import style from "./style.module.css";

export interface IndexCardTabItem {
  id: string;
  label: string;
  code?: string;
  content: React.ReactNode;
}

export interface IndexCardTabsProps {
  items: IndexCardTabItem[];
  activeId?: string;
  onChange?: (id: string) => void;
  ariaLabel?: string;
  className?: string;
}

/**
 * Abas de filtro estilo "Fichário Catalográfico":
 * Empilhadas em perspective(900px) onde fichas anteriores tombam para baixo (-80deg)
 * ao selecionar uma categoria posterior.
 */
export function IndexCardTabs({
  items,
  activeId: controlledId,
  onChange,
  ariaLabel = "Fichário de categorias",
  className = "",
}: IndexCardTabsProps) {
  const [internalId, setInternalId] = useState<string>(() => items[0]?.id ?? "");
  const currentId = controlledId ?? internalId;
  const activeIdx = Math.max(
    0,
    items.findIndex((item) => item.id === currentId),
  );

  const handleSelect = (id: string) => {
    if (controlledId === undefined) {
      setInternalId(id);
    }
    onChange?.(id);
  };

  return (
    <div className={`${style.wrapper} ${className}`}>
      <div className={style.tabBar} role="tablist" aria-label={ariaLabel}>
        {items.map((item, idx) => {
          const isActive = idx === activeIdx;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${style.tabBtn} ${isActive ? style.tabBtnActive : ""}`}
              onClick={() => handleSelect(item.id)}
            >
              {item.code && <span className={style.tabCode}>{item.code}</span>}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className={style.deckStage}>
        {items.map((item, idx) => {
          const isActive = idx === activeIdx;
          const isBefore = idx < activeIdx;
          const isAfter = idx > activeIdx;

          if (isAfter) return null;

          return (
            <motion.div
              key={item.id}
              role="tabpanel"
              aria-hidden={!isActive}
              className={`${style.card} ${isBefore ? style.cardTumbled : ""}`}
              initial={false}
              animate={
                isBefore
                  ? {
                      rotateX: -80,
                      opacity: 0,
                      y: 12,
                      scale: 0.96,
                    }
                  : {
                      rotateX: 0,
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }
              }
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 26,
              }}
              style={{ zIndex: isActive ? 3 : 1 }}
            >
              <div className={style.cardHeader}>
                <h3 className={style.cardTitle}>{item.label}</h3>
                {item.code && <span className={style.tabCode}>{item.code}</span>}
              </div>
              <div>{item.content}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
