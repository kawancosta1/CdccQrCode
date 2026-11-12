import { useBookSearchContext } from "../../../context/bookSearchStore";
import { AccessibilityDrawer } from "../../AccessibilityDrawer";
import { Footer } from "../../Footer";
import { Nav } from "../../Nav";
import { SearchResultModal } from "../../SearchResultModal";
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
    searchKey,
    setActiveRoom,
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
      <VisualEditorOverlay />

      {resultsByRoom && activeRoom !== null && (
        <SearchResultModal
          key={searchKey}
          query={lastQuery}
          matchedContext={matchedContext}
          resultsByRoom={resultsByRoom}
          activeRoom={activeRoom}
          onSelectRoom={setActiveRoom}
          onClose={closeResults}
          onNewSearch={focusPrimarySearch}
        />
      )}
    </div>
  );
}
