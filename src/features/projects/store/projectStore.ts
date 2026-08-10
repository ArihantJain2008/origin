import { create } from "zustand";

import { Project } from "../types/project";
import {
  loadProjects as loadProjectsFromApi,
} from "../services/projectApi";

interface ProjectStore {
  projects: Project[];

  activeProjectId: string | null;

  searchQuery: string;

  addProject: (project: Project) => void;

  removeProject: (id: string) => void;

  updateProject: (project: Project) => void;

  loadProjects: () => Promise<void>;

  setActiveProject: (
    projectId: string | null
  ) => void;

  setSearchQuery: (query: string) => void;
}

export const useProjectStore =
  create<ProjectStore>((set) => ({
    projects: [],

    activeProjectId: null,

    searchQuery: "",

    addProject: (project) =>
      set((state) => ({
        projects: [...state.projects, project],
      })),

    removeProject: (id) =>
      set((state) => {
        const projects =
          state.projects.filter(
            (project) =>
              project.id !== id
          );

        const activeProjectId = state.activeProjectId === id ? null : state.activeProjectId;

        return { projects, activeProjectId };
      }),

    updateProject: (project) =>
      set((state) => ({
        projects:
          state.projects.map(
            (existingProject) =>
              existingProject.id ===
              project.id
                ? project
                : existingProject
          ),
      })),

    loadProjects: async () => {
        // Load persisted activeProjectId from backend settings before loading projects
        let persistedActive: string | null = null;
        try {
          // dynamic import to avoid circulars at module init
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const api = await import("../services/projectApi");
          persistedActive = await api.loadActiveProject();
        } catch (e) {
          console.warn("Failed to load persisted active project:", e);
        }

        const projects = await loadProjectsFromApi();

        set((state) => {
          // If there is a persisted active project id, restore it only if it still exists.
          const activeStillExists =
            persistedActive !== null && projects.some((project) => project.id === persistedActive);

          return {
            projects,
            activeProjectId: activeStillExists ? persistedActive : null,
          };
        });
    },

    setActiveProject: (projectId) =>
      set((state) => {
        // Update in-memory state immediately
        const next = { activeProjectId: projectId } as Partial<ProjectStore>;

        // Persist change in background
        import("../services/projectApi")
          .then((api) => api.saveActiveProject(projectId))
          .catch((e) => console.warn("Failed to persist active project:", e));

        return next;
      }),

    setSearchQuery: (query) =>
      set({
        searchQuery: query,
      }),
  }));