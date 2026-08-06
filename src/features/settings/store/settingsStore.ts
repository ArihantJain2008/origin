import { create } from "zustand";
import { Settings } from "../types/settings";
import { Editor } from "../types/editor";
import {
  saveSettings,
  loadSettings as loadSettingsFromApi,
} from "../services/settingsApi";

interface SettingsStore {
  settings: Settings;

  setPreferredEditor: (
    editor: Editor
  ) => Promise<void>;

  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: {
    preferredEditor: "vscode",
  },

  setPreferredEditor: async (editor) => {
  const settings = {
    preferredEditor: editor,
  };

  await saveSettings(settings);

  set({
    settings,
  });
},

loadSettings: async () => {
  const settings = await loadSettingsFromApi();

  set({
    settings,
  });
},
}));