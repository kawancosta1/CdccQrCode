import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Camera, CheckCircle2, MapPin, Plus, Save, Trash2 } from "lucide-react";
import { ROOM_CONFIG, ROOM_IDS, type RoomId } from "../../../config/rooms.ts";
import { SHELF_OVERVIEW_IMAGES } from "../../../config/shelfImages.ts";
import { VESTIBULAR_BOOKS_SEED } from "../../../data/vestibularBooksSeed.ts";
import { getDefaultRoom, searchBooksByCode } from "../../../domain/searchParser.ts";
import { staticBookCatalogRepository } from "../../../repositories/bookCatalogRepository.ts";
import {
  deleteDynamicShelfMapping,
  deletePhotoOverride,
  getDynamicShelfMappings,
  getMarkerOverrides,
  getPhotoOverrides,
  saveDynamicShelfMapping,
  saveMarkerOverride,
  savePhotoOverride,
  type PhotoOverrideRecord,
} from "../../../services/mappingService.ts";
import { uploadCmsImage } from "../../../services/siteConfigService.ts";
import type { DynamicMarkerOverride, DynamicShelfMapping } from "../../../types/content.ts";
import { ShelfSpotlightEditor } from "../../components/ShelfSpotlightEditor/index.tsx";
import adminStyles from "../../styles/admin.module.css";
import styles from "../../styles/cms.module.css";

export default function AdminMapping() {
  const [activeSectionTab, setActiveSectionTab] = useState<"spotlight" | "mapa" | "regras">(
    "spotlight",
  );
  const [roomId, setRoomId] = useState<RoomId>(1);
  const [selectedShelf, setSelectedShelf] = useState<string>("1");
  const [overrides, setOverrides] = useState<DynamicMarkerOverride[]>([]);
  const [mappings, setMappings] = useState<DynamicShelfMapping[]>([]);
  const [newCode, setNewCode] = useState("");
  const [newShelf, setNewShelf] = useState("1");
  const [newRange, setNewRange] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [photoOverrides, setPhotoOverrides] = useState<PhotoOverrideRecord[]>([]);
  const [photoTargetType, setPhotoTargetType] = useState<"shelf" | "code">("shelf");

  const healthAudit = useMemo(() => {
    const missingOverviewPhotos: string[] = [];
    const missingMarkers: string[] = [];
    const unmappedVestibularBooks: string[] = [];

    for (const rId of ROOM_IDS) {
      const room = ROOM_CONFIG[rId];
      const imgs = SHELF_OVERVIEW_IMAGES[rId] ?? {};
      for (const shelfNum of room.shelfNumbers) {
        const key = String(shelfNum);
        if (!imgs[key]) missingOverviewPhotos.push(`${room.label} • Estante ${key}`);
        if (!room.shelfMarkers[key]) missingMarkers.push(`${room.label} • Estante ${key}`);
      }
    }

    for (const book of VESTIBULAR_BOOKS_SEED) {
      const results = searchBooksByCode(book.codigoDedalus, staticBookCatalogRepository);
      if (!getDefaultRoom(results)) {
        unmappedVestibularBooks.push(`${book.titulo} (${book.codigoDedalus})`);
      }
    }

    return { missingOverviewPhotos, missingMarkers, unmappedVestibularBooks };
  }, []);
  const [photoShelf, setPhotoShelf] = useState("1");
  const [photoCode, setPhotoCode] = useState("");
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const [photoFilter, setPhotoFilter] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadData = async () => {
    const [ov, mp, po] = await Promise.all([
      getMarkerOverrides(),
      getDynamicShelfMappings(),
      getPhotoOverrides(),
    ]);
    setOverrides(ov);
    setMappings(mp);
    setPhotoOverrides(po);
  };

  useEffect(() => {
    let active = true;
    Promise.all([getMarkerOverrides(), getDynamicShelfMappings(), getPhotoOverrides()])
      .then(([ov, mp, po]) => {
        if (active) {
          setOverrides(ov);
          setMappings(mp);
          setPhotoOverrides(po);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const room = ROOM_CONFIG[roomId];

  const getMarkerPosition = (shelfKey: string) => {
    const override = overrides.find(
      (o) => o.roomId === roomId && o.shelfKey.toUpperCase() === shelfKey.toUpperCase()
    );
    if (override) return { top: override.top, left: override.left };
    const base = room.shelfMarkers[shelfKey];
    return {
      top: base?.top ?? "50%",
      left: base?.left ?? "50%",
    };
  };

  const handleMapClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const leftPct = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1) + "%";
    const topPct = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1) + "%";

    const saved = await saveMarkerOverride({
      roomId,
      shelfKey: selectedShelf,
      top: topPct,
      left: leftPct,
    });
    setOverrides((prev) => [
      ...prev.filter((o) => !(o.roomId === roomId && o.shelfKey === selectedShelf)),
      saved,
    ]);
    setStatusMsg(
      `Posição da Estante ${selectedShelf} (${room.label}) atualizada para top: ${topPct}, left: ${leftPct}!`
    );
  };

  const handleAddMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    await saveDynamicShelfMapping({
      id: "",
      roomId,
      code: newCode.trim(),
      shelf: newShelf.trim(),
      range: newRange.trim() || `Faixa ${newCode.trim()}`,
      images: newImageUrl.trim() ? [newImageUrl.trim()] : [],
    });
    setNewCode("");
    setNewRange("");
    setNewImageUrl("");
    await loadData();
    setStatusMsg("Regra de código Dedalus/CDU salva!");
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Mapeamento Visual &amp; Localização nas Salas</h1>
          <p className={styles.subtitle}>
            Envie a foto limpa de cada estante e marque onde ficam os códigos das prateleiras, ou
            ajuste a posição das estantes no mapa da sala.
          </p>
        </div>
      </header>

      {statusMsg && <div className={adminStyles.successBanner}>{statusMsg}</div>}

      <div className={styles.tabs} role="tablist" aria-label="Módulos de mapeamento">
        <button
          type="button"
          role="tab"
          aria-selected={activeSectionTab === "spotlight"}
          className={`${styles.tab} ${activeSectionTab === "spotlight" ? styles.tabActive : ""}`}
          onClick={() => setActiveSectionTab("spotlight")}
        >
          1. Fotos e Marcação das Estantes
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeSectionTab === "mapa"}
          className={`${styles.tab} ${activeSectionTab === "mapa" ? styles.tabActive : ""}`}
          onClick={() => setActiveSectionTab("mapa")}
        >
          2. Posição das Estantes no Mapa
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeSectionTab === "regras"}
          className={`${styles.tab} ${activeSectionTab === "regras" ? styles.tabActive : ""}`}
          onClick={() => setActiveSectionTab("regras")}
        >
          3. Regras Extras &amp; Saúde do Acervo
        </button>
      </div>

      {activeSectionTab === "spotlight" && <ShelfSpotlightEditor />}

      {activeSectionTab === "mapa" && (
        <>
          <div className={styles.tabs}>
            {([1, 2, 3] as RoomId[]).map((id) => (
              <button
                key={id}
                type="button"
                className={`${styles.tab} ${roomId === id ? styles.tabActive : ""}`}
                onClick={() => {
                  setRoomId(id);
                  setSelectedShelf(String(ROOM_CONFIG[id].shelfNumbers[0] ?? "1"));
                }}
              >
                {ROOM_CONFIG[id].label}
              </button>
            ))}
          </div>

          <section className={styles.card} data-tour="mapping-3d-map">
            <h2 className={styles.cardTitle}>
              <MapPin size={18} /> Reposicionar Marcadores na Planta ({room.label})
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <span className={styles.label}>Estante selecionada para mover:</span>
              <select
                className={styles.select}
                style={{ width: "auto", minWidth: 160 }}
                value={selectedShelf}
                onChange={(e) => setSelectedShelf(e.target.value)}
              >
                {room.shelfNumbers.map((num) => (
                  <option key={num} value={String(num)}>
                    Estante {num}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: "0.82rem", color: "#475569" }}>
                Clique em qualquer ponto da planta abaixo para definir a posição do pino vermelho.
              </span>
            </div>

            <div className={styles.mapCanvasWrap} onClick={handleMapClick}>
              <img src={room.mapSrc} alt={`Planta ${room.label}`} className={styles.mapCanvasImg} />
              {room.shelfNumbers.map((num) => {
                const key = String(num);
                const pos = getMarkerPosition(key);
                const isActive = key === selectedShelf;
                return (
                  <span
                    key={key}
                    className={`${styles.mapPin} ${isActive ? styles.mapPinActive : ""}`}
                    style={{ top: pos.top, left: pos.left }}
                  >
                    {key}
                  </span>
                );
              })}
            </div>
          </section>
        </>
      )}

      {activeSectionTab === "regras" && (
        <>

      <div className={styles.grid2}>
        <form className={styles.card} onSubmit={handleAddMapping}>
          <h2 className={styles.cardTitle}>
            <Plus size={18} /> Nova Regra CDU → Estante ({room.label})
          </h2>
          <div className={styles.grid2}>
            <label className={styles.field}>
              <span className={styles.label}>Código CDU / Prefixo</span>
              <input
                required
                className={styles.input}
                placeholder="Ex: 530.12 ou 869.93"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Estante</span>
              <input
                required
                className={styles.input}
                placeholder="Ex: 17"
                value={newShelf}
                onChange={(e) => setNewShelf(e.target.value)}
              />
            </label>
          </div>
          <label className={styles.field}>
            <span className={styles.label}>Descrição / Faixa da Estante</span>
            <input
              className={styles.input}
              placeholder="Ex: 530.1 a 530.9 — Física Moderna"
              value={newRange}
              onChange={(e) => setNewRange(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Foto da Estante (URL ou upload WebP)</span>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className={styles.input}
                placeholder="https://..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await uploadCmsImage(file, `shelves/sala-${roomId}`);
                  setNewImageUrl(url);
                }}
              />
            </div>
          </label>
          <button type="submit" className={styles.primaryBtn}>
            <Save size={15} /> Adicionar Regra
          </button>
        </form>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Regras Customizadas Ativas ({mappings.length})</h2>
          {mappings.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "0.88rem" }}>
              Nenhuma regra customizada cadastrada. O portal usa o catálogo estático padrão.
            </p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Sala</th>
                    <th>Código</th>
                    <th>Estante</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {mappings.map((m) => (
                    <tr key={m.id}>
                      <td>Sala {m.roomId}</td>
                      <td>
                        <code>{m.code}</code>
                      </td>
                      <td>Estante {m.shelf}</td>
                      <td>
                        <button
                          type="button"
                          className={styles.dangerBtn}
                          onClick={async () => {
                            await deleteDynamicShelfMapping(m.id);
                            await loadData();
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Troca Rápida de Foto por Estante ou Código/Número CDU */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          <Camera size={18} /> Troca Rápida de Foto por Estante ou Código/Número CDU
        </h2>
        <p style={{ margin: 0, fontSize: "0.86rem", color: "#475569" }}>
          Substitua a foto geral de uma estante (ex.: Sala 1 - Estante 17) ou defina uma foto
          específica para um código exato (ex.: <code>530</code>, <code>869.3 C500</code>,{" "}
          <code>R</code>). Se o código não tiver foto própria, o sistema usa a foto da estante.
        </p>

        <div className={styles.grid2}>
          <form
            className={styles.subBox}
            onSubmit={async (e) => {
              e.preventDefault();
              if (!photoUrlInput.trim()) return;
              await savePhotoOverride({
                id: "",
                targetType: photoTargetType,
                roomId: photoTargetType === "shelf" ? roomId : undefined,
                shelfKey: photoTargetType === "shelf" ? photoShelf : undefined,
                codeKey: photoTargetType === "code" ? photoCode.trim().toUpperCase() : undefined,
                imageUrl: photoUrlInput.trim(),
              });
              setPhotoUrlInput("");
              setPhotoCode("");
              await loadData();
              setStatusMsg("Foto específica salva e aplicada imediatamente!");
            }}
          >
            <div className={styles.tabs}>
              <button
                type="button"
                className={`${styles.tab} ${photoTargetType === "shelf" ? styles.tabActive : ""}`}
                onClick={() => setPhotoTargetType("shelf")}
              >
                Por Estante ({room.label})
              </button>
              <button
                type="button"
                className={`${styles.tab} ${photoTargetType === "code" ? styles.tabActive : ""}`}
                onClick={() => setPhotoTargetType("code")}
              >
                Por Código/Número Específico
              </button>
            </div>

            {photoTargetType === "shelf" ? (
              <label className={styles.field}>
                <span className={styles.label}>Estante ({room.label})</span>
                <select
                  className={styles.select}
                  value={photoShelf}
                  onChange={(e) => setPhotoShelf(e.target.value)}
                >
                  {room.shelfNumbers.map((num) => (
                    <option key={num} value={String(num)}>
                      Estante {num}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label className={styles.field}>
                <span className={styles.label}>Código CDU / Dedalus exato</span>
                <input
                  required
                  className={styles.input}
                  placeholder="Ex: 530, 869.3 C500, R"
                  value={photoCode}
                  onChange={(e) => setPhotoCode(e.target.value)}
                />
              </label>
            )}

            <label className={styles.field}>
              <span className={styles.label}>Foto (Upload WebP ou URL)</span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input
                  required
                  className={styles.input}
                  placeholder="https://... ou envie um arquivo abaixo"
                  value={photoUrlInput}
                  onChange={(e) => setPhotoUrlInput(e.target.value)}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadCmsImage(file, "shelf-overrides");
                    setPhotoUrlInput(url);
                  }}
                />
              </div>
            </label>

            <button type="submit" className={styles.primaryBtn}>
              <Save size={15} /> Salvar Foto Customizada
            </button>
          </form>

          <div className={styles.subBox}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <strong>Fotos Customizadas ({photoOverrides.length})</strong>
              <input
                type="search"
                className={styles.input}
                style={{ maxWidth: 200 }}
                placeholder="Filtrar estante ou código..."
                value={photoFilter}
                onChange={(e) => setPhotoFilter(e.target.value)}
              />
            </div>

            {photoOverrides.length === 0 ? (
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                Nenhuma foto sobrescrita ainda.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
                {photoOverrides
                  .filter((o) => {
                    const q = photoFilter.trim().toLowerCase();
                    if (!q) return true;
                    return (
                      (o.codeKey ?? "").toLowerCase().includes(q) ||
                      (o.shelfKey ?? "").toLowerCase().includes(q) ||
                      `sala ${o.roomId ?? ""}`.includes(q)
                    );
                  })
                  .map((o) => (
                    <div
                      key={o.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        background: "#ffffff",
                        padding: "0.5rem 0.75rem",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <img
                          src={o.imageUrl}
                          alt={o.id}
                          style={{ width: 48, height: 36, objectFit: "cover", borderRadius: 4 }}
                        />
                        <div>
                          <strong style={{ fontSize: "0.85rem" }}>
                            {o.targetType === "shelf"
                              ? `Sala ${o.roomId} • Estante ${o.shelfKey}`
                              : `Código ${o.codeKey}`}
                          </strong>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={styles.dangerBtn}
                        onClick={async () => {
                          await deletePhotoOverride(o.id);
                          await loadData();
                          setStatusMsg("Foto original restaurada!");
                        }}
                      >
                        Restaurar Original
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>
          Auditoria Automática de Saúde do Acervo & Fotos
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "0.9rem",
          }}
        >
          <div className={styles.listRow} style={{ flexDirection: "column", alignItems: "flex-start" }}>
            <strong>
              {healthAudit.missingOverviewPhotos.length === 0 ? (
                <CheckCircle2 size={14} style={{ color: "#16a34a" }} />
              ) : (
                <AlertTriangle size={14} style={{ color: "#d97706" }} />
              )}{" "}
              Fotos gerais de estantes
            </strong>
            <span className={styles.mutedSmall}>
              {healthAudit.missingOverviewPhotos.length === 0
                ? "Todas as estantes configuradas possuem foto."
                : `${healthAudit.missingOverviewPhotos.length} sem foto: ${healthAudit.missingOverviewPhotos.slice(0, 4).join(", ")}`}
            </span>
          </div>

          <div className={styles.listRow} style={{ flexDirection: "column", alignItems: "flex-start" }}>
            <strong>
              {healthAudit.missingMarkers.length === 0 ? (
                <CheckCircle2 size={14} style={{ color: "#16a34a" }} />
              ) : (
                <AlertTriangle size={14} style={{ color: "#d97706" }} />
              )}{" "}
              Marcadores no mapa
            </strong>
            <span className={styles.mutedSmall}>
              {healthAudit.missingMarkers.length === 0
                ? "Todas as estantes estão marcadas nos mapas."
                : `${healthAudit.missingMarkers.length} sem pino: ${healthAudit.missingMarkers.slice(0, 4).join(", ")}`}
            </span>
          </div>

          <div className={styles.listRow} style={{ flexDirection: "column", alignItems: "flex-start" }}>
            <strong>
              {healthAudit.unmappedVestibularBooks.length === 0 ? (
                <CheckCircle2 size={14} style={{ color: "#16a34a" }} />
              ) : (
                <AlertTriangle size={14} style={{ color: "#d97706" }} />
              )}{" "}
              Livros do Vestibular no índice
            </strong>
            <span className={styles.mutedSmall}>
              {healthAudit.unmappedVestibularBooks.length === 0
                ? "Todos os códigos do Vestibular resolvem para uma estante."
                : `${healthAudit.unmappedVestibularBooks.length} sem estante: ${healthAudit.unmappedVestibularBooks.slice(0, 3).join(", ")}`}
            </span>
          </div>
        </div>
      </section>
        </>
      )}
    </div>
  );
}
