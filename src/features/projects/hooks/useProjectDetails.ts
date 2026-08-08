import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { useAnalysisStore } from "@/features/analysis/store/analysisStore";
import { useProjectStore } from "../store/projectStore";

import {
  buildProjectDetailsModel,
  ProjectDetailsModel,
} from "../model/projectDetailsModel";

export function useProjectDetails(): {
  model?: ProjectDetailsModel;
  loading: boolean;
} {
  const { id } = useParams();

  const projects = useProjectStore(
    (state) => state.projects
  );

  const analysis = useAnalysisStore(
    (state) => state.analysis
  );

  const loadingMap = useAnalysisStore(
    (state) => state.loading
  );

  const model = useMemo(() => {
    if (!id) {
      return undefined;
    }

    const project = projects.find(
      (project) => project.id === id
    );

    if (!project) {
      return undefined;
    }

    return buildProjectDetailsModel(
      project,
      analysis[project.id]
    );
  }, [id, projects, analysis]);

  return {
    model,
    loading: id ? Boolean(loadingMap[id]) : false,
  };
}