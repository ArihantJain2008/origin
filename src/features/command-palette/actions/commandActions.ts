import { Project } from "@/features/projects/types/project";
import {
  launchProject,
  revealProject,
} from "@/features/workspace/services/launcher";

export function openProject(project: Project) {
  launchProject(project.id, project.path);
}

export function revealProjectFolder(project: Project) {
  revealProject(project.path);
}