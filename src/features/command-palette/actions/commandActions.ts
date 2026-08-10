import { Project } from "@/features/projects/types/project";

import {
  launchProject,
  revealProject,
} from "@/features/workspace/services/launcher";
import { useProjectStore } from "@/features/projects/store/projectStore";

export async function openProject(
  project: Project
) {
  useProjectStore.getState().setActiveProject(project.id);

  await launchProject(project.id, project.path);
}

export async function revealProjectFolder(
  project: Project
) {
  await revealProject(
    project.path
  );
}