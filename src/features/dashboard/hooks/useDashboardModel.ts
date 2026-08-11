import { useMemo } from "react";

import { useAnalysisStore } from "@/features/analysis/store/analysisStore";
import { useProjectStore } from "@/features/projects/store/projectStore";
import { useTodosStore } from "@/features/overlay/store/todosStore";

import { buildDashboardModel } from "../model/dashboardModel";

export function useDashboardModel() {
  const projects = useProjectStore((state) => state.projects);

  const analysis = useAnalysisStore((state) => state.analysis);
  const loading = useAnalysisStore((state) => state.loading);

  const todosByProject = useTodosStore(
  (state) => state.todosByProject
);

  // ======================================================
  // DEBUG (Sprint 6 - Dashboard Stabilization)
  // Purpose:
  // Inspect dashboard snapshot coherence while validating store sync.
  // Uncomment only while debugging.
  // ======================================================
  /*
  console.log({
    projects,
    analysis,
    loading,
  });
  */

  return useMemo(
    () => buildDashboardModel(projects, analysis, loading,todosByProject),
    [projects, analysis, loading]
  );
}