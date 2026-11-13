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

export type PurchaseSuggestionStatus =
  | "pendente"
  | "avaliando"
  | "aprovada"
  | "adquirida"
  | "recusada";

export interface PurchaseSuggestion {
  id: string;
  titulo: string;
  autor: string;
  editoraOuIsbn?: string;
  categoria: string;
  justificativa?: string;
  solicitanteNome?: string;
  solicitanteEmail?: string;
  status: PurchaseSuggestionStatus;
  createdAt: string;
}

export const LIBRARY_SUGGESTION_EMAIL = "biblioteca@cdcc.usp.br";

const COLLECTION_NAME = "sugestoes_compra";
const LOCAL_STORAGE_KEY = "qrcodecdcc_purchase_suggestions_v1";

function readLocal(): PurchaseSuggestion[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PurchaseSuggestion[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocal(items: PurchaseSuggestion[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function buildSuggestionMailtoUrl(
  input: {
    titulo: string;
    autor: string;
    editoraOuIsbn?: string;
    categoria: string;
    justificativa?: string;
    solicitanteNome?: string;
    solicitanteEmail?: string;
  },
  recipientEmail = LIBRARY_SUGGESTION_EMAIL,
): string {
  const subject = `[Sugestão de Compra - Biblioteca CDCC] ${input.titulo}`;
  const lines = [
    "Olá equipe da Biblioteca do CDCC-USP,",
    "",
    "Gostaria de sugerir a aquisição do seguinte livro para o acervo:",
    "",
    `• Título: ${input.titulo}`,
    `• Autor(a): ${input.autor || "Não informado"}`,
    `• Área / Categoria: ${input.categoria || "Geral"}`,
    input.editoraOuIsbn ? `• Editora / ISBN: ${input.editoraOuIsbn}` : null,
    input.justificativa ? `• Justificativa / Uso: ${input.justificativa}` : null,
    "",
    input.solicitanteNome ? `Solicitante: ${input.solicitanteNome}` : null,
    input.solicitanteEmail ? `E-mail para retorno: ${input.solicitanteEmail}` : null,
    "",
    "Enviado pelo Portal da Biblioteca CDCC-USP.",
  ].filter((line): line is string => line !== null);

  return `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(lines.join("\n"))}`;
}

export const PurchaseSuggestionsService = {
  async getAll(): Promise<PurchaseSuggestion[]> {
    const db = getFirestoreDb();
    if (!db) {
      return readLocal().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<PurchaseSuggestion, "id">),
      }));
      saveLocal(list);
      return list;
    } catch {
      return readLocal().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
  },

  async submit(
    input: Omit<PurchaseSuggestion, "id" | "status" | "createdAt">,
  ): Promise<PurchaseSuggestion> {
    const payload: Omit<PurchaseSuggestion, "id"> = {
      ...input,
      status: "pendente",
      createdAt: new Date().toISOString(),
    };
    const db = getFirestoreDb();
    if (db) {
      try {
        const ref = await addDoc(collection(db, COLLECTION_NAME), payload);
        const created: PurchaseSuggestion = { id: ref.id, ...payload };
        saveLocal([created, ...readLocal().filter((s) => s.id !== created.id)]);
        return created;
      } catch {
        // fallback local
      }
    }
    const created: PurchaseSuggestion = {
      id: `sug-${Date.now()}`,
      ...payload,
    };
    saveLocal([created, ...readLocal()]);
    return created;
  },

  async updateStatus(id: string, status: PurchaseSuggestionStatus): Promise<void> {
    const db = getFirestoreDb();
    if (db) {
      try {
        await updateDoc(doc(db, COLLECTION_NAME, id), { status });
      } catch {
        // fallback local
      }
    }
    saveLocal(readLocal().map((item) => (item.id === id ? { ...item, status } : item)));
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
