import "./styles/global.css";
import "./styles/theme.css";

import { lazy, Suspense } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { MainTemplate } from "./components/template/MainTemplate";
import { AccessibilityProvider } from "./context/AccessibilityContext";
import { BookSearchProvider } from "./context/BookSearchContext";
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
const NotFound = lazy(() =>
  import("./pages/NotFound").then((m) => ({ default: m.NotFound })),
);
const AdminRoutes = lazy(() =>
  import("./admin/AdminRoutes").then((m) => ({ default: m.AdminRoutes })),
);

export function App() {
  return (
    <HashRouter>
      <AccessibilityProvider>
        <BookSearchProvider>
          <MainTemplate>
            <ErrorBoundary>
              <Suspense
                fallback={
                  <div role="status" aria-live="polite" className="page-loading-fallback">
                    Carregando página...
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<Home />} />
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
      </AccessibilityProvider>
    </HashRouter>
  );
}
