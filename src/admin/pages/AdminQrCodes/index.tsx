import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Download, Printer, QrCode } from "lucide-react";
import { ROOM_CONFIG, type RoomId } from "../../../config/rooms.ts";
import styles from "../../styles/cms.module.css";

interface QrEntry {
  id: string;
  label: string;
  subtitle: string;
  targetUrl: string;
  dataUrl: string;
  svgText: string;
}

export default function AdminQrCodes() {
  const [mode, setMode] = useState<"estantes" | "custom">("estantes");
  const [roomId, setRoomId] = useState<RoomId>(1);
  const [customTitle, setCustomTitle] = useState("Leituras do Vestibular");
  const [customPath, setCustomPath] = useState("/#/vestibular");
  const [entries, setEntries] = useState<QrEntry[]>([]);

  const baseOrigin = useMemo(() => {
    const cleanPath = window.location.pathname.replace(/\/$/, "");
    return `${window.location.origin}${cleanPath}`;
  }, []);

  useEffect(() => {
    let active = true;
    const build = async () => {
      const targets: Array<{ id: string; label: string; subtitle: string; targetUrl: string }> =
        mode === "estantes"
          ? ROOM_CONFIG[roomId].shelfNumbers.map((shelf) => ({
              id: `sala-${roomId}-estante-${shelf}`,
              label: `${ROOM_CONFIG[roomId].label} • Estante ${shelf}`,
              subtitle: `Escaneie para localizar livros na Estante ${shelf}`,
              targetUrl: `${baseOrigin}/#/estantes/${ROOM_CONFIG[roomId].slug}/${shelf}`,
            }))
          : [
              {
                id: "custom-qr",
                label: customTitle || "Portal Biblioteca CDCC",
                subtitle: "Escaneie com a câmera do celular",
                targetUrl: customPath.startsWith("http")
                  ? customPath
                  : `${baseOrigin}${customPath.startsWith("/") ? customPath : `/${customPath}`}`,
              },
            ];

      const generated = await Promise.all(
        targets.map(async (item) => {
          const [dataUrl, svgText] = await Promise.all([
            QRCode.toDataURL(item.targetUrl, { width: 320, margin: 2 }),
            QRCode.toString(item.targetUrl, { type: "svg", margin: 2 }),
          ]);
          return { ...item, dataUrl, svgText };
        })
      );
      if (active) setEntries(generated);
    };
    void build();
    return () => {
      active = false;
    };
  }, [mode, roomId, customTitle, customPath, baseOrigin]);

  const downloadFile = (content: string, filename: string, isDataUrl = false) => {
    const a = document.createElement("a");
    if (isDataUrl) {
      a.href = content;
    } else {
      const blob = new Blob([content], { type: "image/svg+xml;charset=utf-8" });
      a.href = URL.createObjectURL(blob);
    }
    a.download = filename;
    a.click();
  };

  return (
    <div className={styles.page}>
      <header className={`${styles.header} ${styles.noPrint}`}>
        <div>
          <h1 className={styles.title}>Gerador de QR Codes para Estantes &amp; Totens</h1>
          <p className={styles.subtitle}>
            Gere QR Codes individuais ou em lote por sala, baixe em PNG/SVG ou imprima em folha A4
            com moldura CDCC.
          </p>
        </div>
        <button type="button" className={styles.primaryBtn} onClick={() => window.print()}>
          <Printer size={16} /> Imprimir Lote A4 / PDF
        </button>
      </header>

      <section className={`${styles.card} ${styles.noPrint}`}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${mode === "estantes" ? styles.tabActive : ""}`}
            onClick={() => setMode("estantes")}
          >
            <QrCode size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
            Lote por Sala / Estantes
          </button>
          <button
            type="button"
            className={`${styles.tab} ${mode === "custom" ? styles.tabActive : ""}`}
            onClick={() => setMode("custom")}
          >
            QR Code Personalizado (Código CDU / Vestibular)
          </button>
        </div>

        {mode === "estantes" ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {([1, 2, 3] as RoomId[]).map((id) => (
              <button
                key={id}
                type="button"
                className={`${styles.tab} ${roomId === id ? styles.tabActive : ""}`}
                onClick={() => setRoomId(id)}
              >
                {ROOM_CONFIG[id].label} ({ROOM_CONFIG[id].shelfNumbers.length} estantes)
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.grid2}>
            <label className={styles.field}>
              <span className={styles.label}>Título da Plaquinha</span>
              <input
                className={styles.input}
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Destino (ex: /#/vestibular ou /#/?q=530)</span>
              <input
                className={styles.input}
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
              />
            </label>
          </div>
        )}
      </section>

      <section className={styles.qrGrid}>
        {entries.map((item) => (
          <article key={item.id} className={styles.qrCard}>
            <div className={styles.qrFrameTitle}>Biblioteca CDCC • USP</div>
            {item.dataUrl && (
              <img
                src={item.dataUrl}
                alt={`QR Code para ${item.label}`}
                style={{ width: 168, height: 168 }}
              />
            )}
            <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{item.label}</strong>
            <span style={{ fontSize: "0.75rem", color: "#475569" }}>{item.subtitle}</span>
            <div className={styles.noPrint} style={{ display: "flex", gap: 6, marginTop: 4 }}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => downloadFile(item.dataUrl, `${item.id}.png`, true)}
              >
                <Download size={13} /> PNG
              </button>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => downloadFile(item.svgText, `${item.id}.svg`, false)}
              >
                <Download size={13} /> SVG
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
