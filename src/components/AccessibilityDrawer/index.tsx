import { useEffect, useRef } from "react";
import {
  Contrast,
  Eye,
  Focus,
  Hand,
  Moon,
  RotateCcw,
  Ruler,
  Sparkles,
  Sun,
  Type,
  X,
} from "lucide-react";
import { UniversalAccessibilityIcon } from "../icons/UniversalAccessibilityIcon";
import { useAccessibility, type FontScaleOption } from "../../context/accessibilityStore";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import style from "./style.module.css";

const FONT_SCALE_OPTIONS: { value: FontScaleOption; label: string; desc: string }[] = [
  { value: "100", label: "100%", desc: "Padrão" },
  { value: "115", label: "115%", desc: "Médio" },
  { value: "130", label: "130%", desc: "Ampliado" },
];

export function AccessibilityDrawer() {
  const {
    isPanelOpen,
    activeCount,
    fontScale,
    highContrast,
    contrastTheme,
    colorblindMode,
    dyslexicReading,
    reducedMotion,
    enhancedFocus,
    readingGuide,
    vlibrasEnabled,
    closePanel,
    setFontScale,
    setHighContrast,
    setContrastTheme,
    setColorblindMode,
    setDyslexicReading,
    setReducedMotion,
    setEnhancedFocus,
    setReadingGuide,
    setVlibrasEnabled,
    resetPreferences,
  } = useAccessibility();

  const drawerRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useFocusTrap(drawerRef, isPanelOpen);

  useEffect(() => {
    if (!isPanelOpen) return;
    const previousActive = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closePanel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (previousActive?.isConnected) {
        previousActive.focus();
      }
    };
  }, [isPanelOpen, closePanel]);

  if (!isPanelOpen) return null;

  return (
    <div
      className={style.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) closePanel();
      }}
    >
      <aside
        id="a11y-drawer"
        ref={drawerRef}
        className={style.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="a11y-drawer-title"
      >
        <header className={style.header}>
          <div className={style.headerTitleGroup}>
            <span className={style.eyebrow}>
              <UniversalAccessibilityIcon size={15} />
              Inclusão Digital • WCAG 2.1 AA
            </span>
            <h2 id="a11y-drawer-title" className={style.title}>
              Preferências de Acessibilidade
            </h2>
            <p className={style.subtitle}>
              Ajustes salvos automaticamente • Atalho <kbd className={style.shortcutKbd}>Alt + A</kbd>
            </p>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            className={style.closeBtn}
            onClick={closePanel}
            aria-label="Fechar painel de acessibilidade"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className={style.body}>
          {/* 1. Escala de Texto */}
          <section className={style.controlSection} aria-labelledby="a11y-scale-heading">
            <div className={style.sectionHeaderRow}>
              <div className={style.sectionLabelGroup}>
                <Type size={18} className={style.sectionIcon} aria-hidden="true" />
                <h3 id="a11y-scale-heading" className={style.sectionTitle}>
                  Escala de Texto (Tipografia Fluida)
                </h3>
              </div>
            </div>
            <p className={style.sectionDesc}>
              Amplia proporcionalmente textos, botões e campos sem quebrar o layout.
            </p>
            <div className={style.scaleGrid} role="group" aria-label="Tamanho da fonte">
              {FONT_SCALE_OPTIONS.map((opt) => {
                const isSelected = fontScale === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={isSelected}
                    className={`${style.scaleBtn} ${isSelected ? style.scaleBtnActive : ""}`}
                    onClick={() => setFontScale(opt.value)}
                  >
                    <span>{opt.label}</span>
                    <span className={style.scaleSub}>{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. Modo Alto Contraste */}
          <section className={style.controlSection} aria-labelledby="a11y-contrast-heading">
            <div className={style.sectionHeaderRow}>
              <div className={style.sectionLabelGroup}>
                <Contrast size={18} className={style.sectionIcon} aria-hidden="true" />
                <h3 id="a11y-contrast-heading" className={style.sectionTitle}>
                  Modo Alto Contraste
                </h3>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={highContrast}
                aria-labelledby="a11y-contrast-heading"
                className={`${style.toggleBtn} ${highContrast ? style.toggleBtnOn : ""}`}
                onClick={() => setHighContrast(!highContrast)}
              >
                <span className={style.toggleThumb} />
              </button>
            </div>
            <p className={style.sectionDesc}>
              Reforça bordas, sublinha todos os links e aplica contraste máximo em páginas, modais e tabuleiros.
            </p>

            {highContrast && (
              <div className={style.subRow} role="group" aria-label="Tema de alto contraste">
                <button
                  type="button"
                  aria-pressed={contrastTheme === "dark"}
                  className={`${style.subOptionBtn} ${
                    contrastTheme === "dark" ? style.subOptionBtnActive : ""
                  }`}
                  onClick={() => setContrastTheme("dark")}
                >
                  <Moon size={14} aria-hidden="true" />
                  Escuro (AAA)
                </button>
                <button
                  type="button"
                  aria-pressed={contrastTheme === "light"}
                  className={`${style.subOptionBtn} ${
                    contrastTheme === "light" ? style.subOptionBtnActive : ""
                  }`}
                  onClick={() => setContrastTheme("light")}
                >
                  <Sun size={14} aria-hidden="true" />
                  Claro (AAA)
                </button>
              </div>
            )}
          </section>

          {/* 3. Modo Daltonismo (Codificação Dupla) */}
          <section className={style.controlSection} aria-labelledby="a11y-colorblind-heading">
            <div className={style.sectionHeaderRow}>
              <div className={style.sectionLabelGroup}>
                <Eye size={18} className={style.sectionIcon} aria-hidden="true" />
                <h3 id="a11y-colorblind-heading" className={style.sectionTitle}>
                  Modo Daltonismo (Codificação Dupla)
                </h3>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={colorblindMode}
                aria-labelledby="a11y-colorblind-heading"
                className={`${style.toggleBtn} ${colorblindMode ? style.toggleBtnOn : ""}`}
                onClick={() => setColorblindMode(!colorblindMode)}
              >
                <span className={style.toggleThumb} />
              </button>
            </div>
            <p className={style.sectionDesc}>
              Adiciona formas geométricas (▲ ■ ● ◆), hachuras e rótulos textuais às estantes, mapas, peões do Ludo e radar da Batalha Naval.
            </p>
          </section>

          {/* 4. Fonte para Dislexia / Leitura Facilitada */}
          <section className={style.controlSection} aria-labelledby="a11y-dyslexic-heading">
            <div className={style.sectionHeaderRow}>
              <div className={style.sectionLabelGroup}>
                <Type size={18} className={style.sectionIcon} aria-hidden="true" />
                <h3 id="a11y-dyslexic-heading" className={style.sectionTitle}>
                  Leitura Facilitada / Dislexia
                </h3>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={dyslexicReading}
                aria-labelledby="a11y-dyslexic-heading"
                className={`${style.toggleBtn} ${dyslexicReading ? style.toggleBtnOn : ""}`}
                onClick={() => setDyslexicReading(!dyslexicReading)}
              >
                <span className={style.toggleThumb} />
              </button>
            </div>
            <p className={style.sectionDesc}>
              Amplia o espaçamento entre letras, palavras e linhas (WCAG 1.4.12) com fonte de alta distinção de caracteres.
            </p>
          </section>

          {/* 5. Reduzir Animações */}
          <section className={style.controlSection} aria-labelledby="a11y-motion-heading">
            <div className={style.sectionHeaderRow}>
              <div className={style.sectionLabelGroup}>
                <Sparkles size={18} className={style.sectionIcon} aria-hidden="true" />
                <h3 id="a11y-motion-heading" className={style.sectionTitle}>
                  Reduzir Animações
                </h3>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={reducedMotion}
                aria-labelledby="a11y-motion-heading"
                className={`${style.toggleBtn} ${reducedMotion ? style.toggleBtnOn : ""}`}
                onClick={() => setReducedMotion(!reducedMotion)}
              >
                <span className={style.toggleThumb} />
              </button>
            </div>
            <p className={style.sectionDesc}>
              Pausa o carrossel automático, desativa transições de tela e simplifica efeitos dos tabuleiros.
            </p>
          </section>

          {/* 6. Destaque de Foco e Guia de Leitura */}
          <section className={style.controlSection} aria-labelledby="a11y-focus-heading">
            <div className={style.sectionHeaderRow}>
              <div className={style.sectionLabelGroup}>
                <Focus size={18} className={style.sectionIcon} aria-hidden="true" />
                <h3 id="a11y-focus-heading" className={style.sectionTitle}>
                  Destaque de Foco Reforçado
                </h3>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enhancedFocus}
                aria-labelledby="a11y-focus-heading"
                className={`${style.toggleBtn} ${enhancedFocus ? style.toggleBtnOn : ""}`}
                onClick={() => setEnhancedFocus(!enhancedFocus)}
              >
                <span className={style.toggleThumb} />
              </button>
            </div>
            <p className={style.sectionDesc}>
              Exibe contorno triplo de alta visibilidade ao navegar com a tecla Tab ou setas do teclado.
            </p>

            <div className={style.sectionHeaderRow} style={{ marginTop: "0.5rem" }}>
              <div className={style.sectionLabelGroup}>
                <Ruler size={18} className={style.sectionIcon} aria-hidden="true" />
                <span id="a11y-ruler-heading" className={style.sectionTitle}>
                  Régua Guia de Leitura
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={readingGuide}
                aria-labelledby="a11y-ruler-heading"
                className={`${style.toggleBtn} ${readingGuide ? style.toggleBtnOn : ""}`}
                onClick={() => setReadingGuide(!readingGuide)}
              >
                <span className={style.toggleThumb} />
              </button>
            </div>
          </section>

          {/* 7. Intérprete de Libras (VLibras) */}
          <section className={style.controlSection} aria-labelledby="a11y-vlibras-heading">
            <div className={style.sectionHeaderRow}>
              <div className={style.sectionLabelGroup}>
                <Hand size={18} className={style.sectionIcon} aria-hidden="true" />
                <h3 id="a11y-vlibras-heading" className={style.sectionTitle}>
                  Intérprete de Libras (VLibras)
                </h3>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={vlibrasEnabled}
                aria-labelledby="a11y-vlibras-heading"
                className={`${style.toggleBtn} ${vlibrasEnabled ? style.toggleBtnOn : ""}`}
                onClick={() => setVlibrasEnabled(!vlibrasEnabled)}
              >
                <span className={style.toggleThumb} />
              </button>
            </div>
            <p className={style.sectionDesc}>
              Exibe o tradutor oficial em Língua Brasileira de Sinais. Ative para clicar em qualquer texto e traduzi-lo com o avatar 3D.
            </p>
          </section>
        </div>

        <footer className={style.footer}>
          <button
            type="button"
            className={style.resetBtn}
            onClick={resetPreferences}
            disabled={activeCount === 0}
          >
            <RotateCcw size={15} aria-hidden="true" />
            Restaurar Padrão
          </button>

          <button type="button" className={style.doneBtn} onClick={closePanel}>
            Concluir
          </button>
        </footer>
      </aside>
    </div>
  );
}
