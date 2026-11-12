import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { getFirestoreDb } from "../lib/firebase.ts";
import type {
  AdminUserRecord,
  DynamicMarkerOverride,
  DynamicShelfMapping,
} from "../types/content.ts";

const MAPPINGS_COLLECTION = "mapeamento_dedalus";
const MARKERS_COLLECTION = "marker_overrides";
const USERS_COLLECTION = "usuarios_admin";
const PHOTO_OVERRIDES_COLLECTION = "fotos_estantes_codigos";

const LOCAL_MAPPINGS_KEY = "qrcodecdcc_dynamic_mappings_v1";
const LOCAL_MARKERS_KEY = "qrcodecdcc_marker_overrides_v1";
const LOCAL_USERS_KEY = "qrcodecdcc_admin_users_v1";
const LOCAL_PHOTO_OVERRIDES_KEY = "qrcodecdcc_photo_overrides_v1";

export interface PhotoOverrideRecord {
  id: string;
  targetType: "shelf" | "code";
  roomId?: 1 | 2 | 3;
  shelfKey?: string;
  codeKey?: string;
  imageUrl: string;
  atualizadoEm?: string;
}

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

// ==========================================
// Mapeamentos Dinâmicos de Código CDU -> Estante
// ==========================================

export async function getDynamicShelfMappings(): Promise<DynamicShelfMapping[]> {
  const db = getFirestoreDb();
  if (db) {
    try {
      const snap = await getDocs(collection(db, MAPPINGS_COLLECTION));
      if (!snap.empty) {
        const list = snap.docs.map((d) => ({ ...(d.data() as DynamicShelfMapping), id: d.id }));
        saveLocal(LOCAL_MAPPINGS_KEY, list);
        return list;
      }
    } catch {
      // fallback
    }
  }
  return readLocal<DynamicShelfMapping[]>(LOCAL_MAPPINGS_KEY, []);
}

export async function saveDynamicShelfMapping(
  mapping: DynamicShelfMapping
): Promise<DynamicShelfMapping> {
  const payload: DynamicShelfMapping = {
    ...mapping,
    id: mapping.id || `map-s${mapping.roomId}-${mapping.shelf}-${Date.now()}`,
    atualizadoEm: new Date().toISOString(),
  };

  const current = readLocal<DynamicShelfMapping[]>(LOCAL_MAPPINGS_KEY, []);
  const exists = current.some((m) => m.id === payload.id);
  const next = exists
    ? current.map((m) => (m.id === payload.id ? payload : m))
    : [...current, payload];
  saveLocal(LOCAL_MAPPINGS_KEY, next);

  const db = getFirestoreDb();
  if (db) {
    await setDoc(doc(db, MAPPINGS_COLLECTION, payload.id), payload, { merge: true });
  }
  return payload;
}

export async function deleteDynamicShelfMapping(id: string): Promise<void> {
  const current = readLocal<DynamicShelfMapping[]>(LOCAL_MAPPINGS_KEY, []);
  saveLocal(
    LOCAL_MAPPINGS_KEY,
    current.filter((m) => m.id !== id)
  );
  const db = getFirestoreDb();
  if (db) {
    await deleteDoc(doc(db, MAPPINGS_COLLECTION, id));
  }
}

// ==========================================
// Overrides de Posição no Mapa (Click-to-Place)
// ==========================================

export async function getMarkerOverrides(): Promise<DynamicMarkerOverride[]> {
  const db = getFirestoreDb();
  if (db) {
    try {
      const snap = await getDocs(collection(db, MARKERS_COLLECTION));
      if (!snap.empty) {
        const list = snap.docs.map((d) => d.data() as DynamicMarkerOverride);
        saveLocal(LOCAL_MARKERS_KEY, list);
        return list;
      }
    } catch {
      // fallback
    }
  }
  return readLocal<DynamicMarkerOverride[]>(LOCAL_MARKERS_KEY, []);
}

export async function saveMarkerOverride(
  override: DynamicMarkerOverride
): Promise<DynamicMarkerOverride> {
  const payload: DynamicMarkerOverride = {
    ...override,
    centered: override.centered ?? true,
  };
  const docId = `sala${payload.roomId}-${payload.shelfKey}`;
  const current = readLocal<DynamicMarkerOverride[]>(LOCAL_MARKERS_KEY, []);
  const filtered = current.filter(
    (m) => !(m.roomId === payload.roomId && m.shelfKey === payload.shelfKey)
  );
  saveLocal(LOCAL_MARKERS_KEY, [...filtered, payload]);

  const db = getFirestoreDb();
  if (db) {
    await setDoc(doc(db, MARKERS_COLLECTION, docId), payload, { merge: true });
  }
  return payload;
}

// ==========================================
// Usuários & Permissões RBAC
// ==========================================

export async function getAdminUsers(): Promise<AdminUserRecord[]> {
  const db = getFirestoreDb();
  if (db) {
    try {
      const snap = await getDocs(collection(db, USERS_COLLECTION));
      if (!snap.empty) {
        const list = snap.docs.map((d) => ({ ...(d.data() as AdminUserRecord), id: d.id }));
        saveLocal(LOCAL_USERS_KEY, list);
        return list;
      }
    } catch {
      // fallback
    }
  }
  return readLocal<AdminUserRecord[]>(LOCAL_USERS_KEY, [
    {
      id: "admin-principal",
      email: "biblioteca@cdcc.usp.br",
      displayName: "Coordenação Biblioteca CDCC",
      role: "super_admin",
      ativo: true,
      atualizadoEm: new Date().toISOString(),
    },
  ]);
}

export async function saveAdminUser(user: AdminUserRecord): Promise<AdminUserRecord> {
  const payload: AdminUserRecord = {
    ...user,
    id: user.id || user.email.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    email: user.email.trim().toLowerCase(),
    atualizadoEm: new Date().toISOString(),
  };
  const current = await getAdminUsers();
  const exists = current.some((u) => u.id === payload.id);
  const next = exists
    ? current.map((u) => (u.id === payload.id ? payload : u))
    : [...current, payload];
  saveLocal(LOCAL_USERS_KEY, next);

  const db = getFirestoreDb();
  if (db) {
    await setDoc(doc(db, USERS_COLLECTION, payload.id), payload, { merge: true });
  }
  return payload;
}

export async function deleteAdminUser(id: string): Promise<void> {
  const current = await getAdminUsers();
  saveLocal(
    LOCAL_USERS_KEY,
    current.filter((u) => u.id !== id)
  );
  const db = getFirestoreDb();
  if (db) {
    await deleteDoc(doc(db, USERS_COLLECTION, id));
  }
}

// ==========================================
// Overrides de Foto por Estante ou Código CDU
// ==========================================

export async function getPhotoOverrides(): Promise<PhotoOverrideRecord[]> {
  const db = getFirestoreDb();
  if (db) {
    try {
      const snap = await getDocs(collection(db, PHOTO_OVERRIDES_COLLECTION));
      if (!snap.empty) {
        const list = snap.docs.map((d) => ({ ...(d.data() as PhotoOverrideRecord), id: d.id }));
        saveLocal(LOCAL_PHOTO_OVERRIDES_KEY, list);
        return list;
      }
    } catch {
      // fallback
    }
  }
  return readLocal<PhotoOverrideRecord[]>(LOCAL_PHOTO_OVERRIDES_KEY, []);
}

export async function savePhotoOverride(record: PhotoOverrideRecord): Promise<PhotoOverrideRecord> {
  const id =
    record.id ||
    (record.targetType === "shelf"
      ? `shelf-s${record.roomId}-${(record.shelfKey || "").toUpperCase()}`
      : `code-${(record.codeKey || "").trim().toUpperCase().replace(/[^A-Z0-9.]/g, "_")}`);

  const payload: PhotoOverrideRecord = {
    ...record,
    id,
    atualizadoEm: new Date().toISOString(),
  };

  const current = readLocal<PhotoOverrideRecord[]>(LOCAL_PHOTO_OVERRIDES_KEY, []);
  const next = [...current.filter((item) => item.id !== id), payload];
  saveLocal(LOCAL_PHOTO_OVERRIDES_KEY, next);

  const db = getFirestoreDb();
  if (db) {
    await setDoc(doc(db, PHOTO_OVERRIDES_COLLECTION, id), payload, { merge: true });
  }
  return payload;
}

export async function deletePhotoOverride(id: string): Promise<void> {
  const current = readLocal<PhotoOverrideRecord[]>(LOCAL_PHOTO_OVERRIDES_KEY, []);
  saveLocal(
    LOCAL_PHOTO_OVERRIDES_KEY,
    current.filter((item) => item.id !== id)
  );
  const db = getFirestoreDb();
  if (db) {
    await deleteDoc(doc(db, PHOTO_OVERRIDES_COLLECTION, id));
  }
}

