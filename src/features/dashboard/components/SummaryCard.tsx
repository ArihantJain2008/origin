import { Card } from "@/shared/components/ui";

interface SummaryCardProps {
  title: string;
  value: number | string;
  description: string;
}

export default function SummaryCard({
  title,
  value,
  description,
}: SummaryCardProps) {
  return (
    <Card className="p-5">
  <p className="text-[12px] font-medium uppercase tracking-[0.02em] text-[var(--color-text-tertiary)]">
    {title}
  </p>

  <h2 className="mt-3 text-3xl font-bold leading-none text-[var(--color-text-primary)]">
    {value}
  </h2>

  <p className="mt-2 text-[13px] text-[var(--color-text-secondary)]">
    {description}
  </p>
</Card>
  );
}