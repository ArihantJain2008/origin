import SummaryCard from "./SummaryCard";

import { useDashboardModel } from "../hooks/useDashboardModel";

export default function SummaryCards() {
  const { summary } = useDashboardModel();

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        title="Projects"
        value={summary.totalProjects}
        description="Tracked Projects"
      />

      <SummaryCard
        title="Healthy"
        value={summary.healthyProjects}
        description="Health ≥ 80"
      />

      <SummaryCard
        title="Modified"
        value={summary.modifiedProjects}
        description="Git Dirty"
      />

      <SummaryCard
        title="TODOs"
        value={summary.totalTodos}
        description="Across Projects"
      />
    </div>
  );
}