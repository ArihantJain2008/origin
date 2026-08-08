import {
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  FolderOpen,
} from "lucide-react";

import { Badge, Card } from "@/shared/components/ui";

import { ProjectDetailsModel } from "../model/projectDetailsModel";

interface ProjectHeaderProps {
  model: ProjectDetailsModel;
}

export default function ProjectHeader({
  model,
}: ProjectHeaderProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
            Project
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[var(--color-text-primary)]">
            {model.project.name}
          </h1>

          <p className="mt-2 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <FolderOpen size={15} />
            {model.project.path}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Badge tone="neutral">
              {model.framework}
            </Badge>

            <Badge tone="neutral">
              {model.language}
            </Badge>

            <Badge
              tone={
                model.isGitRepository
                  ? "success"
                  : "danger"
              }
            >
              <GitBranch size={12} className="mr-1" />
              {model.gitBranch}
            </Badge>

            <Badge
              tone={
                model.isDirty
                  ? "warning"
                  : "success"
              }
            >
              {model.isDirty
                ? "Modified"
                : "Clean"}
            </Badge>
          </div>
        </div>

        <div className="flex min-w-[180px] flex-col items-end">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
            Health Score
          </p>

          <h2 className="mt-2 text-5xl font-bold text-[var(--color-text-primary)]">
            {model.healthScore}%
          </h2>

          <div className="mt-3 flex items-center gap-2">
            {model.healthScore >= 80 ? (
              <>
                <CheckCircle2
                  size={18}
                  className="text-green-500"
                />

                <span className="text-sm text-green-500">
                  Healthy
                </span>
              </>
            ) : (
              <>
                <AlertTriangle
                  size={18}
                  className="text-yellow-500"
                />

                <span className="text-sm text-yellow-500">
                  Needs Attention
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}