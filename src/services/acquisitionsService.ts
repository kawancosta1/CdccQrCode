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
import type { RoomId } from "../config/roomConstants.ts";

export type AcquisitionOrigin = "compra" | "doacao";

export interface AcquisitionItem {
  id: string;
  titulo: string;
  autor: string;
  origem: AcquisitionOrigin;
  doadorOuFornecedor?: string;
  codigoDedalus: string;
  sala: RoomId;
  estante: string;
  dataEntrada: string;
  capaUrl?: string;
  observacao?: string;
  destaque?: boolean;
  createdAt: string;
}

const COLLECTION_NAME = "novos_acervo";
const LOCAL_STORAGE_KEY = "qrcodecdcc_acquisitions_v1";

export const DEFAULT_ACQUISITIONS: AcquisitionItem[] = [
  {
    id: "acq-cosmos-sagan",
    titulo: "Cosmos",
    autor: "Carl Sagan",
    origem: "compra",
    doadorOuFornecedor: "Aquisição USP / CDCC",
    codigoDedalus: "523.1 S129c",
    sala: 2,
    estante: "Estante 8",
    dataEntrada: "2026-04-10",
    observacao: "Nova edição ilustrada para divulgação científica e astronomia.",
    destaque: true,
    createdAt: "2026-04-10T10:00:00.000Z",
  },
  {
    id: "acq-universo-casca-noz",
    titulo: "O Universo numa Casca de Noz",
    autor: "Stephen Hawking",
    origem: "doacao",
    doadorOuFornecedor: "Doação de Docente IFSC-USP",
    codigoDedalus: "530.1 H392u",
    sala: 2,
    estante: "Estante 8",
    dataEntrada: "2026-04-06",
    observacao: "Exemplar em ótimo estado incorporado ao acervo de Física Moderna.",
    destaque: true,
    createdAt: "2026-04-06T14:00:00.000Z",
  },
  {
    id: "acq-torto-arado",
    titulo: "Torto Arado",
    autor: "Itamar Vieira Junior",
    origem: "compra",
    doadorOuFornecedor: "Aquisição Vestibular & Literatura",
    codigoDedalus: "869.93 V658t",
    sala: 1,
    estante: "Estante 5",
    dataEntrada: "2026-03-28",
    observacao: "Romance contemporâneo muito procurado por estudantes.",
    destaque: true,
    createdAt: "2026-03-28T09:00:00.000Z",
  },
  {
    id: "acq-turma-monica-ciencia",
    titulo: "Manual da Ciência da Turma da Mônica",
    autor: "Mauricio de Sousa",
    origem: "doacao",
    doadorOuFornecedor: "Doação da Comunidade",
    codigoDedalus: "M",
    sala: 3,
    estante: "Estante 4",
    dataEntrada: "2026-03-20",
    observacao: "Disponível na Sala 3 (Espaço Infantojuvenil) para leitura e empréstimo.",
    destaque: false,
    createdAt: "2026-03-20T11:30:00.000Z",
  },
];

function readLocal(): AcquisitionItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return DEFAULT_ACQUISITIONS;
    const parsed = JSON.parse(raw) as AcquisitionItem[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ACQUISITIONS;
  } catch {
    return DEFAULT_ACQUISITIONS;
  }
}

function saveLocal(items: AcquisitionItem[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage quota errors
  }
}

export const AcquisitionsService = {
  async getAll(): Promise<AcquisitionItem[]> {
    const db = getFirestoreDb();
    if (!db) {
      return readLocal().sort((a, b) => b.dataEntrada.localeCompare(a.dataEntrada));
    }
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("dataEntrada", "desc"));
      const snap = await getDocs(q);
      if (snap.empty) {
        return readLocal().sort((a, b) => b.dataEntrada.localeCompare(a.dataEntrada));
      }
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<AcquisitionItem, "id">),
      }));
      saveLocal(list);
      return list;
    } catch {
      return readLocal().sort((a, b) => b.dataEntrada.localeCompare(a.dataEntrada));
    }
  },

  async create(input: Omit<AcquisitionItem, "id" | "createdAt">): Promise<AcquisitionItem> {
    const createdAt = new Date().toISOString();
    const payload = { ...input, createdAt };
    const db = getFirestoreDb();
    if (db) {
      try {
        const ref = await addDoc(collection(db, COLLECTION_NAME), payload);
        const created: AcquisitionItem = { id: ref.id, ...payload };
        const current = readLocal().filter((i) => i.id !== created.id);
        saveLocal([created, ...current]);
        return created;
      } catch {
        // fallback local
      }
    }
    const created: AcquisitionItem = {
      id: `acq-${Date.now()}`,
      ...payload,
    };
    saveLocal([created, ...readLocal()]);
    return created;
  },

  async update(id: string, patch: Partial<Omit<AcquisitionItem, "id">>): Promise<void> {
    const db = getFirestoreDb();
    if (db) {
      try {
        await updateDoc(doc(db, COLLECTION_NAME, id), patch);
      } catch {
        // fallback local
      }
    }
    const next = readLocal().map((item) => (item.id === id ? { ...item, ...patch } : item));
    saveLocal(next);
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
