import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ExternalLink,
  Gamepad2,
  ImageIcon,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { isFirebaseConfigured } from "../../../lib/firebase.ts";
import { GamesService, generateSlug } from "../../../services/gamesService.ts";
import type { GameItem } from "../../../types/content.ts";
import { useAdminAuth } from "../../context/adminAuthStore.ts";
import styles from "../../styles/admin.module.css";

interface GameFormState {
  id?: string;
  nome: string;
  slug: string;
  categoria: string;
  jogadores: string;
  descricao: string;
  capaUrl: string;
  ordem: number;
  disponivel: boolean;
  accentColor: string;
  duration: string;
  complexity: string;
  emprStatus: "disponivel" | "emprestado";
  regrasTitulo: string;
  objetivo: string;
  preparacao: string;
  regras: string[];
  condicaoVitoria: string;
}

const INITIAL_GAME_FORM: GameFormState = {
  nome: "",
  slug: "",
  categoria: "Estratégia",
  jogadores: "2 a 4 jogadores",
  descricao: "",
  capaUrl: "",
  ordem: 1,
  disponivel: true,
  accentColor: "#145399",
  duration: "20–40 min",
  complexity: "Médio",
  emprStatus: "disponivel",
  regrasTitulo: "",
  objetivo: "",
  preparacao: "",
  regras: ["Cada jogador joga em seu turno."],
  condicaoVitoria: "Vence quem atingir a pontuação máxima ou cumprir o objetivo.",
};

const CATEGORY_SUGGESTIONS = [
  "Estratégia Clássica",
  "Família e Sorte",
  "Dedução e Estratégia",
  "Raciocínio Lógico",
  "Cartas e Agilidade",
  "Infantil e Educativo",
];

export function AdminGames() {
  const [games, setGames] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<GameItem | null>(null);
  const [formState, setFormState] = useState<GameFormState>(INITIAL_GAME_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const fileInputId = useId();
  const isOnlineFirebase = isFirebaseConfigured();
  const { user } = useAdminAuth();

  // Revoga ObjectURLs temporárias para evitar vazamento de memória
  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  const loadGames = async () => {
    setLoading(true);
    try {
      const data = await GamesService.getAll();
      setGames(data);
    } catch (err) {
      setErrorBanner("Erro ao carregar catálogo de jogos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadGames();
  }, []);

  const handleOpenNewModal = () => {
    setFormState({
      ...INITIAL_GAME_FORM,
      ordem: games.length + 1,
    });
    setSelectedFile(null);
    setPreviewUrl("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (game: GameItem) => {
    setFormState({
      id: game.id,
      nome: game.nome,
      slug: game.slug,
      categoria: game.categoria,
      jogadores: game.jogadores || "2 jogadores",
      descricao: game.descricao,
      capaUrl: game.capaUrl,
      ordem: game.ordem,
      disponivel: game.disponivel,
      accentColor: game.accentColor || "#145399",
      duration: game.duration || "20–40 min",
      complexity: game.complexity || "Médio",
      emprStatus: game.emprStatus || "disponivel",
      regrasTitulo: game.regrasTitulo || `Regras do ${game.nome}`,
      objetivo: game.objetivo || "",
      preparacao: game.preparacao || "",
      regras: game.regras && game.regras.length > 0 ? [...game.regras] : ["Regra geral."],
      condicaoVitoria: game.condicaoVitoria || "",
    });
    setSelectedFile(null);
    setPreviewUrl(game.capaUrl);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleNameChange = (name: string) => {
    const nextSlug = formState.id ? formState.slug : generateSlug(name);
    const nextRulesTitle = formState.regrasTitulo.startsWith("Regras do ") || !formState.regrasTitulo
      ? `Regras do ${name}`
      : formState.regrasTitulo;

    setFormState({
      ...formState,
      nome: name,
      slug: nextSlug,
      regrasTitulo: nextRulesTitle,
    });
  };

  const handleAddRuleRow = () => {
    setFormState({
      ...formState,
      regras: [...formState.regras, ""],
    });
  };

  const handleRuleChange = (index: number, val: string) => {
    const updated = [...formState.regras];
    updated[index] = val;
    setFormState({ ...formState, regras: updated });
  };

  const handleRemoveRuleRow = (index: number) => {
    const updated = formState.regras.filter((_, i) => i !== index);
    setFormState({
      ...formState,
      regras: updated.length > 0 ? updated : [""],
    });
  };

  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorBanner("Sessão expirada. Faça login novamente para salvar alterações.");
      return;
    }
    if (!formState.nome.trim()) {
      alert("Por favor, preencha o nome do jogo.");
      return;
    }
    if (!previewUrl && !formState.capaUrl) {
      alert("Por favor, envie uma foto da capa ou insira a URL da imagem.");
      return;
    }

    setSaving(true);
    try {
      const cleanRules = formState.regras.map((r) => r.trim()).filter(Boolean);

      if (formState.id) {
        await GamesService.update(
          formState.id,
          {
            nome: formState.nome.trim(),
            slug: formState.slug.trim() || generateSlug(formState.nome),
            categoria: formState.categoria.trim(),
            jogadores: formState.jogadores.trim(),
            descricao: formState.descricao.trim(),
            capaUrl: formState.capaUrl,
            ordem: Number(formState.ordem) || 1,
            disponivel: formState.disponivel,
            accentColor: formState.accentColor,
            duration: formState.duration.trim(),
            complexity: formState.complexity.trim(),
            emprStatus: formState.emprStatus,
            regrasTitulo: formState.regrasTitulo.trim(),
            objetivo: formState.objetivo.trim(),
            preparacao: formState.preparacao.trim(),
            regras: cleanRules,
            condicaoVitoria: formState.condicaoVitoria.trim(),
          },
          selectedFile || undefined,
        );
        showToast("Jogo atualizado com sucesso!");
      } else {
        await GamesService.create(
          {
            nome: formState.nome.trim(),
            slug: formState.slug.trim() || generateSlug(formState.nome),
            categoria: formState.categoria.trim(),
            jogadores: formState.jogadores.trim(),
            descricao: formState.descricao.trim(),
            capaUrl: formState.capaUrl || previewUrl,
            ordem: Number(formState.ordem) || games.length + 1,
            disponivel: formState.disponivel,
            accentColor: formState.accentColor,
            duration: formState.duration.trim(),
            complexity: formState.complexity.trim(),
            emprStatus: formState.emprStatus,
            regrasTitulo: formState.regrasTitulo.trim(),
            objetivo: formState.objetivo.trim(),
            preparacao: formState.preparacao.trim(),
            regras: cleanRules,
            condicaoVitoria: formState.condicaoVitoria.trim(),
          },
          selectedFile || undefined,
        );
        showToast("Novo jogo cadastrado com sucesso!");
      }
      setIsModalOpen(false);
      await loadGames();
    } catch (err) {
      alert("Erro ao salvar jogo: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDisponivel = async (game: GameItem) => {
    const next = !game.disponivel;
    try {
      await GamesService.toggleDisponivel(game.id, next);
      setGames((prev) => prev.map((g) => (g.id === game.id ? { ...g, disponivel: next } : g)));
      showToast(
        next ? `"${game.nome}" marcado como disponível!` : `"${game.nome}" marcado como indisponível.`,
      );
    } catch (err) {
      alert("Erro ao alterar disponibilidade: " + String(err));
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= games.length) return;

    const newGames = [...games];
    const [moved] = newGames.splice(index, 1);
    newGames.splice(targetIndex, 0, moved);

    setGames(newGames);
    try {
      await GamesService.reorder(newGames.map((g) => g.id));
      showToast("Ordem dos jogos atualizada.");
    } catch (err) {
      console.error(err);
      await loadGames();
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await GamesService.delete(deleteCandidate.id);
      showToast(`Jogo "${deleteCandidate.nome}" excluído com sucesso.`);
      setDeleteCandidate(null);
      await loadGames();
    } catch (err) {
      alert("Erro ao excluir: " + String(err));
    }
  };

  const handleResetDefaults = async () => {
    if (
      window.confirm(
        "Deseja restaurar os 3 jogos originais (Xadrez, Ludo e Batalha Naval)? Quaisquer jogos adicionais salvos localmente serão substituídos.",
      )
    ) {
      setLoading(true);
      await GamesService.resetToDefaults();
      await loadGames();
      showToast("Catálogo de jogos restaurado para o padrão original.");
    }
  };

  const filteredGames = games.filter(
    (g) =>
      g.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.slug.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const availableCount = games.filter((g) => g.disponivel).length;
  const categoriesCount = new Set(games.map((g) => g.categoria)).size;

  return (
    <section aria-labelledby="games-admin-title" className={styles.pageSection}>
      <header className={styles.sectionHeader}>
        <div>
          <h1 id="games-admin-title" className={styles.sectionTitle}>
            Gerenciador do Espaço Lúdico
          </h1>
          <p className={styles.sectionSubtitle}>
            Cadastre novos jogos de tabuleiro, edite regras oficiais, atualize fotos de capa e
            alterne a disponibilidade de empréstimo em tempo real.
          </p>
        </div>

        <div className={styles.rowActions}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={handleResetDefaults}
            title="Restaurar o acervo de jogos padrão (Xadrez, Ludo, Batalha Naval)"
          >
            <RefreshCw size={15} aria-hidden="true" />
            Restaurar Padrões
          </button>
          <button type="button" className={styles.primaryBtn} onClick={handleOpenNewModal}>
            <Plus size={16} aria-hidden="true" />
            Novo Jogo
          </button>
        </div>
      </header>

      {errorBanner && (
        <div role="alert" className={styles.errorBanner}>
          {errorBanner}
        </div>
      )}

      {/* Sincronização & Estatísticas */}
      <div className={styles.statusIndicator}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span>
            Persistência:{" "}
            {isOnlineFirebase ? (
              <span className={`${styles.syncBadge} ${styles.syncOnline}`}>
                <CheckCircle2 size={13} aria-hidden="true" />
                Firebase Firestore Conectado
              </span>
            ) : (
              <span className={`${styles.syncBadge} ${styles.syncLocal}`}>
                Demonstração Local (LocalStorage Ativo)
              </span>
            )}
          </span>
        </div>

        <div>
          Total: <strong>{games.length} jogos</strong> (
          <span style={{ color: "#16a34a", fontWeight: 600 }}>{availableCount} disponíveis</span>,{" "}
          <span>{games.length - availableCount} em manutenção</span>) •{" "}
          <strong>{categoriesCount} categorias</strong>
        </div>
      </div>

      {/* Tabela de Jogos */}
      <div className={styles.panelCard}>
        <div className={styles.toolbar}>
          <input
            type="search"
            className={styles.toolbarSearch}
            placeholder="Pesquisar por nome do jogo, categoria ou slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Filtrar jogos cadastrados"
          />
        </div>

        {loading ? (
          <div className={styles.emptyState}>Carregando jogos...</div>
        ) : filteredGames.length === 0 ? (
          <div className={styles.emptyState}>Nenhum jogo encontrado.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: "70px", textAlign: "center" }}>Ordem</th>
                  <th style={{ width: "60px" }}>Capa</th>
                  <th>Nome do Jogo</th>
                  <th>Categoria</th>
                  <th>Jogadores</th>
                  <th style={{ width: "130px" }}>Status Empréstimo</th>
                  <th style={{ width: "130px", textAlign: "right" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredGames.map((game, index) => (
                  <tr key={game.id}>
                    <td style={{ textAlign: "center" }}>
                      <div className={styles.orderControls}>
                        <button
                          type="button"
                          className={styles.orderBtn}
                          onClick={() => handleMoveOrder(index, "up")}
                          disabled={index === 0}
                          title="Subir ordem"
                          aria-label={`Subir jogo ${game.nome}`}
                        >
                          <ArrowUp size={13} />
                        </button>
                        <span style={{ fontWeight: 600, fontSize: "0.8125rem", minWidth: "16px" }}>
                          {index + 1}
                        </span>
                        <button
                          type="button"
                          className={styles.orderBtn}
                          onClick={() => handleMoveOrder(index, "down")}
                          disabled={index === games.length - 1}
                          title="Descer ordem"
                          aria-label={`Descer jogo ${game.nome}`}
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                    </td>

                    <td>
                      <img
                        src={game.capaUrl}
                        alt={game.nome}
                        className={styles.tableThumbGame}
                        loading="lazy"
                      />
                    </td>

                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                        <strong style={{ color: "var(--color-text-primary)", fontSize: "0.875rem" }}>
                          {game.nome}
                        </strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                          URL: <code>/espacoludico/{game.slug}</code>
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className={styles.badgeTag}>{game.categoria}</span>
                    </td>

                    <td style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                      {game.jogadores || "2 jogadores"}
                    </td>

                    <td>
                      <label className={styles.toggleSwitch}>
                        <input
                          type="checkbox"
                          className={styles.toggleCheckbox}
                          checked={game.disponivel}
                          onChange={() => handleToggleDisponivel(game)}
                          aria-label={`Alternar disponibilidade do jogo ${game.nome}`}
                        />
                        <span
                          className={game.disponivel ? styles.badgeSuccess : styles.badgeNeutral}
                        >
                          {game.disponivel ? "Disponível" : "Em falta"}
                        </span>
                      </label>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div className={styles.rowActions} style={{ justifyContent: "flex-end" }}>
                        <Link
                          to={`/espacoludico/${game.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.smallBtn}
                          title="Ver regras públicas no site"
                          aria-label={`Ver regras públicas de ${game.nome}`}
                        >
                          <ExternalLink size={14} />
                        </Link>
                        <button
                          type="button"
                          className={styles.smallBtn}
                          onClick={() => handleOpenEditModal(game)}
                          title="Editar jogo e regras"
                          aria-label={`Editar ${game.nome}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          className={styles.smallDangerBtn}
                          onClick={() => setDeleteCandidate(game)}
                          title="Excluir jogo"
                          aria-label={`Excluir ${game.nome}`}
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
        )}
      </div>

      {/* Modal de Criação / Edição de Jogo */}
      {isModalOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalContent} style={{ maxWidth: "760px" }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {formState.id ? `Editar Jogo: ${formState.nome}` : "Cadastrar Novo Jogo"}
              </h2>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsModalOpen(false)}
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveGame}>
              <div className={styles.modalBody}>
                {/* Capa do Jogo */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Foto da Capa ou Tabuleiro</label>
                  <div
                    className={styles.dropzone}
                    onClick={() => document.getElementById(fileInputId)?.click()}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Prévia da capa"
                        className={styles.dropzonePreview}
                        style={{ maxHeight: "150px" }}
                      />
                    ) : (
                      <>
                        <ImageIcon size={30} style={{ color: "var(--color-text-secondary)" }} />
                        <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                          Selecione uma imagem de capa (WebP, JPG, PNG)
                        </span>
                        <span className={styles.dropzoneHelp}>
                          Será enviada ao Firebase Storage ou mantida em cache local
                        </span>
                      </>
                    )}

                    <input
                      id={fileInputId}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />
                  </div>

                  <input
                    type="text"
                    className={styles.input}
                    style={{ marginTop: "0.5rem" }}
                    placeholder="Ou cole a URL direta da imagem (https://...)"
                    value={formState.capaUrl}
                    onChange={(e) => {
                      setFormState({ ...formState, capaUrl: e.target.value });
                      if (e.target.value) setPreviewUrl(e.target.value);
                    }}
                  />
                </div>

                {/* Dados Principais */}
                <div className={styles.formGrid}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      Nome do Jogo <span style={{ color: "var(--color-danger)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Ex: Catan, Carcassonne, Damas..."
                      value={formState.nome}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Identificador na URL (slug)</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="ex: catan"
                      value={formState.slug}
                      onChange={(e) =>
                        setFormState({ ...formState, slug: generateSlug(e.target.value) })
                      }
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Categoria Temática</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Ex: Estratégia Clássica"
                      value={formState.categoria}
                      onChange={(e) => setFormState({ ...formState, categoria: e.target.value })}
                      list="categories-list"
                    />
                    <datalist id="categories-list">
                      {CATEGORY_SUGGESTIONS.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Número de Jogadores</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Ex: 2 jogadores ou 2 a 4 jogadores"
                      value={formState.jogadores}
                      onChange={(e) => setFormState({ ...formState, jogadores: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Tempo Médio</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Ex: 20–40 min"
                      value={formState.duration}
                      onChange={(e) => setFormState({ ...formState, duration: e.target.value })}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Complexidade</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Ex: Médio"
                      value={formState.complexity}
                      onChange={(e) => setFormState({ ...formState, complexity: e.target.value })}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Status na Bancada</label>
                    <select
                      className={styles.select}
                      value={formState.emprStatus}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          emprStatus: e.target.value as "disponivel" | "emprestado",
                        })
                      }
                    >
                      <option value="disponivel">Na Bancada (Disponível)</option>
                      <option value="emprestado">Emprestado no Momento</option>
                    </select>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Cor de Destaque do Card</label>
                    <input
                      type="color"
                      value={formState.accentColor}
                      onChange={(e) => setFormState({ ...formState, accentColor: e.target.value })}
                      style={{ width: 56, height: 38, border: "1px solid var(--color-border)", borderRadius: 6 }}
                    />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Descrição Resumida</label>
                  <textarea
                    rows={2}
                    className={styles.textarea}
                    placeholder="Apresentação do jogo exibida no card do Espaço Lúdico..."
                    value={formState.descricao}
                    onChange={(e) => setFormState({ ...formState, descricao: e.target.value })}
                  />
                </div>

                {/* Seção de Regras Oficiais */}
                <div
                  style={{
                    borderTop: "1px solid var(--color-border)",
                    paddingTop: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Gamepad2 size={18} style={{ color: "var(--color-brand)" }} />
                    <strong style={{ fontSize: "0.9375rem" }}>Regras e Dinâmica de Jogo</strong>
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Título da Página de Regras</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={formState.regrasTitulo}
                        onChange={(e) =>
                          setFormState({ ...formState, regrasTitulo: e.target.value })
                        }
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Condição de Vitória</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Ex: Vence quem aplicar xeque-mate..."
                        value={formState.condicaoVitoria}
                        onChange={(e) =>
                          setFormState({ ...formState, condicaoVitoria: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Objetivo Principal do Jogo</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Ex: Percorrer todo o tabuleiro com seus 4 peões..."
                      value={formState.objetivo}
                      onChange={(e) => setFormState({ ...formState, objetivo: e.target.value })}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Preparação Inicial (Setup)</label>
                    <textarea
                      rows={2}
                      className={styles.textarea}
                      placeholder="Como posicionar o tabuleiro, peças ou cartas antes de começar..."
                      value={formState.preparacao}
                      onChange={(e) => setFormState({ ...formState, preparacao: e.target.value })}
                    />
                  </div>

                  {/* Lista Dinâmica de Regras */}
                  <div className={styles.fieldGroup}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <label className={styles.fieldLabel}>Regras Passo a Passo</label>
                      <button
                        type="button"
                        className={styles.smallBtn}
                        onClick={handleAddRuleRow}
                        style={{ fontSize: "0.75rem" }}
                      >
                        <Plus size={13} />
                        Adicionar Regra
                      </button>
                    </div>

                    <div className={styles.ruleList}>
                      {formState.regras.map((regra, idx) => (
                        <div key={idx} className={styles.ruleRow}>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              color: "var(--color-text-secondary)",
                              width: "20px",
                            }}
                          >
                            {idx + 1}.
                          </span>
                          <input
                            type="text"
                            className={styles.input}
                            placeholder="Descreva a regra ou movimento..."
                            value={regra}
                            onChange={(e) => handleRuleChange(idx, e.target.value)}
                          />
                          <button
                            type="button"
                            className={styles.smallDangerBtn}
                            onClick={() => handleRemoveRuleRow(idx)}
                            title="Remover linha"
                            aria-label={`Remover regra ${idx + 1}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Disponibilidade */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.5rem" }}>
                  <label className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      className={styles.toggleCheckbox}
                      checked={formState.disponivel}
                      onChange={(e) => setFormState({ ...formState, disponivel: e.target.checked })}
                    />
                    <span>Jogo disponível no acervo para empréstimo aos frequentadores</span>
                  </label>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.primaryBtn} disabled={saving}>
                  {saving ? (
                    <>
                      <Upload size={14} className="spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Jogo"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmação de Exclusão */}
      {deleteCandidate && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalContent} style={{ maxWidth: "440px" }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Excluir Jogo</h2>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setDeleteCandidate(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                Tem certeza de que deseja remover o jogo{" "}
                <strong style={{ color: "var(--color-text-primary)" }}>
                  "{deleteCandidate.nome}"
                </strong>
                ? O registro e as regras serão excluídos do sistema.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setDeleteCandidate(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.dangerBtn}
                onClick={handleConfirmDelete}
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts Flutuantes */}
      {toastMessage && (
        <div className={styles.toastContainer} role="status" aria-live="polite">
          <div className={styles.toast}>
            <CheckCircle2 size={16} style={{ color: "#4ade80" }} />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </section>
  );
}
