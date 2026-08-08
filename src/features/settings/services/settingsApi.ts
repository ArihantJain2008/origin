import { invoke } from "@tauri-apps/api/core";

import { Settings } from "../types/settings";

interface SettingsDto {
  preferred_editor: string;

  theme: Settings["theme"];

  command_shortcuts: Record<string, string>;
}

function mapSettingsDto(
  dto: SettingsDto
): Settings {
  return {
    preferredEditor:
      dto.preferred_editor as Settings["preferredEditor"],

    theme: dto.theme ?? "dark",

    commandShortcuts:
      dto.command_shortcuts ?? {},
  };
}

function mapSettings(
  settings: Settings
): SettingsDto {
  return {
    preferred_editor:
      settings.preferredEditor,

    theme: settings.theme,

    command_shortcuts:
      settings.commandShortcuts,
  };
}

export async function saveSettings(
  settings: Settings
) {
  await invoke("save_settings", {
    settings: mapSettings(settings),
  });
}

export async function loadSettings(): Promise<Settings> {
  const dto =
    await invoke<SettingsDto>(
      "load_settings"
    );

  return mapSettingsDto(dto);
}