import { useEffect, useId, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Copy,
  ExternalLink,
  ImageIcon,
  Pencil,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useSiteConfig } from "../../../context/siteConfigStore.ts";
import { isFirebaseConfigured } from "../../../lib/firebase.ts";
import { CarouselService } from "../../../services/carouselService.ts";
import type { CarouselSlide } from "../../../types/content.ts";
import { useAdminAuth } from "../../context/adminAuthStore.ts";
import styles from "../../styles/admin.module.css";

interface FormState {
  id?: string;
  titulo: string;
  eyebrow: string;
  descricao: string;
  linkDestino: string;
  textoBotao: string;
  imagemUrl: string;
  posicaoObjeto: string;
  overlayOpacity: number;
  textAlign: "left" | "center" | "right";
  accentColor: string;
  openInNewTab: boolean;
  hideButton: boolean;
  ordem: number;
  ativo: boolean;
}

const INITIAL_FORM: FormState = {
  titulo: "",
  eyebrow: "Biblioteca CDCC • USP",
  descricao: "",
  linkDestino: "/estantes",
  textoBotao: "Explorar acervo",
  imagemUrl: "",
  posicaoObjeto: "center 45%",
  overlayOpacity: 65,
  textAlign: "left",
  accentColor: "",
  openInNewTab: false,
  hideButton: false,
  ordem: 1,
  ativo: true,
};

export function AdminCarousel() {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<CarouselSlide | null>(null);
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const fileInputId = useId();
  const isOnlineFirebase = isFirebaseConfigured();
  const { user } = useAdminAuth();
  const { config, updateConfig } = useSiteConfig();
  const carouselCfg = config.homeConfig.carouselConfig ?? {
    autoPlayEnabled: true,
    autoPlaySeconds: 6,
    showArrows: true,
    showDots: true,
    showPauseButton: true,
    heightMode: "default" as const,
  };

  const updateCarouselSetting = async (
    patch: Partial<NonNullable<typeof config.homeConfig.carouselConfig>>
  ) => {
    await updateConfig({
      ...config,
      homeConfig: {
        ...config.homeConfig,
        carouselConfig: { ...carouselCfg, ...patch },
      },
    });
    showToast("Opções globais do carrossel atualizadas!");
  };

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

  const loadSlides = async () => {
    setLoading(true);
    try {
      const data = await CarouselService.getAll();
      setSlides(data);
    } catch (err) {
      setErrorBanner("Erro ao carregar slides do carrossel.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSlides();
  }, []);

  const handleOpenNewModal = () => {
    setFormState({
      ...INITIAL_FORM,
      ordem: slides.length + 1,
    });
    setSelectedFile(null);
    setPreviewUrl("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (slide: CarouselSlide) => {
    setFormState({
      id: slide.id,
      titulo: slide.titulo,
      eyebrow: slide.eyebrow || "",
      descricao: slide.descricao || "",
      linkDestino: slide.linkDestino,
      textoBotao: slide.textoBotao || "Explorar",
      imagemUrl: slide.imagemUrl,
      posicaoObjeto: slide.posicaoObjeto || "center 45%",
      overlayOpacity: slide.overlayOpacity ?? 65,
      textAlign: slide.textAlign ?? "left",
      accentColor: slide.accentColor || "",
      openInNewTab: Boolean(slide.openInNewTab),
      hideButton: Boolean(slide.hideButton),
      ordem: slide.ordem,
      ativo: slide.ativo,
    });
    setSelectedFile(null);
    setPreviewUrl(slide.imagemUrl);
    setIsModalOpen(true);
  };

  const handleDuplicateSlide = async (slide: CarouselSlide) => {
    try {
      await CarouselService.create({
        titulo: `${slide.titulo} (Cópia)`,
        eyebrow: slide.eyebrow || "",
        descricao: slide.descricao || "",
        linkDestino: slide.linkDestino,
        textoBotao: slide.textoBotao || "Explorar",
        imagemUrl: slide.imagemUrl,
        posicaoObjeto: slide.posicaoObjeto || "center 45%",
        overlayOpacity: slide.overlayOpacity ?? 65,
        textAlign: slide.textAlign ?? "left",
        accentColor: slide.accentColor || "",
        openInNewTab: Boolean(slide.openInNewTab),
        hideButton: Boolean(slide.hideButton),
        ordem: slides.length + 1,
        ativo: false,
      });
      await loadSlides();
      showToast("Slide duplicado como rascunho!");
    } catch (err) {
      alert("Erro ao duplicar slide: " + String(err));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorBanner("Sessão expirada. Faça login novamente para salvar alterações.");
      return;
    }
    if (!formState.titulo.trim()) {
      alert("Por favor, preencha o título do slide.");
      return;
    }
    if (!previewUrl && !formState.imagemUrl) {
      alert("Por favor, envie uma imagem ou insira a URL da imagem.");
      return;
    }

    setSaving(true);
    try {
      if (formState.id) {
        await CarouselService.update(
          formState.id,
          {
            titulo: formState.titulo.trim(),
            eyebrow: formState.eyebrow.trim(),
            descricao: formState.descricao.trim(),
            linkDestino: formState.linkDestino.trim(),
            textoBotao: formState.textoBotao.trim(),
            imagemUrl: formState.imagemUrl,
            posicaoObjeto: formState.posicaoObjeto,
            overlayOpacity: formState.overlayOpacity,
            textAlign: formState.textAlign,
            accentColor: formState.accentColor || undefined,
            openInNewTab: formState.openInNewTab,
            hideButton: formState.hideButton,
            ordem: Number(formState.ordem) || 1,
            ativo: formState.ativo,
          },
          selectedFile || undefined,
        );
        showToast("Slide atualizado com sucesso!");
      } else {
        await CarouselService.create(
          {
            titulo: formState.titulo.trim(),
            eyebrow: formState.eyebrow.trim(),
            descricao: formState.descricao.trim(),
            linkDestino: formState.linkDestino.trim(),
            textoBotao: formState.textoBotao.trim(),
            imagemUrl: formState.imagemUrl || previewUrl,
            posicaoObjeto: formState.posicaoObjeto,
            overlayOpacity: formState.overlayOpacity,
            textAlign: formState.textAlign,
            accentColor: formState.accentColor || undefined,
            openInNewTab: formState.openInNewTab,
            hideButton: formState.hideButton,
            ordem: Number(formState.ordem) || slides.length + 1,
            ativo: formState.ativo,
          },
          selectedFile || undefined,
        );
        showToast("Novo slide cadastrado com sucesso!");
      }
      setIsModalOpen(false);
      await loadSlides();
    } catch (err) {
      alert("Erro ao salvar slide: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (slide: CarouselSlide) => {
    const next = !slide.ativo;
    try {
      await CarouselService.toggleActive(slide.id, next);
      setSlides((prev) => prev.map((s) => (s.id === slide.id ? { ...s, ativo: next } : s)));
      showToast(next ? "Slide publicado no carrossel!" : "Slide ocultado do carrossel.");
    } catch (err) {
      alert("Erro ao alterar visibilidade: " + String(err));
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const newSlides = [...slides];
    const [moved] = newSlides.splice(index, 1);
    newSlides.splice(targetIndex, 0, moved);

    setSlides(newSlides);
    try {
      await CarouselService.reorder(newSlides.map((s) => s.id));
      showToast("Ordem dos slides atualizada.");
    } catch (err) {
      console.error(err);
      await loadSlides();
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await CarouselService.delete(deleteCandidate.id);
      showToast("Slide removido com sucesso.");
      setDeleteCandidate(null);
      await loadSlides();
    } catch (err) {
      alert("Erro ao excluir: " + String(err));
    }
  };

  const handleResetDefaults = async () => {
    if (
      window.confirm(
        "Deseja restaurar os 5 slides originais padrão do CDCC? Quaisquer alterações locais serão substituídas.",
      )
    ) {
      setLoading(true);
      await CarouselService.resetToDefaults();
      await loadSlides();
      showToast("Slides restaurados para o padrão original.");
    }
  };

  const filteredSlides = slides.filter(
    (s) =>
      s.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.eyebrow && s.eyebrow.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.linkDestino.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const activeCount = slides.filter((s) => s.ativo).length;

  return (
    <section aria-labelledby="carousel-title" className={styles.pageSection}>
      <header className={styles.sectionHeader}>
        <div>
          <h1 id="carousel-title" className={styles.sectionTitle}>
            Gerenciador do Carrossel da Home
          </h1>
          <p className={styles.sectionSubtitle}>
            Adicione, reordene, edite e oculte os slides de destaque exibidos no topo da página
            inicial sem tocar no código.
          </p>
        </div>

        <div className={styles.rowActions}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={handleResetDefaults}
            title="Restaurar os 5 slides padrão de demonstração"
          >
            <RefreshCw size={15} aria-hidden="true" />
            Restaurar Padrões
          </button>
          <button type="button" className={styles.primaryBtn} onClick={handleOpenNewModal}>
            <Plus size={16} aria-hidden="true" />
            Novo Slide
          </button>
        </div>
      </header>

      {errorBanner && (
        <div role="alert" className={styles.errorBanner}>
          {errorBanner}
        </div>
      )}

      {/* Sincronização & Estatísticas Rápidas */}
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
          Total: <strong>{slides.length} slides</strong> (
          <span style={{ color: "#16a34a", fontWeight: 600 }}>{activeCount} no ar</span>,{" "}
          <span>{slides.length - activeCount} ocultos</span>)
        </div>
      </div>

      {/* Opções Globais do Carrossel */}
      <div className={styles.panelCard} style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <SlidersHorizontal size={17} style={{ color: "var(--color-brand)" }} />
          <strong style={{ fontSize: "0.95rem" }}>Opções de Comportamento &amp; Exibição do Carrossel</strong>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "0.85rem",
            alignItems: "center",
          }}
        >
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              className={styles.toggleCheckbox}
              checked={carouselCfg.autoPlayEnabled}
              onChange={(e) => void updateCarouselSetting({ autoPlayEnabled: e.target.checked })}
            />
            <span>Rotação automática (Autoplay)</span>
          </label>

          <label className={styles.fieldGroup} style={{ margin: 0 }}>
            <span className={styles.fieldLabel}>Intervalo (segundos)</span>
            <select
              className={styles.select}
              value={carouselCfg.autoPlaySeconds}
              onChange={(e) => void updateCarouselSetting({ autoPlaySeconds: Number(e.target.value) })}
            >
              <option value={3}>3 segundos (Rápido)</option>
              <option value={5}>5 segundos</option>
              <option value={6}>6 segundos (Padrão)</option>
              <option value={8}>8 segundos</option>
              <option value={10}>10 segundos (Lento)</option>
            </select>
          </label>

          <label className={styles.fieldGroup} style={{ margin: 0 }}>
            <span className={styles.fieldLabel}>Altura do Carrossel</span>
            <select
              className={styles.select}
              value={carouselCfg.heightMode}
              onChange={(e) =>
                void updateCarouselSetting({
                  heightMode: e.target.value as "compact" | "default" | "tall",
                })
              }
            >
              <option value="compact">Compacto (260px)</option>
              <option value="default">Padrão CDCC</option>
              <option value="tall">Destaque Amplo (440px)</option>
            </select>
          </label>

          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              className={styles.toggleCheckbox}
              checked={carouselCfg.showArrows}
              onChange={(e) => void updateCarouselSetting({ showArrows: e.target.checked })}
            />
            <span>Exibir setas laterais</span>
          </label>

          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              className={styles.toggleCheckbox}
              checked={carouselCfg.showDots}
              onChange={(e) => void updateCarouselSetting({ showDots: e.target.checked })}
            />
            <span>Exibir indicadores (bolinhas)</span>
          </label>

          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              className={styles.toggleCheckbox}
              checked={carouselCfg.showPauseButton}
              onChange={(e) => void updateCarouselSetting({ showPauseButton: e.target.checked })}
            />
            <span>Exibir botão Pausar/Play</span>
          </label>
        </div>
      </div>

      {/* Tabela de Alta Densidade */}
      <div className={styles.panelCard}>
        <div className={styles.toolbar}>
          <input
            type="search"
            className={styles.toolbarSearch}
            placeholder="Pesquisar por título, cartola ou link..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Filtrar slides do carrossel"
          />
        </div>

        {loading ? (
          <div className={styles.emptyState}>Carregando slides...</div>
        ) : filteredSlides.length === 0 ? (
          <div className={styles.emptyState}>
            Nenhum slide encontrado com o termo pesquisado.
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: "70px", textAlign: "center" }}>Ordem</th>
                  <th style={{ width: "85px" }}>Imagem</th>
                  <th>Título & Cartola</th>
                  <th>Destino do Botão</th>
                  <th style={{ width: "120px" }}>Visibilidade</th>
                  <th style={{ width: "110px", textAlign: "right" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSlides.map((slide, index) => {
                  const isExternal =
                    slide.linkDestino.startsWith("http://") ||
                    slide.linkDestino.startsWith("https://");
                  return (
                    <tr key={slide.id}>
                      <td style={{ textAlign: "center" }}>
                        <div className={styles.orderControls}>
                          <button
                            type="button"
                            className={styles.orderBtn}
                            onClick={() => handleMoveOrder(index, "up")}
                            disabled={index === 0}
                            title="Subir prioridade"
                            aria-label={`Subir slide ${slide.titulo}`}
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
                            disabled={index === slides.length - 1}
                            title="Descer prioridade"
                            aria-label={`Descer slide ${slide.titulo}`}
                          >
                            <ArrowDown size={13} />
                          </button>
                        </div>
                      </td>

                      <td>
                        <img
                          src={slide.imagemUrl}
                          alt={slide.titulo}
                          className={styles.tableThumb}
                          loading="lazy"
                        />
                      </td>

                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                          {slide.eyebrow && (
                            <span
                              style={{
                                fontSize: "0.6875rem",
                                textTransform: "uppercase",
                                color: "var(--color-brand)",
                                fontWeight: 700,
                                letterSpacing: "0.04em",
                              }}
                            >
                              {slide.eyebrow}
                            </span>
                          )}
                          <strong style={{ color: "var(--color-text-primary)", fontSize: "0.875rem" }}>
                            {slide.titulo}
                          </strong>
                          {slide.descricao && (
                            <span
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--color-text-secondary)",
                                display: "-webkit-box",
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {slide.descricao}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className={styles.badgeTag}>
                          {isExternal && <ExternalLink size={12} style={{ marginRight: "0.3rem" }} />}
                          {slide.linkDestino}
                        </span>
                      </td>

                      <td>
                        <label className={styles.toggleSwitch}>
                          <input
                            type="checkbox"
                            className={styles.toggleCheckbox}
                            checked={slide.ativo}
                            onChange={() => handleToggleActive(slide)}
                            aria-label={`Alternar status do slide ${slide.titulo}`}
                          />
                          <span
                            className={slide.ativo ? styles.badgeSuccess : styles.badgeNeutral}
                          >
                            {slide.ativo ? "No ar" : "Oculto"}
                          </span>
                        </label>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <div className={styles.rowActions} style={{ justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className={styles.smallBtn}
                            onClick={() => void handleDuplicateSlide(slide)}
                            title="Duplicar slide"
                            aria-label={`Duplicar ${slide.titulo}`}
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            type="button"
                            className={styles.smallBtn}
                            onClick={() => handleOpenEditModal(slide)}
                            title="Editar slide"
                            aria-label={`Editar ${slide.titulo}`}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            className={styles.smallDangerBtn}
                            onClick={() => setDeleteCandidate(slide)}
                            title="Excluir slide"
                            aria-label={`Excluir ${slide.titulo}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Criação / Edição */}
      {isModalOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {formState.id ? "Editar Slide do Carrossel" : "Novo Slide do Carrossel"}
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

            <form onSubmit={handleSaveSlide}>
              <div className={styles.modalBody}>
                {/* Upload de Imagem & Preview */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Imagem de Fundo do Slide</label>

                  <div
                    className={styles.dropzone}
                    onClick={() => document.getElementById(fileInputId)?.click()}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Pré-visualização do slide"
                        className={styles.dropzonePreview}
                      />
                    ) : (
                      <>
                        <ImageIcon size={32} style={{ color: "var(--color-text-secondary)" }} />
                        <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                          Clique para selecionar ou arraste uma imagem (WebP, JPG, PNG)
                        </span>
                        <span className={styles.dropzoneHelp}>
                          Recomendado: 1920x800 ou proporção widescreen (16:9)
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

                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Ou cole uma URL direta de imagem (https://...)"
                      value={formState.imagemUrl}
                      onChange={(e) => {
                        setFormState({ ...formState, imagemUrl: e.target.value });
                        if (e.target.value) setPreviewUrl(e.target.value);
                      }}
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Cartola / Eyebrow</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Ex: Biblioteca CDCC • USP"
                      value={formState.eyebrow}
                      onChange={(e) => setFormState({ ...formState, eyebrow: e.target.value })}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Texto do Botão CTA</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Ex: Explorar estantes"
                      value={formState.textoBotao}
                      onChange={(e) => setFormState({ ...formState, textoBotao: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Título Principal <span style={{ color: "var(--color-danger)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Ex: Ciência, leitura e descoberta em um só espaço"
                    value={formState.titulo}
                    onChange={(e) => setFormState({ ...formState, titulo: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Descrição Curta</label>
                  <textarea
                    rows={2}
                    className={styles.textarea}
                    placeholder="Breve texto complementar exibido abaixo do título..."
                    value={formState.descricao}
                    onChange={(e) => setFormState({ ...formState, descricao: e.target.value })}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Link de Destino <span style={{ color: "var(--color-danger)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="/estantes ou https://..."
                    value={formState.linkDestino}
                    onChange={(e) => setFormState({ ...formState, linkDestino: e.target.value })}
                    required
                  />

                  {/* Atalhos Rápidos */}
                  <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.35rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                      Sugestões:
                    </span>
                    <button
                      type="button"
                      className={styles.badgeTag}
                      style={{ cursor: "pointer" }}
                      onClick={() => setFormState({ ...formState, linkDestino: "/estantes" })}
                    >
                      /estantes
                    </button>
                    <button
                      type="button"
                      className={styles.badgeTag}
                      style={{ cursor: "pointer" }}
                      onClick={() => setFormState({ ...formState, linkDestino: "/espacoludico" })}
                    >
                      /espacoludico
                    </button>
                    <button
                      type="button"
                      className={styles.badgeTag}
                      style={{ cursor: "pointer" }}
                      onClick={() => setFormState({ ...formState, linkDestino: "/vestibular" })}
                    >
                      /vestibular
                    </button>
                    <button
                      type="button"
                      className={styles.badgeTag}
                      style={{ cursor: "pointer" }}
                      onClick={() => setFormState({ ...formState, linkDestino: "/p/guia-calouros" })}
                    >
                      /p/guia-calouros
                    </button>
                    <button
                      type="button"
                      className={styles.badgeTag}
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        setFormState({ ...formState, linkDestino: "https://dedalus.usp.br/F" })
                      }
                    >
                      Dedalus USP (Externo)
                    </button>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Ordem de Exibição</label>
                    <input
                      type="number"
                      min={1}
                      className={styles.input}
                      value={formState.ordem}
                      onChange={(e) => setFormState({ ...formState, ordem: Number(e.target.value) })}
                    />
                  </div>

                  <div className={styles.fieldGroup} style={{ justifyContent: "center" }}>
                    <label className={styles.toggleSwitch} style={{ marginTop: "1.5rem" }}>
                      <input
                        type="checkbox"
                        className={styles.toggleCheckbox}
                        checked={formState.ativo}
                        onChange={(e) => setFormState({ ...formState, ativo: e.target.checked })}
                      />
                      <span>Publicar imediatamente no carrossel da Home</span>
                    </label>
                  </div>
                </div>

                {/* Opções Visuais e de Comportamento do Slide */}
                <div
                  style={{
                    borderTop: "1px solid var(--color-border)",
                    paddingTop: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.85rem",
                  }}
                >
                  <strong style={{ fontSize: "0.88rem", color: "var(--color-text-primary)" }}>
                    Opções Visuais &amp; Comportamento do Slide
                  </strong>

                  <div className={styles.formGrid}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Enquadramento da Imagem</label>
                      <select
                        className={styles.select}
                        value={formState.posicaoObjeto}
                        onChange={(e) =>
                          setFormState({ ...formState, posicaoObjeto: e.target.value })
                        }
                      >
                        <option value="center 25%">Topo (ideal para rostos/pessoas)</option>
                        <option value="center 45%">Equilibrado (Padrão CDCC)</option>
                        <option value="center center">Centralizado</option>
                        <option value="center 75%">Inferior</option>
                      </select>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Alinhamento do Texto</label>
                      <select
                        className={styles.select}
                        value={formState.textAlign}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            textAlign: e.target.value as "left" | "center" | "right",
                          })
                        }
                      >
                        <option value="left">Esquerda (Padrão)</option>
                        <option value="center">Centralizado</option>
                        <option value="right">Direita</option>
                      </select>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>
                        Escurecimento do Fundo ({formState.overlayOpacity}%)
                      </label>
                      <input
                        type="range"
                        min={15}
                        max={90}
                        step={5}
                        value={formState.overlayOpacity}
                        onChange={(e) =>
                          setFormState({ ...formState, overlayOpacity: Number(e.target.value) })
                        }
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Cor do Botão CTA (opcional)</label>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <input
                          type="color"
                          value={formState.accentColor || "#145399"}
                          onChange={(e) =>
                            setFormState({ ...formState, accentColor: e.target.value })
                          }
                          style={{
                            width: 44,
                            height: 36,
                            border: "1px solid var(--color-border)",
                            borderRadius: 6,
                          }}
                        />
                        {formState.accentColor && (
                          <button
                            type="button"
                            className={styles.smallBtn}
                            onClick={() => setFormState({ ...formState, accentColor: "" })}
                          >
                            Usar padrão
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem" }}>
                    <label className={styles.toggleSwitch}>
                      <input
                        type="checkbox"
                        className={styles.toggleCheckbox}
                        checked={formState.openInNewTab}
                        onChange={(e) =>
                          setFormState({ ...formState, openInNewTab: e.target.checked })
                        }
                      />
                      <span>Abrir link em nova aba</span>
                    </label>

                    <label className={styles.toggleSwitch}>
                      <input
                        type="checkbox"
                        className={styles.toggleCheckbox}
                        checked={formState.hideButton}
                        onChange={(e) =>
                          setFormState({ ...formState, hideButton: e.target.checked })
                        }
                      />
                      <span>Ocultar botão CTA (somente banner)</span>
                    </label>
                  </div>
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
                    "Salvar Slide"
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
              <h2 className={styles.modalTitle}>Excluir Slide</h2>
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
                Tem certeza de que deseja remover o slide{" "}
                <strong style={{ color: "var(--color-text-primary)" }}>
                  "{deleteCandidate.titulo}"
                </strong>
                ? Esta ação não poderá ser desfeita.
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

      {/* Toasts de Feedback */}
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
