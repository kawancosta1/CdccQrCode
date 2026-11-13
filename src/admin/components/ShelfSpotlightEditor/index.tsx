import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import {
  CheckCircle2,
  Eye,
  Grid,
  Magnet,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { ShelfSpotlightViewer } from "../../../components/ShelfSpotlightViewer/index.tsx";
import { ROOM_CONFIG, ROOM_IDS, type RoomId } from "../../../config/rooms.ts";
import { SHELF_OVERVIEW_IMAGES } from "../../../config/shelfImages.ts";
import {
  imageDatabaseSala1,
  imageDatabaseSala2,
  imageDatabaseSala3,
  type ImageData,
} from "../../../data/index.ts";
import {
  buildShelfId,
  getAllShelfMappings,
  saveShelfMapping,
  uploadCleanShelfPhoto,
} from "../../../services/shelfSpotlightService.ts";
import type { ShelfMapping, ShelfRegion } from "../../../types/shelfMapping.ts";
import style from "./style.module.css";

const ROOM_DATABASES: Record<RoomId, Record<string, ImageData>> = {
  1: imageDatabaseSala1,
  2: imageDatabaseSala2,
  3: imageDatabaseSala3,
};

type HandleKind = "move" | "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function getCodesForShelf(roomId: RoomId, shelfNumber: number): string[] {
  const db = ROOM_DATABASES[roomId] ?? {};
  const list: string[] = [];
  for (const [code, data] of Object.entries(db)) {
    const m = data.shelf.match(/\d+/);
    if (m && Number(m[0]) === shelfNumber) {
      list.push(code);
    }
  }
  return list.sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));
}

function buildEqualDividers(count: number): number[] {
  const divs: number[] = [];
  for (let i = 1; i < count; i++) {
    divs.push(Number(((i / count) * 100).toFixed(1)));
  }
  return divs;
}

export function ShelfSpotlightEditor() {
  const [allMappings, setAllMappings] = useState<Record<string, ShelfMapping>>({});
  const [roomId, setRoomId] = useState<RoomId>(1);
  const [shelfNumber, setShelfNumber] = useState<number>(1);
  const [onlyPending, setOnlyPending] = useState(false);
  const [useLegacyAsBase, setUseLegacyAsBase] = useState(false);

  const [selectedCode, setSelectedCode] = useState<string>(
    () => getCodesForShelf(1, 1)[0] ?? "",
  );
  const [customCodeInput, setCustomCodeInput] = useState<string>("");
  const [activeRow, setActiveRow] = useState<number>(1);
  const [snapEnabled, setSnapEnabled] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const [draftMapping, setDraftMapping] = useState<ShelfMapping>(() => ({
    shelfId: buildShelfId(1, 1),
    roomId: 1,
    shelfNumber: 1,
    dividers: buildEqualDividers(5),
    regions: {},
  }));

  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragDividerIdxRef = useRef<number | null>(null);
  const dragBoxRef = useRef<{
    code: string;
    handle: HandleKind;
    startX: number;
    startY: number;
    initial: ShelfRegion;
  } | null>(null);

  useEffect(() => {
    let active = true;
    getAllShelfMappings()
      .then((map) => {
        if (!active) return;
        setAllMappings(map);
        const firstClean = Object.values(map).find((item) => Boolean(item.cleanImageUrl));
        const targetRoom = firstClean?.roomId ?? 1;
        const targetShelf = firstClean?.shelfNumber ?? 1;
        const initial = map[buildShelfId(targetRoom, targetShelf)];
        setRoomId(targetRoom);
        setShelfNumber(targetShelf);
        setSelectedCode(getCodesForShelf(targetRoom, targetShelf)[0] ?? "");
        if (initial) {
          setDraftMapping({
            ...initial,
            dividers: initial.dividers?.length ? initial.dividers : buildEqualDividers(5),
          });
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleSelectRoomOrShelf = (nextRoom: RoomId, nextShelf: number) => {
    setRoomId(nextRoom);
    setShelfNumber(nextShelf);
    setUseLegacyAsBase(false);
    const id = buildShelfId(nextRoom, nextShelf);
    const existing = allMappings[id];
    setDraftMapping(
      existing
        ? {
            ...existing,
            dividers: existing.dividers?.length ? existing.dividers : buildEqualDividers(5),
          }
        : {
            shelfId: id,
            roomId: nextRoom,
            shelfNumber: nextShelf,
            dividers: buildEqualDividers(5),
            regions: {},
          },
    );
    const codes = getCodesForShelf(nextRoom, nextShelf);
    setSelectedCode(codes[0] ?? "");
    setStatusMessage("");
  };

  const shelfCodes = useMemo(() => {
    const base = getCodesForShelf(roomId, shelfNumber);
    const extra = Object.keys(draftMapping.regions ?? {});
    return Array.from(new Set([...base, ...extra]));
  }, [draftMapping.regions, roomId, shelfNumber]);

  const progressStats = useMemo(() => {
    let totalShelves = 0;
    let shelvesWithCleanPhoto = 0;
    let totalCodes = 0;
    let mappedCodes = 0;

    for (const rId of ROOM_IDS) {
      for (const sNum of ROOM_CONFIG[rId].shelfNumbers) {
        totalShelves += 1;
        const id = buildShelfId(rId, sNum);
        const m = allMappings[id];
        if (m?.cleanImageUrl) shelvesWithCleanPhoto += 1;
        const codes = getCodesForShelf(rId, sNum);
        totalCodes += codes.length;
        for (const c of codes) {
          if (m?.regions?.[c]) mappedCodes += 1;
        }
      }
    }
    return { totalShelves, shelvesWithCleanPhoto, totalCodes, mappedCodes };
  }, [allMappings]);

  const visibleShelvesForRoom = useMemo(() => {
    const allNums = ROOM_CONFIG[roomId].shelfNumbers;
    if (!onlyPending) return allNums;
    return allNums.filter((n) => {
      const m = allMappings[buildShelfId(roomId, n)];
      return !m?.cleanImageUrl;
    });
  }, [allMappings, onlyPending, roomId]);

  const dividers = draftMapping.dividers ?? buildEqualDividers(5);
  const shelfRowsCount = dividers.length + 1;

  const rowBounds = useMemo(() => {
    const pts = [0, ...dividers, 100];
    return Array.from({ length: pts.length - 1 }, (_, idx) => ({
      row: idx + 1,
      top: pts[idx],
      bottom: pts[idx + 1],
      height: Number((pts[idx + 1] - pts[idx]).toFixed(1)),
    }));
  }, [dividers]);

  const legacyPhotoUrl = SHELF_OVERVIEW_IMAGES[roomId]?.[String(shelfNumber)] || "";
  const activePhotoUrl = draftMapping.cleanImageUrl || (useLegacyAsBase ? legacyPhotoUrl : "");

  const handleUploadCleanPhoto = async (file: File) => {
    setUploading(true);
    setStatusMessage("Comprimindo foto para WebP (max 1600px)...");
    try {
      const { url, aspectRatio } = await uploadCleanShelfPhoto(roomId, shelfNumber, file);
      setDraftMapping((prev) => ({
        ...prev,
        cleanImageUrl: url,
        imageAspectRatio: aspectRatio,
      }));
      setStatusMessage("Foto limpa carregada e comprimida em WebP!");
    } catch {
      setStatusMessage("Erro ao processar a foto.");
    } finally {
      setUploading(false);
    }
  };

  const applySlotPreset = (x: number, w: number) => {
    const targetCode = selectedCode || customCodeInput.trim();
    if (!targetCode) {
      setStatusMessage("Selecione ou digite um código CDU antes de aplicar o slot.");
      return;
    }
    const bound = rowBounds[clamp(activeRow - 1, 0, rowBounds.length - 1)];
    const region: ShelfRegion = {
      x: Number(x.toFixed(1)),
      y: Number(bound.top.toFixed(1)),
      w: Number(w.toFixed(1)),
      h: Number(bound.height.toFixed(1)),
      shelfRow: bound.row,
      label: targetCode,
    };
    setDraftMapping((prev) => ({
      ...prev,
      regions: { ...prev.regions, [targetCode]: region },
    }));
    setSelectedCode(targetCode);
    setStatusMessage(`Slot aplicado para ${targetCode} na Prateleira ${bound.row}.`);
  };

  const handleStagePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const px = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
    const py = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);

    if (dragDividerIdxRef.current !== null) {
      const idx = dragDividerIdxRef.current;
      const minY = idx === 0 ? 6 : dividers[idx - 1] + 5;
      const maxY = idx === dividers.length - 1 ? 94 : dividers[idx + 1] - 5;
      const nextY = Number(clamp(py, minY, maxY).toFixed(1));
      setDraftMapping((prev) => {
        const nextDivs = [...(prev.dividers ?? [])];
        nextDivs[idx] = nextY;
        return { ...prev, dividers: nextDivs };
      });
      return;
    }

    if (dragBoxRef.current) {
      const { code, handle, startX, startY, initial } = dragBoxRef.current;
      const dx = px - startX;
      const dy = py - startY;
      let { x, y, w, h } = initial;

      const maybeSnapY = (val: number) => {
        if (!snapEnabled) return val;
        for (const d of [0, ...dividers, 100]) {
          if (Math.abs(val - d) < 2.2) return d;
        }
        return val;
      };

      if (handle === "move") {
        x = clamp(initial.x + dx, 0, 100 - w);
        y = maybeSnapY(clamp(initial.y + dy, 0, 100 - h));
      } else {
        if (handle.includes("w")) {
          const newX = clamp(initial.x + dx, 0, initial.x + initial.w - 4);
          w = initial.w + (initial.x - newX);
          x = newX;
        }
        if (handle.includes("e")) {
          w = clamp(initial.w + dx, 4, 100 - initial.x);
        }
        if (handle.includes("n")) {
          const newY = maybeSnapY(clamp(initial.y + dy, 0, initial.y + initial.h - 4));
          h = initial.h + (initial.y - newY);
          y = newY;
        }
        if (handle.includes("s")) {
          const bottom = maybeSnapY(clamp(initial.y + initial.h + dy, initial.y + 4, 100));
          h = bottom - initial.y;
        }
      }

      setDraftMapping((prev) => ({
        ...prev,
        regions: {
          ...prev.regions,
          [code]: {
            ...prev.regions[code],
            x: Number(x.toFixed(1)),
            y: Number(y.toFixed(1)),
            w: Number(w.toFixed(1)),
            h: Number(h.toFixed(1)),
          },
        },
      }));
    }
  };

  const handleStagePointerUp = () => {
    dragDividerIdxRef.current = null;
    dragBoxRef.current = null;
  };

  const startBoxDrag = (e: PointerEvent, code: string, handle: HandleKind) => {
    e.stopPropagation();
    const stage = stageRef.current;
    const region = draftMapping.regions[code];
    if (!stage || !region) return;
    const rect = stage.getBoundingClientRect();
    dragBoxRef.current = {
      code,
      handle,
      startX: clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100),
      startY: clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100),
      initial: { ...region },
    };
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await saveShelfMapping(draftMapping);
      setAllMappings((prev) => ({ ...prev, [saved.shelfId]: saved }));
      setStatusMessage("Mapeamento Spotlight salvo no Firestore!");
    } catch {
      setStatusMessage("Salvo localmente (verifique conexão Firestore).");
    } finally {
      setSaving(false);
    }
  };

  const activeRegion = selectedCode ? draftMapping.regions[selectedCode] : undefined;

  return (
    <section className={style.editorCard}>
      {/* Barra de Progresso do Acervo */}
      <div className={style.progressHeader} data-tour="mapping-spotlight-progress">
        <div>
          <h2 className={style.editorTitle}>Editor Visual Spotlight (Foto Única Limpa)</h2>
          <p className={style.editorSubtitle}>
            <strong>
              {progressStats.shelvesWithCleanPhoto}/{progressStats.totalShelves}
            </strong>{" "}
            estantes com foto limpa •{" "}
            <strong>
              {progressStats.mappedCodes}/{progressStats.totalCodes}
            </strong>{" "}
            códigos mapeados
          </p>
        </div>
        <label className={style.pendingToggle}>
          <input
            type="checkbox"
            checked={onlyPending}
            onChange={(e) => setOnlyPending(e.target.checked)}
          />
          Mostrar apenas pendentes
        </label>
      </div>

      {/* Seletor de Sala e Estante */}
      <div className={style.selectorRow} data-tour="mapping-spotlight-selector">
        <label className={style.inlineField}>
          <span>Sala</span>
          <select
            value={roomId}
            onChange={(e) => {
              const nextR = Number(e.target.value) as RoomId;
              handleSelectRoomOrShelf(nextR, ROOM_CONFIG[nextR].shelfNumbers[0] ?? 1);
            }}
          >
            {ROOM_IDS.map((id) => (
              <option key={id} value={id}>
                {ROOM_CONFIG[id].label}
              </option>
            ))}
          </select>
        </label>

        <label className={style.inlineField}>
          <span>Estante</span>
          <select
            value={shelfNumber}
            onChange={(e) => handleSelectRoomOrShelf(roomId, Number(e.target.value))}
          >
            {visibleShelvesForRoom.map((n) => (
              <option key={n} value={n}>
                Estante {n}{" "}
                {allMappings[buildShelfId(roomId, n)]?.cleanImageUrl ? "✓" : "(pendente)"}
              </option>
            ))}
          </select>
        </label>

        <label className={style.uploadBtn}>
          <Upload size={15} />
          {uploading ? "Comprimindo..." : "Subir Foto Limpa (Auto WebP)"}
          <input
            type="file"
            accept="image/*"
            hidden
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleUploadCleanPhoto(file);
            }}
          />
        </label>

        <div data-tour="mapping-spotlight-actions" style={{ display: "inline-flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className={style.previewBtn}
            disabled={!activePhotoUrl}
            onClick={() => setPreviewOpen(true)}
          >
            <Eye size={15} />
            Testar como Aluno
          </button>

          <button
            type="button"
            className={style.saveBtn}
            disabled={saving}
            onClick={handleSave}
          >
            <Save size={15} />
            {saving ? "Salvando..." : "Salvar Estante"}
          </button>
        </div>
      </div>

      {statusMessage && <p className={style.statusBar}>{statusMessage}</p>}

      <div className={style.workspaceGrid}>
        {/* Sidebar de Códigos e Presets */}
        <aside className={style.sidebar} data-tour="mapping-spotlight-presets">
          <div className={style.sideBlock}>
            <span className={style.sideLabel}>1. Quantas prateleiras tem a estante?</span>
            <div className={style.shelfCountBtns}>
              {[4, 5, 6, 7].map((count) => (
                <button
                  key={count}
                  type="button"
                  className={`${style.miniBtn} ${
                    shelfRowsCount === count ? style.miniBtnActive : ""
                  }`}
                  onClick={() =>
                    setDraftMapping((prev) => ({
                      ...prev,
                      dividers: buildEqualDividers(count),
                    }))
                  }
                >
                  <Grid size={12} /> {count} prat.
                </button>
              ))}
            </div>
            <button
              type="button"
              className={`${style.miniBtn} ${snapEnabled ? style.miniBtnActive : ""}`}
              onClick={() => setSnapEnabled((s) => !s)}
              style={{ marginTop: "0.35rem" }}
            >
              <Magnet size={12} /> Snap magnético: {snapEnabled ? "ON" : "OFF"}
            </button>
          </div>

          <div className={style.sideBlock}>
            <span className={style.sideLabel}>2. Código/assunto para marcar (Estante {shelfNumber})</span>
            <div className={style.codeList}>
              {shelfCodes.map((code) => {
                const mapped = Boolean(draftMapping.regions[code]);
                return (
                  <button
                    key={code}
                    type="button"
                    className={`${style.codeBtn} ${
                      selectedCode === code ? style.codeBtnActive : ""
                    }`}
                    onClick={() => setSelectedCode(code)}
                  >
                    <span>{code}</span>
                    {mapped && <CheckCircle2 size={13} className={style.mappedIcon} />}
                  </button>
                );
              })}
            </div>

            <div className={style.customCodeRow}>
              <input
                type="text"
                placeholder="Outro código CDU..."
                value={customCodeInput}
                onChange={(e) => setCustomCodeInput(e.target.value)}
              />
              <button
                type="button"
                className={style.miniBtn}
                onClick={() => {
                  if (!customCodeInput.trim()) return;
                  setSelectedCode(customCodeInput.trim());
                  setCustomCodeInput("");
                }}
              >
                Usar
              </button>
            </div>
          </div>

          <div className={style.sideBlock}>
            <span className={style.sideLabel}>3. Slot Rápido (1 Clique)</span>
            <div className={style.rowPickers}>
              {rowBounds.map((b) => (
                <button
                  key={b.row}
                  type="button"
                  className={`${style.miniBtn} ${activeRow === b.row ? style.miniBtnActive : ""}`}
                  onClick={() => setActiveRow(b.row)}
                >
                  P{b.row}
                </button>
              ))}
            </div>
            <div className={style.presetGrid}>
              <button type="button" className={style.presetBtn} onClick={() => applySlotPreset(2, 96)}>
                Linha Inteira
              </button>
              <button type="button" className={style.presetBtn} onClick={() => applySlotPreset(2, 47)}>
                Esq (1/2)
              </button>
              <button type="button" className={style.presetBtn} onClick={() => applySlotPreset(51, 47)}>
                Dir (1/2)
              </button>
              <button type="button" className={style.presetBtn} onClick={() => applySlotPreset(2, 31)}>
                Terço Esq
              </button>
              <button type="button" className={style.presetBtn} onClick={() => applySlotPreset(34.5, 31)}>
                Meio
              </button>
              <button type="button" className={style.presetBtn} onClick={() => applySlotPreset(67, 31)}>
                Terço Dir
              </button>
            </div>

            {activeRegion && selectedCode && (
              <button
                type="button"
                className={style.removeRegionBtn}
                onClick={() =>
                  setDraftMapping((prev) => {
                    const next = { ...prev.regions };
                    delete next[selectedCode];
                    return { ...prev, regions: next };
                  })
                }
              >
                <Trash2 size={13} /> Remover marcação de {selectedCode}
              </button>
            )}
          </div>

          <label className={style.sideBlock}>
            <span className={style.sideLabel}>Orientação espacial (Bentinho)</span>
            <input
              type="text"
              className={style.hintInput}
              value={draftMapping.spatialHint ?? ""}
              onChange={(e) =>
                setDraftMapping((prev) => ({ ...prev, spatialHint: e.target.value }))
              }
              placeholder="Ex: Corredor 2, lado direito..."
            />
          </label>
        </aside>

        {/* Palco Visual Interativo */}
        <div className={style.canvasArea} data-tour="mapping-spotlight-canvas">
          {activePhotoUrl ? (
            <div
              ref={stageRef}
              className={style.editorStage}
              onPointerMove={handleStagePointerMove}
              onPointerUp={handleStagePointerUp}
              onPointerLeave={handleStagePointerUp}
            >
              <img
                src={activePhotoUrl}
                alt={`Estante ${shelfNumber}`}
                className={style.stageImg}
                draggable={false}
              />

              {/* Divisórias horizontais arrastáveis */}
              {dividers.map((yPct, idx) => (
                <div
                  key={idx}
                  className={style.dividerLine}
                  style={{ top: `${yPct}%` }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    dragDividerIdxRef.current = idx;
                  }}
                  title={`Arraste para ajustar divisória entre P${idx + 1} e P${idx + 2}`}
                >
                  <span className={style.dividerBadge}>
                    P{idx + 1} / P{idx + 2}
                  </span>
                </div>
              ))}

              {/* Regiões mapeadas */}
              {Object.entries(draftMapping.regions).map(([code, reg]) => {
                const isActive = selectedCode === code;
                return (
                  <div
                    key={code}
                    className={`${style.regionBox} ${isActive ? style.regionBoxActive : ""}`}
                    style={{
                      left: `${reg.x}%`,
                      top: `${reg.y}%`,
                      width: `${reg.w}%`,
                      height: `${reg.h}%`,
                    }}
                    onPointerDown={(e) => {
                      setSelectedCode(code);
                      startBoxDrag(e, code, "move");
                    }}
                  >
                    <span className={style.regionLabel}>{code}</span>
                    {isActive &&
                      (["nw", "n", "ne", "e", "se", "s", "sw", "w"] as HandleKind[]).map((h) => (
                        <span
                          key={h}
                          className={`${style.handle} ${style[`handle_${h}`]}`}
                          onPointerDown={(e) => startBoxDrag(e, code, h)}
                        />
                      ))}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={style.noPhotoBox}>
              <Upload size={28} aria-hidden="true" />
              <h3 className={style.noPhotoTitle}>
                Envie a foto da Estante {shelfNumber} ({ROOM_CONFIG[roomId].label})
              </h3>
              <p className={style.noPhotoDesc}>
                Tire uma foto frontal da estante inteira (sem marcações desenhadas ou cartaz de QR Code).
                O sistema comprime automaticamente e libera a marcação por prateleira na hora.
              </p>
              <label className={style.noPhotoUploadBtn}>
                <Upload size={16} aria-hidden="true" />
                {uploading ? "Comprimindo foto..." : "Escolher Foto da Estante (Auto WebP)"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleUploadCleanPhoto(file);
                  }}
                />
              </label>
              {legacyPhotoUrl && (
                <button
                  type="button"
                  className={style.legacyBaseBtn}
                  onClick={() => setUseLegacyAsBase(true)}
                >
                  Ou visualizar/usar foto antiga cadastrada como base temporária
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal "Testar como Aluno" */}
      {previewOpen && activePhotoUrl && (
        <div
          className={style.previewBackdrop}
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewOpen(false);
          }}
        >
          <div className={style.previewDialog}>
            <div className={style.previewHeader}>
              <strong>
                Preview do Aluno — Estante {shelfNumber} ({selectedCode || "Visão Geral"})
              </strong>
              <button
                type="button"
                className={style.closePreviewBtn}
                onClick={() => setPreviewOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
            <ShelfSpotlightViewer
              imageUrl={activePhotoUrl}
              alt={`Preview Estante ${shelfNumber}`}
              shelfLabel={`Estante ${shelfNumber}`}
              activeCode={selectedCode || undefined}
              regions={draftMapping.regions}
              spatialHint={draftMapping.spatialHint}
              aspectRatio={draftMapping.imageAspectRatio}
            />
          </div>
        </div>
      )}
    </section>
  );
}
