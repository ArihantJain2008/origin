import { Card } from "@/shared/components/ui";
import { formatRelativeDate } from "@/shared/utils/projectFormatting";

import { ProjectDetailsModel } from "../model/projectDetailsModel";

interface ProjectOverviewProps {
  model: ProjectDetailsModel;
}

interface OverviewRowProps {
  label: string;
  value: React.ReactNode;
}

function OverviewRow({
  label,
  value,
}: OverviewRowProps) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] py-3 last:border-b-0">
      <span className="text-sm text-[var(--color-text-secondary)]">
        {label}
      </span>

      <span className="text-sm font-medium text-[var(--color-text-primary)]">
        {value}
      </span>
    </div>
  );
}

export default function ProjectOverview({
  model,
}: ProjectOverviewProps) {
  return (
    <Card className="p-6">
      <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
        Project Overview
      </h2>

      <OverviewRow
        label="Framework"
        value={model.framework}
      />

      <OverviewRow
        label="Language"
        value={model.language}
      />

      <OverviewRow
        label="Git Branch"
        value={model.gitBranch}
      />

      <OverviewRow
        label="Status"
        value={
          model.isDirty
            ? "Modified"
            : "Clean"
        }
      />

      <OverviewRow
        label="README"
        value={
          model.readmeAvailable
            ? "Available"
            : "Missing"
        }
      />

      <OverviewRow
        label="Dependencies"
        value={model.dependencyCount}
      />

      <OverviewRow
        label="TODOs"
        value={model.todoCount}
      />

      <OverviewRow
        label="Last Opened"
        value={formatRelativeDate(model.lastOpened)}
      />
    </Card>
  );
}