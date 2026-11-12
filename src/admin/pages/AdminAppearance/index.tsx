import { useEffect, useState } from "react";
import { Image as ImageIcon, Palette, RefreshCw, Save } from "lucide-react";
import { useSiteConfig } from "../../../context/siteConfigStore.ts";
import {
  GLOBAL_IMAGE_SLOTS,
  uploadCmsImage,
} from "../../../services/siteConfigService.ts";
import type { SiteConfig } from "../../../types/content.ts";
import adminStyles from "../../styles/admin.module.css";
import styles from "../../styles/cms.module.css";

export default function AdminAppearance() {
  const { config, updateConfig, resetConfig } = useSiteConfig();
  const [draft, setDraft] = useState<SiteConfig>(config);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setDraft(config);
  }, [config]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      await updateConfig(draft);
      setStatusMsg("Aparência, identidade visual e imagens globais atualizadas com sucesso!");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erro ao salvar aparência.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Restaurar tema e identidade padrão do CDCC?")) return;
    setSaving(true);
    try {
      const fresh = await resetConfig();
      setDraft(fresh);
      setStatusMsg("Tema padrão do CDCC restaurado.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={styles.page} onSubmit={handleSave}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Aparência, Tema &amp; Imagens Globais</h1>
          <p className={styles.subtitle}>
            Personalize cores do sistema, logotipo, aviso no topo, rodapé e substitua imagens padrão
            com compressão automática em WebP.
          </p>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.secondaryBtn} onClick={handleReset}>
            <RefreshCw size={15} /> Restaurar Tema CDCC
          </button>
          <button type="submit" className={styles.primaryBtn} disabled={saving}>
            <Save size={15} /> {saving ? "Salvando..." : "Publicar Alterações"}
          </button>
        </div>
      </header>

      {statusMsg && <div className={adminStyles.successBanner}>{statusMsg}</div>}
      {errorMsg && <div className={adminStyles.errorBanner}>{errorMsg}</div>}

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          <Palette size={18} /> Paleta de Cores &amp; Arredondamento
        </h2>
        <div className={styles.grid3}>
          <label className={styles.field}>
            <span className={styles.label}>Cor Primária (--color-brand)</span>
            <div className={styles.colorRow}>
              <input
                type="color"
                className={styles.colorPicker}
                value={draft.brandColor}
                onChange={(e) => setDraft((p) => ({ ...p, brandColor: e.target.value }))}
              />
              <input
                className={styles.input}
                value={draft.brandColor}
                onChange={(e) => setDraft((p) => ({ ...p, brandColor: e.target.value }))}
              />
            </div>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Cor de Destaque (--color-accent)</span>
            <div className={styles.colorRow}>
              <input
                type="color"
                className={styles.colorPicker}
                value={draft.accentColor}
                onChange={(e) => setDraft((p) => ({ ...p, accentColor: e.target.value }))}
              />
              <input
                className={styles.input}
                value={draft.accentColor}
                onChange={(e) => setDraft((p) => ({ ...p, accentColor: e.target.value }))}
              />
            </div>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Cor de Fundo (--color-bg)</span>
            <div className={styles.colorRow}>
              <input
                type="color"
                className={styles.colorPicker}
                value={draft.bgColor}
                onChange={(e) => setDraft((p) => ({ ...p, bgColor: e.target.value }))}
              />
              <input
                className={styles.input}
                value={draft.bgColor}
                onChange={(e) => setDraft((p) => ({ ...p, bgColor: e.target.value }))}
              />
            </div>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Arredondamento de Bordas</span>
            <select
              className={styles.select}
              value={draft.borderRadiusScale}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  borderRadiusScale: e.target.value as SiteConfig["borderRadiusScale"],
                }))
              }
            >
              <option value="compact">Compacto (4px / 6px)</option>
              <option value="default">Padrão CDCC (8px / 12px)</option>
              <option value="rounded">Suave / Arredondado (12px / 18px)</option>
            </select>
          </label>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Identidade, Rodapé &amp; Faixa de Aviso Global</h2>
        <div className={styles.grid2}>
          <label className={styles.field}>
            <span className={styles.label}>Nome do Portal</span>
            <input
              className={styles.input}
              value={draft.portalName}
              onChange={(e) => setDraft((p) => ({ ...p, portalName: e.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Logotipo Customizado (URL ou Upload WebP)</span>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className={styles.input}
                placeholder="Deixe vazio para usar o padrão"
                value={draft.logoUrl}
                onChange={(e) => setDraft((p) => ({ ...p, logoUrl: e.target.value }))}
              />
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await uploadCmsImage(file, "branding");
                  setDraft((p) => ({ ...p, logoUrl: url }));
                }}
              />
            </div>
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Texto do Rodapé</span>
            <input
              className={styles.input}
              value={draft.footerText}
              onChange={(e) => setDraft((p) => ({ ...p, footerText: e.target.value }))}
            />
          </label>
          <div className={styles.grid2}>
            <label className={styles.field}>
              <span className={styles.label}>Rótulo Link Rodapé</span>
              <input
                className={styles.input}
                value={draft.footerLinkLabel}
                onChange={(e) => setDraft((p) => ({ ...p, footerLinkLabel: e.target.value }))}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>URL Link Rodapé</span>
              <input
                className={styles.input}
                value={draft.footerLinkUrl}
                onChange={(e) => setDraft((p) => ({ ...p, footerLinkUrl: e.target.value }))}
              />
            </label>
          </div>
        </div>

        <div className={styles.subBox}>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={draft.noticeBanner.enabled}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  noticeBanner: { ...p.noticeBanner, enabled: e.target.checked },
                }))
              }
            />
            Exibir Faixa de Aviso Global no topo do site
          </label>
          <div className={styles.grid3}>
            <label className={styles.field}>
              <span className={styles.label}>Mensagem do Aviso</span>
              <input
                className={styles.input}
                value={draft.noticeBanner.text}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    noticeBanner: { ...p.noticeBanner, text: e.target.value },
                  }))
                }
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Link do Botão (ex: /vestibular)</span>
              <input
                className={styles.input}
                value={draft.noticeBanner.linkUrl}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    noticeBanner: { ...p.noticeBanner, linkUrl: e.target.value },
                  }))
                }
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Cor da Faixa</span>
              <div className={styles.colorRow}>
                <input
                  type="color"
                  className={styles.colorPicker}
                  value={draft.noticeBanner.color}
                  onChange={(e) =>
                    setDraft((p) => ({
                      ...p,
                      noticeBanner: { ...p.noticeBanner, color: e.target.value },
                    }))
                  }
                />
                <input
                  className={styles.input}
                  value={draft.noticeBanner.color}
                  onChange={(e) =>
                    setDraft((p) => ({
                      ...p,
                      noticeBanner: { ...p.noticeBanner, color: e.target.value },
                    }))
                  }
                />
              </div>
            </label>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          <ImageIcon size={18} /> Gerenciador de Imagens Globais (Bentinho, Tutorial e Mapas)
        </h2>
        <div className={styles.grid2}>
          {GLOBAL_IMAGE_SLOTS.map((slot) => {
            const currentUrl = draft.imageOverrides?.[slot.key] ?? "";
            return (
              <div key={slot.key} className={styles.subBox}>
                <div>
                  <strong>{slot.label}</strong>
                  <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{slot.description}</div>
                </div>
                {currentUrl && (
                  <img
                    src={currentUrl}
                    alt={slot.label}
                    style={{ maxHeight: 90, objectFit: "contain", borderRadius: 6, background: "#fff" }}
                  />
                )}
                <input
                  className={styles.input}
                  placeholder={`Padrão: ${slot.fallbackPath}`}
                  value={currentUrl}
                  onChange={(e) =>
                    setDraft((p) => ({
                      ...p,
                      imageOverrides: { ...p.imageOverrides, [slot.key]: e.target.value },
                    }))
                  }
                />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = await uploadCmsImage(file, `slots/${slot.key}`);
                      setDraft((p) => ({
                        ...p,
                        imageOverrides: { ...p.imageOverrides, [slot.key]: url },
                      }));
                    }}
                  />
                  {currentUrl && (
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={() =>
                        setDraft((p) => {
                          const next = { ...p.imageOverrides };
                          delete next[slot.key];
                          return { ...p, imageOverrides: next };
                        })
                      }
                    >
                      Restaurar Imagem Original
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </form>
  );
}
