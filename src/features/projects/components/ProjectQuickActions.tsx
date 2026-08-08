import {
  ExternalLink,
  FolderOpen,
  RefreshCw,
} from "lucide-react";

import { Button, Card } from "@/shared/components/ui";

import { useAnalysisStore } from "@/features/analysis/store/analysisStore";
import { refreshApplicationState } from "@/features/app/coordinator/appCoordinator";
import {
  launchProject,
  revealProject,
} from "@/features/workspace/services/launcher";

import { ProjectDetailsModel } from "../model/projectDetailsModel";

interface ProjectQuickActionsProps {
  model: ProjectDetailsModel;
}

export default function ProjectQuickActions({
  model,
}: ProjectQuickActionsProps) {
  const analyze = useAnalysisStore(
    (state) => state.analyze
  );

  const loading = useAnalysisStore(
    (state) => state.loading[model.project.id]
  );

  const handleOpenProject = async () => {
    await launchProject(
      model.project.id,
      model.project.path
    );

    await refreshApplicationState();
  };

  const handleRevealInExplorer = async () => {
    await revealProject(
      model.project.path
    );
  };

  const handleRefreshAnalysis = async () => {
    if (loading) {
      return;
    }

    await analyze(
      model.project.id,
      model.project.path
    );
  };

  return (
    <Card className="p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Quick Actions
        </h2>

        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Common actions for this project.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          onClick={handleOpenProject}
        >
          <ExternalLink size={16} />

          <span>
            Open Project
          </span>
        </Button>

        <Button
          variant="secondary"
          onClick={handleRevealInExplorer}
        >
          <FolderOpen size={16} />

          <span>
            Reveal in Explorer
          </span>
        </Button>

        <Button
          variant="secondary"
          onClick={handleRefreshAnalysis}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          <span>
            {loading
              ? "Analyzing..."
              : "Refresh Analysis"}
          </span>
        </Button>
      </div>
    </Card>
  );
}