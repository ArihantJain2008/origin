import { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";

interface NavItemProps {
  collapsed?: boolean;
  icon: LucideIcon;
  title: string;
  to: string;
}

export default function NavItem({
  collapsed = false,
  icon: Icon,
  title,
  to,
}: NavItemProps) {
  return (
    <NavLink
      to={to}
      title={collapsed ? title : undefined}
      className={({ isActive }) =>
        cn(
          "group relative flex h-9 items-center rounded-[8px] text-[13px] font-medium transition duration-100",
          collapsed ? "justify-center px-0" : "gap-3 px-4",
          isActive
            ? "text-[var(--color-text-primary)]"
            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
        )
      }
    >
      {({ isActive }) => (
        <>
          {!collapsed ? (
            <span
              className={cn(
                "absolute inset-y-1 left-0 w-0.5 rounded-full",
                isActive ? "bg-[var(--color-accent)]" : "bg-transparent"
              )}
            />
          ) : null}

          <Icon
            size={18}
            className={cn(isActive ? "text-[var(--color-accent)]" : "")}
          />

          {!collapsed ? <span>{title}</span> : null}

          {collapsed && isActive ? (
            <span className="absolute bottom-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
          ) : null}
        </>
      )}
    </NavLink>
  );
}
