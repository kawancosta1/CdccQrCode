import { useEffect, useRef } from "react";
import { useAccessibility } from "../../context/accessibilityStore";
import { useSiteConfig } from "../../context/siteConfigStore";
import type { ParticleIntensity, SeasonId } from "../../domain/seasonEngine";
import style from "./style.module.css";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  angle: number;
  spin: number;
  swayPhase: number;
  swaySpeed: number;
  kind: "leaf" | "petal" | "pollen" | "flake" | "dust" | "sun" | "firefly";
}

const INTENSITY_FACTOR: Record<ParticleIntensity, number> = {
  suave: 0.55,
  normal: 1,
  intenso: 1.65,
};

const AUTUMN_COLORS = ["#c2410c", "#d97706", "#8a3354"];
const SPRING_PETAL_COLORS = ["#ec4899", "#f472b6", "#f59e0b", "#fbbf24"];

function createParticle(
  season: SeasonId,
  isNight: boolean,
  width: number,
  height: number,
  randomY = false,
): Particle {
  const y = randomY ? Math.random() * height : -20;

  if (season === "outono") {
    return {
      x: Math.random() * width,
      y,
      vx: 0.25 + Math.random() * 0.45,
      vy: 0.7 + Math.random() * 0.9,
      size: 6 + Math.random() * 6,
      alpha: 0.4 + Math.random() * 0.35,
      color: AUTUMN_COLORS[Math.floor(Math.random() * AUTUMN_COLORS.length)],
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.035,
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.015 + Math.random() * 0.02,
      kind: "leaf",
    };
  }

  if (season === "primavera") {
    const isPollen = Math.random() < 0.35;
    return {
      x: Math.random() * width,
      y,
      vx: 0.45 + Math.random() * 0.55,
      vy: isPollen ? 0.3 + Math.random() * 0.4 : 0.65 + Math.random() * 0.75,
      size: isPollen ? 1.5 + Math.random() * 1.8 : 4.5 + Math.random() * 4.5,
      alpha: isPollen ? 0.45 + Math.random() * 0.35 : 0.48 + Math.random() * 0.3,
      color: isPollen
        ? "#fde68a"
        : SPRING_PETAL_COLORS[Math.floor(Math.random() * SPRING_PETAL_COLORS.length)],
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.03,
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.018 + Math.random() * 0.018,
      kind: isPollen ? "pollen" : "petal",
    };
  }

  if (season === "inverno") {
    const isFlake = Math.random() < 0.4;
    return {
      x: Math.random() * width,
      y,
      vx: (Math.random() - 0.5) * 0.25,
      vy: isFlake ? 0.4 + Math.random() * 0.55 : 0.2 + Math.random() * 0.3,
      size: isFlake ? 4 + Math.random() * 4 : 1.5 + Math.random() * 2,
      alpha: isFlake ? 0.38 + Math.random() * 0.28 : 0.35 + Math.random() * 0.35,
      color: isFlake ? "#cbd5e1" : Math.random() < 0.5 ? "#fde68a" : "#e2e8f0",
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.012,
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.012 + Math.random() * 0.014,
      kind: isFlake ? "flake" : "dust",
    };
  }

  // Verão: vagalumes à noite nas bordas ou partículas solares durante o dia
  if (isNight) {
    const nearLeft = Math.random() < 0.5;
    const edgeBand = Math.min(180, width * 0.22);
    const x = nearLeft ? Math.random() * edgeBand : width - Math.random() * edgeBand;
    return {
      x,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.38,
      size: 2.4 + Math.random() * 2.2,
      alpha: 0.3 + Math.random() * 0.65,
      color: "#fbbf24",
      angle: 0,
      spin: 0,
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.03 + Math.random() * 0.03,
      kind: "firefly",
    };
  }

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: 0.15 + Math.random() * 0.25,
    vy: -0.15 + Math.random() * 0.35,
    size: 1.8 + Math.random() * 2.2,
    alpha: 0.28 + Math.random() * 0.35,
    color: "#fde047",
    angle: 0,
    spin: 0,
    swayPhase: Math.random() * Math.PI * 2,
    swaySpeed: 0.02 + Math.random() * 0.02,
    kind: "sun",
  };
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.translate(p.x, p.y);

  if (p.kind === "leaf") {
    ctx.rotate(p.angle);
    ctx.scale(1, Math.max(0.35, Math.abs(Math.cos(p.swayPhase))));
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.moveTo(0, -p.size);
    ctx.quadraticCurveTo(p.size * 0.85, 0, 0, p.size);
    ctx.quadraticCurveTo(-p.size * 0.85, 0, 0, -p.size);
    ctx.fill();
  } else if (p.kind === "petal") {
    ctx.rotate(p.angle);
    ctx.scale(1, Math.max(0.45, Math.abs(Math.cos(p.swayPhase * 0.8))));
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 0.72, p.size * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.kind === "flake") {
    ctx.rotate(p.angle);
    ctx.globalAlpha = p.alpha;
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 1.1;
    for (let i = 0; i < 3; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(-p.size, 0);
      ctx.lineTo(p.size, 0);
      ctx.stroke();
    }
  } else if (p.kind === "firefly") {
    const pulse = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(p.swayPhase));
    ctx.globalAlpha = p.alpha * pulse;
    ctx.shadowColor = "#fbbf24";
    ctx.shadowBlur = 12;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.globalAlpha = p.alpha * (0.65 + 0.35 * Math.sin(p.swayPhase));
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Camada sazonal 60fps em Canvas leve com pausa automática em segundo plano
 * e respeito integral a `reducedMotion` e ao toggle do visitante.
 */
export function SeasonalOverlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { config, activeSeason, isNightAtmosphere, visitorParticlesEnabled } = useSiteConfig();
  const { reducedMotion } = useAccessibility();

  const systemReducedMotion =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const shouldAnimate =
    Boolean(activeSeason) &&
    visitorParticlesEnabled &&
    !reducedMotion &&
    !systemReducedMotion;
  const intensity = config.estacao?.intensity ?? "normal";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!shouldAnimate || !activeSeason) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const baseCount = width < 640 ? 16 : 28;
    const count = Math.max(8, Math.round(baseCount * INTENSITY_FACTOR[intensity]));
    const particles: Particle[] = Array.from({ length: count }, () =>
      createParticle(activeSeason, isNightAtmosphere, width, height, true),
    );

    let rafId = 0;
    let paused = document.visibilityState === "hidden";

    const tick = () => {
      if (paused) return;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.swayPhase += p.swaySpeed;
        p.angle += p.spin;

        if (p.kind === "firefly") {
          p.x += p.vx + Math.sin(p.swayPhase) * 0.25;
          p.y += p.vy + Math.cos(p.swayPhase * 0.8) * 0.2;
          if (p.x < -10 || p.x > width + 10 || p.y < -10 || p.y > height + 10) {
            particles[i] = createParticle(activeSeason, isNightAtmosphere, width, height, true);
          }
        } else {
          p.x += p.vx + Math.sin(p.swayPhase) * 0.42;
          p.y += p.vy;
          if (p.y > height + 24 || p.x > width + 32 || p.x < -32) {
            particles[i] = createParticle(activeSeason, isNightAtmosphere, width, height, false);
          }
        }

        drawParticle(ctx, p);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    const handleVisibility = () => {
      paused = document.visibilityState === "hidden";
      if (!paused) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        window.cancelAnimationFrame(rafId);
      }
    };

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);

    if (!paused) {
      rafId = window.requestAnimationFrame(tick);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [activeSeason, intensity, isNightAtmosphere, shouldAnimate]);

  if (!activeSeason) return null;

  const glowClass =
    activeSeason === "outono"
      ? style.glowOutono
      : activeSeason === "primavera"
        ? style.glowPrimavera
        : activeSeason === "inverno"
          ? style.glowInverno
          : style.glowVerao;

  return (
    <div className={style.overlayRoot} aria-hidden="true">
      <div className={`${style.ambientGlow} ${glowClass}`} />
      {activeSeason === "verao" && !isNightAtmosphere && <div className={style.sunbeams} />}
      {isNightAtmosphere && <div className={style.nightLampGlow} />}
      <canvas ref={canvasRef} className={style.canvas} />
    </div>
  );
}
