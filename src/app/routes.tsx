import { createBrowserRouter } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";

import HomePage from "@/features/home/pages/HomePage";
import ProjectsPage from "@/features/projects/pages/ProjectsPage";
import WorkspacePage from "@/features/workspace/pages/WorkspacePage";
import SettingsPage from "@/features/settings/pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
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