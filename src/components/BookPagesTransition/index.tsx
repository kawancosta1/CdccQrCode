import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAccessibility } from "../../context/accessibilityStore";
import style from "./style.module.css";

interface BookPagesTransitionProps {
  /** Incremente para disparar uma nova chuva de livros e folhas (~1.1s). */
  triggerKey: number;
}

interface ParticleSpec {
  id: number;
  kind: "book" | "page";
  leftPct: number;
  delay: number;
  duration: number;
  swayX: number;
  fallY: number;
  rotateStart: number;
  rotateEnd: number;
  color: string;
  scale: number;
}

const PARTICLES: ParticleSpec[] = [
  { id: 1, kind: "book", leftPct: 14, delay: 0.0, duration: 0.95, swayX: -24, fallY: 520, rotateStart: -16, rotateEnd: 22, color: "#8a3354", scale: 1.0 },
  { id: 2, kind: "page", leftPct: 24, delay: 0.05, duration: 1.0, swayX: 34, fallY: 560, rotateStart: 10, rotateEnd: -38, color: "#faf7f2", scale: 0.95 },
  { id: 3, kind: "book", leftPct: 37, delay: 0.03, duration: 0.92, swayX: 18, fallY: 540, rotateStart: 8, rotateEnd: -24, color: "#145399", scale: 0.9 },
  { id: 4, kind: "page", leftPct: 48, delay: 0.08, duration: 1.04, swayX: -40, fallY: 590, rotateStart: -22, rotateEnd: 42, color: "#fef3c7", scale: 1.05 },
  { id: 5, kind: "book", leftPct: 58, delay: 0.02, duration: 0.96, swayX: -16, fallY: 530, rotateStart: -8, rotateEnd: 28, color: "#b7791f", scale: 0.95 },
  { id: 6, kind: "page", leftPct: 68, delay: 0.06, duration: 1.02, swayX: 28, fallY: 570, rotateStart: 18, rotateEnd: -34, color: "#faf7f2", scale: 0.9 },
  { id: 7, kind: "book", leftPct: 79, delay: 0.04, duration: 0.94, swayX: 22, fallY: 520, rotateStart: 14, rotateEnd: -18, color: "#2d6a4f", scale: 0.92 },
  { id: 8, kind: "page", leftPct: 87, delay: 0.09, duration: 1.0, swayX: -28, fallY: 550, rotateStart: -12, rotateEnd: 30, color: "#f3ead8", scale: 0.88 },
  { id: 9, kind: "page", leftPct: 31, delay: 0.12, duration: 0.98, swayX: -20, fallY: 500, rotateStart: 6, rotateEnd: 35, color: "#faf7f2", scale: 0.85 },
  { id: 10, kind: "book", leftPct: 52, delay: 0.1, duration: 0.95, swayX: 16, fallY: 510, rotateStart: -14, rotateEnd: 16, color: "#9c4221", scale: 0.86 },
];

function MiniBookSvg({ color }: { color: string }) {
  return (
    <svg width="32" height="26" viewBox="0 0 32 26" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="26" height="19" rx="3" fill={color} stroke="#2c2218" strokeWidth="1.2" />
      <rect x="6" y="7" width="21" height="13" rx="1.5" fill="#faf7f2" />
      <path d="M16 7V20" stroke="#c8bba6" strokeWidth="1.1" />
      <path d="M9 10.5H14M9 13.5H13.5M18.5 10.5H23.5M18.5 13.5H23" stroke="#9c8b75" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function LoosePageSvg({ color }: { color: string }) {
  return (
    <svg width="24" height="28" viewBox="0 0 24 28" fill="none" aria-hidden="true">
      <path
        d="M4 3C4 1.9 4.9 1 6 1H15.5L20 5.5V25C20 26.1 19.1 27 18 27H6C4.9 27 4 26.1 4 25V3Z"
        fill={color}
        stroke="#8d7b66"
        strokeWidth="1.1"
      />
      <path d="M15 1V6H20" stroke="#8d7b66" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M7.5 10H16.5M7.5 14H16.5M7.5 18H13.5" stroke="#b3a490" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Micro-animação overlay leve (~1.1s, 60fps apenas com transform e opacity) de livros e folhas
 * caindo suavemente ao abrir o Mapa 3D ou a Foto da Estante.
 */
export function BookPagesTransition({ triggerKey }: BookPagesTransitionProps) {
  const { reducedMotion } = useAccessibility();
  const [completedKey, setCompletedKey] = useState<number>(0);

  useEffect(() => {
    if (triggerKey <= 0 || reducedMotion) return;
    const timer = window.setTimeout(() => {
      setCompletedKey(triggerKey);
    }, 1120);
    return () => window.clearTimeout(timer);
  }, [reducedMotion, triggerKey]);

  const isActive = triggerKey > 0 && !reducedMotion && completedKey !== triggerKey;
  if (!isActive) return null;

  return (
    <div key={triggerKey} className={style.overlay} aria-hidden="true">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className={style.particle}
          style={{ left: `${p.leftPct}%` }}
          initial={{
            opacity: 0,
            transform: `translate3d(0px, -20px, 0) rotate(${p.rotateStart}deg) scale(${p.scale})`,
          }}
          animate={{
            opacity: [0, 0.95, 0.9, 0],
            transform: [
              `translate3d(0px, -20px, 0) rotate(${p.rotateStart}deg) scale(${p.scale})`,
              `translate3d(${p.swayX}px, ${Math.round(p.fallY * 0.45)}px, 0) rotate(${Math.round((p.rotateStart + p.rotateEnd) / 2)}deg) scale(${p.scale})`,
              `translate3d(${Math.round(p.swayX * -0.6)}px, ${p.fallY}px, 0) rotate(${p.rotateEnd}deg) scale(${(p.scale * 0.85).toFixed(2)})`,
            ],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {p.kind === "book" ? <MiniBookSvg color={p.color} /> : <LoosePageSvg color={p.color} />}
        </motion.div>
      ))}
    </div>
  );
}
