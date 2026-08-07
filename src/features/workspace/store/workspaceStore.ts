import { create } from "zustand";

interface WorkspaceStore {
  activeProjectId: string | null;

  setActiveProject: (projectId: string) => void;

  clearWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  activeProjectId: null,

  setActiveProject: (projectId) =>
    set({
      activeProjectId: projectId,
    }),

  clearWorkspace: () =>
    set({
      activeProjectId: null,
    }),
}));