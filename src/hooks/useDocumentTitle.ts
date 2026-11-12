import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const BASE_TITLE = "QRCodeCDCC — Biblioteca CDCC USP";

export function resolveRouteTitle(pathname: string): string {
  if (pathname === "/" || pathname === "") {
    return `Localizador de Livros | ${BASE_TITLE}`;
  }
  if (pathname === "/estantes") {
    return `Estantes da Biblioteca | ${BASE_TITLE}`;
  }
  if (pathname.startsWith("/estantes/")) {
    const parts = pathname.split("/").filter(Boolean);
    const sala = parts[1] ? parts[1].replace("-", " ").toUpperCase() : "Sala";
    const num = parts[2] ? `Estante ${parts[2]}` : "Detalhe";
    return `${num} (${sala}) | ${BASE_TITLE}`;
  }
  if (pathname === "/espacoludico") {
    return `Espaço Lúdico | ${BASE_TITLE}`;
  }
  if (pathname.startsWith("/espacoludico/")) {
    const slug = pathname.split("/")[2] || "Jogo";
    const formatted = slug.charAt(0).toUpperCase() + slug.slice(1);
    return `${formatted} — Espaço Lúdico | ${BASE_TITLE}`;
  }
  if (pathname.startsWith("/admin")) {
    return `Painel Administrativo | ${BASE_TITLE}`;
  }
  return `Página não encontrada | ${BASE_TITLE}`;
}

export function RouteTitleUpdater() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = resolveRouteTitle(pathname);
  }, [pathname]);

  return null;
}
