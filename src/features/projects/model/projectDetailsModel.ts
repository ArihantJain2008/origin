import { AnalysisDto } from "@/features/analysis/types/analysis";
import { Project } from "../types/project";

export interface ProjectDetailsModel {
  project: Project;

  analysis?: AnalysisDto;

  healthScore: number;

  gitBranch: string;

  isGitRepository: boolean;

  isDirty: boolean;

  readmeAvailable: boolean;

  dependencyCount: number;

  todoCount: number;

  framework: string;

  language: string;

  lastOpened?: string;
}

export function buildProjectDetailsModel(
  project: Project,
  analysis?: AnalysisDto
): ProjectDetailsModel {
  return {
    project,

    analysis,

    healthScore: analysis?.health.score ?? 0,

    gitBranch: project.gitBranch ?? "Not a Git repository",

    isGitRepository: Boolean(project.gitBranch),

    isDirty: project.gitDirty,

    readmeAvailable: Boolean(
      analysis?.readme.description
    ),

    dependencyCount:
      analysis?.dependencies.length ?? 0,

    todoCount:
      analysis?.todos.length ?? 0,

    framework: project.metadata.framework,

    language: project.metadata.language,

    lastOpened: project.lastOpened,
  };
}