import { create } from "zustand";
import { Project } from "../types/project";
import { loadProjects as loadProjectsFromApi } from "../services/projectApi";

interface ProjectStore {
  projects: Project[];

  addProject: (project: Project) => void;

  removeProject: (id: string) => void;

  updateProject: (project: Project) => void;

  loadProjects: () => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],

  addProject: (project) =>
    set((state) => ({
      projects: [...state.projects, project],
    })),

  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    })),

  updateProject: (project) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === project.id ? project : p
      ),
    })),

    loadProjects: async () => {
  const projects = await loadProjectsFromApi();

  set({
    projects,
  });
},

}));