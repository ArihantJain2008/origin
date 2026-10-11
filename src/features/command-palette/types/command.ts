export type CommandCategory =
  | "navigation"
  | "projects"
  | "editor"
  | "application"
  | "overlay"
  | "commandPalette";

export interface Command {
  id: string;

  title: string;

  subtitle?: string;

  keywords?: string[];

  category: CommandCategory;

  defaultShortcut?: string;

  action: () => void | Promise<void>;
}