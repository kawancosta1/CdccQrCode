import { useEffect, useState } from "react";
import { CloudSun, Image as ImageIcon, Palette, RefreshCw, Save } from "lucide-react";
import { useSiteConfig } from "../../../context/siteConfigStore.ts";
import {
  DEFAULT_SEASON_PALETTES,
  DEFAULT_SEASONAL_CONFIG,
  SEASON_METADATA,
  type ParticleIntensity,
  type SeasonalMode,
  type SeasonId,
  type SeasonPalette,
} from "../../../domain/seasonEngine.ts";
import {
  GLOBAL_IMAGE_SLOTS,
  uploadCmsImage,
} from "../../../services/siteConfigService.ts";
import type { SiteConfig } from "../../../types/content.ts";
import adminStyles from "../../styles/admin.module.css";
import styles from "../../styles/cms.module.css";

export default function AdminAppearance() {
  const { config, activeSeason, updateConfig, resetConfig } = useSiteConfig();
  const [draft, setDraft] = useState<SiteConfig>(config);
  const [editingSeason, setEditingSeason] = useState<SeasonId>(activeSeason ?? "outono");
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
        <h2 className={styles.cardTitle}>
          <CloudSun size={18} /> Estações do Ano &amp; Clima Dinâmico
        </h2>
        <p className={styles.subtitle} style={{ marginBottom: "1rem" }}>
          Adapta o portal automaticamente ao calendário do Hemisfério Sul (Brasil) ou permite forçar
          uma estação para testes e campanhas.
        </p>

        <div className={styles.grid2}>
          <label className={styles.field}>
            <span className={styles.label}>Modo da Estação</span>
            <select
              className={styles.select}
              value={draft.estacao?.mode ?? DEFAULT_SEASONAL_CONFIG.mode}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  estacao: {
                    ...(p.estacao ?? DEFAULT_SEASONAL_CONFIG),
                    mode: e.target.value as SeasonalMode,
                  },
                }))
              }
            >
              <option value="auto">Automático (Calendário Brasil)</option>
              <option value="outono">Forçar Outono 🍂</option>
              <option value="inverno">Forçar Inverno ❄️</option>
              <option value="primavera">Forçar Primavera 🌸</option>
              <option value="verao">Forçar Verão ☀️</option>
              <option value="off">Desativado</option>
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Intensidade das Partículas</span>
            <select
              className={styles.select}
              value={draft.estacao?.intensity ?? DEFAULT_SEASONAL_CONFIG.intensity}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  estacao: {
                    ...(p.estacao ?? DEFAULT_SEASONAL_CONFIG),
                    intensity: e.target.value as ParticleIntensity,
                  },
                }))
              }
            >
              <option value="suave">Suave</option>
              <option value="normal">Normal</option>
              <option value="intenso">Intenso</option>
            </select>
          </label>
        </div>

        <label className={styles.checkboxRow} style={{ marginTop: "0.75rem", marginBottom: "1rem" }}>
          <input
            type="checkbox"
            checked={draft.estacao?.nightEffectEnabled ?? true}
            onChange={(e) =>
              setDraft((p) => ({
                ...p,
                estacao: {
                  ...(p.estacao ?? DEFAULT_SEASONAL_CONFIG),
                  nightEffectEnabled: e.target.checked,
                },
              }))
            }
          />
          Ativar Efeito Noturno Automático (entre 18h e 06h — luminária de biblioteca e vagalumes no Verão)
        </label>

        <div className={styles.grid2}>
          {(["outono", "inverno", "primavera", "verao"] as SeasonId[]).map((seasonKey) => (
            <label key={seasonKey} className={styles.field}>
              <span className={styles.label}>
                Saudação — {SEASON_METADATA[seasonKey].label} {SEASON_METADATA[seasonKey].emoji}
              </span>
              <input
                className={styles.input}
                value={
                  draft.estacao?.greetings?.[seasonKey] ??
                  SEASON_METADATA[seasonKey].defaultGreeting
                }
                onChange={(e) =>
                  setDraft((p) => {
                    const base = p.estacao ?? DEFAULT_SEASONAL_CONFIG;
                    return {
                      ...p,
                      estacao: {
                        ...base,
                        greetings: {
                          ...base.greetings,
                          [seasonKey]: e.target.value,
                        },
                      },
                    };
                  })
                }
              />
            </label>
          ))}
        </div>

        <div className={styles.subBox} style={{ marginTop: "1.25rem" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
              marginBottom: "0.9rem",
            }}
          >
            <div>
              <strong style={{ fontSize: "0.95rem" }}>
                Paleta de Cores por Estação (CSS Variables)
              </strong>
              <p className={styles.subtitle} style={{ marginTop: "0.2rem" }}>
                Personalize as cores de cada estação no Firestore. O modo Alto Contraste continua
                tendo prioridade máxima.
              </p>
            </div>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => {
                setDraft((p) => {
                  const base = p.estacao ?? DEFAULT_SEASONAL_CONFIG;
                  return {
                    ...p,
                    estacao: {
                      ...base,
                      palettes: {
                        ...(base.palettes ?? DEFAULT_SEASON_PALETTES),
                        [editingSeason]: { ...DEFAULT_SEASON_PALETTES[editingSeason] },
                      },
                    },
                  };
                });
              }}
            >
              <RefreshCw size={14} /> Restaurar Cores Padrão da Estação
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            {(["outono", "inverno", "primavera", "verao"] as SeasonId[]).map((s) => {
              const isSelected = editingSeason === s;
              const meta = SEASON_METADATA[s];
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setEditingSeason(s)}
                  className={isSelected ? styles.primaryBtn : styles.secondaryBtn}
                  style={{ padding: "0.45rem 0.85rem", fontSize: "0.85rem" }}
                >
                  {meta.emoji} Editar Cores — {meta.label}
                </button>
              );
            })}
          </div>

          {(() => {
            const currentPalette: SeasonPalette =
              draft.estacao?.palettes?.[editingSeason] ?? DEFAULT_SEASON_PALETTES[editingSeason];
            const updatePaletteField = (field: keyof SeasonPalette, value: string) => {
              setDraft((p) => {
                const base = p.estacao ?? DEFAULT_SEASONAL_CONFIG;
                const prevPalette =
                  base.palettes?.[editingSeason] ?? DEFAULT_SEASON_PALETTES[editingSeason];
                return {
                  ...p,
                  estacao: {
                    ...base,
                    palettes: {
                      ...(base.palettes ?? DEFAULT_SEASON_PALETTES),
                      [editingSeason]: {
                        ...prevPalette,
                        [field]: value,
                      },
                    },
                  },
                };
              });
            };

            return (
              <div className={styles.grid3}>
                <label className={styles.field}>
                  <span className={styles.label}>--color-brand ({SEASON_METADATA[editingSeason].label})</span>
                  <div className={styles.colorRow}>
                    <input
                      type="color"
                      value={currentPalette.brandColor}
                      onChange={(e) => updatePaletteField("brandColor", e.target.value)}
                    />
                    <input
                      className={styles.input}
                      value={currentPalette.brandColor}
                      onChange={(e) => updatePaletteField("brandColor", e.target.value)}
                    />
                  </div>
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>--color-accent ({SEASON_METADATA[editingSeason].label})</span>
                  <div className={styles.colorRow}>
                    <input
                      type="color"
                      value={currentPalette.accentColor}
                      onChange={(e) => updatePaletteField("accentColor", e.target.value)}
                    />
                    <input
                      className={styles.input}
                      value={currentPalette.accentColor}
                      onChange={(e) => updatePaletteField("accentColor", e.target.value)}
                    />
                  </div>
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>--color-bg ({SEASON_METADATA[editingSeason].label})</span>
                  <div className={styles.colorRow}>
                    <input
                      type="color"
                      value={currentPalette.bgColor}
                      onChange={(e) => updatePaletteField("bgColor", e.target.value)}
                    />
                    <input
                      className={styles.input}
                      value={currentPalette.bgColor}
                      onChange={(e) => updatePaletteField("bgColor", e.target.value)}
                    />
                  </div>
                </label>
              </div>
            );
          })()}
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
