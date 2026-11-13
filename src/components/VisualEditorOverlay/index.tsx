import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Camera, Pencil, RotateCcw, Save, Sliders, X } from "lucide-react";
import { AuthService } from "../../admin/services/authService";
import { useSiteConfig } from "../../context/siteConfigStore";
import {
  DEFAULT_SITE_CONFIG,
  GLOBAL_IMAGE_SLOTS,
  uploadCmsImage,
} from "../../services/siteConfigService";

export function VisualEditorOverlay() {
  const { pathname } = useLocation();
  const { config, updateConfig } = useSiteConfig();
  const [isAdminLogged, setIsAdminLogged] = useState(false);
  const [visualMode, setVisualMode] = useState(false);
  const [modalTab, setModalTab] = useState<"texts" | "images" | null>(null);
  const [heroTitle, setHeroTitle] = useState(config.homeConfig.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(config.homeConfig.heroSubtitle);
  const [bannerText, setBannerText] = useState(config.noticeBanner.text);
  const [bannerEnabled, setBannerEnabled] = useState(config.noticeBanner.enabled);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setIsAdminLogged(AuthService.getSavedSession() !== null);
  }, [pathname]);

  useEffect(() => {
    setHeroTitle(config.homeConfig.heroTitle);
    setHeroSubtitle(config.homeConfig.heroSubtitle);
    setBannerText(config.noticeBanner.text);
    setBannerEnabled(config.noticeBanner.enabled);
  }, [config]);

  if (!isAdminLogged || pathname.startsWith("/admin")) {
    return null;
  }

  const handleSaveTexts = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateConfig({
        ...config,
        noticeBanner: {
          ...config.noticeBanner,
          enabled: bannerEnabled,
          text: bannerText,
        },
        homeConfig: {
          ...config.homeConfig,
          heroTitle,
          heroSubtitle,
        },
      });
      setFeedback("Textos atualizados diretamente na tela!");
      setTimeout(() => setFeedback(null), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          left: "1rem",
          bottom: "1rem",
          zIndex: 1200,
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          alignItems: "flex-start",
        }}
      >
        {visualMode && (
          <div
            style={{
              background: "#0f172a",
              color: "#ffffff",
              borderRadius: 12,
              padding: "0.6rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.45rem",
              boxShadow: "0 12px 28px rgba(15, 23, 42, 0.35)",
              border: "1px solid rgba(255,255,255,0.16)",
            }}
          >
            <button
              type="button"
              onClick={() => setModalTab("texts")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#1e293b",
                color: "#fff",
                border: "1px solid #334155",
                borderRadius: 8,
                padding: "0.45rem 0.7rem",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Pencil size={14} /> Editar Textos
            </button>
            <button
              type="button"
              onClick={() => setModalTab("images")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#1e293b",
                color: "#fff",
                border: "1px solid #334155",
                borderRadius: 8,
                padding: "0.45rem 0.7rem",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Camera size={14} /> Trocar Fotos
            </button>
            <Link
              to="/admin"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--color-brand)",
                color: "#fff",
                borderRadius: 8,
                padding: "0.45rem 0.7rem",
                fontSize: "0.8rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <Sliders size={14} /> Painel Admin
            </Link>
          </div>
        )}

        <button
          type="button"
          onClick={() => setVisualMode((v) => !v)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            background: visualMode ? "var(--color-brand)" : "#0f172a",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.22)",
            borderRadius: 999,
            padding: "0.55rem 0.95rem",
            fontSize: "0.82rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 10px 24px rgba(15, 23, 42, 0.28)",
          }}
        >
          <Pencil size={14} />
          {visualMode ? "Modo Edição Visual: Ativo" : "Modo Edição Visual"}
        </button>
      </div>

      {modalTab && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            zIndex: 1300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 14,
              maxWidth: 560,
              width: "100%",
              maxHeight: "88vh",
              overflowY: "auto",
              padding: "1.25rem",
              boxShadow: "0 20px 44px rgba(15, 23, 42, 0.3)",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: "1.05rem", color: "#0f172a" }}>
                {modalTab === "texts"
                  ? "Edição Direta de Textos & Aviso"
                  : "Trocar Imagens Diretamente na Tela"}
              </strong>
              <button
                type="button"
                onClick={() => setModalTab(null)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: 8,
                  padding: "0.4rem",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {feedback && (
              <div
                style={{
                  background: "#dcfce7",
                  color: "#166534",
                  padding: "0.55rem 0.75rem",
                  borderRadius: 8,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                {feedback}
              </div>
            )}

            {modalTab === "texts" ? (
              <form
                onSubmit={handleSaveTexts}
                style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}
              >
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>Título do Hero (Home)</span>
                  <input
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    style={{ padding: "0.55rem", borderRadius: 8, border: "1px solid #cbd5e1" }}
                  />
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>Subtítulo do Hero</span>
                  <textarea
                    rows={3}
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    style={{ padding: "0.55rem", borderRadius: 8, border: "1px solid #cbd5e1" }}
                  />
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={bannerEnabled}
                    onChange={(e) => setBannerEnabled(e.target.checked)}
                  />
                  Exibir Faixa de Aviso Global no Topo
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>Texto da Faixa de Aviso</span>
                  <input
                    value={bannerText}
                    onChange={(e) => setBannerText(e.target.value)}
                    style={{ padding: "0.55rem", borderRadius: 8, border: "1px solid #cbd5e1" }}
                  />
                </label>

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setHeroTitle(DEFAULT_SITE_CONFIG.homeConfig.heroTitle);
                      setHeroSubtitle(DEFAULT_SITE_CONFIG.homeConfig.heroSubtitle);
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "0.5rem 0.8rem",
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      background: "#f8fafc",
                      cursor: "pointer",
                    }}
                  >
                    <RotateCcw size={14} /> Restaurar Padrão
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "0.55rem 0.95rem",
                      borderRadius: 8,
                      border: "none",
                      background: "var(--color-brand)",
                      color: "#fff",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <Save size={14} /> {saving ? "Salvando..." : "Salvar na Tela"}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {GLOBAL_IMAGE_SLOTS.map((slot) => {
                  const hasOverride = Boolean(config.imageOverrides?.[slot.key]);
                  return (
                    <div
                      key={slot.key}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        padding: "0.7rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <strong style={{ fontSize: "0.85rem" }}>{slot.label}</strong>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const url = await uploadCmsImage(file, `slots/${slot.key}`);
                            await updateConfig({
                              ...config,
                              imageOverrides: { ...config.imageOverrides, [slot.key]: url },
                            });
                            setFeedback(`Imagem "${slot.label}" atualizada!`);
                          }}
                        />
                        {hasOverride && (
                          <button
                            type="button"
                            onClick={async () => {
                              const next = { ...config.imageOverrides };
                              delete next[slot.key];
                              await updateConfig({ ...config, imageOverrides: next });
                              setFeedback(`Imagem "${slot.label}" restaurada ao original!`);
                            }}
                            style={{
                              padding: "0.35rem 0.65rem",
                              borderRadius: 6,
                              border: "1px solid #fecaca",
                              background: "#fef2f2",
                              color: "#b91c1c",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Restaurar Original
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
