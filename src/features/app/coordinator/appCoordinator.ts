import { useAnalysisStore } from "@/features/analysis/store/analysisStore";
import { useProjectStore } from "@/features/projects/store/projectStore";
import { useAppStore } from "../store/appStore";

let initializationPromise: Promise<void> | null = null;
let refreshPromise: Promise<void> | null = null;
let hasInitialized = false;

async function reconcileAnalysisWithProjects() {
  const { projects } = useProjectStore.getState();
  const analysisStore = useAnalysisStore.getState();

  const projectIds = new Set(projects.map((project) => project.id));

  Object.keys(analysisStore.analysis).forEach((projectId) => {
    if (!projectIds.has(projectId)) {
      analysisStore.removeAnalysis(projectId);
    }
  });

  await Promise.all(
    projects.map(async (project) => {
      const { analysis, loading } = useAnalysisStore.getState();

      if (!analysis[project.id] && !loading[project.id]) {
        await analysisStore.analyze(project.id, project.path);
      }
    })
  );
}

export async function refreshApplicationState() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    await useProjectStore.getState().loadProjects();
    await reconcileAnalysisWithProjects();
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function initializeApplication() {
  if (hasInitialized) {
    return;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  const appStore = useAppStore.getState();

  initializationPromise = (async () => {
    appStore.setInitializing(true);
    appStore.setReady(false);

    try {
      await refreshApplicationState();
      hasInitialized = true;
    } finally {
      appStore.setReady(true);
      appStore.setInitializing(false);
    }
  })().finally(() => {
    initializationPromise = null;
  });

  return initializationPromise;
}