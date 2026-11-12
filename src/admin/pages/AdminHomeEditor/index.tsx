import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, LayoutTemplate, Plus, Save, Trash2 } from "lucide-react";
import { useSiteConfig } from "../../../context/siteConfigStore.ts";
import { uploadCmsImage } from "../../../services/siteConfigService.ts";
import type { QuickAccessCardConfig, SiteConfig } from "../../../types/content.ts";
import adminStyles from "../../styles/admin.module.css";
import styles from "../../styles/cms.module.css";

export default function AdminHomeEditor() {
  const { config, updateConfig } = useSiteConfig();
  const [home, setHome] = useState<SiteConfig["homeConfig"]>(config.homeConfig);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    setHome(config.homeConfig);
  }, [config.homeConfig]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    try {
      await updateConfig({ ...config, homeConfig: home });
      setStatusMsg("Configurações da página inicial salvas com sucesso!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={styles.page} onSubmit={handleSave}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Editor da Página Inicial (Home)</h1>
          <p className={styles.subtitle}>
            Personalize textos do buscador, chips de exemplo, cards de acesso rápido, tutorial em 3
            etapas e visibilidade das seções.
          </p>
        </div>
        <button type="submit" className={styles.primaryBtn} disabled={saving}>
          <Save size={15} /> {saving ? "Salvando..." : "Salvar Home"}
        </button>
      </header>

      {statusMsg && <div className={adminStyles.successBanner}>{statusMsg}</div>}

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          <LayoutTemplate size={18} /> Ordem &amp; Visibilidade das Seções da Home
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
          {(home.sectionsOrder ?? ["hero", "quickAccess", "carousel", "tutorial"]).map((key, idx, arr) => {
            const labels: Record<"hero" | "quickAccess" | "carousel" | "tutorial", string> = {
              hero: "Hero & Buscador",
              quickAccess: "Cards de Acesso Rápido",
              carousel: "Carrossel de Destaques",
              tutorial: "Tutorial Dinâmico",
            };
            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "0.55rem 0.75rem",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                }}
              >
                <label className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={home.sectionsVisibility[key]}
                    onChange={(e) =>
                      setHome((p) => ({
                        ...p,
                        sectionsVisibility: { ...p.sectionsVisibility, [key]: e.target.checked },
                      }))
                    }
                  />
                  {labels[key]}
                </label>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    disabled={idx === 0}
                    onClick={() => {
                      const next = [...arr];
                      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                      setHome((p) => ({ ...p, sectionsOrder: next }));
                    }}
                    title="Subir seção"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    disabled={idx === arr.length - 1}
                    onClick={() => {
                      const next = [...arr];
                      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                      setHome((p) => ({ ...p, sectionsOrder: next }));
                    }}
                    title="Descer seção"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Cabeçalho &amp; Buscador Hero</h2>
        <div className={styles.grid2}>
          <label className={styles.field}>
            <span className={styles.label}>Badge Superior</span>
            <input
              className={styles.input}
              value={home.heroBadge}
              onChange={(e) => setHome((p) => ({ ...p, heroBadge: e.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Título Principal</span>
            <input
              className={styles.input}
              value={home.heroTitle}
              onChange={(e) => setHome((p) => ({ ...p, heroTitle: e.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Placeholder da Busca</span>
            <input
              className={styles.input}
              value={home.searchPlaceholder}
              onChange={(e) => setHome((p) => ({ ...p, searchPlaceholder: e.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Dica abaixo da Busca</span>
            <input
              className={styles.input}
              value={home.searchHint}
              onChange={(e) => setHome((p) => ({ ...p, searchHint: e.target.value }))}
            />
          </label>
        </div>
        <label className={styles.field}>
          <span className={styles.label}>Subtítulo</span>
          <textarea
            className={styles.textarea}
            value={home.heroSubtitle}
            onChange={(e) => setHome((p) => ({ ...p, heroSubtitle: e.target.value }))}
          />
        </label>

        <div className={styles.subBox}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>Chips de Exemplo Rápido</strong>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() =>
                setHome((p) => ({
                  ...p,
                  exampleCodes: [...p.exampleCodes, { code: "500", label: "Ciências (500)" }],
                }))
              }
            >
              <Plus size={14} /> Adicionar Chip
            </button>
          </div>
          {home.exampleCodes.map((chip, idx) => (
            <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                className={styles.input}
                placeholder="Código (ex: 530)"
                value={chip.code}
                onChange={(e) =>
                  setHome((p) => ({
                    ...p,
                    exampleCodes: p.exampleCodes.map((c, i) =>
                      i === idx ? { ...c, code: e.target.value } : c
                    ),
                  }))
                }
              />
              <input
                className={styles.input}
                placeholder="Rótulo (ex: Física (530))"
                value={chip.label}
                onChange={(e) =>
                  setHome((p) => ({
                    ...p,
                    exampleCodes: p.exampleCodes.map((c, i) =>
                      i === idx ? { ...c, label: e.target.value } : c
                    ),
                  }))
                }
              />
              <button
                type="button"
                className={styles.dangerBtn}
                onClick={() =>
                  setHome((p) => ({
                    ...p,
                    exampleCodes: p.exampleCodes.filter((_, i) => i !== idx),
                  }))
                }
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className={styles.cardTitle}>Cards de Acesso Rápido</h2>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() =>
              setHome((p) => ({
                ...p,
                quickCards: [
                  ...p.quickCards,
                  {
                    id: `card-${Date.now()}`,
                    title: "Novo Atalho",
                    description: "Descrição breve",
                    to: "/vestibular",
                    icon: "sparkles",
                  },
                ],
              }))
            }
          >
            <Plus size={14} /> Novo Card
          </button>
        </div>

        <div className={styles.grid2}>
          {home.quickCards.map((card, idx) => (
            <div key={card.id} className={styles.subBox}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>Card #{idx + 1}</strong>
                <button
                  type="button"
                  className={styles.dangerBtn}
                  onClick={() =>
                    setHome((p) => ({
                      ...p,
                      quickCards: p.quickCards.filter((_, i) => i !== idx),
                    }))
                  }
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <input
                className={styles.input}
                placeholder="Título"
                value={card.title}
                onChange={(e) =>
                  setHome((p) => ({
                    ...p,
                    quickCards: p.quickCards.map((c, i) =>
                      i === idx ? { ...c, title: e.target.value } : c
                    ),
                  }))
                }
              />
              <input
                className={styles.input}
                placeholder="Descrição"
                value={card.description}
                onChange={(e) =>
                  setHome((p) => ({
                    ...p,
                    quickCards: p.quickCards.map((c, i) =>
                      i === idx ? { ...c, description: e.target.value } : c
                    ),
                  }))
                }
              />
              <div className={styles.grid2}>
                <input
                  className={styles.input}
                  placeholder="Rota interna (/vestibular) ou URL"
                  value={card.to ?? card.href ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    const isExt = val.startsWith("http");
                    setHome((p) => ({
                      ...p,
                      quickCards: p.quickCards.map((c, i) =>
                        i === idx
                          ? { ...c, to: isExt ? undefined : val, href: isExt ? val : undefined }
                          : c
                      ),
                    }));
                  }}
                />
                <select
                  className={styles.select}
                  value={card.icon}
                  onChange={(e) =>
                    setHome((p) => ({
                      ...p,
                      quickCards: p.quickCards.map((c, i) =>
                        i === idx
                          ? { ...c, icon: e.target.value as QuickAccessCardConfig["icon"] }
                          : c
                      ),
                    }))
                  }
                >
                  <option value="graduation">Vestibular (Chapéu)</option>
                  <option value="gamepad">Jogos (Gamepad)</option>
                  <option value="book">Livros</option>
                  <option value="external">Link Externo</option>
                  <option value="sparkles">Destaque</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <h2 className={styles.cardTitle}>
            Tutorial Dinâmico ({home.tutorialPhases.length} passos)
          </h2>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => {
              const num = String(home.tutorialPhases.length + 1).padStart(2, "0");
              setHome((p) => ({
                ...p,
                tutorialPhases: [
                  ...p.tutorialPhases,
                  {
                    id: `passo-${Date.now()}`,
                    phaseNumber: num,
                    tabLabel: `${home.tutorialPhases.length + 1}. Novo Passo`,
                    tagline: `Fase ${num} • Dica`,
                    title: "Novo passo do tutorial",
                    description: "Descreva aqui a orientação para o estudante.",
                    bullets: ["Orientação detalhada"],
                    calloutLabel: "Destaque",
                    calloutValue: "Biblioteca CDCC",
                    imageAlt: "Ilustração do passo",
                    badge: "CDCC-USP",
                    enabled: true,
                  },
                ],
              }));
            }}
          >
            <Plus size={14} /> Adicionar Passo
          </button>
        </div>

        <div className={styles.grid2}>
          {home.tutorialPhases.map((phase, idx) => (
            <div key={phase.id} className={styles.subBox}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                <strong>
                  Passo {phase.phaseNumber} — {phase.tabLabel}
                </strong>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    disabled={idx === 0}
                    onClick={() => {
                      const next = [...home.tutorialPhases];
                      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                      setHome((p) => ({ ...p, tutorialPhases: next }));
                    }}
                    title="Subir passo"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    disabled={idx === home.tutorialPhases.length - 1}
                    onClick={() => {
                      const next = [...home.tutorialPhases];
                      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                      setHome((p) => ({ ...p, tutorialPhases: next }));
                    }}
                    title="Descer passo"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    type="button"
                    className={styles.dangerBtn}
                    disabled={home.tutorialPhases.length <= 1}
                    onClick={() =>
                      setHome((p) => ({
                        ...p,
                        tutorialPhases: p.tutorialPhases.filter((_, i) => i !== idx),
                      }))
                    }
                    title="Remover passo"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={phase.enabled !== false}
                  onChange={(e) =>
                    setHome((p) => ({
                      ...p,
                      tutorialPhases: p.tutorialPhases.map((t, i) =>
                        i === idx ? { ...t, enabled: e.target.checked } : t
                      ),
                    }))
                  }
                />
                Exibir este passo na Home
              </label>

              <div className={styles.grid2}>
                <input
                  className={styles.input}
                  placeholder="Número (ex: 01)"
                  value={phase.phaseNumber}
                  onChange={(e) =>
                    setHome((p) => ({
                      ...p,
                      tutorialPhases: p.tutorialPhases.map((t, i) =>
                        i === idx ? { ...t, phaseNumber: e.target.value } : t
                      ),
                    }))
                  }
                />
                <input
                  className={styles.input}
                  placeholder="Rótulo da aba"
                  value={phase.tabLabel}
                  onChange={(e) =>
                    setHome((p) => ({
                      ...p,
                      tutorialPhases: p.tutorialPhases.map((t, i) =>
                        i === idx ? { ...t, tabLabel: e.target.value } : t
                      ),
                    }))
                  }
                />
              </div>

              <input
                className={styles.input}
                placeholder="Título"
                value={phase.title}
                onChange={(e) =>
                  setHome((p) => ({
                    ...p,
                    tutorialPhases: p.tutorialPhases.map((t, i) =>
                      i === idx ? { ...t, title: e.target.value } : t
                    ),
                  }))
                }
              />
              <textarea
                className={styles.textarea}
                value={phase.description}
                onChange={(e) =>
                  setHome((p) => ({
                    ...p,
                    tutorialPhases: p.tutorialPhases.map((t, i) =>
                      i === idx ? { ...t, description: e.target.value } : t
                    ),
                  }))
                }
              />

              <div className={styles.grid2}>
                <input
                  className={styles.input}
                  placeholder="Botão opcional (ex: Abrir Vestibular)"
                  value={phase.actionLabel ?? ""}
                  onChange={(e) =>
                    setHome((p) => ({
                      ...p,
                      tutorialPhases: p.tutorialPhases.map((t, i) =>
                        i === idx ? { ...t, actionLabel: e.target.value } : t
                      ),
                    }))
                  }
                />
                <input
                  className={styles.input}
                  placeholder="Link do botão (ex: /vestibular)"
                  value={phase.actionUrl ?? ""}
                  onChange={(e) =>
                    setHome((p) => ({
                      ...p,
                      tutorialPhases: p.tutorialPhases.map((t, i) =>
                        i === idx ? { ...t, actionUrl: e.target.value } : t
                      ),
                    }))
                  }
                />
              </div>

              <label className={styles.field}>
                <span className={styles.label}>Imagem customizada (WebP ou URL)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadCmsImage(file, `tutorial/${phase.id}`);
                    setHome((p) => ({
                      ...p,
                      tutorialPhases: p.tutorialPhases.map((t, i) =>
                        i === idx ? { ...t, imageUrl: url } : t
                      ),
                    }));
                  }}
                />
              </label>
            </div>
          ))}
        </div>
      </section>
    </form>
  );
}
