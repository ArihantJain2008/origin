import { Editor } from "./editor";

export type Theme = "dark" | "light" | "system";

export interface CommandShortcutMap {
  [commandId: string]: string;
}

export interface Settings {
  preferredEditor: Editor;

  theme: Theme;

  commandShortcuts: CommandShortcutMap;
}