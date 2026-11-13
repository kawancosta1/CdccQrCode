import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { getFirestoreDb } from "../lib/firebase.ts";

export interface ExhibitionItem {
  id: string;
  titulo: string;
  subtitulo: string;
  descricao: string;
  periodo: string;
  tema: string;
  codigosDestaque: string[];
  ativa: boolean;
  createdAt: string;
}

const COLLECTION_NAME = "exposicoes_tematicas";
const LOCAL_STORAGE_KEY = "qrcodecdcc_exhibitions_v1";

export const DEFAULT_EXHIBITIONS: ExhibitionItem[] = [
  {
    id: "expo-mulheres-ciencia",
    titulo: "Mulheres na Ciência e Literatura",
    subtitulo: "Exposição Temática do Mês",
    descricao:
      "Seleção especial de obras de divulgadoras científicas, autoras da FUVEST e biografias inspiradoras disponíveis no acervo físico.",
    periodo: "Mês vigente • Sala 1 e Sala 2",
    tema: "Divulgação Científica & Literatura",
    codigosDestaque: ["530", "869.98 F634o", "869.93 T274m", "520"],
    ativa: true,
    createdAt: "2026-04-01T10:00:00.000Z",
  },
];

function readLocal(): ExhibitionItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return DEFAULT_EXHIBITIONS;
    const parsed = JSON.parse(raw) as ExhibitionItem[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_EXHIBITIONS;
  } catch {
    return DEFAULT_EXHIBITIONS;
  }
}

function saveLocal(items: ExhibitionItem[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export const ExhibitionsService = {
  async getAll(): Promise<ExhibitionItem[]> {
    const db = getFirestoreDb();
    if (!db) return readLocal();
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      if (snap.empty) return readLocal();
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ExhibitionItem, "id">),
      }));
      saveLocal(list);
      return list;
    } catch {
      return readLocal();
    }
  },

  async getActive(): Promise<ExhibitionItem | null> {
    const list = await this.getAll();
    return list.find((item) => item.ativa) ?? null;
  },

  async create(input: Omit<ExhibitionItem, "id" | "createdAt">): Promise<ExhibitionItem> {
    const payload = { ...input, createdAt: new Date().toISOString() };
    const db = getFirestoreDb();
    if (db) {
      try {
        const ref = await addDoc(collection(db, COLLECTION_NAME), payload);
        const created: ExhibitionItem = { id: ref.id, ...payload };
        saveLocal([created, ...readLocal().filter((i) => i.id !== created.id)]);
        return created;
      } catch {
        // fallback local
      }
    }
    const created: ExhibitionItem = { id: `expo-${Date.now()}`, ...payload };
    saveLocal([created, ...readLocal()]);
    return created;
  },

  async update(id: string, patch: Partial<Omit<ExhibitionItem, "id">>): Promise<void> {
    const db = getFirestoreDb();
    if (db) {
      try {
        await updateDoc(doc(db, COLLECTION_NAME, id), patch);
      } catch {
        // fallback local
      }
    }
    saveLocal(readLocal().map((item) => (item.id === id ? { ...item, ...patch } : item)));
  },

  async remove(id: string): Promise<void> {
    const db = getFirestoreDb();
    if (db) {
      try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
      } catch {
        // fallback local
      }
    }
    saveLocal(readLocal().filter((item) => item.id !== id));
  },
};
