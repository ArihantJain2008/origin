import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { useProjectStore } from "@/features/projects/store/projectStore";

import { useCommandPaletteStore } from "../store/commandPaletteStore";
import { getCommands } from "../data/commands";
import { getProjectCommands } from "../data/projectCommands";
import { filterCommands } from "../utils/filterCommands";
import { useCommandPaletteNavigation } from "../hooks/useCommandPaletteNavigation";

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

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

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
      inputRef.current?.focus();
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-24 backdrop-blur-sm"
      onClick={resetPalette}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-2xl"
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          placeholder="Type a command..."
          className="w-full border-b border-[var(--color-border)] bg-transparent px-6 py-5 text-lg outline-none placeholder:text-[var(--color-text-secondary)]"
        />

        <div className="p-2">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-[var(--color-text-secondary)]">
              No commands found.
            </div>
          ) : (
            filteredCommands.map((command, index) => (
              <button
                key={command.id}
                type="button"
                onClick={() => {
                  resetPalette();
                  command.action();
                }}
                className={`w-full rounded-xl px-4 py-3 text-left transition ${
                  selectedIndex === index
                    ? "bg-[var(--color-bg-hover)]"
                    : "hover:bg-[var(--color-bg-hover)]"
                }`}
              >
                <p className="font-medium">
                  {command.title}
                </p>

                {command.subtitle && (
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    {command.subtitle}
                  </p>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}