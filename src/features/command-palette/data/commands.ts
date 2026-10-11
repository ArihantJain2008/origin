import { Command } from "../types/command";
import { useCommandPaletteStore } from "../store/commandPaletteStore";

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
      defaultShortcut: "CommandOrControl+H",
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
      defaultShortcut: "CommandOrControl+2",
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
      defaultShortcut: "CommandOrControl+,",
      action: () => navigate("/settings"),
    },

    {
      id: "command-palette",
      title: "Toggle Command Palette",
      subtitle: "Open or close the command palette",
      category: "commandPalette",
      keywords: ["commands", "search", "palette"],
      defaultShortcut: "CommandOrControl+K",
      action: () => useCommandPaletteStore.getState().toggle(),
    },
  ];
}