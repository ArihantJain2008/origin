import { useSettingsStore } from "../store/settingsStore";

export default function SettingsPage() {
  const settings = useSettingsStore((s) => s.settings);
  const setPreferredEditor = useSettingsStore(
    (s) => s.setPreferredEditor
  );

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
          <option value="vscode">
            VS Code
          </option>
        </select>
      </div>
    </div>
  );
}