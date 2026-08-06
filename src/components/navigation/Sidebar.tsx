import {
  ChevronsLeftRightEllipsis,
  FolderOpen,
  House,
  Monitor,
  Settings,
} from "lucide-react";
import { useEffect } from "react";

import Logo from "./Logo";
import NavItem from "./NavItem";
import { Button } from "@/shared/components/ui";
import { cn } from "@/lib/utils";
import { useUiPreferencesStore } from "@/shared/store/uiPreferencesStore";
import { useSettingsStore } from "@/features/settings/store/settingsStore";

const editorLabels = {
  vscode: "VS Code",
  cursor: "Cursor",
  windsurf: "Windsurf",
} as const;

export default function Sidebar() {
  const collapsed = useUiPreferencesStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiPreferencesStore((state) => state.toggleSidebar);
  const settings = useSettingsStore((state) => state.settings);
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  useEffect(() => {
    loadSettings().catch((error) => {
      console.error("Failed to load settings:", error);
    });
  }, [loadSettings]);

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] transition-[width] duration-200 ease-out",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <Logo collapsed={collapsed} />

      <nav className="flex flex-1 flex-col gap-1 p-3">
        <NavItem collapsed={collapsed} icon={House} title="Dashboard" to="/" />
        <NavItem collapsed={collapsed} icon={FolderOpen} title="Projects" to="/projects" />
        <NavItem collapsed={collapsed} icon={Monitor} title="Workspace" to="/workspace" />
        <NavItem collapsed={collapsed} icon={Settings} title="Settings" to="/settings" />
      </nav>

      <div className="border-t border-[var(--color-border-subtle)] p-3">
        {!collapsed ? (
          <div className="mb-3 rounded-[8px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-3 py-2">
            <p className="text-[12px] font-medium uppercase tracking-[0.02em] text-[var(--color-text-tertiary)]">
              Editor
            </p>
            <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
              {editorLabels[settings.preferredEditor]}
            </p>
          </div>
        ) : null}

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={cn("w-full", collapsed ? "justify-center px-0" : "justify-start")}
        >
          <ChevronsLeftRightEllipsis size={16} />
          {!collapsed ? <span>Collapse sidebar</span> : null}
        </Button>
      </div>
    </aside>
  );
}
