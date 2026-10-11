import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useProjectStore } from "@/features/projects/store/projectStore";
import { useSettingsStore } from "@/features/settings/store/settingsStore";

import { useCommandPaletteStore } from "../store/commandPaletteStore";
import { getCommands } from "../data/commands";
import { getProjectCommands } from "../data/projectCommands";
import {
  getDefaultShortcut,
  getOriginPlatform,
  shortcutMatches,
  type OriginPlatform,
} from "@/shared/utils/shortcuts";

export function useCommandPalette() {
  const open = useCommandPaletteStore(
    (state) => state.open
  );

  const close = useCommandPaletteStore(
    (state) => state.close
  );

  const toggle = useCommandPaletteStore(
    (state) => state.toggle
  );

  const navigate = useNavigate();

  const projects = useProjectStore(
    (state) => state.projects
  );

  const settings = useSettingsStore(
    (state) => state.settings
  );

  const [platform, setPlatform] =
    useState<OriginPlatform>("windows");

  useEffect(() => {
    setPlatform(getOriginPlatform());
  }, []);

  const commands = useMemo(
    () => [
      ...getCommands(navigate),
      ...getProjectCommands(projects),
    ],
    [navigate, projects]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      /*
       * Escape
       */
      if (event.key === "Escape") {
        close();
        return;
      }

      /*
       * Execute configured shortcuts.
       */
      for (const command of commands) {
        const shortcut =
          settings.commandShortcuts[command.id] ??
          command.defaultShortcut ??
          getDefaultShortcut(command.id, platform);

        if (!shortcut) {
          continue;
        }

        if (
          shortcutMatches(event, shortcut, platform)
        ) {
          const target = event.target as HTMLElement | null;
          const isTyping =
            target?.tagName === "INPUT" ||
            target?.tagName === "TEXTAREA" ||
            target?.tagName === "SELECT" ||
            target?.isContentEditable;

          if (isTyping && command.id !== "command-palette") {
            return;
          }

          event.preventDefault();
          command.action();
          return;
        }
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    commands,
    settings.commandShortcuts,
    close,
    platform,
  ]);

  return {
    open,
    close,
    toggle,
  };
}