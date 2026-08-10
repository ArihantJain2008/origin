import { createBrowserRouter } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";

import HomePage from "@/features/home/pages/HomePage";
import ProjectsPage from "@/features/projects/pages/ProjectsPage";
import WorkspacePage from "@/features/workspace/pages/WorkspacePage";
import SettingsPage from "@/features/settings/pages/SettingsPage";
import ProjectDetailsPage from "@/features/projects/pages/ProjectDetailsPage";

import OverlaySearchPage from "@/features/overlay/pages/OverlaySearchPage";

function RootLayout() {
  const params = new URLSearchParams(
    window.location.search
  );

  const isOverlay =
    params.get("overlay") === "1";

  if (isOverlay) {
    document.documentElement.classList.add(
      "overlay-mode"
    );

    document.body.classList.add(
      "overlay-mode"
    );

    return <OverlaySearchPage />;
  }

  document.documentElement.classList.remove(
    "overlay-mode"
  );

  document.body.classList.remove(
    "overlay-mode"
  );

  return <MainLayout />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,

    children: [
      {
        index: true,
        element: <HomePage />,
      },

      {
        path: "projects",
        element: <ProjectsPage />,
      },

      {
        path: "projects/:id",
        element: <ProjectDetailsPage />,
      },

      {
        path: "workspace",
        element: <WorkspacePage />,
      },

      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
]);