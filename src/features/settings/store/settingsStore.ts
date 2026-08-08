import { create } from "zustand";

import { Settings } from "../types/settings";
import { Editor } from "../types/editor";
import { applyTheme } from "../utils/applyTheme";

import {
  saveSettings,
  loadSettings as loadSettingsFromApi,
} from "../services/settingsApi";

interface SettingsStore {
  settings: Settings;

  setPreferredEditor: (
    editor: Editor
  ) => Promise<void>;

  setTheme: (
    theme: Settings["theme"]
  ) => Promise<void>;

  setCommandShortcut: (
    commandId: string,
    shortcut: string
  ) => Promise<void>;

  resetCommandShortcut: (
    commandId: string
  ) => Promise<void>;

  resetAllCommandShortcuts: () => Promise<void>;

  loadSettings: () => Promise<void>;
}

const defaultSettings: Settings = {
  preferredEditor: "vscode",

  theme: "dark",

  commandShortcuts: {
    home: "Ctrl+H",
    projects: "Ctrl+2",
    settings: "Ctrl+,",
  },
};

export const useSettingsStore =
  create<SettingsStore>((set, get) => ({
    settings: defaultSettings,

    setPreferredEditor: async (editor) => {
      const settings = {
        ...get().settings,
        preferredEditor: editor,
      };

      await saveSettings(settings);

      set({
        settings,
      });
    },

    setTheme: async (theme) => {
      const settings = {
        ...get().settings,
        theme,
      };

      await saveSettings(settings);

      set({
        settings,
      });

      applyTheme(theme);
    },

    setCommandShortcut: async (
      commandId,
      shortcut
    ) => {
      const settings = {
        ...get().settings,

        commandShortcuts: {
          ...get().settings.commandShortcuts,
          [commandId]: shortcut,
        },
      };

      await saveSettings(settings);

      set({
        settings,
      });
    },

    resetCommandShortcut: async (
      commandId
    ) => {
      const commandShortcuts = {
        ...get().settings.commandShortcuts,
      };

      delete commandShortcuts[commandId];

      const settings = {
        ...get().settings,

        commandShortcuts,
      };

      await saveSettings(settings);

      set({
        settings,
      });
    },

    resetAllCommandShortcuts: async () => {
      const settings = {
        ...get().settings,

        commandShortcuts: {
          ...defaultSettings.commandShortcuts,
        },
      };

      await saveSettings(settings);

      set({
        settings,
      });
    },

    loadSettings: async () => {
      const settings =
        await loadSettingsFromApi();

      const mergedSettings: Settings = {
        ...defaultSettings,

        ...settings,

        commandShortcuts: {
          ...defaultSettings.commandShortcuts,
          ...settings.commandShortcuts,
        },
      };

      set({
        settings: mergedSettings,
      });

      applyTheme(mergedSettings.theme);
    },
  }));