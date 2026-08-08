import {
  Check,
  ChevronsLeftRightEllipsis,
  ChevronDown,
  FolderOpen,
  House,
  Monitor,
  Settings,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import Logo from "./Logo";
import NavItem from "./NavItem";

import { Button } from "@/shared/components/ui";
import { cn } from "@/lib/utils";

import { useSettingsStore } from "@/features/settings/store/settingsStore";
import { Editor } from "@/features/settings/types/editor";

import { useUiPreferencesStore } from "@/shared/store/uiPreferencesStore";

const editorLabels: Record<Editor, string> = {
  vscode: "VS Code",
  cursor: "Cursor",
  windsurf: "Windsurf",
};

const editorOptions: Editor[] = [
  "vscode",
  "cursor",
  "windsurf",
];

export default function Sidebar() {
  const collapsed = useUiPreferencesStore(
    (state) => state.sidebarCollapsed
  );

  const toggleSidebar = useUiPreferencesStore(
    (state) => state.toggleSidebar
  );

  const settings = useSettingsStore(
    (state) => state.settings
  );

  const setPreferredEditor = useSettingsStore(
    (state) => state.setPreferredEditor
  );

  const loadSettings = useSettingsStore(
    (state) => state.loadSettings
  );

  const [editorMenuOpen, setEditorMenuOpen] =
    useState(false);

  const editorMenuRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadSettings().catch((error) => {
      console.error(
        "Failed to load settings:",
        error
      );
    });
  }, [loadSettings]);

  useEffect(() => {
    if (!editorMenuOpen) {
      return;
    }

    const handlePointerDown = (
      event: MouseEvent
    ) => {
      if (
        editorMenuRef.current &&
        !editorMenuRef.current.contains(
          event.target as Node
        )
      ) {
        setEditorMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );
    };
  }, [editorMenuOpen]);

  const handleEditorChange = async (
    editor: Editor
  ) => {
    try {
      await setPreferredEditor(editor);
      setEditorMenuOpen(false);
    } catch (error) {
      console.error(
        "Failed to change preferred editor:",
        error
      );
    }
  };

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] transition-[width] duration-200 ease-out",
        collapsed
          ? "w-16"
          : "w-60"
      )}
    >
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <NavItem
          collapsed={collapsed}
          icon={House}
          title="Dashboard"
          to="/"
        />

        <NavItem
          collapsed={collapsed}
          icon={FolderOpen}
          title="Projects"
          to="/projects"
        />

        <NavItem
          collapsed={collapsed}
          icon={Settings}
          title="Settings"
          to="/settings"
        />
      </nav>

      <div className="border-t border-[var(--color-border-subtle)] p-3">
        {!collapsed ? (
          <div
            ref={editorMenuRef}
            className="relative mb-3"
          >
            <p className="mb-2 px-1 text-[12px] font-medium uppercase tracking-[0.02em] text-[var(--color-text-tertiary)]">
              Editor
            </p>

            <button
              type="button"
              onClick={() =>
                setEditorMenuOpen(
                  (open) => !open
                )
              }
              className={cn(
                "flex w-full items-center justify-between rounded-[8px] border px-3 py-2 text-left transition-colors",
                editorMenuOpen
                  ? "border-[var(--color-border-default)] bg-[var(--color-bg-hover)]"
                  : "border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] hover:border-[var(--color-border-default)] hover:bg-[var(--color-bg-hover)]"
              )}
            >
              <span className="text-[13px] text-[var(--color-text-secondary)]">
                {editorLabels[
                  settings.preferredEditor
                ]}
              </span>

              <ChevronDown
                size={14}
                className={cn(
                  "text-[var(--color-text-tertiary)] transition-transform",
                  editorMenuOpen &&
                    "rotate-180"
                )}
              />
            </button>

            {editorMenuOpen ? (
              <div className="absolute bottom-full left-0 z-30 mb-2 w-full overflow-hidden rounded-[8px] border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-1 shadow-[var(--shadow-float)]">
                {editorOptions.map(
                  (editor) => {
                    const selected =
                      settings.preferredEditor ===
                      editor;

                    return (
                      <button
                        key={editor}
                        type="button"
                        onClick={() =>
                          handleEditorChange(
                            editor
                          )
                        }
                        className={cn(
                          "flex w-full items-center justify-between rounded-[6px] px-3 py-2 text-left text-[13px] transition-colors",
                          selected
                            ? "bg-[var(--color-bg-hover)] text-[var(--color-text-primary)]"
                            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
                        )}
                      >
                        <span>
                          {
                            editorLabels[
                              editor
                            ]
                          }
                        </span>

                        {selected ? (
                          <Check
                            size={14}
                            className="text-[var(--color-accent)]"
                          />
                        ) : null}
                      </button>
                    );
                  }
                )}
              </div>
            ) : null}
          </div>
        ) : null}

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={cn(
            "w-full",
            collapsed
              ? "justify-center px-0"
              : "justify-start"
          )}
        >
          <ChevronsLeftRightEllipsis
            size={16}
          />

          {!collapsed ? (
            <span>
              Collapse sidebar
            </span>
          ) : null}
        </Button>
      </div>
    </aside>
  );
}