import {
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  GitBranch,
  ListTodo,
} from "lucide-react";

import { Badge, Card } from "@/shared/components/ui";

import { ProjectDetailsModel } from "../model/projectDetailsModel";

interface ProjectInsightsProps {
  model: ProjectDetailsModel;
}

interface Insight {
  title: string;
  description: string;
  tone: "success" | "warning" | "danger" | "neutral";
}

export default function ProjectInsights({
  model,
}: ProjectInsightsProps) {
  const insights: Insight[] = [];

  // Not a Git repository
  if (!model.isGitRepository) {
    insights.push({
      title: "Git Repository",
      description:
        "This project is not connected to a Git repository.",
      tone: "danger",
    });
  }

  // Health
  if (model.healthScore < 60) {
    insights.push({
      title: "Project Health",
      description: `Health score is ${model.healthScore}%.`,
      tone: "warning",
    });
  }

  // README
  if (!model.readmeAvailable) {
    insights.push({
      title: "README",
      description:
        "A README file could not be detected.",
      tone: "warning",
    });
  }

  // TODOs
  if (model.todoCount > 10) {
    insights.push({
      title: "TODOs",
      description: `${model.todoCount} TODOs are still pending.`,
      tone: "neutral",
    });
  }

  // Dirty repository
  if (model.isDirty) {
    insights.push({
      title: "Repository Status",
      description:
        "Repository contains uncommitted changes.",
      tone: "neutral",
    });
  }

  // Everything looks good
  if (insights.length === 0) {
    insights.push({
      title: "Project Status",
      description:
        "Everything looks healthy. No immediate action required.",
      tone: "success",
    });
  }

  return (
    <Card className="p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Project Insights
        </h2>

        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Automated observations generated from project analysis.
        </p>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={`${insight.title}-${index}`}
            className="flex items-start justify-between rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4"
          >
            <div className="flex items-start gap-3">
              {insight.tone === "danger" && (
                <AlertTriangle
                  size={18}
                  className="mt-0.5 text-red-500"
                />
              )}

              {insight.tone === "warning" && (
                <FileWarning
                  size={18}
                  className="mt-0.5 text-yellow-500"
                />
              )}

              {insight.tone === "neutral" && (
                <GitBranch
                  size={18}
                  className="mt-0.5 text-blue-500"
                />
              )}

              {insight.tone === "success" && (
                <CheckCircle2
                  size={18}
                  className="mt-0.5 text-green-500"
                />
              )}

              <div>
                <p className="font-medium text-[var(--color-text-primary)]">
                  {insight.title}
                </p>

                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {insight.description}
                </p>
              </div>
            </div>

            <Badge tone={insight.tone}>
              {insight.tone}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}