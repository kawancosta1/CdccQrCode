import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ExternalLink, GraduationCap, MapPin, Search } from "lucide-react";
import { getVestibularBooks } from "../../services/pagesService.ts";
import type { VestibularBook, VestibularExamTag } from "../../types/content.ts";
import styles from "./style.module.css";

const FILTER_TABS: Array<"Todas" | VestibularExamTag> = [
  "Todas",
  "FUVEST 2026–2028",
  "FUVEST",
  "UNICAMP",
  "UNESP / Clássicos",
];

export default function VestibularPage() {
  const [books, setBooks] = useState<VestibularBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Todas" | VestibularExamTag>("Todas");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let active = true;
    getVestibularBooks()
      .then((data) => {
        if (active) setBooks(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredBooks = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return books.filter((book) => {
      const matchesTab = activeTab === "Todas" || book.vestibular === activeTab;
      if (!matchesTab) return false;
      if (!q) return true;
      return (
        book.titulo.toLowerCase().includes(q) ||
        book.autor.toLowerCase().includes(q) ||
        book.codigoDedalus.toLowerCase().includes(q) ||
        book.vestibular.toLowerCase().includes(q)
      );
    });
  }, [books, activeTab, searchTerm]);

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="vestibular-heading">
        <span className={styles.badge}>
          <GraduationCap size={15} aria-hidden="true" /> Leituras Obrigatórias
        </span>
        <h1 id="vestibular-heading" className={styles.title}>
          Obras Obrigatórias dos Vestibulares no CDCC
        </h1>
        <p className={styles.subtitle}>
          Consulte rapidamente os livros cobrados pela FUVEST, UNICAMP, UNESP e clássicos do
          ENEM/Provão Paulista disponíveis no acervo da Biblioteca do CDCC-USP. Clique em{" "}
          <strong>Ver na Estante</strong> para abrir a localização exata no mapa.
        </p>
      </section>

      <div className={styles.controls}>
        <div className={styles.tabs} role="tablist" aria-label="Filtrar por vestibular">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} aria-hidden="true" />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Buscar obra, autor ou código CDU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar obras obrigatórias"
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.empty}>Carregando lista de leituras obrigatórias...</div>
      ) : filteredBooks.length === 0 ? (
        <div className={styles.empty}>
          <BookOpen size={28} aria-hidden="true" style={{ marginBottom: 8 }} />
          <p>Nenhuma obra encontrada para os filtros selecionados.</p>
        </div>
      ) : (
        <section className={styles.grid} aria-label="Lista de livros do vestibular">
          {filteredBooks.map((book) => {
            const dedalusUrl = `https://dedalus.usp.br/F/?func=find-b&request=${encodeURIComponent(
              book.titulo
            )}`;
            return (
              <article key={book.id} className={styles.card}>
                <div className={styles.cardTop}>
                  {book.capaUrl ? (
                    <img
                      src={book.capaUrl}
                      alt={`Capa de ${book.titulo}`}
                      className={styles.coverImg}
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className={styles.spine}
                      style={{ backgroundColor: book.corCapa || "#1e3a8a" }}
                      aria-hidden="true"
                    >
                      {book.codigoDedalus.split(" ")[0]}
                    </div>
                  )}

                  <div className={styles.meta}>
                    <span className={styles.examTag}>
                      {book.anos && !book.vestibular.includes(book.anos)
                        ? `${book.vestibular} • ${book.anos}`
                        : book.vestibular}
                    </span>
                    <h2 className={styles.bookTitle}>{book.titulo}</h2>
                    <p className={styles.author}>{book.autor}</p>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.detailsRow}>
                    <span className={styles.pill}>{book.genero}</span>
                    <span className={styles.pill}>
                      {book.sala} • {book.estante}
                    </span>
                    <span className={book.disponivel ? styles.statusAvail : styles.statusUnavail}>
                      {book.disponivel ? "No acervo" : "Consultar balcão"}
                    </span>
                  </div>

                  <div className={styles.codeBox}>
                    <span>Código CDU / Dedalus:</span>
                    <span className={styles.codeValue}>{book.codigoDedalus}</span>
                  </div>

                  {book.observacao && <p className={styles.obs}>{book.observacao}</p>}
                </div>

                <div className={styles.cardActions}>
                  <Link
                    to={`/?q=${encodeURIComponent(book.codigoDedalus)}`}
                    className={styles.primaryBtn}
                  >
                    <MapPin size={15} aria-hidden="true" /> Ver na Estante
                  </Link>
                  <a
                    href={dedalusUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.secondaryBtn}
                    title="Consultar disponibilidade no Dedalus USP"
                  >
                    Dedalus <ExternalLink size={14} aria-hidden="true" />
                  </a>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
