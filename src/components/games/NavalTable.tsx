import { useMemo, useState } from "react";
import { Compass, Crosshair, RotateCcw, Shuffle } from "lucide-react";
import styles from "./NavalTable.module.css";

interface ShipTemplate {
  id: string;
  name: string;
  size: number;
}

interface PlacedShip extends ShipTemplate {
  coords: [number, number][];
}

const FLEET_TEMPLATES: ShipTemplate[] = [
  { id: "carrier", name: "Porta-Aviões", size: 5 },
  { id: "battleship", name: "Encouraçado", size: 4 },
  { id: "cruiser", name: "Cruzador", size: 3 },
  { id: "submarine", name: "Submarino", size: 3 },
  { id: "destroyer", name: "Destróier", size: 2 },
];

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function canPlaceShip(
  existing: PlacedShip[],
  r: number,
  c: number,
  size: number,
  horizontal: boolean,
): [number, number][] | null {
  const coords: [number, number][] = [];
  for (let i = 0; i < size; i++) {
    const nr = horizontal ? r : r + i;
    const nc = horizontal ? c + i : c;
    if (nr < 0 || nr >= 10 || nc < 0 || nc >= 10) return null;
    const collision = existing.some((ship) =>
      ship.coords.some(([sr, sc]) => sr === nr && sc === nc),
    );
    if (collision) return null;
    coords.push([nr, nc]);
  }
  return coords;
}

function generateRandomFleet(): PlacedShip[] {
  const placed: PlacedShip[] = [];
  for (const tpl of FLEET_TEMPLATES) {
    let success = false;
    while (!success) {
      const horizontal = Math.random() < 0.5;
      const r = Math.floor(Math.random() * 10);
      const c = Math.floor(Math.random() * 10);
      const coords = canPlaceShip(placed, r, c, tpl.size, horizontal);
      if (coords) {
        placed.push({ ...tpl, coords });
        success = true;
      }
    }
  }
  return placed;
}

export function NavalTable() {
  const [playerFleet, setPlayerFleet] = useState<PlacedShip[]>(() => generateRandomFleet());
  const [enemyFleet, setEnemyFleet] = useState<PlacedShip[]>(() => generateRandomFleet());
  const [playerShots, setPlayerShots] = useState<Set<string>>(() => new Set());
  const [enemyShots, setEnemyShots] = useState<Set<string>>(() => new Set());
  const [placingMode, setPlacingMode] = useState(false);
  const [horizontal, setHorizontal] = useState(true);
  const [telemetry, setTelemetry] = useState(
    "Radar ativo: selecione uma coordenada no setor inimigo (A1–J10) para disparar.",
  );

  const nextShipToPlace = useMemo(() => {
    if (!placingMode) return null;
    return FLEET_TEMPLATES[playerFleet.length] || null;
  }, [placingMode, playerFleet.length]);

  const isShipSunk = (ship: PlacedShip, shots: Set<string>) =>
    ship.coords.every(([r, c]) => shots.has(`${r},${c}`));

  const enemySunkCount = useMemo(
    () => enemyFleet.filter((s) => isShipSunk(s, playerShots)).length,
    [enemyFleet, playerShots],
  );

  const playerSunkCount = useMemo(
    () => playerFleet.filter((s) => isShipSunk(s, enemyShots)).length,
    [playerFleet, enemyShots],
  );

  const gameOver = enemySunkCount === FLEET_TEMPLATES.length || playerSunkCount === FLEET_TEMPLATES.length;

  const handleFireAtEnemy = (r: number, c: number) => {
    if (placingMode || gameOver) return;
    const key = `${r},${c}`;
    if (playerShots.has(key)) return;

    const nextPlayerShots = new Set(playerShots);
    nextPlayerShots.add(key);
    setPlayerShots(nextPlayerShots);

    const coordLabel = `${ROWS[r]}${c + 1}`;
    const hitShip = enemyFleet.find((s) => s.coords.some(([sr, sc]) => sr === r && sc === c));

    if (hitShip) {
      const sunkNow = isShipSunk(hitShip, nextPlayerShots);
      if (sunkNow) {
        setTelemetry(`Impacto confirmado em ${coordLabel}! ${hitShip.name} inimigo AFUNDADO!`);
      } else {
        setTelemetry(`Fogo em ${coordLabel}! Atingimos uma embarcação inimiga!`);
      }
    } else {
      setTelemetry(`Disparo em ${coordLabel}: Água.`);
    }

    // Verifica se o jogador já venceu antes do contra-ataque
    const allEnemyDown = enemyFleet.every((s) => isShipSunk(s, nextPlayerShots));
    if (allEnemyDown) {
      setTelemetry("Vitória Naval! Toda a esquadra inimiga foi neutralizada!");
      return;
    }

    // Contra-ataque tático da IA (prioriza adjacentes a acertos)
    const nextEnemyShots = new Set(enemyShots);
    const availableTargets: [number, number][] = [];
    const priorityTargets: [number, number][] = [];

    for (let er = 0; er < 10; er++) {
      for (let ec = 0; ec < 10; ec++) {
        const k = `${er},${ec}`;
        if (!nextEnemyShots.has(k)) {
          availableTargets.push([er, ec]);
        } else {
          // Se foi acerto em navio ainda não afundado, adiciona vizinhos como prioridade
          const hitPlayerShip = playerFleet.find((s) =>
            s.coords.some(([sr, sc]) => sr === er && sc === ec),
          );
          if (hitPlayerShip && !isShipSunk(hitPlayerShip, nextEnemyShots)) {
            const neighbors: [number, number][] = [
              [er - 1, ec],
              [er + 1, ec],
              [er, ec - 1],
              [er, ec + 1],
            ];
            for (const [nr, nc] of neighbors) {
              if (
                nr >= 0 &&
                nr < 10 &&
                nc >= 0 &&
                nc < 10 &&
                !nextEnemyShots.has(`${nr},${nc}`)
              ) {
                priorityTargets.push([nr, nc]);
              }
            }
          }
        }
      }
    }

    const pool = priorityTargets.length > 0 ? priorityTargets : availableTargets;
    if (pool.length > 0) {
      const [ar, ac] = pool[Math.floor(Math.random() * pool.length)];
      nextEnemyShots.add(`${ar},${ac}`);
      setEnemyShots(nextEnemyShots);
    }
  };

  const handlePlacePlayerShip = (r: number, c: number) => {
    if (!placingMode || !nextShipToPlace) return;
    const coords = canPlaceShip(playerFleet, r, c, nextShipToPlace.size, horizontal);
    if (!coords) {
      setTelemetry(
        `Posição inválida em ${ROWS[r]}${c + 1} para ${nextShipToPlace.name} (${nextShipToPlace.size} casas).`,
      );
      return;
    }

    const updated = [...playerFleet, { ...nextShipToPlace, coords }];
    setPlayerFleet(updated);

    if (updated.length === FLEET_TEMPLATES.length) {
      setPlacingMode(false);
      setTelemetry("Frota posicionada! Inicie o bombardeio no Radar de Ataque.");
    } else {
      const next = FLEET_TEMPLATES[updated.length];
      setTelemetry(`Posicione agora: ${next.name} (${next.size} casas).`);
    }
  };

  const handleStartManualPlacement = () => {
    setPlayerFleet([]);
    setEnemyFleet(generateRandomFleet());
    setPlayerShots(new Set());
    setEnemyShots(new Set());
    setPlacingMode(true);
    setTelemetry("Modo de posicionamento: clique no mapa da Sua Frota para alocar o Porta-Aviões (5 casas).");
  };

  const handleAutoReset = () => {
    setPlacingMode(false);
    setPlayerFleet(generateRandomFleet());
    setEnemyFleet(generateRandomFleet());
    setPlayerShots(new Set());
    setEnemyShots(new Set());
    setTelemetry("Nova operação iniciada com frota posicionada taticamente.");
  };

  return (
    <section className={styles.tableSection} aria-label="Mesa tática de Batalha Naval">
      <div className={styles.topBar}>
        <div className={styles.titleGroup}>
          <span className={styles.eyebrow}>Sonar Hidrográfico • Operação Atlântico</span>
          <h2 className={styles.tableTitle}>Centro Tático de Batalha Naval</h2>
        </div>

        <div className={styles.topControls}>
          {placingMode && (
            <button
              type="button"
              className={`${styles.tacticalBtn} ${styles.tacticalBtnPrimary}`}
              onClick={() => setHorizontal((h) => !h)}
            >
              <Compass size={15} aria-hidden="true" />
              Orientação: {horizontal ? "Horizontal" : "Vertical"}
            </button>
          )}
          <button
            type="button"
            className={styles.tacticalBtn}
            onClick={handleStartManualPlacement}
          >
            <Crosshair size={15} aria-hidden="true" />
            Posicionar Manualmente
          </button>
          <button
            type="button"
            className={`${styles.tacticalBtn} ${!placingMode ? styles.tacticalBtnPrimary : ""}`}
            onClick={handleAutoReset}
          >
            {playerShots.size > 0 ? (
              <>
                <RotateCcw size={15} aria-hidden="true" />
                Nova Operação
              </>
            ) : (
              <>
                <Shuffle size={15} aria-hidden="true" />
                Sortear Frota
              </>
            )}
          </button>
        </div>
      </div>

      {/* Telemetria em Tempo Real */}
      <div className={styles.telemetryBanner} role="status" aria-live="polite">
        <div>
          <span className={styles.radarDot} />
          <strong>Telemetria:</strong> {telemetry}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem" }}>
          Alvos Neutralizados: <strong>{enemySunkCount}/5</strong> • Sua Esquadra:{" "}
          <strong>{5 - playerSunkCount}/5</strong>
        </div>
      </div>

      {/* Status da Esquadra Inimiga */}
      <div className={styles.fleetPanel} aria-label="Integridade da frota inimiga">
        {enemyFleet.map((ship) => {
          const sunk = isShipSunk(ship, playerShots);
          const hits = ship.coords.filter(([r, c]) => playerShots.has(`${r},${c}`)).length;
          return (
            <div
              key={ship.id}
              className={`${styles.shipBadge} ${sunk ? styles.shipBadgeSunk : ""}`}
            >
              <div className={styles.shipName}>
                <span>{ship.name}</span>
                <span>{sunk ? "AFUNDADO" : `${ship.size} casas`}</span>
              </div>
              <div className={styles.hullPips}>
                {Array.from({ length: ship.size }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`${styles.hullPip} ${
                      sunk || idx < hits ? styles.hullPipDamaged : ""
                    }`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.gridsContainer}>
        {/* Radar de Ataque (Inimigo) */}
        <div className={styles.radarCard}>
          <div className={styles.radarHeader}>
            <span className={styles.radarTitle}>Radar de Ataque (Setor Inimigo)</span>
            <span className={styles.radarSubtitle}>Clique nas coordenadas para disparar</span>
          </div>

          <div className={styles.boardMatrix} role="grid" aria-label="Grade de ataque inimigo 10 por 10">
            <div className={styles.coordCell} />
            {COLS.map((col) => (
              <div key={`atk-col-${col}`} className={styles.coordCell}>
                {col}
              </div>
            ))}

            {ROWS.map((rowLabel, r) => (
              <div key={`atk-row-wrap-${rowLabel}`} style={{ display: "contents" }}>
                <div className={styles.coordCell}>{rowLabel}</div>
                {COLS.map((colNum, c) => {
                  const key = `${r},${c}`;
                  const fired = playerShots.has(key);
                  const ship = enemyFleet.find((s) =>
                    s.coords.some(([sr, sc]) => sr === r && sc === c),
                  );
                  const isHit = fired && Boolean(ship);
                  const isSunk = isHit && ship && isShipSunk(ship, playerShots);

                  return (
                    <button
                      key={`atk-${r}-${c}`}
                      type="button"
                      disabled={placingMode || fired || gameOver}
                      onClick={() => handleFireAtEnemy(r, c)}
                      className={[
                        styles.seaCell,
                        !placingMode && !fired && !gameOver ? styles.seaCellInteractive : "",
                        isSunk ? styles.seaCellSunk : isHit ? styles.seaCellHit : "",
                        fired && !isHit ? styles.seaCellMiss : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-label={`Coordenada inimiga ${rowLabel}${colNum}${
                        isSunk
                          ? ", embarcação afundada"
                          : isHit
                            ? ", impacto confirmado"
                            : fired
                              ? ", tiro na água"
                              : ""
                      }`}
                    >
                      {fired && !isHit && <span className={styles.waterPeg} />}
                      {isHit && (
                        <svg viewBox="0 0 24 24" className={styles.hitMarker} fill="none" stroke="currentColor" strokeWidth="2.6">
                          <circle cx="12" cy="12" r="7" />
                          <line x1="5" y1="5" x2="19" y2="19" />
                          <line x1="19" y1="5" x2="5" y2="19" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Mapa da Sua Frota (Defesa) */}
        <div className={styles.radarCard}>
          <div className={styles.radarHeader}>
            <span className={styles.radarTitle}>Carta da Sua Esquadra (Defesa)</span>
            <span className={styles.radarSubtitle}>
              {placingMode && nextShipToPlace
                ? `Alocando: ${nextShipToPlace.name} (${nextShipToPlace.size} casas)`
                : "Posição dos seus navios e disparos recebidos"}
            </span>
          </div>

          <div className={styles.boardMatrix} role="grid" aria-label="Grade da sua frota 10 por 10">
            <div className={styles.coordCell} />
            {COLS.map((col) => (
              <div key={`def-col-${col}`} className={styles.coordCell}>
                {col}
              </div>
            ))}

            {ROWS.map((rowLabel, r) => (
              <div key={`def-row-wrap-${rowLabel}`} style={{ display: "contents" }}>
                <div className={styles.coordCell}>{rowLabel}</div>
                {COLS.map((colNum, c) => {
                  const key = `${r},${c}`;
                  const firedByEnemy = enemyShots.has(key);
                  const ship = playerFleet.find((s) =>
                    s.coords.some(([sr, sc]) => sr === r && sc === c),
                  );
                  const isHit = firedByEnemy && Boolean(ship);
                  const isSunk = isHit && ship && isShipSunk(ship, enemyShots);

                  return (
                    <button
                      key={`def-${r}-${c}`}
                      type="button"
                      disabled={!placingMode}
                      onClick={() => handlePlacePlayerShip(r, c)}
                      className={[
                        styles.seaCell,
                        placingMode ? styles.seaCellInteractive : "",
                        ship ? styles.seaCellShip : "",
                        isSunk ? styles.seaCellSunk : isHit ? styles.seaCellHit : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-label={`Sua coordenada ${rowLabel}${colNum}${
                        ship ? `, ${ship.name}` : ""
                      }`}
                    >
                      {firedByEnemy && !isHit && <span className={styles.waterPeg} />}
                      {isHit && (
                        <svg viewBox="0 0 24 24" className={styles.hitMarker} fill="none" stroke="currentColor" strokeWidth="2.6">
                          <circle cx="12" cy="12" r="7" />
                          <line x1="5" y1="5" x2="19" y2="19" />
                          <line x1="19" y1="5" x2="5" y2="19" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
