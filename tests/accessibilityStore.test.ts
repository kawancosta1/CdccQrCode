import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyAccessibilityToElement,
  countActiveAccessibilityFeatures,
  getDefaultAccessibilityPreferences,
  sanitizeAccessibilityPreferences,
} from "../src/context/accessibilityStore.ts";

describe("AccessibilityStore (WCAG 2.1 AA + VLibras)", () => {
  it("retorna preferências padrão respeitando reducedMotion do sistema", () => {
    const prefsNormal = getDefaultAccessibilityPreferences(false);
    assert.equal(prefsNormal.fontScale, "100");
    assert.equal(prefsNormal.highContrast, false);
    assert.equal(prefsNormal.vlibrasEnabled, false);
    assert.equal(prefsNormal.reducedMotion, false);

    const prefsReduced = getDefaultAccessibilityPreferences(true);
    assert.equal(prefsReduced.reducedMotion, true);
  });

  it("sanitiza entradas inválidas mantendo valores seguros", () => {
    const sanitized = sanitizeAccessibilityPreferences(
      {
        fontScale: "999",
        highContrast: true,
        contrastTheme: "invalid",
        vlibrasEnabled: true,
        dyslexicReading: "yes",
      },
      false,
    );

    assert.equal(sanitized.fontScale, "100");
    assert.equal(sanitized.highContrast, true);
    assert.equal(sanitized.contrastTheme, "dark");
    assert.equal(sanitized.vlibrasEnabled, true);
    assert.equal(sanitized.dyslexicReading, false);
  });

  it("conta corretamente os recursos de acessibilidade ativos", () => {
    const defaults = getDefaultAccessibilityPreferences(false);
    assert.equal(countActiveAccessibilityFeatures(defaults), 0);

    const active = {
      ...defaults,
      fontScale: "115" as const,
      highContrast: true,
      colorblindMode: true,
      vlibrasEnabled: true,
    };
    assert.equal(countActiveAccessibilityFeatures(active), 4);
  });

  it("aplica classes CSS e escala de fonte no elemento raiz simulado", () => {
    const toggled = new Map<string, boolean>();
    const attrs = new Map<string, string>();
    const fakeRoot = {
      style: { fontSize: "" },
      setAttribute: (k: string, v: string) => attrs.set(k, v),
      classList: {
        toggle: (cls: string, force?: boolean) => {
          toggled.set(cls, Boolean(force));
          return Boolean(force);
        },
      },
    } as unknown as HTMLElement;

    const prefs = {
      ...getDefaultAccessibilityPreferences(false),
      fontScale: "130" as const,
      highContrast: true,
      contrastTheme: "light" as const,
      dyslexicReading: true,
      vlibrasEnabled: true,
    };

    applyAccessibilityToElement(prefs, fakeRoot);

    assert.equal(fakeRoot.style.fontSize, "130%");
    assert.equal(attrs.get("data-font-scale"), "130");
    assert.equal(attrs.get("data-contrast"), "light");
    assert.equal(toggled.get("high-contrast"), true);
    assert.equal(toggled.get("high-contrast-light"), true);
    assert.equal(toggled.get("high-contrast-dark"), false);
    assert.equal(toggled.get("dyslexic-spacing"), true);
    assert.equal(toggled.get("vlibras-enabled"), true);
  });
});
