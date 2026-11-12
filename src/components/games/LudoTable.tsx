import { useEffect, useMemo, useState } from "react";
import { Dices, RotateCcw } from "lucide-react";
import styles from "./LudoTable.module.css";

type LudoColor = "red" | "green" | "yellow" | "blue";

interface Pawn {
  id: number; // 0..3
  color: LudoColor;
  /**
   * progress:
   * -1 = na base
   * 0..50 = trilha principal relativa à cor
   * 51..55 = reta final colorida (5 casas)
   * 56 = chegada no centro
   */
  progress: number;
}

const COLORS: LudoColor[] = ["red", "green", "yellow", "blue"];

const COLOR_META: Record<
  LudoColor,
  { name: string; hex: string; startIdx: number; cellClass: string; pawnClass: string }
> = {
  red: {
    name: "Vermelho Terracota",
    hex: "#c84b31",
    startIdx: 0,
    cellClass: styles.cellRed,
    pawnClass: styles.pawnRed,
  },
  green: {
    name: "Verde Floresta",
    hex: "#2d7d56",
    startIdx: 13,
    cellClass: styles.cellGreen,
    pawnClass: styles.pawnGreen,
  },
  yellow: {
    name: "Amarelo Ocre",
    hex: "#d99b26",
    startIdx: 26,
    cellClass: styles.cellYellow,
    pawnClass: styles.pawnYellow,
  },
  blue: {
    name: "Azul Marítimo",
    hex: "#2b5b84",
    startIdx: 39,
    cellClass: styles.cellBlue,
    pawnClass: styles.pawnBlue,
  },
};

// As 52 coordenadas (linha, coluna) do percurso principal no grid 15x15 (sentido horário)
const MAIN_TRACK_COORDS: [number, number][] = [
  // Saída do Vermelho para direita
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  // Subida pelo braço superior
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  // Topo
  [0, 7], [0, 8],
  // Descida (Saída do Verde em [1, 8])
  [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  // Braço direito superior
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  // Extrema direita
  [7, 14], [8, 14],
  // Braço direito inferior (Saída do Amarelo em [8, 13])
  [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  // Descida pelo braço inferior
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  // Base inferior
  [14, 7], [14, 6],
  // Subida pelo braço inferior (Saída do Azul em [13, 6])
  [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  // Braço esquerdo inferior
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  // Extrema esquerda
  [7, 0], [6, 0],
];

// Casas seguras na trilha principal (índices de 0 a 51)
const SAFE_TRACK_INDICES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

// Coordenadas das 5 casas da reta final de cada cor (progress 51..55)
const HOME_STRETCH_COORDS: Record<LudoColor, [number, number][]> = {
  red: [
    [7, 1], [7, 2], [7, 3], [7, 4], [7, 5],
  ],
  green: [
    [1, 7], [2, 7], [3, 7], [4, 7], [5, 7],
  ],
  yellow: [
    [7, 13], [7, 12], [7, 11], [7, 10], [7, 9],
  ],
  blue: [
    [13, 7], [12, 7], [11, 7], [10, 7], [9, 7],
  ],
};

function createInitialPawns(): Pawn[] {
  const list: Pawn[] = [];
  for (const color of COLORS) {
    for (let id = 0; id < 4; id++) {
      list.push({
        id,
        color,
        // Inicia com 1 peão já na casa de saída para ação imediata e 3 na base
        progress: id === 0 ? 0 : -1,
      });
    }
  }
  return list;
}

function getGlobalTrackIndex(color: LudoColor, progress: number): number | null {
  if (progress < 0 || progress > 50) return null;
  return (COLOR_META[color].startIdx + progress) % 52;
}

function canMovePawn(pawn: Pawn, dice: number | null): boolean {
  if (!dice) return false;
  if (pawn.progress === -1) return dice === 6;
  if (pawn.progress >= 56) return false;
  return pawn.progress + dice <= 56;
}

function DieSvg({ value }: { value: number }) {
  const pips: Record<number, [number, number][]> = {
    1: [[24, 24]],
    2: [[14, 14], [34, 34]],
    3: [[14, 14], [24, 24], [34, 34]],
    4: [[14, 14], [34, 14], [14, 34], [34, 34]],
    5: [[14, 14], [34, 14], [24, 24], [14, 34], [34, 34]],
    6: [[14, 12], [34, 12], [14, 24], [34, 24], [14, 36], [34, 36]],
  };

  return (
    <svg viewBox="0 0 48 48" width="42" height="42" aria-hidden="true">
      {(pips[value] || pips[1]).map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={4.2}
          fill={value === 6 ? "#c84b31" : "#292018"}
        />
      ))}
    </svg>
  );
}

export function LudoTable() {
  const [pawns, setPawns] = useState<Pawn[]>(() => createInitialPawns());
  const [turnIdx, setTurnIdx] = useState(0);
  const [dice, setDice] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [mode, setMode] = useState<"bot" | "local">("bot");
  const [statusMessage, setStatusMessage] = useState(
    "Role o dado para avançar seus peões Vermelhos até o centro do tabuleiro!",
  );

  const currentColor = COLORS[turnIdx];
  const isBotTurn = mode === "bot" && currentColor !== "red";

  const winnerColor = useMemo(() => {
    for (const c of COLORS) {
      const finished = pawns.filter((p) => p.color === c && p.progress === 56).length;
      if (finished === 4) return c;
    }
    return null;
  }, [pawns]);

  const movablePawns = useMemo(() => {
    if (!dice || winnerColor) return [];
    return pawns.filter((p) => p.color === currentColor && canMovePawn(p, dice));
  }, [pawns, currentColor, dice, winnerColor]);

  const advanceTurn = (keepTurn: boolean) => {
    setDice(null);
    if (!keepTurn) {
      setTurnIdx((prev) => (prev + 1) % 4);
    }
  };

  const executePawnMove = (targetPawn: Pawn, rolled: number) => {
    const nextProgress = targetPawn.progress === -1 ? 0 : targetPawn.progress + rolled;
    const destTrackIdx = getGlobalTrackIndex(targetPawn.color, nextProgress);

    let capturedEnemy = false;
    const updated = pawns.map((p) => {
      if (p.color === targetPawn.color && p.id === targetPawn.id) {
        return { ...p, progress: nextProgress };
      }
      // Verifica captura na trilha principal (se não for estrela segura)
      if (
        destTrackIdx !== null &&
        !SAFE_TRACK_INDICES.has(destTrackIdx) &&
        p.color !== targetPawn.color
      ) {
        const enemyTrackIdx = getGlobalTrackIndex(p.color, p.progress);
        if (enemyTrackIdx === destTrackIdx) {
          capturedEnemy = true;
          return { ...p, progress: -1 };
        }
      }
      return p;
    });

    setPawns(updated);

    const reachedGoal = nextProgress === 56;
    const bonusTurn = rolled === 6 || capturedEnemy || reachedGoal;

    if (reachedGoal) {
      setStatusMessage(
        `${COLOR_META[targetPawn.color].name} levou um peão ao centro! Joga novamente.`,
      );
    } else if (capturedEnemy) {
      setStatusMessage(
        `${COLOR_META[targetPawn.color].name} capturou um peão adversário e ganhou turno extra!`,
      );
    } else if (rolled === 6) {
      setStatusMessage(
        `${COLOR_META[targetPawn.color].name} tirou 6 e ganhou uma nova rolagem!`,
      );
    } else {
      const nextColor = COLORS[(turnIdx + 1) % 4];
      setStatusMessage(`Vez de ${COLOR_META[nextColor].name}.`);
    }

    advanceTurn(bonusTurn);
  };

  const handleRollDice = () => {
    if (dice !== null || isRolling || winnerColor) return;
    setIsRolling(true);

    window.setTimeout(() => {
      const rolled = Math.floor(Math.random() * 6) + 1;
      setIsRolling(false);
      setDice(rolled);

      const valid = pawns.filter((p) => p.color === currentColor && canMovePawn(p, rolled));
      if (valid.length === 0) {
        setStatusMessage(
          `${COLOR_META[currentColor].name} tirou ${rolled}, mas não há movimentos possíveis.`,
        );
        window.setTimeout(() => {
          setDice(null);
          setTurnIdx((prev) => (prev + 1) % 4);
        }, 700);
      } else {
        setStatusMessage(
          `${COLOR_META[currentColor].name} tirou ${rolled}! Selecione um peão destacado.`,
        );
      }
    }, 180);
  };

  // Automação rápida dos bots
  useEffect(() => {
    if (!isBotTurn || winnerColor) return;

    if (dice === null && !isRolling) {
      const t = window.setTimeout(() => {
        handleRollDice();
      }, 420);
      return () => window.clearTimeout(t);
    }

    if (dice !== null && movablePawns.length > 0) {
      const t = window.setTimeout(() => {
        // Prioriza sair da base com 6 ou avançar o peão mais adiantado
        const keluar = movablePawns.find((p) => p.progress === -1);
        const chosen =
          keluar || [...movablePawns].sort((a, b) => b.progress - a.progress)[0];
        executePawnMove(chosen, dice);
      }, 480);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBotTurn, dice, isRolling, movablePawns, winnerColor]);

  const handleReset = () => {
    setPawns(createInitialPawns());
    setTurnIdx(0);
    setDice(null);
    setStatusMessage(
      "Tabuleiro reiniciado. Role o dado para movimentar seus peões Vermelhos!",
    );
  };

  // Mapeia coordenada (r, c) para lista de peões nela
  const pawnsByCoord = useMemo(() => {
    const map = new Map<string, Pawn[]>();
    for (const p of pawns) {
      if (p.progress < 0 || p.progress >= 56) continue;
      let coord: [number, number] | null = null;
      if (p.progress <= 50) {
        const idx = getGlobalTrackIndex(p.color, p.progress);
        if (idx !== null) coord = MAIN_TRACK_COORDS[idx];
      } else {
        coord = HOME_STRETCH_COORDS[p.color][p.progress - 51];
      }
      if (coord) {
        const key = `${coord[0]},${coord[1]}`;
        const list = map.get(key) || [];
        list.push(p);
        map.set(key, list);
      }
    }
    return map;
  }, [pawns]);

  const renderTrackCell = (r: number, c: number) => {
    const key = `${r},${c}`;
    const cellPawns = pawnsByCoord.get(key) || [];

    // Verifica se é reta final colorida
    let colorClass = "";
    for (const color of COLORS) {
      if (HOME_STRETCH_COORDS[color].some(([hr, hc]) => hr === r && hc === c)) {
        colorClass = COLOR_META[color].cellClass;
      }
    }

    // Verifica se é casa de saída ou estrela segura na trilha principal
    const mainIdx = MAIN_TRACK_COORDS.findIndex(([mr, mc]) => mr === r && mc === c);
    let isStar = false;
    if (mainIdx !== -1) {
      if (mainIdx === 0) colorClass = styles.cellRed;
      else if (mainIdx === 13) colorClass = styles.cellGreen;
      else if (mainIdx === 26) colorClass = styles.cellYellow;
      else if (mainIdx === 39) colorClass = styles.cellBlue;
      else if (SAFE_TRACK_INDICES.has(mainIdx)) {
        colorClass = styles.cellSafeStar;
        isStar = true;
      }
    }

    return (
      <div
        key={key}
        style={{ gridRow: r + 1, gridColumn: c + 1 }}
        className={`${styles.cell} ${colorClass}`}
      >
        {isStar && (
          <svg viewBox="0 0 24 24" className={styles.starIcon} fill="currentColor">
            <polygon points="12,2 15,9 22,9.5 16.5,14 18.5,21 12,17.2 5.5,21 7.5,14 2,9.5 9,9" />
          </svg>
        )}
        {cellPawns.length > 0 && (
          <div className={styles.pawnStack}>
            {cellPawns.map((pawn) => {
              const isMovable =
                !isBotTurn &&
                pawn.color === currentColor &&
                canMovePawn(pawn, dice);
              return (
                <button
                  key={`${pawn.color}-${pawn.id}`}
                  type="button"
                  disabled={!isMovable}
                  onClick={() => dice && executePawnMove(pawn, dice)}
                  className={[
                    styles.pawnBtn,
                    cellPawns.length > 1 ? styles.pawnBtnSmall : "",
                    COLOR_META[pawn.color].pawnClass,
                    isMovable ? styles.pawnMovable : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-label={`Peão ${COLOR_META[pawn.color].name} ${pawn.id + 1}`}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Gera todas as células da trilha (fora das 4 bases 6x6 e do centro 3x3)
  const trackCells: React.ReactNode[] = [];
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      const inRedBase = r < 6 && c < 6;
      const inGreenBase = r < 6 && c >= 9;
      const inBlueBase = r >= 9 && c < 6;
      const inYellowBase = r >= 9 && c >= 9;
      const inCenter = r >= 6 && r <= 8 && c >= 6 && c <= 8;
      if (inRedBase || inGreenBase || inBlueBase || inYellowBase || inCenter) {
        continue;
      }
      trackCells.push(renderTrackCell(r, c));
    }
  }

  const renderBase = (color: LudoColor, baseClass: string) => {
    const basePawns = pawns.filter((p) => p.color === color);
    return (
      <div className={`${styles.baseZone} ${baseClass}`}>
        <div className={styles.baseInner}>
          {basePawns.map((pawn) => {
            const inYard = pawn.progress === -1;
            const isMovable =
              inYard && !isBotTurn && pawn.color === currentColor && canMovePawn(pawn, dice);
            return (
              <div key={pawn.id} className={styles.yardSlot}>
                {inYard && (
                  <button
                    type="button"
                    disabled={!isMovable}
                    onClick={() => dice && executePawnMove(pawn, dice)}
                    className={[
                      styles.pawnBtn,
                      COLOR_META[color].pawnClass,
                      isMovable ? styles.pawnMovable : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-label={`Retirar peão ${COLOR_META[color].name} ${pawn.id + 1} da base`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section className={styles.tableSection} aria-label="Mesa interativa de Ludo">
      <div className={styles.topBar}>
        <div className={styles.titleGroup}>
          <span className={styles.eyebrow}>Mesa Digital • Edição Retrô Tátil</span>
          <h2 className={styles.tableTitle}>Tabuleiro Oficial de Ludo</h2>
        </div>

        <div className={styles.modeGroup} role="group" aria-label="Modo de partida">
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === "bot" ? styles.modeBtnActive : ""}`}
            onClick={() => {
              setMode("bot");
              handleReset();
            }}
          >
            Contra 3 Bots
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === "local" ? styles.modeBtnActive : ""}`}
            onClick={() => {
              setMode("local");
              handleReset();
            }}
          >
            4 Jogadores na Mesa
          </button>
        </div>
      </div>

      <div className={styles.workspace}>
        <div className={styles.boardFrame}>
          <div className={styles.ludoGrid}>
            {renderBase("red", styles.baseRed)}
            {renderBase("green", styles.baseGreen)}
            {renderBase("blue", styles.baseBlue)}
            {renderBase("yellow", styles.baseYellow)}

            {trackCells}

            {/* Coroa Central de Chegada */}
            <div className={styles.centerGoal} aria-label="Casa central de chegada">
              <svg viewBox="0 0 100 100" className={styles.centerSvg}>
                <polygon points="0,0 100,0 50,50" fill="#2d7d56" />
                <polygon points="100,0 100,100 50,50" fill="#d99b26" />
                <polygon points="0,100 100,100 50,50" fill="#2b5b84" />
                <polygon points="0,0 0,100 50,50" fill="#c84b31" />
                <circle cx="50" cy="50" r="16" fill="#fffdf9" stroke="#292018" strokeWidth="2.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Painel de Controle e Dado */}
        <aside className={styles.sidePanel} aria-label="Dado e placar do Ludo">
          <div className={styles.turnBanner} role="status" aria-live="polite">
            <div className={styles.playerBadge}>
              <span
                className={styles.colorDot}
                style={{ backgroundColor: COLOR_META[currentColor].hex }}
              />
              <span>
                {winnerColor
                  ? `Vitória de ${COLOR_META[winnerColor].name}!`
                  : `Turno: ${COLOR_META[currentColor].name}`}
              </span>
            </div>
          </div>

          <div className={styles.diceStage}>
            <button
              type="button"
              className={styles.diceButton}
              onClick={handleRollDice}
              disabled={dice !== null || isRolling || isBotTurn || Boolean(winnerColor)}
            >
              <Dices size={18} aria-hidden="true" />
              {isRolling ? "Rolando..." : dice ? `Tirou ${dice}` : "Lançar Dado"}
            </button>

            <div
              className={`${styles.dieVisual} ${isRolling ? styles.dieRolling : ""}`}
              aria-label={dice ? `Valor do dado: ${dice}` : "Dado aguardando lançamento"}
            >
              <DieSvg value={dice || 6} />
            </div>
          </div>

          <div className={styles.statusLog}>{statusMessage}</div>

          <div className={styles.scoreboard}>
            {COLORS.map((color) => {
              const finished = pawns.filter((p) => p.color === color && p.progress === 56).length;
              return (
                <div
                  key={color}
                  className={`${styles.scoreCard} ${
                    currentColor === color ? styles.scoreCardActive : ""
                  }`}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontWeight: 600 }}>
                    <span
                      className={styles.colorDot}
                      style={{ backgroundColor: COLOR_META[color].hex, width: 11, height: 11 }}
                    />
                    {COLOR_META[color].name.split(" ")[0]}
                  </span>
                  <strong>{finished}/4 no centro</strong>
                </div>
              );
            })}
          </div>

          <button type="button" className={styles.resetBtn} onClick={handleReset}>
            <RotateCcw size={15} aria-hidden="true" />
            Reiniciar Partida de Ludo
          </button>
        </aside>
      </div>
    </section>
  );
}
