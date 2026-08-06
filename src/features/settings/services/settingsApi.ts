import { invoke } from "@tauri-apps/api/core";
import { Settings } from "../types/settings";

interface SettingsDto {
  preferred_editor: string;
}

function mapSettingsDto(dto: SettingsDto): Settings {
  return {
    preferredEditor: dto.preferred_editor as Settings["preferredEditor"],
  };
}

function mapSettings(settings: Settings): SettingsDto {
  return {
    preferred_editor: settings.preferredEditor,
  };
}

export async function saveSettings(settings: Settings) {
  await invoke("save_settings", {
    settings: mapSettings(settings),
  });
}

export async function loadSettings(): Promise<Settings> {
  const dto = await invoke<SettingsDto>("load_settings");

  return mapSettingsDto(dto);
}