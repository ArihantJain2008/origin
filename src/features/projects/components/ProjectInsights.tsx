import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  FileWarning,
} from "lucide-react";

import {
  Badge,
  Card,
} from "@/shared/components/ui";

import { ProjectDetailsModel } from "../model/projectDetailsModel";

interface ProjectInsightsProps {
  model: ProjectDetailsModel;
}

interface Insight {
  title: string;
  description: string;
  tone:
    | "success"
    | "warning"
    | "danger"
    | "neutral";
  priority: number;
}

export default function ProjectInsights({
  model,
}: ProjectInsightsProps) {
  const insights: Insight[] = [];

  /*
   * Analysis state
   */
  if (!model.analysisAvailable) {
    insights.push({
      title: "Analysis Unavailable",

      description:
        "This project has not been analyzed yet. Refresh analysis to generate project insights.",

      tone: "neutral",

      priority: 3,
    });
  } else {
    /*
     * Project health
     */
    if (model.healthScore < 60) {
      insights.push({
        title: "Project Health",

        description:
          `Health score is ${model.healthScore}%. The project may need attention.`,

        tone: "danger",

        priority: 1,
      });
    } else if (model.healthScore < 80) {
      insights.push({
        title: "Project Health",

        description:
          `Health score is ${model.healthScore}%. There are areas that could be improved.`,

        tone: "warning",

        priority: 2,
      });
    } else {
      insights.push({
        title: "Project Health",

        description:
          `Health score is ${model.healthScore}%. The project is in good condition.`,

        tone: "success",

        priority: 4,
      });
    }

    /*
     * README
     */
    if (!model.readmeAvailable) {
      insights.push({
        title: "README",

        description:
          "A README file could not be detected for this project.",

        tone: "warning",

        priority: 2,
      });
    }

    /*
     * TODOs
     */
    if (model.todoCount > 10) {
      insights.push({
        title: "TODOs",

        description:
          `${model.todoCount} TODOs are still pending.`,

        tone: "warning",

        priority: 2,
      });
    }

    /*
     * Dependencies
     */
    if (model.dependencyCount === 0) {
      insights.push({
        title: "Dependencies",

        description:
          "No project dependencies were detected.",

        tone: "neutral",

        priority: 3,
      });
    }
  }

  /*
   * Git status
   *
   * Git information does not depend
   * on project analysis.
   */
  if (!model.isGitRepository) {
    insights.push({
      title: "Git Repository",

      description:
        "This project is not connected to a Git repository.",

      tone: "danger",

      priority: 1,
    });
  } else if (model.isDirty) {
    insights.push({
      title: "Repository Status",

      description:
        "Repository contains uncommitted changes.",

      tone: "neutral",

      priority: 3,
    });
  } else {
    insights.push({
      title: "Repository Status",

      description:
        "Working tree is clean. No uncommitted changes detected.",

      tone: "success",

      priority: 4,
    });
  }

  /*
   * Sort insights by importance.
   *
   * 1 = Critical
   * 2 = Warning
   * 3 = Informational
   * 4 = Healthy
   */
  insights.sort(
    (a, b) => a.priority - b.priority
  );

  const iconForTone = (
    tone: Insight["tone"]
  ) => {
    if (tone === "danger") {
      return (
        <AlertTriangle
          size={18}
          className="mt-0.5 text-red-500"
        />
      );
    }

    if (tone === "warning") {
      return (
        <FileWarning
          size={18}
          className="mt-0.5 text-yellow-500"
        />
      );
    }

    if (tone === "success") {
      return (
        <CheckCircle2
          size={18}
          className="mt-0.5 text-green-500"
        />
      );
    }

    return (
      <BarChart3
        size={18}
        className="mt-0.5 text-blue-500"
      />
    );
  };

  const getInsightLabel = (
    tone: Insight["tone"]
  ) => {
    switch (tone) {
      case "danger":
        return "Critical";

      case "warning":
        return "Warning";

      case "success":
        return "Healthy";

      default:
        return "Info";
    }
  };

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
        {insights.map(
          (insight, index) => (
            <div
              key={`${insight.title}-${index}`}
              className="flex items-start justify-between rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4"
            >
              <div className="flex items-start gap-3">
                {iconForTone(
                  insight.tone
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
                {getInsightLabel(
                  insight.tone
                )}
              </Badge>
            </div>
          )
        )}
      </div>
    </Card>
  );
}