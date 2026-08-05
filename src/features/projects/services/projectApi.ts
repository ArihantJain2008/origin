import { invoke } from "@tauri-apps/api/core";
import { Project } from "../types/project";

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