import { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "success" | "warning" | "danger";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]",
  success: "bg-[rgb(79_191_123_/_0.15)] text-[var(--color-success)]",
  warning: "bg-[rgb(224_168_62_/_0.15)] text-[var(--color-warning)]",
  danger: "bg-[rgb(229_104_107_/_0.15)] text-[var(--color-danger)]",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[6px] px-2 py-1 text-[12px] font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
