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
