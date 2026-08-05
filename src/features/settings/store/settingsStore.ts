import { create } from "zustand";
import { Settings } from "../types/settings";
import { Editor } from "../types/editor";

interface SettingsStore {
  settings: Settings;

  setPreferredEditor: (editor: Editor) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: {
    preferredEditor: "vscode",
  },

  setPreferredEditor: (editor) =>
    set((state) => ({
      settings: {
        ...state.settings,
        preferredEditor: editor,
      },
    })),
}));