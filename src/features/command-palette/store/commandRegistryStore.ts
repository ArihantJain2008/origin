import { create } from "zustand";

import { Command } from "../types/command";

interface CommandRegistryStore {
  commands: Command[];

  registerCommands: (
    commands: Command[]
  ) => void;

  clearCommands: () => void;
}

export const useCommandRegistryStore =
  create<CommandRegistryStore>((set) => ({
    commands: [],

    registerCommands: (commands) =>
      set({
        commands,
      }),

    clearCommands: () =>
      set({
        commands: [],
      }),
  }));