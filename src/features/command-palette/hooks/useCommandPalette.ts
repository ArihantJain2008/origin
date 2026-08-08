import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useProjectStore } from "@/features/projects/store/projectStore";
import { useSettingsStore } from "@/features/settings/store/settingsStore";

import { useCommandPaletteStore } from "../store/commandPaletteStore";
import { getCommands } from "../data/commands";
import { getProjectCommands } from "../data/projectCommands";

function normalizeKey(key: string) {
  return key.length === 1 ? key.toUpperCase() : key;
}

function shortcutMatches(
  event: KeyboardEvent,
  shortcut: string
) {
  const parts = shortcut
    .split("+")
    .map((part) => part.trim().toLowerCase());

  const hasCtrl = parts.includes("ctrl");
  const hasShift = parts.includes("shift");
  const hasAlt = parts.includes("alt");

  const hasMeta =
    parts.includes("meta") ||
    parts.includes("cmd") ||
    parts.includes("command");

  const keyPart = parts.find(
    (part) =>
      ![
        "ctrl",
        "shift",
        "alt",
        "meta",
        "cmd",
        "command",
      ].includes(part)
  );

  if (!keyPart) {
    return false;
  }

  return (
    event.ctrlKey === hasCtrl &&
    event.shiftKey === hasShift &&
    event.altKey === hasAlt &&
    event.metaKey === hasMeta &&
    normalizeKey(event.key).toLowerCase() ===
      keyPart.toLowerCase()
  );
}

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
       * Command palette
       */
      if (
        event.ctrlKey &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        toggle();
        return;
      }

      /*
       * Escape
       */
      if (event.key === "Escape") {
        close();
        return;
      }

      /*
       * Don't trigger global shortcuts while
       * typing inside an input.
       */
      const target = event.target as HTMLElement | null;

      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if (isTyping) {
        return;
      }

      /*
       * Execute configured shortcuts.
       */
      for (const command of commands) {
        const shortcut =
          settings.commandShortcuts[command.id] ??
          command.defaultShortcut;

        if (!shortcut) {
          continue;
        }

        if (
          shortcutMatches(
            event,
            shortcut
          )
        ) {
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
    toggle,
    close,
  ]);

  return {
    open,
    close,
    toggle,
  };
}