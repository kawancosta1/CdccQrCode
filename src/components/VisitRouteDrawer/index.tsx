import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, MapPin, Route, Trash2, X } from "lucide-react";
import { ROOM_CONFIG, type RoomId } from "../../config/rooms";
import { useVisitRoute } from "../../context/visitRouteStore";
import style from "./style.module.css";

function extractShelfNumber(shelfLabel: string): string | null {
  const m = shelfLabel.match(/\d+/);
  return m ? m[0] : null;
}

export function VisitRouteDrawer() {
  const { items, drawerOpen, setDrawerOpen, removeItem, clearRoute } = useVisitRoute();
  const [copied, setCopied] = useState(false);

  const groupedByRoom = useMemo(() => {
    const groups = new Map<RoomId, typeof items>();
    for (const item of items) {
      const list = groups.get(item.roomId) ?? [];
      list.push(item);
      groups.set(item.roomId, list);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a - b);
  }, [items]);

  if (items.length === 0 && !drawerOpen) return null;

  const handleCopyRoute = async () => {
    const text = groupedByRoom
      .map(([roomId, list]) => {
        const roomLabel = ROOM_CONFIG[roomId]?.label ?? `Sala ${roomId}`;
        const lines = list.map((it) => `  • ${it.shelf}: ${it.title} (${it.code})`);
        return `${roomLabel}:\n${lines.join("\n")}`;
      })
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(`Minha Rota na Biblioteca CDCC:\n\n${text}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      {items.length > 0 && (
        <button
          type="button"
          className={style.floatingPill}
          onClick={() => setDrawerOpen(true)}
          aria-label={`Abrir minha rota de busca com ${items.length} itens`}
        >
          <Route size={16} aria-hidden="true" />
          <span>Minha Rota</span>
          <span className={style.countBadge}>{items.length}</span>
        </button>
      )}

      {drawerOpen && (
        <div
          className={style.backdrop}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDrawerOpen(false);
          }}
        >
          <aside
            className={style.drawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="visit-route-title"
          >
            <header className={style.header}>
              <div>
                <h2 id="visit-route-title" className={style.title}>
                  Minha Rota na Biblioteca
                </h2>
                <p className={style.subtitle}>
                  Itens organizados por sala e estante para sua visita.
                </p>
              </div>
              <button
                type="button"
                className={style.closeBtn}
                onClick={() => setDrawerOpen(false)}
                aria-label="Fechar minha rota"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </header>

            <div className={style.body}>
              {items.length === 0 ? (
                <p className={style.emptyState}>
                  Sua rota está vazia. Busque um livro ou abra uma obra do Vestibular e clique em{" "}
                  <strong>+ Minha Rota</strong>.
                </p>
              ) : (
                groupedByRoom.map(([roomId, roomItems]) => {
                  const room = ROOM_CONFIG[roomId];
                  return (
                    <section key={roomId} className={style.roomGroup}>
                      <h3 className={style.roomHeading}>
                        <MapPin size={14} aria-hidden="true" />
                        {room?.label ?? `Sala ${roomId}`}
                      </h3>
                      <ul className={style.itemList}>
                        {roomItems.map((item) => {
                          const shelfNum = extractShelfNumber(item.shelf);
                          return (
                            <li key={item.id} className={style.itemCard}>
                              <div className={style.itemInfo}>
                                <strong className={style.itemTitle}>{item.title}</strong>
                                <span className={style.itemMeta}>
                                  {item.shelf} • Código <code>{item.code}</code>
                                </span>
                              </div>
                              <div className={style.itemActions}>
                                {shelfNum && room && (
                                  <Link
                                    to={`/estantes/${room.slug}/${shelfNum}`}
                                    className={style.openLink}
                                    onClick={() => setDrawerOpen(false)}
                                  >
                                    Ver estante
                                  </Link>
                                )}
                                <button
                                  type="button"
                                  className={style.removeBtn}
                                  onClick={() => removeItem(item.id)}
                                  aria-label={`Remover ${item.title} da rota`}
                                >
                                  <Trash2 size={14} aria-hidden="true" />
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  );
                })
              )}
            </div>

            {items.length > 0 && (
              <footer className={style.footer}>
                <button type="button" className={style.copyBtn} onClick={handleCopyRoute}>
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? "Roteiro copiado!" : "Copiar roteiro"}
                </button>
                <button type="button" className={style.clearBtn} onClick={clearRoute}>
                  Limpar rota
                </button>
              </footer>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
