import { useBookSearchContext } from "../../../context/bookSearchStore";
import { AccessibilityDrawer } from "../../AccessibilityDrawer";
import { BentinhoGuide } from "../../BentinhoGuide";
import { Footer } from "../../Footer";
import { Nav } from "../../Nav";
import { SearchResultModal } from "../../SearchResultModal";
import { SeasonalOverlay } from "../../SeasonalOverlay";
import { VisitRouteDrawer } from "../../VisitRouteDrawer";
import { VisualEditorOverlay } from "../../VisualEditorOverlay";

type MainTemplateProps = {
  children: React.ReactNode;
};

export function MainTemplate({ children }: MainTemplateProps) {
  const {
    lastQuery,
    resultsByRoom,
    activeRoom,
    matchedContext,
    relatedNameMatches,
    searchKey,
    setActiveRoom,
    submitSearch,
    closeResults,
    focusPrimarySearch,
  } = useBookSearchContext();

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo principal
      </a>

      <Nav />

      <main id="main-content" tabIndex={-1} className="app-main">
        {children}
      </main>

      <Footer />

      <AccessibilityDrawer />
      <SeasonalOverlay />
      <VisitRouteDrawer />
      <BentinhoGuide />
      <VisualEditorOverlay />

      {resultsByRoom && activeRoom !== null && (
        <SearchResultModal
          key={searchKey}
          query={lastQuery}
          matchedContext={matchedContext}
          relatedMatches={relatedNameMatches}
          resultsByRoom={resultsByRoom}
          activeRoom={activeRoom}
          onSelectRoom={setActiveRoom}
          onSelectMatch={(item) => submitSearch(item.code, item)}
          onClose={closeResults}
          onNewSearch={focusPrimarySearch}
        />
      )}
    </div>
  );
}
