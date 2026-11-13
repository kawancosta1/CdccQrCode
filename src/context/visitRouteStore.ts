import { createContext, useContext } from "react";
import type { RoomId } from "../config/roomConstants.ts";

export interface VisitRouteItem {
  id: string;
  code: string;
  title: string;
  roomId: RoomId;
  shelf: string;
  range?: string;
}

export interface VisitRouteContextValue {
  items: VisitRouteItem[];
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  addItem: (item: Omit<VisitRouteItem, "id">) => void;
  removeItem: (id: string) => void;
  clearRoute: () => void;
  hasItem: (code: string, roomId: RoomId, shelf: string) => boolean;
}

export const VisitRouteContext = createContext<VisitRouteContextValue | null>(null);

export function useVisitRoute(): VisitRouteContextValue {
  const ctx = useContext(VisitRouteContext);
  if (!ctx) {
    throw new Error("useVisitRoute deve ser usado dentro de VisitRouteProvider");
  }
  return ctx;
}
