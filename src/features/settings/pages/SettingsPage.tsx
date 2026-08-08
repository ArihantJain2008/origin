import { useEffect } from "react";
import {
  Monitor,
  Palette,
  Settings2,
} from "lucide-react";

import { Card } from "@/shared/components/ui";

import CommandSettings from "../components/CommandSettings";
import { useSettingsStore } from "../store/settingsStore";
import { Settings } from "../types/settings";

export default function SettingsPage() {
  const settings = useSettingsStore(
    (state) => state.settings
  );

  const setPreferredEditor =
    useSettingsStore(
      (state) => state.setPreferredEditor
    );

  const setTheme =
    useSettingsStore(
      (state) => state.setTheme
    );

  const loadSettings =
    useSettingsStore(
      (state) => state.loadSettings
    );

  useEffect(() => {
    loadSettings().catch((error) => {
      console.error(
        "Failed to load settings:",
        error
      );
    });
  }, [loadSettings]);

  return (
    <div className="min-h-full">
      <div className="mx-auto w-full max-w-6xl px-8 py-10">
        {/* Page Header */}
        <div className="mb-10">
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
            Settings
          </p>

          <h1 className="mt-2 text-[30px] font-bold tracking-tight text-[var(--color-text-primary)]">
            Configure Origin
          </h1>

          <p className="mt-2 max-w-2xl text-[14px] text-[var(--color-text-secondary)]">
            Customize Origin to fit the way you
            work.
          </p>
        </div>

        {/* General */}
        <section className="mb-10">
          <div className="mb-4">
            <h2 className="text-[18px] font-semibold text-[var(--color-text-primary)]">
              General
            </h2>

            <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
              Configure the basic behavior and
              appearance of Origin.
            </p>
          </div>

          <Card className="overflow-hidden p-0">
            {/* Appearance */}
            <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
                  <Palette size={18} />
                </div>

                <div>
                  <h3 className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                    Appearance
                  </h3>

                  <p className="mt-1 max-w-md text-[13px] leading-5 text-[var(--color-text-secondary)]">
                    Choose how Origin looks on your
                    device.
                  </p>
                </div>
              </div>

              <div className="w-full lg:w-[280px]">
                <label
                  htmlFor="theme"
                  className="mb-2 block text-[12px] font-medium uppercase tracking-[0.05em] text-[var(--color-text-tertiary)]"
                >
                  Theme
                </label>

                <select
                  id="theme"
                  value={settings.theme}
                  onChange={(event) =>
                    setTheme(
                      event.target.value as Settings["theme"]
                    )
                  }
                  className="h-[38px] w-full rounded-[8px] border border-[var(--color-border-default)] bg-[var(--color-bg-canvas)] px-3 text-[13px] text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-accent)]"
                >
                  <option value="dark">
                    Dark
                  </option>

                  <option value="light">
                    Light
                  </option>

                  <option value="system">
                    System
                  </option>
                </select>
              </div>
            </div>

            <div className="border-t border-[var(--color-border-subtle)]" />

            {/* Preferred Editor */}
            <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
                  <Monitor size={18} />
                </div>

                <div>
                  <h3 className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                    Preferred editor
                  </h3>

                  <p className="mt-1 max-w-md text-[13px] leading-5 text-[var(--color-text-secondary)]">
                    Choose which editor Origin should
                    use when opening your projects.
                  </p>
                </div>
              </div>

              <div className="w-full lg:w-[280px]">
                <label
                  htmlFor="preferred-editor"
                  className="mb-2 block text-[12px] font-medium uppercase tracking-[0.05em] text-[var(--color-text-tertiary)]"
                >
                  Editor
                </label>

                <select
                  id="preferred-editor"
                  value={settings.preferredEditor}
                  onChange={(event) =>
                    setPreferredEditor(
                      event.target.value as typeof settings.preferredEditor
                    )
                  }
                  className="h-[38px] w-full rounded-[8px] border border-[var(--color-border-default)] bg-[var(--color-bg-canvas)] px-3 text-[13px] text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-accent)]"
                >
                  <option value="vscode">
                    VS Code
                  </option>

                  <option value="cursor">
                    Cursor
                  </option>

                  <option value="windsurf">
                    Windsurf
                  </option>
                </select>
              </div>
            </div>
          </Card>
        </section>

        {/* Commands */}
        <section>
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
                <Settings2 size={17} />
              </div>

              <div>
                <h2 className="text-[18px] font-semibold text-[var(--color-text-primary)]">
                  Commands
                </h2>

                <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
                  Manage keyboard shortcuts used
                  throughout Origin.
                </p>
              </div>
            </div>
          </div>

          <CommandSettings />
        </section>
      </div>
    </div>
  );
}