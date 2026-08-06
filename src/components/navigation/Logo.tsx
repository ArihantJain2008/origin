import { Code2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface LogoProps {
  collapsed?: boolean;
}

export default function Logo({ collapsed = false }: LogoProps) {
  return (
    <div
      className={cn(
        "flex h-16 items-center border-b border-[var(--color-border-subtle)] px-4",
        collapsed ? "justify-center" : "gap-3"
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--color-bg-elevated)] text-[var(--color-accent)]">
        <Code2 size={18} />
      </div>

      {!collapsed ? (
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight text-[var(--color-text-primary)]">
            Origin
          </h1>
          <p className="text-[12px] font-medium text-[var(--color-text-tertiary)]">
            Quiet launchpad
          </p>
        </div>
      ) : null}
    </div>
  );
}
