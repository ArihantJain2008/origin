import { Project } from "@/features/projects/types/project";
import { Command } from "../types/command";

import {
  openProject,
  revealProjectFolder,
} from "../actions/commandActions";

export function getProjectCommands(
  projects: Project[]
): Command[] {
  return projects.flatMap((project) => [
    {
      id: `open-${project.id}`,
      title: `Open ${project.name}`,
      subtitle: project.path,
      keywords: [
        project.name,
        "open",
        project.metadata.framework,
        project.metadata.language,
      ],
      action: () => openProject(project),
    },
    {
      id: `reveal-${project.id}`,
      title: `Reveal ${project.name}`,
      subtitle: project.path,
      keywords: [
        project.name,
        "reveal",
        "explorer",
        "folder",
      ],
      action: () => revealProjectFolder(project),
    },
  ]);
}