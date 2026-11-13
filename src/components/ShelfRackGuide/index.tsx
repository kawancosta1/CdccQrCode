import { useMemo } from "react";
import { Layers } from "lucide-react";
import type { RoomId } from "../../config/roomConstants";
import {
  imageDatabaseSala1,
  imageDatabaseSala2,
  imageDatabaseSala3,
  type ImageData,
} from "../../data";
import style from "./style.module.css";

interface ShelfRackGuideProps {
  roomId: RoomId;
  shelfNumberOrLabel: string;
  activeCode?: string;
  onSelectCode?: (code: string) => void;
}

const ROOM_DATABASES: Record<RoomId, Record<string, ImageData>> = {
  1: imageDatabaseSala1,
  2: imageDatabaseSala2,
  3: imageDatabaseSala3,
};

function normalizeShelfNum(raw: string): string {
  const m = raw.match(/\d+/);
  return m ? m[0] : raw.trim();
}

export function ShelfRackGuide({
  roomId,
  shelfNumberOrLabel,
  activeCode,
  onSelectCode,
}: ShelfRackGuideProps) {
  const targetShelf = normalizeShelfNum(shelfNumberOrLabel);

  const codes = useMemo(() => {
    const db = ROOM_DATABASES[roomId] ?? {};
    const list: Array<{ code: string; range: string }> = [];
    for (const [code, data] of Object.entries(db)) {
      if (normalizeShelfNum(data.shelf) === targetShelf) {
        list.push({ code, range: data.range });
      }
    }
    return list.sort((a, b) => a.code.localeCompare(b.code, "pt-BR", { numeric: true }));
  }, [roomId, targetShelf]);

  if (codes.length === 0) return null;

  const cleanActive = activeCode?.trim().toUpperCase() ?? "";

  return (
    <section className={style.rackBox} aria-label="Guia de códigos desta estante">
      <div className={style.rackHeader}>
        <span className={style.rackTitle}>
          <Layers size={14} aria-hidden="true" />
          Faixas na Estante {targetShelf} ({codes.length} códigos)
        </span>
        <span className={style.rackHint}>Topo → Base</span>
      </div>

      <div className={style.rackChips}>
        {codes.map((entry) => {
          const isMatch =
            cleanActive.length > 0 &&
            (cleanActive === entry.code.toUpperCase() ||
              cleanActive.startsWith(entry.code.toUpperCase()));

          if (onSelectCode) {
            return (
              <button
                key={entry.code}
                type="button"
                className={`${style.rackChip} ${isMatch ? style.rackChipActive : ""}`}
                onClick={() => onSelectCode(entry.code)}
                title={`Faixa ${entry.range}`}
              >
                {entry.code}
              </button>
            );
          }

          return (
            <span
              key={entry.code}
              className={`${style.rackChip} ${isMatch ? style.rackChipActive : ""}`}
              title={`Faixa ${entry.range}`}
            >
              {entry.code}
            </span>
          );
        })}
      </div>
    </section>
  );
}
