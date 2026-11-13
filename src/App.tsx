import "./styles/global.css";
import "./styles/theme.css";

import { lazy, Suspense } from "react";
import { MotionConfig } from "framer-motion";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PageSkeleton } from "./components/PageSkeleton";
import { MainTemplate } from "./components/template/MainTemplate";
import { AccessibilityProvider } from "./context/AccessibilityContext";
import { BookSearchProvider } from "./context/BookSearchContext";
import { SiteConfigProvider } from "./context/SiteConfigContext";
import { VisitRouteProvider } from "./context/VisitRouteContext";
import { RouteTitleUpdater } from "./hooks/useDocumentTitle";
import { Home } from "./pages/Home";

const Estantes = lazy(() =>
  import("./pages/Estantes").then((m) => ({ default: m.Estantes })),
);
const EspacoLudico = lazy(() =>
  import("./pages/EspacoLudico").then((m) => ({ default: m.EspacoLudico })),
);
const ShelfDetail = lazy(() =>
  import("./pages/ShelfDetail").then((m) => ({ default: m.ShelfDetail })),
);
const GameRules = lazy(() =>
  import("./pages/GameRules").then((m) => ({ default: m.GameRules })),
);
const VestibularPage = lazy(() => import("./pages/Vestibular"));
const Novidades = lazy(() =>
  import("./pages/Novidades").then((m) => ({ default: m.Novidades })),
);
const SugestaoCompra = lazy(() =>
  import("./pages/SugestaoCompra").then((m) => ({ default: m.SugestaoCompra })),
);
const Totem = lazy(() =>
  import("./pages/Totem").then((m) => ({ default: m.Totem })),
);
const CustomPageView = lazy(() => import("./pages/CustomPage"));
const NotFound = lazy(() =>
  import("./pages/NotFound").then((m) => ({ default: m.NotFound })),
);
const AdminRoutes = lazy(() =>
  import("./admin/AdminRoutes").then((m) => ({ default: m.AdminRoutes })),
);

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <HashRouter>
      <RouteTitleUpdater />
      <SiteConfigProvider>
        <AccessibilityProvider>
          <VisitRouteProvider>
            <BookSearchProvider>
              <MainTemplate>
                <ErrorBoundary>
                  <Suspense fallback={<PageSkeleton label="Carregando página da Biblioteca CDCC..." />}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/vestibular" element={<VestibularPage />} />
                      <Route path="/novidades" element={<Novidades />} />
                      <Route path="/sugerir" element={<SugestaoCompra />} />
                      <Route path="/totem" element={<Totem />} />
                      <Route path="/p/:slug" element={<CustomPageView />} />
                      <Route path="/espacoludico" element={<EspacoLudico />} />
                      <Route path="/espacoludico/:jogo" element={<GameRules />} />
                      <Route path="/estantes" element={<Estantes />} />
                      <Route path="/estantes/:sala/:numero" element={<ShelfDetail />} />
                      <Route path="/admin/*" element={<AdminRoutes />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </MainTemplate>
            </BookSearchProvider>
          </VisitRouteProvider>
        </AccessibilityProvider>
      </SiteConfigProvider>
    </HashRouter>
    </MotionConfig>
  );
}
