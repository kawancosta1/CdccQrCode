import { useEffect, useState } from "react";
import { MapPin, Plus, Save, Trash2 } from "lucide-react";
import { ROOM_CONFIG, type RoomId } from "../../../config/rooms.ts";
import {
  deleteDynamicShelfMapping,
  getDynamicShelfMappings,
  getMarkerOverrides,
  saveDynamicShelfMapping,
  saveMarkerOverride,
} from "../../../services/mappingService.ts";
import { uploadCmsImage } from "../../../services/siteConfigService.ts";
import type { DynamicMarkerOverride, DynamicShelfMapping } from "../../../types/content.ts";
import adminStyles from "../../styles/admin.module.css";
import styles from "../../styles/cms.module.css";

export default function AdminMapping() {
  const [roomId, setRoomId] = useState<RoomId>(1);
  const [selectedShelf, setSelectedShelf] = useState<string>("1");
  const [overrides, setOverrides] = useState<DynamicMarkerOverride[]>([]);
  const [mappings, setMappings] = useState<DynamicShelfMapping[]>([]);
  const [newCode, setNewCode] = useState("");
  const [newShelf, setNewShelf] = useState("1");
  const [newRange, setNewRange] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadData = async () => {
    const [ov, mp] = await Promise.all([getMarkerOverrides(), getDynamicShelfMappings()]);
    setOverrides(ov);
    setMappings(mp);
  };

  useEffect(() => {
    let active = true;
    Promise.all([getMarkerOverrides(), getDynamicShelfMappings()])
      .then(([ov, mp]) => {
        if (active) {
          setOverrides(ov);
          setMappings(mp);
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
          <h1 className={styles.title}>Regras de Busca Dedalus &amp; Mapa Click-to-Place</h1>
          <p className={styles.subtitle}>
            Clique na planta baixa para reposicionar marcadores de estantes ou cadastre faixas de
            código CDU customizadas.
          </p>
        </div>
      </header>

      {statusMsg && <div className={adminStyles.successBanner}>{statusMsg}</div>}

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

      <section className={styles.card}>
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
    </div>
  );
}
