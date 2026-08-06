import { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-4",
        className
      )}
      {...props}
    />
  );
}
