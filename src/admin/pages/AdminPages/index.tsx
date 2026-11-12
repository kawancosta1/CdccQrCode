import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ExternalLink,
  FileText,
  GraduationCap,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import {
  deleteCustomPage,
  deleteVestibularBook,
  getCustomPages,
  getVestibularBooks,
  normalizeSlug,
  resetVestibularBooksToSeed,
  saveCustomPage,
  saveVestibularBook,
} from "../../../services/pagesService.ts";
import { uploadCmsImage } from "../../../services/siteConfigService.ts";
import type {
  CustomPage,
  CustomPageBlock,
  VestibularBook,
  VestibularExamTag,
} from "../../../types/content.ts";
import adminStyles from "../../styles/admin.module.css";
import styles from "../../styles/cms.module.css";

const EMPTY_PAGE: CustomPage = {
  id: "",
  slug: "",
  titulo: "",
  subtitulo: "",
  icone: "FileText",
  bannerUrl: "",
  publicada: true,
  mostrarNoMenu: false,
  blocos: [
    {
      id: "bloco-1",
      tipo: "texto",
      titulo: "Informações",
      conteudo: "",
    },
  ],
};

const EMPTY_VEST_BOOK: VestibularBook = {
  id: "",
  titulo: "",
  autor: "",
  vestibular: "FUVEST",
  anos: "2026",
  genero: "Romance",
  codigoDedalus: "869.93",
  sala: "Sala 1",
  estante: "Estante 10",
  corCapa: "#1e3a8a",
  disponivel: true,
  observacao: "",
  ordem: 99,
};

export default function AdminPages() {
  const [activeTab, setActiveTab] = useState<"paginas" | "vestibular">("paginas");
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [editingPage, setEditingPage] = useState<CustomPage>(EMPTY_PAGE);
  const [vestBooks, setVestBooks] = useState<VestibularBook[]>([]);
  const [editingBook, setEditingBook] = useState<VestibularBook>(EMPTY_VEST_BOOK);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    const [p, v] = await Promise.all([getCustomPages(false), getVestibularBooks()]);
    setPages(p);
    setVestBooks(v);
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      const saved = await saveCustomPage({
        ...editingPage,
        slug: normalizeSlug(editingPage.slug || editingPage.titulo),
      });
      setEditingPage(saved);
      await loadAll();
      setStatusMsg(`Página "/p/${saved.slug}" salva com sucesso!`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erro ao salvar página.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!window.confirm("Excluir esta página customizada?")) return;
    await deleteCustomPage(id);
    if (editingPage.id === id) setEditingPage(EMPTY_PAGE);
    await loadAll();
  };

  const addBlock = (tipo: CustomPageBlock["tipo"]) => {
    const newBlock: CustomPageBlock = {
      id: `bloco-${Date.now()}`,
      tipo,
      titulo:
        tipo === "alerta_bentinho"
          ? "Dica do Bentinho"
          : tipo === "grade_livros"
          ? "Obras Recomendadas"
          : tipo === "link_externo"
          ? "Link Útil"
          : "Seção",
      conteudo: "",
      livros:
        tipo === "grade_livros"
          ? [
              {
                id: `livro-${Date.now()}`,
                titulo: "Dom Casmurro",
                autor: "Machado de Assis",
                categoria: "Literatura",
                codigoDedalus: "869.93 M149",
                salaEstante: "Sala 1 • Estante 12",
                disponivel: true,
              },
            ]
          : undefined,
    };
    setEditingPage((prev) => ({ ...prev, blocos: [...prev.blocos, newBlock] }));
  };

  const updateBlock = (index: number, patch: Partial<CustomPageBlock>) => {
    setEditingPage((prev) => ({
      ...prev,
      blocos: prev.blocos.map((b, i) => (i === index ? { ...b, ...patch } : b)),
    }));
  };

  const removeBlock = (index: number) => {
    setEditingPage((prev) => ({
      ...prev,
      blocos: prev.blocos.filter((_, i) => i !== index),
    }));
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      const saved = await saveVestibularBook(editingBook);
      setEditingBook(EMPTY_VEST_BOOK);
      await loadAll();
      setStatusMsg(`Obra "${saved.titulo}" salva na lista do Vestibular!`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erro ao salvar obra.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Criador de Páginas &amp; Leituras do Vestibular</h1>
          <p className={styles.subtitle}>
            Crie páginas dinâmicas em <code>/#/p/slug</code> ou gerencie as obras obrigatórias de{" "}
            <code>/#/vestibular</code>.
          </p>
        </div>
        <div className={styles.actions}>
          <Link to="/vestibular" target="_blank" className={styles.secondaryBtn}>
            <GraduationCap size={16} /> Abrir /vestibular <ExternalLink size={14} />
          </Link>
        </div>
      </header>

      {statusMsg && <div className={adminStyles.successBanner}>{statusMsg}</div>}
      {errorMsg && <div className={adminStyles.errorBanner}>{errorMsg}</div>}

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === "paginas" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("paginas")}
        >
          <FileText size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
          Páginas Customizadas ({pages.length})
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === "vestibular" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("vestibular")}
        >
          <GraduationCap size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
          Obras do Vestibular ({vestBooks.length})
        </button>
      </div>

      {activeTab === "paginas" ? (
        <div className={styles.grid2}>
          <section className={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 className={styles.cardTitle}>Páginas Existentes</h2>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setEditingPage(EMPTY_PAGE)}
              >
                <Plus size={15} /> Nova Página
              </button>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>URL</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.titulo}</strong>
                        {p.mostrarNoMenu && (
                          <div style={{ fontSize: "0.74rem", color: "#145399" }}>No menu</div>
                        )}
                      </td>
                      <td>
                        <code>/p/{p.slug}</code>
                      </td>
                      <td>
                        <span className={p.publicada ? styles.badgeOk : styles.badgeMuted}>
                          {p.publicada ? "Publicada" : "Rascunho"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            type="button"
                            className={styles.secondaryBtn}
                            onClick={() => setEditingPage(p)}
                          >
                            Editar
                          </button>
                          <Link
                            to={`/p/${p.slug}`}
                            target="_blank"
                            className={styles.secondaryBtn}
                            title="Abrir página"
                          >
                            <ExternalLink size={14} />
                          </Link>
                          <button
                            type="button"
                            className={styles.dangerBtn}
                            onClick={() => handleDeletePage(p.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <form className={styles.card} onSubmit={handleSavePage}>
            <h2 className={styles.cardTitle}>
              {editingPage.id ? `Editando: ${editingPage.titulo}` : "Nova Página Dinâmica"}
            </h2>
            <div className={styles.grid2}>
              <label className={styles.field}>
                <span className={styles.label}>Título</span>
                <input
                  required
                  className={styles.input}
                  value={editingPage.titulo}
                  onChange={(e) =>
                    setEditingPage((prev) => ({
                      ...prev,
                      titulo: e.target.value,
                      slug: prev.id ? prev.slug : normalizeSlug(e.target.value),
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Slug (URL /p/...)</span>
                <input
                  required
                  className={styles.input}
                  value={editingPage.slug}
                  onChange={(e) =>
                    setEditingPage((prev) => ({ ...prev, slug: normalizeSlug(e.target.value) }))
                  }
                />
              </label>
            </div>

            <label className={styles.field}>
              <span className={styles.label}>Subtítulo</span>
              <input
                className={styles.input}
                value={editingPage.subtitulo}
                onChange={(e) => setEditingPage((prev) => ({ ...prev, subtitulo: e.target.value }))}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Banner (URL ou upload WebP)</span>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className={styles.input}
                  placeholder="https://..."
                  value={editingPage.bannerUrl ?? ""}
                  onChange={(e) =>
                    setEditingPage((prev) => ({ ...prev, bannerUrl: e.target.value }))
                  }
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadCmsImage(file, "pages");
                    setEditingPage((prev) => ({ ...prev, bannerUrl: url }));
                  }}
                />
              </div>
            </label>

            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={editingPage.publicada}
                  onChange={(e) =>
                    setEditingPage((prev) => ({ ...prev, publicada: e.target.checked }))
                  }
                />
                Página publicada
              </label>
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={editingPage.mostrarNoMenu}
                  onChange={(e) =>
                    setEditingPage((prev) => ({ ...prev, mostrarNoMenu: e.target.checked }))
                  }
                />
                Mostrar na Barra de Navegação
              </label>
            </div>

            <div className={styles.subBox}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <strong>Blocos de Conteúdo ({editingPage.blocos.length})</strong>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button type="button" className={styles.secondaryBtn} onClick={() => addBlock("texto")}>
                    + Texto
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => addBlock("alerta_bentinho")}
                  >
                    + Alerta Bentinho
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => addBlock("link_externo")}
                  >
                    + Link
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => addBlock("grade_livros")}
                  >
                    + Grade de Livros
                  </button>
                </div>
              </div>

              {editingPage.blocos.map((block, idx) => (
                <div
                  key={block.id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    padding: "0.75rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.55rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className={styles.badgeMuted}>{block.tipo}</span>
                    <button
                      type="button"
                      className={styles.dangerBtn}
                      onClick={() => removeBlock(idx)}
                    >
                      Remover bloco
                    </button>
                  </div>
                  <input
                    className={styles.input}
                    placeholder="Título do bloco"
                    value={block.titulo ?? ""}
                    onChange={(e) => updateBlock(idx, { titulo: e.target.value })}
                  />
                  <textarea
                    className={styles.textarea}
                    placeholder="Texto / conteúdo..."
                    value={block.conteudo ?? ""}
                    onChange={(e) => updateBlock(idx, { conteudo: e.target.value })}
                  />
                  {block.tipo === "link_externo" && (
                    <div className={styles.grid2}>
                      <input
                        className={styles.input}
                        placeholder="URL externa (https://...)"
                        value={block.linkUrl ?? ""}
                        onChange={(e) => updateBlock(idx, { linkUrl: e.target.value })}
                      />
                      <input
                        className={styles.input}
                        placeholder="Texto do botão"
                        value={block.linkLabel ?? ""}
                        onChange={(e) => updateBlock(idx, { linkLabel: e.target.value })}
                      />
                    </div>
                  )}
                  {block.tipo === "grade_livros" && (
                    <div style={{ fontSize: "0.82rem", color: "#475569" }}>
                      Livros cadastrados neste bloco: {(block.livros ?? []).length}.{" "}
                      <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={() => {
                          const titulo = window.prompt("Título da obra:");
                          if (!titulo) return;
                          const autor = window.prompt("Autor:") ?? "";
                          const codigoDedalus = window.prompt("Código CDU/Dedalus (ex: 869.93 M149):") ?? "869.93";
                          const salaEstante = window.prompt("Sala/Estante (ex: Sala 1 • Estante 12):") ?? "Sala 1";
                          updateBlock(idx, {
                            livros: [
                              ...(block.livros ?? []),
                              {
                                id: `l-${Date.now()}`,
                                titulo,
                                autor,
                                categoria: "Acervo CDCC",
                                codigoDedalus,
                                salaEstante,
                                disponivel: true,
                              },
                            ],
                          });
                        }}
                      >
                        + Adicionar livro à grade
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button type="submit" className={styles.primaryBtn} disabled={saving}>
              <Save size={16} /> {saving ? "Salvando..." : "Salvar Página"}
            </button>
          </form>
        </div>
      ) : (
        <div className={styles.grid2}>
          <section className={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <h2 className={styles.cardTitle}>Obras Cadastradas ({vestBooks.length})</h2>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setEditingBook(EMPTY_VEST_BOOK)}
                >
                  <Plus size={14} /> Nova Obra
                </button>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={async () => {
                    if (!window.confirm("Restaurar lista padrão FUVEST/UNICAMP/UNESP?")) return;
                    await resetVestibularBooksToSeed();
                    await loadAll();
                    setStatusMsg("Lista padrão de vestibulares restaurada.");
                  }}
                >
                  <RefreshCw size={14} /> Restaurar Padrão
                </button>
              </div>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Obra</th>
                    <th>Vestibular</th>
                    <th>Código CDU</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {vestBooks.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <strong>{b.titulo}</strong>
                        <div style={{ fontSize: "0.76rem", color: "#64748b" }}>{b.autor}</div>
                      </td>
                      <td>{b.vestibular}</td>
                      <td>
                        <code>{b.codigoDedalus}</code>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            type="button"
                            className={styles.secondaryBtn}
                            onClick={() => setEditingBook(b)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className={styles.dangerBtn}
                            onClick={async () => {
                              if (!window.confirm(`Remover "${b.titulo}"?`)) return;
                              await deleteVestibularBook(b.id);
                              await loadAll();
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <form className={styles.card} onSubmit={handleSaveBook}>
            <h2 className={styles.cardTitle}>
              {editingBook.id ? `Editando: ${editingBook.titulo}` : "Adicionar Obra de Vestibular"}
            </h2>
            <div className={styles.grid2}>
              <label className={styles.field}>
                <span className={styles.label}>Título</span>
                <input
                  required
                  className={styles.input}
                  value={editingBook.titulo}
                  onChange={(e) => setEditingBook((p) => ({ ...p, titulo: e.target.value }))}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Autor(a)</span>
                <input
                  required
                  className={styles.input}
                  value={editingBook.autor}
                  onChange={(e) => setEditingBook((p) => ({ ...p, autor: e.target.value }))}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Vestibular</span>
                <select
                  className={styles.select}
                  value={editingBook.vestibular}
                  onChange={(e) =>
                    setEditingBook((p) => ({ ...p, vestibular: e.target.value as VestibularExamTag }))
                  }
                >
                  <option value="FUVEST 2026–2028">FUVEST 2026–2028</option>
                  <option value="FUVEST">FUVEST</option>
                  <option value="UNICAMP">UNICAMP</option>
                  <option value="UNESP / Clássicos">UNESP / Clássicos</option>
                </select>
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Edições / Anos</span>
                <input
                  className={styles.input}
                  value={editingBook.anos}
                  onChange={(e) => setEditingBook((p) => ({ ...p, anos: e.target.value }))}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Código CDU / Dedalus</span>
                <input
                  required
                  className={styles.input}
                  value={editingBook.codigoDedalus}
                  onChange={(e) => setEditingBook((p) => ({ ...p, codigoDedalus: e.target.value }))}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Gênero</span>
                <input
                  className={styles.input}
                  value={editingBook.genero}
                  onChange={(e) => setEditingBook((p) => ({ ...p, genero: e.target.value }))}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Sala</span>
                <input
                  className={styles.input}
                  value={editingBook.sala}
                  onChange={(e) => setEditingBook((p) => ({ ...p, sala: e.target.value }))}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Estante</span>
                <input
                  className={styles.input}
                  value={editingBook.estante}
                  onChange={(e) => setEditingBook((p) => ({ ...p, estante: e.target.value }))}
                />
              </label>
            </div>
            <label className={styles.field}>
              <span className={styles.label}>Capa do Livro (URL ou upload WebP)</span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input
                  className={styles.input}
                  placeholder="https://... (opcional)"
                  value={editingBook.capaUrl ?? ""}
                  onChange={(e) => setEditingBook((p) => ({ ...p, capaUrl: e.target.value }))}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadCmsImage(file, "vestibular");
                    setEditingBook((p) => ({ ...p, capaUrl: url }));
                  }}
                />
              </div>
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Observação</span>
              <input
                className={styles.input}
                value={editingBook.observacao ?? ""}
                onChange={(e) => setEditingBook((p) => ({ ...p, observacao: e.target.value }))}
              />
            </label>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={editingBook.disponivel}
                onChange={(e) => setEditingBook((p) => ({ ...p, disponivel: e.target.checked }))}
              />
              Disponível no acervo
            </label>
            <button type="submit" className={styles.primaryBtn} disabled={saving}>
              <Save size={16} /> Salvar Obra
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
