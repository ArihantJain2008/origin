import {
  ExternalLink,
  FolderOpen,
  RefreshCw,
} from "lucide-react";

import {
  Button,
  Card,
} from "@/shared/components/ui";

import { ProjectDetailsModel } from "../model/projectDetailsModel";

interface ProjectQuickActionsProps {
  model: ProjectDetailsModel;
}

export default function ProjectQuickActions({
  model,
}: ProjectQuickActionsProps) {
  return (
    <Card className="p-6">
      <h2 className="mb-5 text-lg font-semibold text-[var(--color-text-primary)]">
        Quick Actions
      </h2>

      <div className="flex flex-col gap-3">
        <Button disabled>
          <ExternalLink size={16} />
          <span>Open Project</span>
        </Button>

        <Button
          variant="secondary"
          disabled
        >
          <FolderOpen size={16} />
          <span>Reveal in Explorer</span>
        </Button>

        <Button
          variant="secondary"
          disabled
        >
          <RefreshCw size={16} />
          <span>Refresh Analysis</span>
        </Button>
      </div>

      <p className="mt-5 text-xs text-[var(--color-text-tertiary)]">
        Project actions will be connected in Story 033.
      </p>
    </Card>
  );
}