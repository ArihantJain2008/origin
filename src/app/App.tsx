import MainLayout from "@/layouts/MainLayout";
import OverlaySearchPage from "@/features/overlay/pages/OverlaySearchPage";

function App() {
  const isOverlay =
    new URLSearchParams(window.location.search).get(
      "overlay"
    ) === "1";

  if (isOverlay) {
    return <OverlaySearchPage />;
  }

  return <MainLayout />;
}

export default App;