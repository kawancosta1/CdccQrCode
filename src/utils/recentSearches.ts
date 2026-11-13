export interface RecentSearchEntry {
  query: string;
  label: string;
  timestamp: number;
}

const STORAGE_KEY = "cdcc_recent_searches_v1";
const MAX_RECENT = 5;

export function getRecentSearches(): RecentSearchEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentSearchEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) => item && typeof item.query === "string" && typeof item.label === "string",
    );
  } catch {
    return [];
  }
}

export function recordRecentSearch(query: string, label?: string): RecentSearchEntry[] {
  const cleanQuery = query.trim();
  if (!cleanQuery) return getRecentSearches();

  const current = getRecentSearches();
  const normalized = cleanQuery.toUpperCase();
  const nextEntry: RecentSearchEntry = {
    query: cleanQuery,
    label: (label ?? cleanQuery).trim(),
    timestamp: Date.now(),
  };

  const filtered = current.filter((item) => item.query.toUpperCase() !== normalized);
  const next = [nextEntry, ...filtered].slice(0, MAX_RECENT);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage quota errors
    }
  }
  return next;
}

export function clearRecentSearches(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
