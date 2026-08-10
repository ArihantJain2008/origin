import { create } from "zustand";
import { persist } from "zustand/middleware";

import { RunCommand } from "../types/runCommand";

interface RunCommandStore {
  commandsByProject: Record<
    string,
    RunCommand[]
  >;

  addCommand: (projectPath: string, command: RunCommand) => void;

  removeCommand: (projectPath: string, commandId: string) => void;

  updateCommand: (projectPath: string, command: RunCommand) => void;
}

export const useRunCommandStore =
  create<RunCommandStore>()(
    persist(
      (set) => ({
        commandsByProject: {},

        addCommand: (projectPath, command) =>
          set((state) => ({
            commandsByProject: {
              ...state.commandsByProject,

              [projectPath]: [...(state.commandsByProject[projectPath] ?? []), command],
            },
          })),

        removeCommand: (projectPath, commandId) =>
          set((state) => ({
            commandsByProject: {
              ...state.commandsByProject,

              [projectPath]: (state.commandsByProject[projectPath] ?? []).filter((command) => command.id !== commandId),
            },
          })),

        updateCommand: (projectPath, updatedCommand) =>
          set((state) => ({
            commandsByProject: {
              ...state.commandsByProject,

              [projectPath]: (state.commandsByProject[projectPath] ?? []).map((command) =>
                command.id === updatedCommand.id ? updatedCommand : command
              ),
            },
          })),
      }),

      {
        name: "origin-run-commands",
      }
    )
  );