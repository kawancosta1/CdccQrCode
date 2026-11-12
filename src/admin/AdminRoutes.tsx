import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAdminAuth, RequirePermission } from "./components/AdminGuards";
import { AdminLayout } from "./components/AdminLayout";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { AdminAudit } from "./pages/AdminAudit";
import { AdminBooks } from "./pages/AdminBooks";
import { AdminCarousel } from "./pages/AdminCarousel";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminGames } from "./pages/AdminGames";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminRooms } from "./pages/AdminRooms";
import { AdminSectors } from "./pages/AdminSectors";
import { AdminSettings } from "./pages/AdminSettings";
import { AdminShelves } from "./pages/AdminShelves";

const AdminPages = lazy(() => import("./pages/AdminPages"));
const AdminAppearance = lazy(() => import("./pages/AdminAppearance"));
const AdminHomeEditor = lazy(() => import("./pages/AdminHomeEditor"));
const AdminQrCodes = lazy(() => import("./pages/AdminQrCodes"));
const AdminMapping = lazy(() => import("./pages/AdminMapping"));

export function AdminRoutes() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route
          element={
            <RequireAdminAuth>
              <AdminLayout />
            </RequireAdminAuth>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route
            path="carrossel"
            element={
              <RequirePermission permission="carousel.manage">
                <AdminCarousel />
              </RequirePermission>
            }
          />
          <Route
            path="jogos"
            element={
              <RequirePermission permission="games.manage">
                <AdminGames />
              </RequirePermission>
            }
          />
          <Route
            path="livros"
            element={
              <RequirePermission permission="books.read">
                <AdminBooks />
              </RequirePermission>
            }
          />
          <Route
            path="estantes"
            element={
              <RequirePermission permission="shelves.read">
                <AdminShelves />
              </RequirePermission>
            }
          />
          <Route
            path="salas"
            element={
              <RequirePermission permission="rooms.read">
                <AdminRooms />
              </RequirePermission>
            }
          />
          <Route
            path="setores"
            element={
              <RequirePermission permission="sectors.manage">
                <AdminSectors />
              </RequirePermission>
            }
          />
          <Route
            path="auditoria"
            element={
              <RequirePermission permission="audit.read">
                <AdminAudit />
              </RequirePermission>
            }
          />
          <Route
            path="aparencia"
            element={
              <RequirePermission permission="appearance.manage">
                <Suspense fallback={<p>Carregando...</p>}>
                  <AdminAppearance />
                </Suspense>
              </RequirePermission>
            }
          />
          <Route
            path="home-editor"
            element={
              <RequirePermission permission="appearance.manage">
                <Suspense fallback={<p>Carregando...</p>}>
                  <AdminHomeEditor />
                </Suspense>
              </RequirePermission>
            }
          />
          <Route
            path="paginas"
            element={
              <RequirePermission permission="pages.manage">
                <Suspense fallback={<p>Carregando...</p>}>
                  <AdminPages />
                </Suspense>
              </RequirePermission>
            }
          />
          <Route
            path="qrcodes"
            element={
              <RequirePermission permission="qrcodes.manage">
                <Suspense fallback={<p>Carregando...</p>}>
                  <AdminQrCodes />
                </Suspense>
              </RequirePermission>
            }
          />
          <Route
            path="mapeamento"
            element={
              <RequirePermission permission="mapping.manage">
                <Suspense fallback={<p>Carregando...</p>}>
                  <AdminMapping />
                </Suspense>
              </RequirePermission>
            }
          />
          <Route
            path="configuracoes"
            element={
              <RequirePermission permission="settings.manage">
                <AdminSettings />
              </RequirePermission>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminAuthProvider>
  );
}
