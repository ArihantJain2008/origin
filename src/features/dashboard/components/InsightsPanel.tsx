import {
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  GitBranch,
  Loader2,
} from "lucide-react";

import { Badge, Card } from "@/shared/components/ui";
import { useDashboardModel } from "../hooks/useDashboardModel";

export default function InsightsPanel() {
  const { insights, isAnalyzing } = useDashboardModel();

  // ======================================================
  // DEBUG (Sprint 6 - Dashboard Stabilization)
  // Purpose:
  // Inspect dashboard insight synchronization while validating the model.
  // Uncomment only while debugging.
  // ======================================================
  /*
  console.log({
    insights,
    isAnalyzing,
  });
  */

  return (
    <Card className="p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Project Insights
        </h2>

        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Projects that may require your attention.
        </p>
      </div>

      {isAnalyzing ? (
        <div className="flex items-center gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4">
          <Loader2
            size={18}
            className="animate-spin text-blue-500"
          />

          <div>
            <p className="font-medium">
              Analyzing projects...
            </p>

            <p className="text-sm text-[var(--color-text-secondary)]">
              Gathering project insights.
            </p>
          </div>
        </div>
      ) : insights.length === 0 ? (
        <div className="flex items-center gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4">
          <CheckCircle2
            size={20}
            className="text-green-500"
          />

          <div>
            <p className="font-medium">
              Everything looks good.
            </p>

            <p className="text-sm text-[var(--color-text-secondary)]">
              No projects currently require attention.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={`${insight.title}-${index}`}
              className="flex items-start justify-between rounded-[10px] border border-[var(--color-border-subtle)] p-4"
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
      )}
    </Card>
  );
}