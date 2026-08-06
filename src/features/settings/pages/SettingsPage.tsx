import { useEffect } from "react";

import { Card } from "@/shared/components/ui";
import { useSettingsStore } from "../store/settingsStore";

export default function SettingsPage() {
  const settings = useSettingsStore((state) => state.settings);
  const setPreferredEditor = useSettingsStore(
    (state) => state.setPreferredEditor
  );
  const loadSettings = useSettingsStore(
    (state) => state.loadSettings
  );

  useEffect(() => {
    loadSettings().catch((error) => {
      console.error(error);
    });
  }, [loadSettings]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-8">
        <p className="text-[12px] font-medium uppercase tracking-[0.02em] text-[var(--color-text-tertiary)]">
          Settings
        </p>

        <h1 className="mt-2 text-[28px] font-bold leading-none tracking-tight text-[var(--color-text-primary)]">
          Configure and leave.
        </h1>
      </div>

      <Card className="max-w-xl">
        <label className="mb-2 block text-[13px] font-medium text-[var(--color-text-secondary)]">
          Preferred editor
        </label>

        <select
          value={settings.preferredEditor}
          onChange={(event) =>
            setPreferredEditor(
              event.target.value as typeof settings.preferredEditor
            )
          }
          className="h-[34px] w-full rounded-[8px] border border-[var(--color-border-default)] bg-[var(--color-bg-canvas)] px-3 text-[13px] text-[var(--color-text-primary)]"
        >
          <option value="vscode">VS Code</option>
          <option value="cursor">Cursor</option>
          <option value="windsurf">Windsurf</option>
        </select>
      </Card>
    </div>
  );
}
