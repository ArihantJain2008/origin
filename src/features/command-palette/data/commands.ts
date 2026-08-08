import { Command } from "../types/command";

export function getCommands(
  navigate: (path: string) => void
): Command[] {
  return [
    {
      id: "home",
      title: "Go to Home",
      subtitle: "Navigate to dashboard",
      category: "navigation",
      keywords: ["dashboard", "start", "home"],
      defaultShortcut: "Ctrl+H",
      action: () => navigate("/"),
    },

    {
      id: "projects",
      title: "Go to Projects",
      subtitle: "View all projects",
      category: "navigation",
      keywords: [
        "project",
        "projects",
        "files",
      ],
      defaultShortcut: "Ctrl+2",
      action: () => navigate("/projects"),
    },

    {
      id: "settings",
      title: "Go to Settings",
      subtitle: "Application preferences",
      category: "application",
      keywords: [
        "preferences",
        "config",
        "settings",
        "theme",
      ],
      defaultShortcut: "Ctrl+,",
      action: () => navigate("/settings"),
    },
  ];
}