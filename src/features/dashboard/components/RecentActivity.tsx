import { Clock3 } from "lucide-react";

import { Card } from "@/shared/components/ui";

interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  time: string;
}

interface RecentActivityProps {
  items: ActivityItem[];
}

export default function RecentActivity({
  items,
}: RecentActivityProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Clock3
          size={14}
          className="text-[var(--color-text-tertiary)]"
        />

        <h2 className="text-[18px] font-semibold text-[var(--color-text-primary)]">
          Recent Activity
        </h2>
      </div>

      <Card className="space-y-4">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="border-b border-[var(--color-border-subtle)] pb-4 last:border-b-0 last:pb-0"
            >
              <p className="text-[13px] font-medium text-[var(--color-text-primary)]">
                {item.title}
              </p>

              <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">
                {item.detail}
              </p>

              <p className="mt-1 text-[12px] text-[var(--color-text-tertiary)]">
                {item.time}
              </p>
            </div>
          ))
        ) : (
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            No recent activity yet.
          </p>
        )}
      </Card>
    </section>
  );
}