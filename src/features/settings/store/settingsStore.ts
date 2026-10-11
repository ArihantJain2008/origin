import { create } from "zustand";

import { Settings } from "../types/settings";
import { Editor } from "../types/editor";
import { applyTheme } from "../utils/applyTheme";

import {
  saveSettings,
  loadSettings as loadSettingsFromApi,
  updateOverlayShortcut,
} from "../services/settingsApi";
import {
  getDefaultShortcut,
  getOriginPlatform,
  normalizeShortcut,
  SHORTCUT_IDS,
  type OriginPlatform,
} from "@/shared/utils/shortcuts";

interface SettingsStore {
  settings: Settings;

  platform: OriginPlatform;

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
    home: "CommandOrControl+H",
    projects: "CommandOrControl+2",
    settings: "CommandOrControl+,",
    [SHORTCUT_IDS.commandPalette]: "CommandOrControl+K",
  },
};

export const useSettingsStore =
  create<SettingsStore>((set, get) => ({
    settings: defaultSettings,
    platform: getOriginPlatform(),

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
      const normalizedShortcut = normalizeShortcut(shortcut);
      const previousShortcut =
        get().settings.commandShortcuts[commandId] ??
        getDefaultShortcut(commandId, get().platform);

      if (!normalizedShortcut) {
        throw new Error("Shortcut cannot be empty.");
      }

      if (commandId === SHORTCUT_IDS.overlay) {
        await updateOverlayShortcut(normalizedShortcut);
      }

      const settings = {
        ...get().settings,

        commandShortcuts: {
          ...get().settings.commandShortcuts,
          [commandId]: normalizedShortcut,
        },
      };

      try {
        await saveSettings(settings);
      } catch (error) {
        if (
          commandId === SHORTCUT_IDS.overlay &&
          previousShortcut
        ) {
          await updateOverlayShortcut(previousShortcut);
        }

        throw error;
      }

      set({
        settings,
      });
    },

    resetCommandShortcut: async (
      commandId
    ) => {
      if (commandId === SHORTCUT_IDS.overlay) {
        const defaultShortcut = getDefaultShortcut(
          commandId,
          get().platform
        );

        if (defaultShortcut) {
          await updateOverlayShortcut(defaultShortcut);
        }
      }

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
      const defaultOverlayShortcut = getDefaultShortcut(
        SHORTCUT_IDS.overlay,
        get().platform
      );

      if (defaultOverlayShortcut) {
        await updateOverlayShortcut(defaultOverlayShortcut);
      }

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
      const platform = getOriginPlatform();

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
        platform,
      });

      applyTheme(mergedSettings.theme);
    },
  }));