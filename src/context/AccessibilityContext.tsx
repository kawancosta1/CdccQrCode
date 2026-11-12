import { useCallback, useEffect, useMemo, useState } from "react";
import {
  A11Y_STORAGE_KEY,
  AccessibilityContext,
  applyAccessibilityToElement,
  countActiveAccessibilityFeatures,
  detectSystemReducedMotion,
  getDefaultAccessibilityPreferences,
  loadAccessibilityPreferences,
  saveAccessibilityPreferences,
  type AccessibilityPreferences,
  type FontScaleOption,
  type HighContrastTheme,
} from "./accessibilityStore";

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<AccessibilityPreferences>(() => {
    const initial = loadAccessibilityPreferences();
    applyAccessibilityToElement(initial);
    return initial;
  });
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [pointerY, setPointerY] = useState<number>(280);

  // Sincroniza classes no <html> e persiste no localStorage
  useEffect(() => {
    applyAccessibilityToElement(prefs);
    saveAccessibilityPreferences(prefs);
  }, [prefs]);

  // Escuta mudanças na preferência de movimento do sistema operacional caso não haja override salvo
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefs((prev) => ({ ...prev, reducedMotion: e.matches }));
    };
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  // Atalho global de teclado Alt + A para abrir/fechar o painel de acessibilidade
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setIsPanelOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Guia de leitura horizontal (acompanha o cursor / toque quando ativado)
  useEffect(() => {
    if (!prefs.readingGuide) return;
    const handlePointerMove = (e: PointerEvent) => {
      setPointerY(e.clientY);
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [prefs.readingGuide]);

  const announce = useCallback((message: string) => {
    setAnnouncement("");
    window.setTimeout(() => {
      setAnnouncement(message);
    }, 30);
  }, []);

  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);
  const togglePanel = useCallback(() => setIsPanelOpen((prev) => !prev), []);

  const setFontScale = useCallback(
    (fontScale: FontScaleOption) => {
      setPrefs((prev) => ({ ...prev, fontScale }));
      announce(`Escala de texto ajustada para ${fontScale}%`);
    },
    [announce],
  );

  const setHighContrast = useCallback(
    (highContrast: boolean) => {
      setPrefs((prev) => ({ ...prev, highContrast }));
      announce(highContrast ? "Modo Alto Contraste ativado" : "Modo Alto Contraste desativado");
    },
    [announce],
  );

  const setContrastTheme = useCallback(
    (contrastTheme: HighContrastTheme) => {
      setPrefs((prev) => ({ ...prev, highContrast: true, contrastTheme }));
      announce(
        contrastTheme === "dark"
          ? "Alto contraste escuro selecionado"
          : "Alto contraste claro selecionado",
      );
    },
    [announce],
  );

  const setColorblindMode = useCallback(
    (colorblindMode: boolean) => {
      setPrefs((prev) => ({ ...prev, colorblindMode }));
      announce(
        colorblindMode
          ? "Modo Daltonismo com codificação dupla ativado"
          : "Modo Daltonismo desativado",
      );
    },
    [announce],
  );

  const setDyslexicReading = useCallback(
    (dyslexicReading: boolean) => {
      setPrefs((prev) => ({ ...prev, dyslexicReading }));
      announce(
        dyslexicReading
          ? "Fonte e espaçamento para leitura facilitada ativados"
          : "Leitura facilitada desativada",
      );
    },
    [announce],
  );

  const setReducedMotion = useCallback(
    (reducedMotion: boolean) => {
      setPrefs((prev) => ({ ...prev, reducedMotion }));
      announce(reducedMotion ? "Animações reduzidas ativadas" : "Animações padrão restauradas");
    },
    [announce],
  );

  const setEnhancedFocus = useCallback(
    (enhancedFocus: boolean) => {
      setPrefs((prev) => ({ ...prev, enhancedFocus }));
      announce(
        enhancedFocus ? "Destaque de foco reforçado ativado" : "Destaque de foco padrão restaurado",
      );
    },
    [announce],
  );

  const setReadingGuide = useCallback(
    (readingGuide: boolean) => {
      setPrefs((prev) => ({ ...prev, readingGuide }));
      announce(
        readingGuide
          ? "Régua de guia de leitura ativada"
          : "Régua de guia de leitura desativada",
      );
    },
    [announce],
  );

  const setVlibrasEnabled = useCallback(
    (vlibrasEnabled: boolean) => {
      setPrefs((prev) => ({ ...prev, vlibrasEnabled }));
      announce(
        vlibrasEnabled
          ? "Intérprete de Libras VLibras ativado na tela"
          : "Intérprete de Libras VLibras ocultado",
      );
    },
    [announce],
  );

  const resetPreferences = useCallback(() => {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(A11Y_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
    const defaults = getDefaultAccessibilityPreferences(detectSystemReducedMotion());
    setPrefs(defaults);
    announce("Preferências de acessibilidade restauradas para o padrão");
  }, [announce]);

  const activeCount = useMemo(() => countActiveAccessibilityFeatures(prefs), [prefs]);

  const value = useMemo(
    () => ({
      ...prefs,
      isPanelOpen,
      activeCount,
      announcement,
      openPanel,
      closePanel,
      togglePanel,
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
      announce,
    }),
    [
      prefs,
      isPanelOpen,
      activeCount,
      announcement,
      openPanel,
      closePanel,
      togglePanel,
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
      announce,
    ],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {/* Região global aria-live para feedback imediato a leitores de tela */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
      {/* Régua horizontal de Guia de Leitura quando ativada */}
      {prefs.readingGuide && (
        <div
          className="a11y-reading-guide-bar"
          style={{ top: `${pointerY}px` }}
          aria-hidden="true"
        />
      )}
    </AccessibilityContext.Provider>
  );
}
