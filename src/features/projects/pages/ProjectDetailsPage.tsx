import {
  ArrowLeft,
} from "lucide-react";

import {
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAnalysisStore } from "@/features/analysis/store/analysisStore";
import { Button } from "@/shared/components/ui";

import ProjectAnalysisSummary from "../components/ProjectAnalysisSummary";
import ProjectDependencies from "../components/ProjectDependencies";
import ProjectHeader from "../components/ProjectHeader";
import ProjectInsights from "../components/ProjectInsights";
import ProjectOverview from "../components/ProjectOverview";
import ProjectQuickActions from "../components/ProjectQuickActions";
import ProjectReadme from "../components/ProjectReadme";
import ProjectTodos from "../components/ProjectTodos";
import { buildProjectDetailsModel } from "../model/projectDetailsModel";
import { useProjectStore } from "../store/projectStore";

export default function ProjectDetailsPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const projects = useProjectStore(
    (state) => state.projects
  );

  const project = projects.find(
    (project) => project.id === id
  );

  /*
   * Keep these as separate Zustand selectors.
   *
   * Do NOT return an object from a single selector here.
   */
  const analysis = useAnalysisStore(
    (state) =>
      project
        ? state.analysis[project.id]
        : undefined
  );

  const analysisLoading = useAnalysisStore(
    (state) =>
      project
        ? Boolean(state.loading[project.id])
        : false
  );

  if (!projects.length) {
    return (
      <div className="p-8">
        Loading project...
      </div>
    );
  }

  if (!project) {
    return (
      <Navigate
        to="/projects"
        replace
      />
    );
  }

  const model = buildProjectDetailsModel(
    project,
    analysis,
    analysisLoading
  );

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-6 2xl:px-8">
        <div className="space-y-6">
      <Button
        variant="ghost"
        className="w-fit px-0 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        onClick={() => navigate("/projects")}
      >
        <ArrowLeft size={15} />

        <span>Back to Projects</span>
      </Button>

      <ProjectHeader model={model} />

      <ProjectAnalysisSummary
        model={model}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <ProjectOverview model={model} />

        <ProjectInsights model={model} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ProjectReadme model={model} />

        <ProjectQuickActions model={model} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ProjectDependencies model={model} />

        <ProjectTodos model={model} />
      </div>
    </div>
    </div>
  );
}