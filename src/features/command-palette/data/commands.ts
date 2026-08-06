import { Command } from "../types/command";

export function getCommands(navigate: (path: string) => void): Command[] {
  return [
    {
      id: "home",
      title: "Go to Home",
      subtitle: "Navigate to dashboard",
      keywords: ["dashboard", "start"],
      action: () => navigate("/"),
    },

    {
      id: "projects",
      title: "Go to Projects",
      subtitle: "View all projects",
      keywords: ["project", "workspace", "files"],
      action: () => navigate("/projects"),
    },

    {
      id: "workspace",
      title: "Go to Workspace",
      subtitle: "Open workspace",
      keywords: ["editor", "coding"],
      action: () => navigate("/workspace"),
    },

    {
      id: "settings",
      title: "Go to Settings",
      subtitle: "Application preferences",
      keywords: ["preferences", "config", "editor", "theme"],
      action: () => navigate("/settings"),
    },
  ];
}
