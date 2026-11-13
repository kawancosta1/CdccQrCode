import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { RoomId } from "../config/roomConstants.ts";
import {
  VisitRouteContext,
  type VisitRouteContextValue,
  type VisitRouteItem,
} from "./visitRouteStore.ts";

const STORAGE_KEY = "qrcodecdcc_visit_route_v1";

function loadInitialItems(): VisitRouteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as VisitRouteItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveItems(items: VisitRouteItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function VisitRouteProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<VisitRouteItem[]>(loadInitialItems);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const addItem = useCallback((input: Omit<VisitRouteItem, "id">) => {
    const id = `${input.roomId}::${input.shelf}::${input.code.toUpperCase()}`;
    setItems((prev) => {
      if (prev.some((existing) => existing.id === id)) return prev;
      const next = [...prev, { ...input, id }];
      saveItems(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveItems(next);
      return next;
    });
  }, []);

  const clearRoute = useCallback(() => {
    setItems([]);
    saveItems([]);
  }, []);

  const hasItem = useCallback(
    (code: string, roomId: RoomId, shelf: string) => {
      const id = `${roomId}::${shelf}::${code.toUpperCase()}`;
      return items.some((item) => item.id === id);
    },
    [items],
  );

  const value = useMemo<VisitRouteContextValue>(
    () => ({
      items,
      drawerOpen,
      setDrawerOpen,
      addItem,
      removeItem,
      clearRoute,
      hasItem,
    }),
    [addItem, clearRoute, drawerOpen, hasItem, items, removeItem],
  );

  return <VisitRouteContext.Provider value={value}>{children}</VisitRouteContext.Provider>;
}
