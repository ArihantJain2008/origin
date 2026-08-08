import {
  Activity,
  BookOpen,
  CheckCircle2,
  Loader2,
  ListTodo,
  Package,
} from "lucide-react";

import {
  Badge,
  Card,
} from "@/shared/components/ui";

import { ProjectDetailsModel } from "../model/projectDetailsModel";

interface ProjectAnalysisSummaryProps {
  model: ProjectDetailsModel;
}

export default function ProjectAnalysisSummary({
  model,
}: ProjectAnalysisSummaryProps) {
  if (model.analysisLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Loader2
            size={20}
            className="mt-0.5 animate-spin text-[var(--color-accent)]"
          />

          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Analysis Summary
            </h2>

            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Origin is analyzing this project.
            </p>

            <Badge
              tone="neutral"
              className="mt-4"
            >
              Analyzing
            </Badge>
          </div>
        </div>
      </Card>
    );
  }

  if (!model.analysisAvailable) {
    return (
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Activity
            size={20}
            className="mt-0.5 text-[var(--color-text-tertiary)]"
          />

          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Analysis Summary
            </h2>

            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              This project has not been analyzed yet.
            </p>

            <Badge
              tone="neutral"
              className="mt-4"
            >
              Not analyzed
            </Badge>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Analysis Summary
        </h2>

        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Current snapshot from the latest project analysis.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryItem
          icon={<Activity size={18} />}
          label="Health"
          value={`${model.healthScore}%`}
        />

        <SummaryItem
          icon={<Package size={18} />}
          label="Dependencies"
          value={model.dependencyCount}
        />

        <SummaryItem
          icon={<ListTodo size={18} />}
          label="TODOs"
          value={model.todoCount}
        />

        <SummaryItem
          icon={<BookOpen size={18} />}
          label="README"
          value={
            model.readmeAvailable
              ? "Available"
              : "Missing"
          }
        />
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
        <CheckCircle2
          size={16}
          className="text-green-500"
        />

        <span>
          Analysis data is available for this project.
        </span>
      </div>
    </Card>
  );
}

interface SummaryItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function SummaryItem({
  icon,
  label,
  value,
}: SummaryItemProps) {
  return (
    <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4">
      <div className="flex items-center gap-2 text-[var(--color-text-tertiary)]">
        {icon}

        <span className="text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-3 text-2xl font-bold text-[var(--color-text-primary)]">
        {value}
      </p>
    </div>
  );
}