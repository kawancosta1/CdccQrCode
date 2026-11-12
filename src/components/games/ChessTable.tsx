import { useEffect, useMemo, useState } from "react";
import { RotateCcw, FlipHorizontal2, Undo2 } from "lucide-react";
import { useAccessibility } from "../../context/accessibilityStore";
import styles from "./ChessTable.module.css";

const PIECE_NAME_PT: Record<PieceType, string> = {
  p: "Peão",
  n: "Cavalo",
  b: "Bispo",
  r: "Torre",
  q: "Dama",
  k: "Rei",
};

type Color = "w" | "b";
type PieceType = "p" | "n" | "b" | "r" | "q" | "k";

interface Piece {
  type: PieceType;
  color: Color;
}

type Board = (Piece | null)[][];

interface Pos {
  r: number;
  c: number;
}

interface MoveRecord {
  from: Pos;
  to: Pos;
  notation: string;
  captured?: Piece | null;
  prevBoard: Board;
}

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const PIECE_LETTER: Record<PieceType, string> = {
  p: "",
  n: "C",
  b: "B",
  r: "T",
  q: "D",
  k: "R",
};

const PIECE_VALUE: Record<PieceType, number> = {
  p: 10,
  n: 30,
  b: 32,
  r: 50,
  q: 90,
  k: 900,
};

function createInitialBoard(): Board {
  const backRank: PieceType[] = ["r", "n", "b", "q", "k", "b", "n", "r"];
  const board: Board = Array.from({ length: 8 }, () => Array(8).fill(null));

  for (let c = 0; c < 8; c++) {
    board[0][c] = { type: backRank[c], color: "b" };
    board[1][c] = { type: "p", color: "b" };
    board[6][c] = { type: "p", color: "w" };
    board[7][c] = { type: backRank[c], color: "w" };
  }
  return board;
}

function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function getPseudoMoves(board: Board, r: number, c: number): Pos[] {
  const piece = board[r][c];
  if (!piece) return [];
  const moves: Pos[] = [];
  const { type, color } = piece;

  if (type === "p") {
    const dir = color === "w" ? -1 : 1;
    const startRow = color === "w" ? 6 : 1;
    if (inBounds(r + dir, c) && !board[r + dir][c]) {
      moves.push({ r: r + dir, c });
      if (r === startRow && inBounds(r + dir * 2, c) && !board[r + dir * 2][c]) {
        moves.push({ r: r + dir * 2, c });
      }
    }
    for (const dc of [-1, 1]) {
      const nr = r + dir;
      const nc = c + dc;
      if (inBounds(nr, nc) && board[nr][nc] && board[nr][nc]?.color !== color) {
        moves.push({ r: nr, c: nc });
      }
    }
    return moves;
  }

  if (type === "n") {
    const jumps = [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ];
    for (const [dr, dc] of jumps) {
      const nr = r + dr;
      const nc = c + dc;
      if (inBounds(nr, nc) && board[nr][nc]?.color !== color) {
        moves.push({ r: nr, c: nc });
      }
    }
    return moves;
  }

  if (type === "k") {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (inBounds(nr, nc) && board[nr][nc]?.color !== color) {
          moves.push({ r: nr, c: nc });
        }
      }
    }
    return moves;
  }

  const dirs: [number, number][] = [];
  if (type === "b" || type === "q") {
    dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
  }
  if (type === "r" || type === "q") {
    dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);
  }

  for (const [dr, dc] of dirs) {
    let nr = r + dr;
    let nc = c + dc;
    while (inBounds(nr, nc)) {
      const target = board[nr][nc];
      if (!target) {
        moves.push({ r: nr, c: nc });
      } else {
        if (target.color !== color) {
          moves.push({ r: nr, c: nc });
        }
        break;
      }
      nr += dr;
      nc += dc;
    }
  }

  return moves;
}

function findKing(board: Board, color: Color): Pos | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === color && p.type === "k") {
        return { r, c };
      }
    }
  }
  return null;
}

function isKingInCheck(board: Board, color: Color): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  const enemy: Color = color === "w" ? "b" : "w";

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]?.color === enemy) {
        const attacks = getPseudoMoves(board, r, c);
        if (attacks.some((m) => m.r === kingPos.r && m.c === kingPos.c)) {
          return true;
        }
      }
    }
  }
  return false;
}

function applyMoveOnBoard(board: Board, from: Pos, to: Pos): Board {
  const next = cloneBoard(board);
  const moving = next[from.r][from.c];
  if (!moving) return next;

  next[from.r][from.c] = null;
  // Promoção automática para Dama na última fileira
  if (moving.type === "p" && (to.r === 0 || to.r === 7)) {
    next[to.r][to.c] = { type: "q", color: moving.color };
  } else {
    next[to.r][to.c] = moving;
  }
  return next;
}

function getLegalMoves(board: Board, r: number, c: number): Pos[] {
  const piece = board[r][c];
  if (!piece) return [];
  const pseudo = getPseudoMoves(board, r, c);
  return pseudo.filter((to) => {
    const simulated = applyMoveOnBoard(board, { r, c }, to);
    return !isKingInCheck(simulated, piece.color);
  });
}

function hasAnyLegalMoves(board: Board, color: Color): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]?.color === color && getLegalMoves(board, r, c).length > 0) {
        return true;
      }
    }
  }
  return false;
}

function ChessPieceSvg({ piece, className }: { piece: Piece; className?: string }) {
  const isWhite = piece.color === "w";
  const fill = isWhite ? "#FBF6EC" : "#2B1E16";
  const stroke = isWhite ? "#382619" : "#E8D5BC";
  const detail = isWhite ? "#382619" : "#F3E5D0";

  return (
    <svg viewBox="0 0 45 45" className={className} aria-hidden="true">
      {piece.type === "p" && (
        <g fill={fill} stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22.5 9c-3.5 0-6 2.5-6 6 0 2.2 1.2 4.1 3 5.1-3.2 2-5.5 5.4-5.5 9.9h17c0-4.5-2.3-7.9-5.5-9.9 1.8-1 3-2.9 3-5.1 0-3.5-2.5-6-6-6z" />
          <path d="M11.5 36h22v3.5h-22z" />
        </g>
      )}
      {piece.type === "r" && (
        <g fill={fill} stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 36h23v3.5H11zM14 32l1.5-15h14L31 32H14zM12 12v5h21v-5h-3.5v2.5h-3.5V12h-7v2.5H15.5V12H12z" />
        </g>
      )}
      {piece.type === "n" && (
        <g fill={fill} stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 35h18l-1.5-4H16.5L15 35zM17 31c1-9 0-15-4-19 3-2 4-5 3-7 3 0.5 5 2 6 4 4-1 9 2 10 7 1.5 5-1 8-5 7-2-0.5-3.5-2-4.5-4-0.5 4 3.5 7 4.5 12H17z" />
          <circle cx="21" cy="16" r="1.4" fill={detail} stroke="none" />
          <path d="M11.5 36h22v3.5h-22z" />
        </g>
      )}
      {piece.type === "b" && (
        <g fill={fill} stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="22.5" cy="9.5" r="2.3" />
          <path d="M15 32c-2-5-2-13 7.5-19.5C32 19 32 27 30 32H15z" />
          <path d="M19.5 18.5h6M22.5 15.5v6" stroke={detail} strokeWidth="1.8" />
          <path d="M11.5 36h22v3.5h-22z" />
        </g>
      )}
      {piece.type === "q" && (
        <g fill={fill} stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 15l4.5 16h18L36 15l-6.5 6.5L22.5 12l-7 9.5L9 15z" />
          <circle cx="9" cy="13.5" r="1.8" />
          <circle cx="15.5" cy="11" r="1.8" />
          <circle cx="22.5" cy="9.5" r="1.8" />
          <circle cx="29.5" cy="11" r="1.8" />
          <circle cx="36" cy="13.5" r="1.8" />
          <path d="M11.5 35.5h22V39h-22z" />
        </g>
      )}
      {piece.type === "k" && (
        <g fill={fill} stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22.5 6v6M19.5 9h6" stroke={stroke} strokeWidth="2.4" />
          <path d="M14 32c-3-6-2-14 8.5-18 10.5 4 11.5 12 8.5 18H14z" />
          <path d="M11.5 35.5h22V39h-22z" />
        </g>
      )}
    </svg>
  );
}

export function ChessTable() {
  const { announce, colorblindMode } = useAccessibility();
  const [board, setBoard] = useState<Board>(() => createInitialBoard());
  const [turn, setTurn] = useState<Color>("w");
  const [selected, setSelected] = useState<Pos | null>(null);
  const [history, setHistory] = useState<MoveRecord[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState<"local" | "bot">("bot");

  const legalMovesForSelected = useMemo(() => {
    if (!selected) return [];
    return getLegalMoves(board, selected.r, selected.c);
  }, [board, selected]);

  const inCheck = useMemo(() => isKingInCheck(board, turn), [board, turn]);
  const hasMoves = useMemo(() => hasAnyLegalMoves(board, turn), [board, turn]);
  const kingPos = useMemo(() => findKing(board, turn), [board, turn]);

  const capturedByWhite = useMemo(
    () => history.filter((m) => m.captured?.color === "b").map((m) => m.captured!),
    [history],
  );
  const capturedByBlack = useMemo(
    () => history.filter((m) => m.captured?.color === "w").map((m) => m.captured!),
    [history],
  );

  const lastMove = history.length > 0 ? history[history.length - 1] : null;

  const executeMove = (from: Pos, to: Pos) => {
    const moving = board[from.r][from.c];
    if (!moving) return;
    const captured = board[to.r][to.c];
    const nextBoard = applyMoveOnBoard(board, from, to);
    const enemyColor: Color = moving.color === "w" ? "b" : "w";
    const givesCheck = isKingInCheck(nextBoard, enemyColor);
    const enemyHasMoves = hasAnyLegalMoves(nextBoard, enemyColor);

    const pLetter = PIECE_LETTER[moving.type];
    const capSymbol = captured ? (moving.type === "p" ? `${FILES[from.c]}x` : "x") : "";
    const destCoord = `${FILES[to.c]}${8 - to.r}`;
    const promo = moving.type === "p" && (to.r === 0 || to.r === 7) ? "=D" : "";
    const suffix = givesCheck ? (enemyHasMoves ? "+" : "#") : "";
    const notation = `${pLetter}${capSymbol}${destCoord}${promo}${suffix}`;

    setHistory((prev) => [
      ...prev,
      {
        from,
        to,
        notation,
        captured,
        prevBoard: board,
      },
    ]);
    setBoard(nextBoard);
    setSelected(null);
    setTurn(enemyColor);

    const moverLabel = moving.color === "w" ? "Brancas" : "Pretas";
    const statusText = !enemyHasMoves
      ? givesCheck
        ? `Xeque-mate! Vitória das ${moverLabel}.`
        : "Empate por afogamento."
      : givesCheck
        ? `Lance ${notation}. Xeque!`
        : `Lance ${notation}. Vez das ${enemyColor === "w" ? "Brancas" : "Pretas"}.`;
    announce(statusText);
  };

  // Resposta tática do Bot CDCC quando for a vez das Pretas no modo "bot"
  useEffect(() => {
    if (mode !== "bot" || turn !== "b" || !hasMoves) return;

    const timer = window.setTimeout(() => {
      const allMoves: { from: Pos; to: Pos; score: number }[] = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (board[r][c]?.color === "b") {
            const moves = getLegalMoves(board, r, c);
            for (const to of moves) {
              let score = 0;
              const target = board[to.r][to.c];
              if (target) {
                score += PIECE_VALUE[target.type] * 10;
              }
              // Bônus por controle das casas centrais
              if (to.r >= 2 && to.r <= 5 && to.c >= 2 && to.c <= 5) {
                score += 4;
              }
              score += Math.random() * 3;
              allMoves.push({ from: { r, c }, to, score });
            }
          }
        }
      }

      if (allMoves.length > 0) {
        allMoves.sort((a, b) => b.score - a.score);
        const best = allMoves[0];
        executeMove(best.from, best.to);
      }
    }, 360);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, turn, board, hasMoves]);

  const handleSquareClick = (r: number, c: number) => {
    if (!hasMoves) return;
    if (mode === "bot" && turn === "b") return;

    if (selected) {
      const isLegal = legalMovesForSelected.some((m) => m.r === r && m.c === c);
      if (isLegal) {
        executeMove(selected, { r, c });
        return;
      }
    }

    const clickedPiece = board[r][c];
    if (clickedPiece && clickedPiece.color === turn) {
      setSelected({ r, c });
    } else {
      setSelected(null);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const stepsBack = mode === "bot" && turn === "w" && history.length >= 2 ? 2 : 1;
    const targetRecord = history[history.length - stepsBack];
    setBoard(targetRecord.prevBoard);
    setHistory((prev) => prev.slice(0, prev.length - stepsBack));
    setTurn(stepsBack === 2 ? "w" : turn === "w" ? "b" : "w");
    setSelected(null);
  };

  const handleReset = () => {
    setBoard(createInitialBoard());
    setTurn("w");
    setSelected(null);
    setHistory([]);
  };

  const pairedHistory: { moveNumber: number; white: string; black?: string }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    pairedHistory.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: history[i].notation,
      black: history[i + 1]?.notation,
    });
  }

  const rowIndices = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const colIndices = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  const handleSquareKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    visualRowIdx: number,
    visualColIdx: number,
  ) => {
    let dr = 0;
    let dc = 0;
    if (e.key === "ArrowUp") dr = -1;
    else if (e.key === "ArrowDown") dr = 1;
    else if (e.key === "ArrowLeft") dc = -1;
    else if (e.key === "ArrowRight") dc = 1;
    else return;

    e.preventDefault();
    const nextRow = Math.max(0, Math.min(7, visualRowIdx + dr));
    const nextCol = Math.max(0, Math.min(7, visualColIdx + dc));
    const nextEl = document.querySelector<HTMLButtonElement>(
      `[data-chess-cell="${nextRow}-${nextCol}"]`,
    );
    nextEl?.focus();
  };

  return (
    <section className={styles.tableSection} aria-label="Mesa interativa de Xadrez">
      <div className={styles.topBar}>
        <div className={styles.titleGroup}>
          <span className={styles.eyebrow}>Mesa Digital • Tabuleiro em Nogueira & Marfim</span>
          <h2 className={styles.tableTitle}>Partida Rápida de Xadrez</h2>
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
            Contra Bot CDCC
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === "local" ? styles.modeBtnActive : ""}`}
            onClick={() => {
              setMode("local");
              handleReset();
            }}
          >
            2 Jogadores na Mesa
          </button>
        </div>
      </div>

      <div className={styles.workspace}>
        <div className={styles.boardColumn}>
          {/* Jogador Superior */}
          <div
            className={`${styles.playerStrip} ${
              turn === (flipped ? "w" : "b") ? styles.playerStripActive : ""
            }`}
          >
            <span className={styles.playerIdentity}>
              <span
                className={`${styles.stoneSwatch} ${
                  flipped ? styles.swatchWhite : styles.swatchBlack
                }`}
              />
              {flipped
                ? "Peças Brancas (Marfim)"
                : mode === "bot"
                  ? "Bot Biblioteca CDCC (Pretas)"
                  : "Peças Pretas (Ébano)"}
            </span>
            <div className={styles.capturedTray} aria-label="Peças capturadas">
              {(flipped ? capturedByWhite : capturedByBlack).map((p, idx) => (
                <ChessPieceSvg key={idx} piece={p} className={styles.capturedIcon} />
              ))}
            </div>
          </div>

          {/* Tabuleiro */}
          <div className={styles.boardFrame}>
            <div className={styles.boardGrid} role="grid" aria-label="Tabuleiro de Xadrez 8 por 8">
              {rowIndices.map((r, visualRowIdx) =>
                colIndices.map((c, visualColIdx) => {
                  const isLight = (r + c) % 2 === 0;
                  const piece = board[r][c];
                  const isSelected = selected?.r === r && selected?.c === c;
                  const isLegalDest = legalMovesForSelected.some((m) => m.r === r && m.c === c);
                  const isLastMove =
                    (lastMove?.from.r === r && lastMove?.from.c === c) ||
                    (lastMove?.to.r === r && lastMove?.to.c === c);
                  const isCheckedKing =
                    inCheck && kingPos?.r === r && kingPos?.c === c;

                  const squareLabel = `${FILES[c]}${8 - r}`;

                  return (
                    <button
                      key={squareLabel}
                      type="button"
                      data-chess-cell={`${visualRowIdx}-${visualColIdx}`}
                      onClick={() => handleSquareClick(r, c)}
                      onKeyDown={(e) => handleSquareKeyDown(e, visualRowIdx, visualColIdx)}
                      className={[
                        styles.square,
                        isLight ? styles.squareLight : styles.squareDark,
                        isSelected ? styles.squareSelected : "",
                        !isSelected && isLastMove
                          ? isLight
                            ? styles.squareLastMoveLight
                            : styles.squareLastMoveDark
                          : "",
                        isCheckedKing ? styles.squareCheck : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-label={`Casa ${squareLabel}${
                        piece
                          ? `, ${PIECE_NAME_PT[piece.type]} ${piece.color === "w" ? "Branco" : "Preto"}`
                          : ", vazia"
                      }${isLegalDest ? " (destino válido)" : ""}`}
                    >
                      {visualColIdx === 0 && <span className={styles.coordRank}>{8 - r}</span>}
                      {visualRowIdx === 7 && (
                        <span className={styles.coordFile}>{FILES[c]}</span>
                      )}

                      {piece && <ChessPieceSvg piece={piece} className={styles.pieceSvg} />}
                      {isLegalDest && !piece && (
                        <span className={styles.moveDot} aria-hidden="true">
                          {colorblindMode ? "●" : ""}
                        </span>
                      )}
                      {isLegalDest && piece && (
                        <span className={styles.captureRing} aria-hidden="true">
                          {colorblindMode ? "◆" : ""}
                        </span>
                      )}
                    </button>
                  );
                }),
              )}
            </div>
          </div>

          {/* Jogador Inferior */}
          <div
            className={`${styles.playerStrip} ${
              turn === (flipped ? "b" : "w") ? styles.playerStripActive : ""
            }`}
          >
            <span className={styles.playerIdentity}>
              <span
                className={`${styles.stoneSwatch} ${
                  flipped ? styles.swatchBlack : styles.swatchWhite
                }`}
              />
              {flipped
                ? mode === "bot"
                  ? "Bot Biblioteca CDCC (Pretas)"
                  : "Peças Pretas (Ébano)"
                : "Peças Brancas (Marfim)"}
            </span>
            <div className={styles.capturedTray} aria-label="Peças capturadas">
              {(flipped ? capturedByBlack : capturedByWhite).map((p, idx) => (
                <ChessPieceSvg key={idx} piece={p} className={styles.capturedIcon} />
              ))}
            </div>
          </div>
        </div>

        {/* Painel Tático Lateral */}
        <aside className={styles.sidePanel} aria-label="Controle e histórico de lances">
          <div className={styles.turnCard} role="status" aria-live="polite">
            <div className={styles.turnStatus}>
              <span className={styles.turnLabel}>Status da Partida</span>
              <span className={styles.turnValue}>
                <span
                  className={`${styles.stoneSwatch} ${
                    turn === "w" ? styles.swatchWhite : styles.swatchBlack
                  }`}
                />
                {!hasMoves
                  ? inCheck
                    ? `Xeque-mate! Vitória das ${turn === "w" ? "Pretas" : "Brancas"}`
                    : "Empate por Afogamento!"
                  : turn === "w"
                    ? "Vez das Brancas"
                    : mode === "bot"
                      ? "Bot CDCC pensando..."
                      : "Vez das Pretas"}
              </span>
            </div>
            {inCheck && hasMoves && <span className={styles.checkPill}>Xeque!</span>}
          </div>

          <div className={styles.historyBox}>
            <div className={styles.historyHeader}>
              <span>Histórico de Lances</span>
              <span>{history.length} lances</span>
            </div>

            <div className={styles.historyList}>
              {pairedHistory.length === 0 ? (
                <p className={styles.historyEmpty}>
                  Toque em uma peça branca para visualizar as casas possíveis e iniciar a partida.
                </p>
              ) : (
                pairedHistory.map((pair) => (
                  <div key={pair.moveNumber} className={styles.historyRow}>
                    <span className={styles.historyNum}>{pair.moveNumber}.</span>
                    <span className={styles.historyMove}>{pair.white}</span>
                    <span className={styles.historyMove}>{pair.black || ""}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.controlsGrid}>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleUndo}
              disabled={history.length === 0}
            >
              <Undo2 size={15} aria-hidden="true" />
              Desfazer
            </button>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={() => setFlipped((f) => !f)}
            >
              <FlipHorizontal2 size={15} aria-hidden="true" />
              Girar Vista
            </button>
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.primaryActionBtn}`}
              onClick={handleReset}
            >
              <RotateCcw size={15} aria-hidden="true" />
              Nova Partida
            </button>
          </div>

          <p className={styles.hintText}>
            <strong>Dica de mesa:</strong> As casas marcadas com círculo indicam movimentos válidos;
            o anel terracota destaca peças adversárias sob alcance de captura.
          </p>
        </aside>
      </div>
    </section>
  );
}
