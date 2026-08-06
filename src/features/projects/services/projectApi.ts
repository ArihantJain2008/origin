import { invoke } from "@tauri-apps/api/core";
import { Project } from "../types/project";
import {
  mapProjectDto,
  ProjectDto,
} from "../mappers/projectMapper";


export async function saveProject(project: Project) {
  await invoke("save_project", {
  project: {
    id: project.id,
    name: project.name,
    path: project.path,
    framework: project.metadata.framework,
    language: project.metadata.language,
    favorite: project.favorite,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  },
});
}

export async function loadProjects(): Promise<Project[]> {
  const projects = await invoke<ProjectDto[]>("load_projects");

  return projects.map(mapProjectDto);
}

export async function removeProject(id: string) {
  await invoke("remove_project", {
    id,
  });
}

export async function updateProjectFavorite(
  id: string,
  favorite: boolean
) {
  await invoke("update_project_favorite", {
    id,
    favorite,
  });
}