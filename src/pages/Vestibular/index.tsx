import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  ExternalLink,
  GraduationCap,
  Info,
  MapPin,
  Pencil,
  Route,
  Save,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { AuthService } from "../../admin/services/authService.ts";
import { BookCover } from "../../components/BookCover/index.tsx";
import type { RoomId } from "../../config/roomConstants.ts";
import { useVisitRoute } from "../../context/visitRouteStore.ts";
import { fetchBookCoverAndMetadata } from "../../services/bookMetadataService.ts";
import { getVestibularBooks, saveVestibularBook } from "../../services/pagesService.ts";
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
  const { addItem, hasItem, setDrawerOpen } = useVisitRoute();
  const [books, setBooks] = useState<VestibularBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Todas" | VestibularExamTag>("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBook, setSelectedBook] = useState<VestibularBook | null>(null);
  const [inlineDraft, setInlineDraft] = useState<VestibularBook | null>(null);
  const [autoFetching, setAutoFetching] = useState(false);
  const [savingInline, setSavingInline] = useState(false);
  const [inlineMsg, setInlineMsg] = useState<string | null>(null);
  const isAdmin = useMemo(() => AuthService.getSavedSession() !== null, []);

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

  useEffect(() => {
    if (!selectedBook) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedBook(null);
        setInlineDraft(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedBook]);

  const tabBooks = useMemo(
    () => books.filter((b) => activeTab === "Todas" || b.vestibular === activeTab),
    [books, activeTab],
  );

  const filteredBooks = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return tabBooks.filter((book) => {
      if (!q) return true;
      return (
        book.titulo.toLowerCase().includes(q) ||
        book.autor.toLowerCase().includes(q) ||
        book.codigoDedalus.toLowerCase().includes(q) ||
        book.vestibular.toLowerCase().includes(q) ||
        (book.escolaLiteraria ?? "").toLowerCase().includes(q)
      );
    });
  }, [tabBooks, searchTerm]);

  const handleOpenBook = (book: VestibularBook, startEditing = false) => {
    setSelectedBook(book);
    setInlineMsg(null);
    setInlineDraft(startEditing ? { ...book } : null);
  };

  const handleAutoFetchInline = async () => {
    if (!inlineDraft) return;
    setAutoFetching(true);
    setInlineMsg(null);
    try {
      const meta = await fetchBookCoverAndMetadata({
        titulo: inlineDraft.titulo,
        autor: inlineDraft.autor,
        isbn: inlineDraft.isbn,
        skipCache: true,
      });
      if (!meta) {
        setInlineMsg("Nenhum dado automático encontrado para este título.");
        return;
      }
      setInlineDraft((prev) =>
        prev
          ? {
              ...prev,
              capaUrl: meta.coverUrl || prev.capaUrl,
              sinopse: prev.sinopse || meta.sinopse,
              anoPublicacao: prev.anoPublicacao || meta.anoPublicacao,
              paginas: prev.paginas || meta.paginas,
              isbn: prev.isbn || meta.isbn,
            }
          : null,
      );
      setInlineMsg("Dados preenchidos! Revise e clique em Salvar alterações.");
    } finally {
      setAutoFetching(false);
    }
  };

  const handleSaveInline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineDraft) return;
    setSavingInline(true);
    setInlineMsg(null);
    try {
      const saved = await saveVestibularBook(inlineDraft);
      setBooks((prev) => prev.map((b) => (b.id === saved.id ? saved : b)));
      setSelectedBook(saved);
      setInlineDraft(null);
      setInlineMsg("Obra atualizada com sucesso!");
    } catch {
      setInlineMsg("Não foi possível salvar no momento.");
    } finally {
      setSavingInline(false);
    }
  };

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
          Consulte capas, sinopses, temas cobrados nas provas e a localização exata na estante da
          Biblioteca do CDCC-USP. Clique em qualquer obra para abrir a{" "}
          <strong>Ficha Completa</strong> ou acompanhar seu checklist de leitura.
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
            placeholder="Buscar obra, autor, escola ou CDU..."
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
              book.titulo,
            )}`;
            const examLabel =
              book.anos && !book.vestibular.includes(book.anos)
                ? `${book.vestibular} • ${book.anos}`
                : book.vestibular;

            return (
              <article key={book.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <button
                    type="button"
                    className={styles.cardCoverTrigger}
                    onClick={() => handleOpenBook(book)}
                    aria-label={`Abrir ficha completa de ${book.titulo}`}
                  >
                    <BookCover book={book} size="md" />
                  </button>

                  <div className={styles.meta}>
                    <div className={styles.metaTopRow}>
                      <span className={styles.examTag}>{examLabel}</span>
                    </div>
                    <button
                      type="button"
                      className={styles.bookTitleBtn}
                      onClick={() => handleOpenBook(book)}
                    >
                      <h2 className={styles.bookTitle}>{book.titulo}</h2>
                    </button>
                    <p className={styles.author}>
                      {book.autor}
                      {book.anoPublicacao ? ` • ${book.anoPublicacao}` : ""}
                    </p>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.detailsRow}>
                    <span className={styles.pill}>{book.escolaLiteraria || book.genero}</span>
                    <span className={book.disponivel ? styles.statusAvail : styles.statusUnavail}>
                      {book.disponivel ? "No acervo" : "Consultar balcão"}
                    </span>
                  </div>

                  {book.sinopse && <p className={styles.synopsisPreview}>{book.sinopse}</p>}

                  <div className={styles.codeBox}>
                    <span>
                      {book.sala} • {book.estante}
                    </span>
                    <span className={styles.codeValue}>{book.codigoDedalus}</span>
                  </div>
                </div>

                <div className={styles.cardActionsGrid}>
                  <button
                    type="button"
                    className={styles.detailsBtn}
                    onClick={() => handleOpenBook(book)}
                  >
                    <Info size={14} aria-hidden="true" /> Ver Detalhes e Sinopse
                  </button>

                  <div className={styles.cardActionsRow}>
                    <Link
                      to={`/?q=${encodeURIComponent(book.codigoDedalus)}`}
                      className={styles.primaryBtn}
                    >
                      <MapPin size={15} aria-hidden="true" /> Localizar Estante
                    </Link>
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      title="Adicionar livro à minha rota de visita"
                      onClick={() => {
                        const roomMatch = book.sala.match(/[123]/);
                        const roomId = (roomMatch ? Number(roomMatch[0]) : 1) as RoomId;
                        if (hasItem(book.codigoDedalus, roomId, book.estante)) {
                          setDrawerOpen(true);
                          return;
                        }
                        addItem({
                          code: book.codigoDedalus,
                          title: book.titulo,
                          roomId,
                          shelf: book.estante,
                        });
                      }}
                    >
                      <Route size={14} aria-hidden="true" />
                      {(() => {
                        const roomMatch = book.sala.match(/[123]/);
                        const roomId = (roomMatch ? Number(roomMatch[0]) : 1) as RoomId;
                        return hasItem(book.codigoDedalus, roomId, book.estante) ? "Na rota" : "+ Rota";
                      })()}
                    </button>
                    <a
                      href={dedalusUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.secondaryBtn}
                      title="Consultar disponibilidade no Dedalus USP"
                    >
                      Dedalus <ExternalLink size={14} aria-hidden="true" />
                    </a>
                    {isAdmin && (
                      <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={() => handleOpenBook(book, true)}
                        title="Editar obra na tela"
                        aria-label={`Editar ${book.titulo}`}
                      >
                        <Pencil size={14} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {selectedBook && (
        <div
          className={styles.modalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ficha-obra-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedBook(null);
              setInlineDraft(null);
            }
          }}
        >
          <div className={styles.modalDialog}>
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={() => {
                setSelectedBook(null);
                setInlineDraft(null);
              }}
              aria-label="Fechar ficha da obra"
            >
              <X size={18} aria-hidden="true" />
            </button>

            {inlineDraft ? (
              <form onSubmit={handleSaveInline} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", paddingRight: "2.5rem" }}>
                  <h2 id="ficha-obra-title" className={styles.modalTitle}>
                    Edição Direta: {inlineDraft.titulo}
                  </h2>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={handleAutoFetchInline}
                    disabled={autoFetching}
                  >
                    <Sparkles size={14} aria-hidden="true" />
                    {autoFetching ? "Buscando..." : "✨ Buscar Capa e Sinopse Automaticamente"}
                  </button>
                </div>

                {inlineMsg && (
                  <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "var(--color-brand)" }}>
                    {inlineMsg}
                  </p>
                )}

                <div className={styles.specsGrid}>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.8rem", fontWeight: 600 }}>
                    URL da Capa
                    <input
                      value={inlineDraft.capaUrl ?? ""}
                      onChange={(e) => setInlineDraft((p) => (p ? { ...p, capaUrl: e.target.value } : null))}
                      style={{ padding: "0.45rem 0.6rem", borderRadius: 8, border: "1px solid var(--color-border-strong)" }}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.8rem", fontWeight: 600 }}>
                    Escola Literária
                    <input
                      value={inlineDraft.escolaLiteraria ?? ""}
                      onChange={(e) => setInlineDraft((p) => (p ? { ...p, escolaLiteraria: e.target.value } : null))}
                      style={{ padding: "0.45rem 0.6rem", borderRadius: 8, border: "1px solid var(--color-border-strong)" }}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.8rem", fontWeight: 600 }}>
                    Código Dedalus/CDU
                    <input
                      value={inlineDraft.codigoDedalus}
                      onChange={(e) => setInlineDraft((p) => (p ? { ...p, codigoDedalus: e.target.value } : null))}
                      style={{ padding: "0.45rem 0.6rem", borderRadius: 8, border: "1px solid var(--color-border-strong)" }}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.8rem", fontWeight: 600 }}>
                    Estante
                    <input
                      value={inlineDraft.estante}
                      onChange={(e) => setInlineDraft((p) => (p ? { ...p, estante: e.target.value } : null))}
                      style={{ padding: "0.45rem 0.6rem", borderRadius: 8, border: "1px solid var(--color-border-strong)" }}
                    />
                  </label>
                </div>

                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.8rem", fontWeight: 600 }}>
                  Sinopse Completa
                  <textarea
                    rows={3}
                    value={inlineDraft.sinopse ?? ""}
                    onChange={(e) => setInlineDraft((p) => (p ? { ...p, sinopse: e.target.value } : null))}
                    style={{ padding: "0.5rem 0.65rem", borderRadius: 8, border: "1px solid var(--color-border-strong)" }}
                  />
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.8rem", fontWeight: 600 }}>
                  Temas do Vestibular (1 por linha)
                  <textarea
                    rows={3}
                    value={(inlineDraft.temasVestibular ?? []).join("\n")}
                    onChange={(e) =>
                      setInlineDraft((p) =>
                        p
                          ? {
                              ...p,
                              temasVestibular: e.target.value
                                .split("\n")
                                .map((t) => t.trim())
                                .filter(Boolean),
                            }
                          : null,
                      )
                    }
                    style={{ padding: "0.5rem 0.65rem", borderRadius: 8, border: "1px solid var(--color-border-strong)" }}
                  />
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.8rem", fontWeight: 600 }}>
                  Link Domínio Público / BBM-USP
                  <input
                    value={inlineDraft.dominioPublicoUrl ?? ""}
                    onChange={(e) => setInlineDraft((p) => (p ? { ...p, dominioPublicoUrl: e.target.value } : null))}
                    style={{ padding: "0.45rem 0.6rem", borderRadius: 8, border: "1px solid var(--color-border-strong)" }}
                  />
                </label>

                <div className={styles.modalActions}>
                  <button type="submit" className={styles.primaryBtn} disabled={savingInline} style={{ flex: "0 1 auto" }}>
                    <Save size={15} aria-hidden="true" />
                    {savingInline ? "Salvando..." : "Salvar alterações"}
                  </button>
                  <button type="button" className={styles.secondaryBtn} onClick={() => setInlineDraft(null)}>
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.modalLayout}>
                <div className={styles.modalLeft}>
                  <BookCover book={selectedBook} size="lg" />
                </div>

                <div className={styles.modalRight}>
                  <div>
                    <div className={styles.metaTopRow}>
                      <span className={styles.examTag}>
                        {selectedBook.anos && !selectedBook.vestibular.includes(selectedBook.anos)
                          ? `${selectedBook.vestibular} • ${selectedBook.anos}`
                          : selectedBook.vestibular}
                      </span>
                      {selectedBook.escolaLiteraria && (
                        <span className={styles.pill}>{selectedBook.escolaLiteraria}</span>
                      )}
                    </div>
                    <h2 id="ficha-obra-title" className={styles.modalTitle}>
                      {selectedBook.titulo}
                    </h2>
                    <p className={styles.modalAuthor}>
                      {selectedBook.autor}
                      {selectedBook.anoPublicacao ? ` (${selectedBook.anoPublicacao})` : ""}
                    </p>
                  </div>

                  {selectedBook.sinopse && (
                    <section className={styles.modalSection}>
                      <h3 className={styles.modalSectionTitle}>
                        <BookOpen size={14} aria-hidden="true" /> Sinopse Completa
                      </h3>
                      <p className={styles.modalSynopsis}>{selectedBook.sinopse}</p>
                    </section>
                  )}

                  {selectedBook.temasVestibular && selectedBook.temasVestibular.length > 0 && (
                    <section className={styles.modalSection}>
                      <h3 className={styles.modalSectionTitle}>
                        <GraduationCap size={14} aria-hidden="true" /> Dicas para o Vestibular (Contexto &amp; Temas)
                      </h3>
                      <ul className={styles.themesList}>
                        {selectedBook.temasVestibular.map((tema, idx) => (
                          <li key={idx}>{tema}</li>
                        ))}
                      </ul>
                    </section>
                  )}

                  <section className={styles.modalSection}>
                    <h3 className={styles.modalSectionTitle}>Ficha Técnica no CDCC</h3>
                    <div className={styles.specsGrid}>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Gênero</span>
                        <span className={styles.specValue}>{selectedBook.genero}</span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Código Dedalus / CDU</span>
                        <span className={styles.specValue}>{selectedBook.codigoDedalus}</span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Localização Física</span>
                        <span className={styles.specValue}>
                          {selectedBook.sala} • {selectedBook.estante}
                        </span>
                      </div>
                      {selectedBook.anoPublicacao && (
                        <div className={styles.specItem}>
                          <span className={styles.specLabel}>Publicação Original</span>
                          <span className={styles.specValue}>{selectedBook.anoPublicacao}</span>
                        </div>
                      )}
                    </div>
                  </section>

                  <div className={styles.modalActions}>
                    <Link
                      to={`/?q=${encodeURIComponent(selectedBook.codigoDedalus)}`}
                      className={styles.primaryBtn}
                      style={{ flex: "0 1 auto" }}
                    >
                      <MapPin size={15} aria-hidden="true" /> Localizar Estante no Mapa
                    </Link>
                    <a
                      href={`https://dedalus.usp.br/F/?func=find-b&request=${encodeURIComponent(
                        selectedBook.titulo,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.secondaryBtn}
                    >
                      Consultar no Dedalus <ExternalLink size={14} aria-hidden="true" />
                    </a>
                    {selectedBook.dominioPublicoUrl && (
                      <a
                        href={selectedBook.dominioPublicoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.publicDomainBtn}
                      >
                        📖 Ler Obra Gratuita (Domínio Público / BBM-USP)
                        <ExternalLink size={13} aria-hidden="true" />
                      </a>
                    )}
                    {isAdmin && (
                      <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={() => setInlineDraft({ ...selectedBook })}
                      >
                        <Pencil size={14} aria-hidden="true" /> Editar Ficha
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
