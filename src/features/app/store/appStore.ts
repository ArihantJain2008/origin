import { create } from "zustand";

interface AppStore {
  ready: boolean;
  initializing: boolean;

  setReady: (value: boolean) => void;
  setInitializing: (value: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  ready: false,

  initializing: true,

  setReady: (value) =>
    set({
      ready: value,
    }),

  setInitializing: (value) =>
    set({
      initializing: value,
    }),
}));