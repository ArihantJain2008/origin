import { Project } from "@/features/projects/types/project";

import {
  launchProject,
  revealProject,
} from "@/features/workspace/services/launcher";

export async function openProject(
  project: Project
) {
  await launchProject(
    project.id,
    project.path
  );
}

export async function revealProjectFolder(
  project: Project
) {
  await revealProject(
    project.path
  );
}