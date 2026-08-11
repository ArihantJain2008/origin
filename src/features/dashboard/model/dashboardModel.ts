import { AnalysisDto } from "@/features/analysis/types/analysis";
import { Project } from "@/features/projects/types/project";

export interface DashboardSummary {
  totalProjects: number;
  healthyProjects: number;
  modifiedProjects: number;
  totalTodos: number;
}

export interface DashboardInsight {
  title: string;
  description: string;
  tone: "success" | "warning" | "danger" | "neutral";
}

export interface DashboardModel {
  summary: DashboardSummary;
  insights: DashboardInsight[];
  isAnalyzing: boolean;
}

const HEALTHY_SCORE = 80;

function getDashboardSummary(
  projects: Project[],
  analysis: Record<string, AnalysisDto>,
  todosByProject: Record<string, { completed: boolean }[]>
): DashboardSummary {
  let healthyProjects = 0;
  let modifiedProjects = 0;
  let totalTodos = 0;

  projects.forEach((project) => {
    const projectAnalysis = analysis[project.id];

    if (projectAnalysis) {
      if (projectAnalysis.health.score >= HEALTHY_SCORE) {
        healthyProjects++;
      }
    }

    if (project.gitDirty) {
      modifiedProjects++;
    }

    const projectTodos =
      todosByProject[project.path] ?? [];

    totalTodos += projectTodos.filter(
      (todo) => !todo.completed
    ).length;
  });

  return {
    totalProjects: projects.length,
    healthyProjects,
    modifiedProjects,
    totalTodos,
  };
}

function getDashboardInsights(
  projects: Project[],
  analysis: Record<string, AnalysisDto>
): DashboardInsight[] {
  const insights: DashboardInsight[] = [];

  projects.forEach((project) => {
    const projectAnalysis = analysis[project.id];

    if (!project.gitBranch) {
      insights.push({
        title: project.name,
        description: "No Git repository detected.",
        tone: "danger",
      });

      return;
    }

    if (!projectAnalysis) {
      return;
    }

    if (projectAnalysis.health.score < 60) {
      insights.push({
        title: project.name,
        description: `Health score is ${projectAnalysis.health.score}%.`,
        tone: "warning",
      });

      return;
    }

    if (!projectAnalysis.readme.description) {
      insights.push({
        title: project.name,
        description: "README is missing.",
        tone: "warning",
      });

      return;
    }

    if (projectAnalysis.todos.length > 10) {
      insights.push({
        title: project.name,
        description: `${projectAnalysis.todos.length} TODOs remaining.`,
        tone: "neutral",
      });

      return;
    }

    if (project.gitDirty) {
      insights.push({
        title: project.name,
        description: "Repository has uncommitted changes.",
        tone: "neutral",
      });
    }
  });

  return insights;
}

export function buildDashboardModel(
  projects: Project[],
  analysis: Record<string, AnalysisDto>,
  loading: Record<string, boolean>,
  todosByProject: Record<string, { completed: boolean }[]>
): DashboardModel {
  return {
    summary: getDashboardSummary(
      projects,
      analysis,
      todosByProject
    ),

    insights: getDashboardInsights(
      projects,
      analysis
    ),

    isAnalyzing:
      Object.values(loading).some(Boolean),
  };
}