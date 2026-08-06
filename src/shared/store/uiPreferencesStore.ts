import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type ProjectView = "grid" | "list";

interface UiPreferencesState {
  projectView: ProjectView;
  sidebarCollapsed: boolean;
  setProjectView: (view: ProjectView) => void;
  toggleSidebar: () => void;
}

export const useUiPreferencesStore = create<UiPreferencesState>()(
  persist(
    (set) => ({
      projectView: "grid",
      sidebarCollapsed: false,
      setProjectView: (projectView) => set({ projectView }),
      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),
    }),
    {
      name: "origin-ui-preferences",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
