import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Card,
} from "@/shared/components/ui";

import { getCommands } from "@/features/command-palette/data/commands";
import { invoke } from "@tauri-apps/api/core";
import {
  captureShortcut,
  displayShortcut,
  getDefaultShortcut,
    isSupportedShortcut,
  normalizeShortcut,
  SHORTCUT_IDS,
} from "@/shared/utils/shortcuts";
import { useSettingsStore } from "../store/settingsStore";

const categoryLabels = {
  navigation: "Navigation",
  overlay: "Overlay",
  commandPalette: "Command Palette",
  projects: "Projects",
  editor: "Editor",
  application: "Application",
} as const;

export default function CommandSettings() {
  const navigate = useNavigate();

  const settings = useSettingsStore(
    (state) => state.settings
  );

  const platform = useSettingsStore(
    (state) => state.platform
  );

  const setCommandShortcut =
    useSettingsStore(
      (state) => state.setCommandShortcut
    );

  const resetCommandShortcut =
    useSettingsStore(
      (state) => state.resetCommandShortcut
    );

    const resetAllCommandShortcuts =
  useSettingsStore(
    (state) =>
      state.resetAllCommandShortcuts
  );

  const commands = useMemo(() => {
    const overlayShortcut = getDefaultShortcut(
      SHORTCUT_IDS.overlay,
      platform
    );

    return [
      ...getCommands(navigate),
      {
        id: SHORTCUT_IDS.overlay,
        title: "Toggle Origin Overlay",
        subtitle: "Show or hide the global Origin overlay",
        category: "overlay" as const,
        keywords: ["overlay", "global", "show", "hide"],
        defaultShortcut: overlayShortcut,
        action: () => invoke("toggle_overlay_command"),
      },
    ];
  }, [navigate, platform]);

  const [recordingCommand, setRecordingCommand] =
    useState<string | null>(null);

  const [recordedShortcut, setRecordedShortcut] =
    useState<string | null>(null);

  const groupedCommands = useMemo(() => {
    return commands.reduce(
      (groups, command) => {
        const category = command.category;

        if (!groups[category]) {
          groups[category] = [];
        }

        groups[category].push(command);

        return groups;
      },
      {} as Record<
        keyof typeof categoryLabels,
        typeof commands
      >
    );
  }, [commands]);

  const startRecording = (
    commandId: string
  ) => {
    setRecordingCommand(commandId);
    setRecordedShortcut(null);
  };

  const cancelRecording = () => {
    setRecordingCommand(null);
    setRecordedShortcut(null);
  };

  /*
   * Listen globally while a shortcut is being recorded.
   */
  useEffect(() => {
    if (!recordingCommand) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.key === "Escape") {
        cancelRecording();
        return;
      }

      const shortcut = captureShortcut(event, platform);

      if (!shortcut) {
        return;
      }

      setRecordedShortcut(shortcut);
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
      true
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
        true
      );
    };
  }, [platform, recordingCommand]);

  const saveShortcut = async (
    commandId: string
  ) => {
    if (!recordedShortcut) {
      return;
    }

    const normalizedShortcut = normalizeShortcut(
      recordedShortcut
    );

    if (!isSupportedShortcut(normalizedShortcut)) {
      window.alert(
        "Use a key together with at least one modifier, such as Ctrl+K or Command+Shift+O."
      );

      return;
    }

    if (
      platform === "macos" &&
      normalizedShortcut ===
        "CommandOrControl+Shift+Space" &&
      commandId === SHORTCUT_IDS.overlay
    ) {
      window.alert(
        "Command+Shift+Space is commonly used by macOS Spotlight. Choose another shortcut."
      );

      return;
    }

    const duplicate = commands.some((command) => {
      if (command.id === commandId) {
        return false;
      }

      const existingShortcut =
        settings.commandShortcuts[command.id] ??
        getDefaultShortcut(command.id, platform);

      return (
        existingShortcut !== undefined &&
        normalizeShortcut(existingShortcut) ===
          normalizedShortcut
      );
    });

    if (duplicate) {
      window.alert(
        "This shortcut is already assigned to another command."
      );

      return;
    }

    try {
      await setCommandShortcut(commandId, normalizedShortcut);
      cancelRecording();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Origin could not register that shortcut."
      );
    }
  };

  return (
    <Card className="max-w-3xl p-6">
      <div className="mb-6">
        <p className="text-[12px] font-medium uppercase tracking-[0.02em] text-[var(--color-text-tertiary)]">
          Commands
        </p>

        <h2 className="mt-2 text-[18px] font-semibold text-[var(--color-text-primary)]">
          Command shortcuts
        </h2>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
  <p className="max-w-xl text-[13px] text-[var(--color-text-secondary)]">
    Configure keyboard shortcuts for commands throughout Origin. Global shortcuts can conflict with operating-system shortcuts or another application.
  </p>

  <Button
    variant="ghost"
    size="sm"
    onClick={async () => {
      const confirmed = window.confirm(
        "Reset all command shortcuts to their defaults?"
      );

      if (!confirmed) {
        return;
      }

      await resetAllCommandShortcuts();
    }}
  >
    Reset All
  </Button>
</div>
      </div>

      <div className="space-y-6">
        {(
          Object.keys(categoryLabels) as Array<
            keyof typeof categoryLabels
          >
        ).map((category) => {
          const categoryCommands =
            groupedCommands[category] ?? [];

          if (
            categoryCommands.length === 0
          ) {
            return null;
          }

          return (
            <section key={category}>
              <h3 className="mb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                {categoryLabels[category]}
              </h3>

              <div className="overflow-hidden rounded-[8px] border border-[var(--color-border-subtle)]">
                {categoryCommands.map(
                  (command, index) => {
                    const isRecording =
                      recordingCommand ===
                      command.id;

                    const currentShortcut =
                      settings
                        .commandShortcuts[
                        command.id
                      ] ??
                      command.defaultShortcut;

                    const hasCustomShortcut =
                      Boolean(
                        settings
                          .commandShortcuts[
                          command.id
                        ]
                      );

                    return (
                      <div
                        key={command.id}
                        className={
                          index ===
                          categoryCommands.length -
                            1
                            ? "flex items-center justify-between gap-4 px-4 py-3"
                            : "flex items-center justify-between gap-4 border-b border-[var(--color-border-subtle)] px-4 py-3"
                        }
                      >
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-[var(--color-text-primary)]">
                            {command.title}
                          </p>

                          {command.subtitle && (
                            <p className="mt-0.5 text-[12px] text-[var(--color-text-secondary)]">
                              {command.subtitle}
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          {isRecording ? (
                            <>
                              <div className="rounded-[6px] border border-[var(--color-accent)] bg-[var(--color-accent-muted)] px-3 py-1.5 font-mono text-[11px] text-[var(--color-accent)]">
                                  {recordedShortcut
                                  ? displayShortcut(
                                      recordedShortcut,
                                      platform
                                    )
                                  : "Press a shortcut..."}
                              </div>

                              <Button
                                size="sm"
                                onClick={() =>
                                  saveShortcut(
                                    command.id
                                  )
                                }
                                disabled={
                                  !recordedShortcut
                                }
                              >
                                Save
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={
                                  cancelRecording
                                }
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              {currentShortcut ? (
                                <kbd className="rounded-[6px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-2 py-1 font-mono text-[11px] text-[var(--color-text-secondary)]">
                                  {displayShortcut(
                                    currentShortcut,
                                    platform
                                  )}
                                </kbd>
                              ) : null}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  startRecording(
                                    command.id
                                  )
                                }
                              >
                                Change
                              </Button>

                              {hasCustomShortcut ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    resetCommandShortcut(
                                      command.id
                                    )
                                  }
                                >
                                  Reset
                                </Button>
                              ) : null}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </section>
          );
        })}
      </div>
    </Card>
  );
}