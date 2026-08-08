import { Card } from "@/shared/components/ui";

interface StatisticsProps {
  statistics: {
    trackedProjects: number;
    pinnedProjects: number;
    dirtyBranches: number;
  };
}

export default function Statistics({
  statistics,
}: StatisticsProps) {
  return (
    <section>
      <h2 className="mb-3 text-[18px] font-semibold text-[var(--color-text-primary)]">
        Statistics
      </h2>

      <Card className="space-y-3">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-[var(--color-text-secondary)]">
            Tracked projects
          </span>

          <span className="font-medium text-[var(--color-text-primary)]">
            {statistics.trackedProjects}
          </span>
        </div>

        <div className="flex items-center justify-between text-[13px]">
          <span className="text-[var(--color-text-secondary)]">
            Pinned
          </span>

          <span className="font-medium text-[var(--color-text-primary)]">
            {statistics.pinnedProjects}
          </span>
        </div>

        <div className="flex items-center justify-between text-[13px]">
          <span className="text-[var(--color-text-secondary)]">
            Dirty branches
          </span>

          <span className="font-medium text-[var(--color-text-primary)]">
            {statistics.dirtyBranches}
          </span>
        </div>
      </Card>
    </section>
  );
}