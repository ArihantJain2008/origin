import { useSettingsStore } from "../store/settingsStore";
import { useEffect } from "react";

export default function SettingsPage() {
  const settings = useSettingsStore((s) => s.settings);
  const setPreferredEditor = useSettingsStore(
    (s) => s.setPreferredEditor
  );
  const loadSettings = useSettingsStore(
  (s) => s.loadSettings
);

useEffect(() => {
  const initialize = async () => {
    try {
      await loadSettings();
    } catch (error) {
      console.error(error);
    }
  };

  initialize();
}, [loadSettings]);

  return (
    <div className="p-8">
      <h1 className="mb-8 text-3xl font-bold">
        Settings
      </h1>

      <div className="max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <label className="mb-2 block text-sm text-zinc-400">
          Preferred Editor
        </label>

        <select
  value={settings.preferredEditor}
  onChange={(e) =>
    setPreferredEditor(e.target.value as any)
  }
  className="w-full rounded-lg bg-zinc-800 p-3"
>
  <option value="vscode">VS Code</option>
  <option value="cursor">Cursor</option>
  <option value="windsurf">Windsurf</option>
</select>
      </div>
    </div>
  );
}