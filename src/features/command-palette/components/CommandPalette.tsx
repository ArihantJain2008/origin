import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { useProjectStore } from "@/features/projects/store/projectStore";
import { useSettingsStore } from "@/features/settings/store/settingsStore";

import { useCommandPaletteStore } from "../store/commandPaletteStore";
import { getCommands } from "../data/commands";
import { getProjectCommands } from "../data/projectCommands";
import { filterCommands } from "../utils/filterCommands";
import { useCommandPaletteNavigation } from "../hooks/useCommandPaletteNavigation";

function formatShortcut(shortcut: string) {
  return shortcut
    .split("Control").join("Ctrl")
    .split("Meta").join("⌘")
    .split("ArrowUp").join("↑")
    .split("ArrowDown").join("↓")
    .split("ArrowLeft").join("←")
    .split("ArrowRight").join("→");
}

export default function CommandPalette() {
  const isOpen = useCommandPaletteStore(
    (state) => state.isOpen
  );

  const close = useCommandPaletteStore(
    (state) => state.close
  );

  const navigate = useNavigate();

  const projects = useProjectStore(
    (state) => state.projects
  );

  const settings = useSettingsStore(
    (state) => state.settings
  );

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] =
    useState(0);

  const inputRef =
    useRef<HTMLInputElement>(null);

  const commands = useMemo(() => {
    return [
      ...getCommands(navigate),
      ...getProjectCommands(projects),
    ];
  }, [navigate, projects]);

  const filteredCommands = useMemo(
    () => filterCommands(commands, query),
    [commands, query]
  );

  const resetPalette = () => {
    setQuery("");
    setSelectedIndex(0);
    close();
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  useCommandPaletteNavigation({
    isOpen,
    commands: filteredCommands,
    selectedIndex,
    setSelectedIndex,
    resetPalette,
  });

  if (!isOpen) {
    return null;
  }

  const executeCommand = (
    command: (typeof commands)[number]
  ) => {
    resetPalette();
    command.action();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[12vh]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          resetPalette();
        }
      }}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="border-b border-[var(--color-border-default)]">
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command..."
            className="w-full bg-transparent px-6 py-5 text-lg outline-none placeholder:text-[var(--color-text-secondary)]"
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-[var(--color-text-secondary)]">
              No commands found.
            </div>
          ) : (
            filteredCommands.map(
              (command, index) => {
                const shortcut =
                  settings.commandShortcuts[
                    command.id
                  ] ??
                  command.defaultShortcut;

                return (
                  <button
                    key={command.id}
                    type="button"
                    onClick={() =>
                      executeCommand(command)
                    }
                    className={`flex w-full items-center justify-between gap-4 rounded-xl px-4 py-3 text-left transition ${
                      selectedIndex === index
                        ? "bg-[var(--color-bg-hover)]"
                        : "hover:bg-[var(--color-bg-hover)]"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--color-text-primary)]">
                        {command.title}
                      </p>

                      {command.subtitle && (
                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                          {command.subtitle}
                        </p>
                      )}
                    </div>

                    {shortcut ? (
                      <kbd className="shrink-0 rounded-[6px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-2 py-1 font-mono text-xs text-[var(--color-text-tertiary)]">
                        {formatShortcut(
                          shortcut
                        )}
                      </kbd>
                    ) : null}
                  </button>
                );
              }
            )
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[var(--color-border-default)] px-4 py-3 text-xs text-[var(--color-text-tertiary)]">
          <span>
            ↑ ↓ to navigate
          </span>

          <span>
            Enter to run · Esc to close
          </span>
        </div>
      </div>
    </div>
  );
}