import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import type { RoomId } from "../config/roomConstants.ts";
import { getFirebaseStorageInstance, getFirestoreDb } from "../lib/firebase.ts";
import type { ShelfMapping, ShelfRegion } from "../types/shelfMapping.ts";

const COLLECTION_NAME = "shelves";
const LOCAL_STORAGE_KEY = "qrcodecdcc_shelf_spotlights_v1";

export function buildShelfId(roomId: RoomId, shelfNumber: number): string {
  return `sala-${roomId}-estante-${String(shelfNumber).padStart(2, "0")}`;
}

function readLocalAll(): Record<string, ShelfMapping> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ShelfMapping>;
  } catch {
    return {};
  }
}

function saveLocalOne(mapping: ShelfMapping) {
  try {
    const all = readLocalAll();
    all[mapping.shelfId] = mapping;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore storage quota errors
  }
}

export async function getAllShelfMappings(): Promise<Record<string, ShelfMapping>> {
  const local = readLocalAll();
  const db = getFirestoreDb();
  if (!db) return local;
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    const merged: Record<string, ShelfMapping> = { ...local };
    snap.forEach((docSnap) => {
      const data = docSnap.data() as ShelfMapping;
      if (data && data.shelfId) {
        merged[data.shelfId] = data;
      }
    });
    return merged;
  } catch {
    return local;
  }
}

export async function getShelfMapping(
  roomId: RoomId,
  shelfNumber: number,
): Promise<ShelfMapping | null> {
  const shelfId = buildShelfId(roomId, shelfNumber);
  const local = readLocalAll()[shelfId] ?? null;
  const db = getFirestoreDb();
  if (!db) return local;
  try {
    const snap = await getDoc(doc(db, COLLECTION_NAME, shelfId));
    if (!snap.exists()) return local;
    const data = snap.data() as ShelfMapping;
    saveLocalOne(data);
    return data;
  } catch {
    return local;
  }
}

export async function saveShelfMapping(mapping: ShelfMapping): Promise<ShelfMapping> {
  const payload: ShelfMapping = {
    ...mapping,
    updatedAt: new Date().toISOString(),
  };
  saveLocalOne(payload);

  const db = getFirestoreDb();
  if (db) {
    try {
      await setDoc(doc(db, COLLECTION_NAME, payload.shelfId), payload, { merge: true });
    } catch {
      // fallback local already saved
    }
  }
  return payload;
}

export function resolveRegionForCode(
  mapping: ShelfMapping | null,
  rawCode?: string,
): { codeKey: string; region: ShelfRegion } | null {
  if (!mapping || !rawCode) return null;
  const entries = Object.entries(mapping.regions ?? {});
  if (entries.length === 0) return null;

  const clean = rawCode.trim().toUpperCase();
  const exact = entries.find(([k]) => k.trim().toUpperCase() === clean);
  if (exact) return { codeKey: exact[0], region: exact[1] };

  // Match by longest prefix (e.g., "530.12" -> "530")
  const prefixMatches = entries
    .filter(([k]) => {
      const keyUp = k.trim().toUpperCase();
      return clean.startsWith(keyUp) || keyUp.startsWith(clean);
    })
    .sort((a, b) => b[0].length - a[0].length);

  if (prefixMatches.length > 0) {
    return { codeKey: prefixMatches[0][0], region: prefixMatches[0][1] };
  }
  return null;
}

/**
 * Comprime a imagem no navegador para WebP (maxWidth 1600px, qualidade 0.82)
 * e retorna o Blob, DataURL e aspectRatio (largura / altura) para evitar CLS.
 */
export async function compressShelfImageClientSide(
  file: File,
  maxWidth = 1600,
  quality = 0.82,
): Promise<{ blob: Blob; dataUrl: string; aspectRatio: number }> {
  const bitmapUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = bitmapUrl;
    });

    const scale = img.naturalWidth > maxWidth ? maxWidth / img.naturalWidth : 1;
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));
    const aspectRatio = Number((width / height).toFixed(4));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas 2D indisponível para compressão.");
    }
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Falha ao gerar WebP."))),
        "image/webp",
        quality,
      );
    });

    const dataUrl = canvas.toDataURL("image/webp", quality);
    return { blob, dataUrl, aspectRatio };
  } finally {
    URL.revokeObjectURL(bitmapUrl);
  }
}

export async function uploadCleanShelfPhoto(
  roomId: RoomId,
  shelfNumber: number,
  file: File,
): Promise<{ url: string; aspectRatio: number }> {
  const { blob, dataUrl, aspectRatio } = await compressShelfImageClientSide(file, 1600, 0.82);
  const storage = getFirebaseStorageInstance();
  if (storage) {
    try {
      const shelfId = buildShelfId(roomId, shelfNumber);
      const storageRef = ref(storage, `shelves/clean/${shelfId}-${Date.now()}.webp`);
      await uploadBytes(storageRef, blob, { contentType: "image/webp" });
      const url = await getDownloadURL(storageRef);
      return { url, aspectRatio };
    } catch {
      // fallback para DataURL comprimida se Storage não permitir upload
    }
  }
  return { url: dataUrl, aspectRatio };
}
