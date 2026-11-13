import { doc, getDoc, increment, setDoc } from "firebase/firestore";
import { getFirestoreDb } from "../lib/firebase.ts";
import type { RoomId } from "../config/roomConstants.ts";

export interface AnalyticsBucket {
  searches: Record<string, number>;
  notFound: Record<string, number>;
  shelves: Record<string, number>;
  totalSearches: number;
  totalNotFound: number;
  totalShelfViews: number;
  updatedAt: string;
}

const LOCAL_STORAGE_KEY = "qrcodecdcc_analytics_v1";
const SESSION_DEDUPE_KEY = "qrcodecdcc_analytics_session";

function getCurrentMonthKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function sanitizeKey(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[./#$[\]]+/g, "_")
    .slice(0, 60);
}

function readLocalBucket(): AnalyticsBucket {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      return {
        searches: {},
        notFound: {},
        shelves: {},
        totalSearches: 0,
        totalNotFound: 0,
        totalShelfViews: 0,
        updatedAt: new Date().toISOString(),
      };
    }
    return JSON.parse(raw) as AnalyticsBucket;
  } catch {
    return {
      searches: {},
      notFound: {},
      shelves: {},
      totalSearches: 0,
      totalNotFound: 0,
      totalShelfViews: 0,
      updatedAt: new Date().toISOString(),
    };
  }
}

function saveLocalBucket(bucket: AnalyticsBucket) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bucket));
  } catch {
    // ignore
  }
}

function alreadyTrackedInSession(eventKey: string): boolean {
  try {
    const raw = sessionStorage.getItem(SESSION_DEDUPE_KEY);
    const seen = raw ? (JSON.parse(raw) as string[]) : [];
    if (seen.includes(eventKey)) return true;
    sessionStorage.setItem(SESSION_DEDUPE_KEY, JSON.stringify([...seen.slice(-40), eventKey]));
    return false;
  } catch {
    return false;
  }
}

export const AnalyticsService = {
  async trackSearch(rawTerm: string, found: boolean): Promise<void> {
    const key = sanitizeKey(rawTerm);
    if (!key || alreadyTrackedInSession(`search:${key}:${found}`)) return;

    const bucket = readLocalBucket();
    bucket.totalSearches += 1;
    bucket.searches[key] = (bucket.searches[key] ?? 0) + 1;
    if (!found) {
      bucket.totalNotFound += 1;
      bucket.notFound[key] = (bucket.notFound[key] ?? 0) + 1;
    }
    bucket.updatedAt = new Date().toISOString();
    saveLocalBucket(bucket);

    const db = getFirestoreDb();
    if (!db) return;
    try {
      const ref = doc(db, "analytics_monthly", getCurrentMonthKey());
      await setDoc(
        ref,
        {
          totalSearches: increment(1),
          ...(found ? {} : { totalNotFound: increment(1) }),
          [`searches.${key}`]: increment(1),
          ...(!found ? { [`notFound.${key}`]: increment(1) } : {}),
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
    } catch {
      // silent fallback if rules disallow public write
    }
  },

  async trackShelfView(roomId: RoomId, shelf: string): Promise<void> {
    const key = `S${roomId}_E${sanitizeKey(shelf)}`;
    if (alreadyTrackedInSession(`shelf:${key}`)) return;

    const bucket = readLocalBucket();
    bucket.totalShelfViews += 1;
    bucket.shelves[key] = (bucket.shelves[key] ?? 0) + 1;
    bucket.updatedAt = new Date().toISOString();
    saveLocalBucket(bucket);

    const db = getFirestoreDb();
    if (!db) return;
    try {
      const ref = doc(db, "analytics_monthly", getCurrentMonthKey());
      await setDoc(
        ref,
        {
          totalShelfViews: increment(1),
          [`shelves.${key}`]: increment(1),
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
    } catch {
      // silent fallback
    }
  },

  async getSummary(): Promise<AnalyticsBucket> {
    const local = readLocalBucket();
    const db = getFirestoreDb();
    if (!db) return local;
    try {
      const snap = await getDoc(doc(db, "analytics_monthly", getCurrentMonthKey()));
      if (!snap.exists()) return local;
      const data = snap.data() as Partial<AnalyticsBucket>;
      return {
        searches: { ...local.searches, ...(data.searches ?? {}) },
        notFound: { ...local.notFound, ...(data.notFound ?? {}) },
        shelves: { ...local.shelves, ...(data.shelves ?? {}) },
        totalSearches: Math.max(local.totalSearches, data.totalSearches ?? 0),
        totalNotFound: Math.max(local.totalNotFound, data.totalNotFound ?? 0),
        totalShelfViews: Math.max(local.totalShelfViews, data.totalShelfViews ?? 0),
        updatedAt: data.updatedAt ?? local.updatedAt,
      };
    } catch {
      return local;
    }
  },
};
