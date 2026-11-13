import { useEffect, useMemo, useState } from "react";
import {
  Gift,
  MailPlus,
  MapPin,
  Route,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { BookCover } from "../../components/BookCover";
import { Container } from "../../components/Container";
import { HighlighterLink, IndexCardTabs } from "../../components/editorial";
import { ROOM_CONFIG } from "../../config/rooms";
import { useBookSearchContext } from "../../context/bookSearchStore";
import { useVisitRoute } from "../../context/visitRouteStore";
import {
  AcquisitionsService,
  type AcquisitionItem,
  type AcquisitionOrigin,
} from "../../services/acquisitionsService";
import type { VestibularBook } from "../../types/content";
import style from "./style.module.css";

type OriginFilter = "todos" | AcquisitionOrigin;

function toCoverBook(item: AcquisitionItem): VestibularBook {
  return {
    id: item.id,
    vestibular: "UNESP / Clássicos",
    anos: item.dataEntrada.slice(0, 4),
    genero: item.origem === "compra" ? "Compra" : "Doação",
    titulo: item.titulo,
    autor: item.autor,
    codigoDedalus: item.codigoDedalus,
    sala: `Sala ${item.sala}`,
    estante: item.estante,
    capaUrl: item.capaUrl,
    disponivel: true,
    observacao: item.observacao,
    ordem: 0,
  };
}

export function Novidades() {
  const [items, setItems] = useState<AcquisitionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OriginFilter>("todos");
  const { submitSearch } = useBookSearchContext();
  const { addItem, hasItem, setDrawerOpen } = useVisitRoute();

  useEffect(() => {
    let active = true;
    AcquisitionsService.getAll()
      .then((list) => {
        if (active) setItems(list);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (filter === "todos") return items;
    return items.filter((item) => item.origem === filter);
  }, [filter, items]);

  const counts = useMemo(
    () => ({
      todos: items.length,
      compra: items.filter((i) => i.origem === "compra").length,
      doacao: items.filter((i) => i.origem === "doacao").length,
    }),
    [items],
  );

  return (
    <Container>
      <div className={style.page}>
        <header className={style.hero}>
          <div className={style.heroContent}>
            <span className={style.eyebrow}>
              <Sparkles size={14} aria-hidden="true" />
              NOVIDADES DO ACERVO
            </span>
            <h1 className={style.title}>Novos no Acervo do CDCC</h1>
            <p className={style.subtitle}>
              Acompanhe os títulos recém-incorporados à biblioteca por meio de{" "}
              <strong>compras institucionais</strong> e <strong>doações</strong> da comunidade.
            </p>
          </div>

          <HighlighterLink to="/sugerir" tone="pink" className={style.suggestCta}>
            <MailPlus size={18} aria-hidden="true" />
            Sugerir compra de livro
          </HighlighterLink>
        </header>

        <IndexCardTabs
          ariaLabel="Filtrar por origem"
          activeId={filter}
          onChange={(id) => setFilter(id as OriginFilter)}
          items={[
            {
              id: "todos",
              code: "01.",
              label: `Todos (${counts.todos})`,
              content: (
                <p style={{ margin: 0, fontSize: "0.86rem", color: "var(--color-text-secondary)" }}>
                  Todas as aquisições recentes incorporadas ao acervo da biblioteca.
                </p>
              ),
            },
            {
              id: "compra",
              code: "02.",
              label: `Compras (${counts.compra})`,
              content: (
                <p style={{ margin: 0, fontSize: "0.86rem", color: "var(--color-text-secondary)" }}>
                  Livros adquiridos por compra institucional ou sugestões da comunidade.
                </p>
              ),
            },
            {
              id: "doacao",
              code: "03.",
              label: `Doações (${counts.doacao})`,
              content: (
                <p style={{ margin: 0, fontSize: "0.86rem", color: "var(--color-text-secondary)" }}>
                  Obras recebidas por doação e catalogadas pela equipe do CDCC-USP.
                </p>
              ),
            },
          ]}
        />

        {loading ? (
          <p className={style.loading}>Carregando novidades do acervo...</p>
        ) : filtered.length === 0 ? (
          <div className={style.empty}>
            <p>Nenhum item encontrado neste filtro no momento.</p>
          </div>
        ) : (
          <div className={style.grid}>
            {filtered.map((item) => {
              const room = ROOM_CONFIG[item.sala];
              const inRoute = hasItem(item.codigoDedalus, item.sala, item.estante);
              return (
                <article key={item.id} className={style.card}>
                  <div className={style.cardTop}>
                    <BookCover book={toCoverBook(item)} size="sm" />
                    <div className={style.cardMeta}>
                      <span
                        className={`${style.originBadge} ${
                          item.origem === "compra" ? style.originCompra : style.originDoacao
                        }`}
                      >
                        {item.origem === "compra" ? (
                          <>
                            <ShoppingBag size={12} aria-hidden="true" />
                            Compra
                          </>
                        ) : (
                          <>
                            <Gift size={12} aria-hidden="true" />
                            Doação
                          </>
                        )}
                      </span>

                      <h2 className={style.bookTitle}>{item.titulo}</h2>
                      <p className={style.bookAuthor}>{item.autor}</p>

                      {item.doadorOuFornecedor && (
                        <p className={style.donorText}>{item.doadorOuFornecedor}</p>
                      )}
                    </div>
                  </div>

                  {item.observacao && <p className={style.obs}>{item.observacao}</p>}

                  <div className={style.locationRow}>
                    <span>
                      {room?.label ?? `Sala ${item.sala}`} • {item.estante}
                    </span>
                    <code>{item.codigoDedalus}</code>
                  </div>

                  <div className={style.actions}>
                    <button
                      type="button"
                      className={style.primaryBtn}
                      onClick={() =>
                        submitSearch(item.codigoDedalus, {
                          id: item.id,
                          title: item.titulo,
                          subtitle: item.autor,
                          code: item.codigoDedalus,
                          kind: "livro",
                        })
                      }
                    >
                      <MapPin size={15} aria-hidden="true" />
                      Ver na estante
                    </button>

                    <button
                      type="button"
                      className={style.routeBtn}
                      onClick={() => {
                        if (inRoute) {
                          setDrawerOpen(true);
                          return;
                        }
                        addItem({
                          code: item.codigoDedalus,
                          title: item.titulo,
                          roomId: item.sala,
                          shelf: item.estante,
                        });
                      }}
                    >
                      <Route size={15} aria-hidden="true" />
                      {inRoute ? "Na rota" : "+ Rota"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
}
