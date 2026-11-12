import { useState } from "react";
import { Dices, Minus, Plus, RotateCcw } from "lucide-react";
import { useAccessibility } from "../../context/accessibilityStore";

export function TabletopCompanion({ gameName }: { gameName: string }) {
  const { announce } = useAccessibility();
  const [dieA, setDieA] = useState(6);
  const [dieB, setDieB] = useState(5);
  const [scores, setScores] = useState([0, 0, 0, 0]);
  const [turn, setTurn] = useState(0);

  const rollDice = () => {
    const a = Math.floor(Math.random() * 6) + 1;
    const b = Math.floor(Math.random() * 6) + 1;
    setDieA(a);
    setDieB(b);
    announce(`Dados rolados: ${a} e ${b}, total ${a + b}`);
  };

  const updateScore = (idx: number, delta: number) => {
    setScores((prev) => prev.map((s, i) => (i === idx ? Math.max(0, s + delta) : s)));
  };

  return (
    <section
      aria-label={`Utilitário de mesa para ${gameName}`}
      style={{
        backgroundColor: "#fbf7f9",
        border: "1px solid var(--color-brand-border)",
        borderRadius: "var(--radius-xl)",
        padding: "clamp(1rem, 2.5vw, 1.5rem)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--color-brand)",
            }}
          >
            Auxiliar Presencial de Partida
          </span>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
            Marcador de Mesa & Dados — {gameName}
          </h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <button
            type="button"
            onClick={rollDice}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.5rem 0.9rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-brand)",
              backgroundColor: "var(--color-brand)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.8125rem",
              cursor: "pointer",
            }}
          >
            <Dices size={16} aria-hidden="true" />
            Rolar 2D6 ({dieA} + {dieB} = {dieA + dieB})
          </button>

          <button
            type="button"
            onClick={() => {
              setScores([0, 0, 0, 0]);
              setTurn(0);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.5rem 0.75rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border-strong)",
              backgroundColor: "#fff",
              color: "var(--color-text-primary)",
              fontWeight: 600,
              fontSize: "0.8125rem",
              cursor: "pointer",
            }}
          >
            <RotateCcw size={14} aria-hidden="true" />
            Zerar Placar
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "0.75rem",
        }}
      >
        {scores.map((score, idx) => (
          <div
            key={idx}
            onClick={() => setTurn(idx)}
            style={{
              backgroundColor: "#fff",
              border:
                turn === idx
                  ? "2px solid var(--color-brand)"
                  : "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "0.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
          >
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", fontWeight: 600 }}>
                Jogador {idx + 1} {turn === idx ? "• Vez" : ""}
              </div>
              <strong style={{ fontSize: "1.25rem", color: "var(--color-text-primary)" }}>
                {score} pts
              </strong>
            </div>

            <div style={{ display: "flex", gap: "0.3rem" }} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => updateScore(idx, -1)}
                aria-label={`Diminuir ponto do Jogador ${idx + 1}`}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-surface-subtle)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Minus size={14} />
              </button>
              <button
                type="button"
                onClick={() => updateScore(idx, 1)}
                aria-label={`Aumentar ponto do Jogador ${idx + 1}`}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-surface-subtle)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
