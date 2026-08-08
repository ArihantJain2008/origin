use std::collections::HashMap;

use crate::{
    database::{database::Database, settings_repository},
    models::settings::SettingsDto,
};

pub fn save_settings(
    database: &Database,
    settings: SettingsDto,
) -> Result<(), String> {
    settings_repository::save_setting(
        database,
        "preferred_editor",
        &settings.preferred_editor,
    )
    .map_err(|e| e.to_string())?;

    settings_repository::save_setting(
        database,
        "theme",
        &settings.theme,
    )
    .map_err(|e| e.to_string())?;

    let shortcuts_json =
        serde_json::to_string(&settings.command_shortcuts)
            .map_err(|e| e.to_string())?;

    settings_repository::save_setting(
        database,
        "command_shortcuts",
        &shortcuts_json,
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

pub fn load_settings(
    database: &Database,
) -> Result<SettingsDto, String> {
    let preferred_editor =
        settings_repository::load_setting(
            database,
            "preferred_editor",
        )
        .map_err(|e| e.to_string())?
        .unwrap_or_else(|| "vscode".to_string());

    let theme =
        settings_repository::load_setting(
            database,
            "theme",
        )
        .map_err(|e| e.to_string())?
        .unwrap_or_else(|| "dark".to_string());

    let command_shortcuts =
        settings_repository::load_setting(
            database,
            "command_shortcuts",
        )
        .map_err(|e| e.to_string())?
        .and_then(|value| {
            serde_json::from_str::<HashMap<String, String>>(
                &value,
            )
            .ok()
        })
        .unwrap_or_default();

    Ok(SettingsDto {
        preferred_editor,
        theme,
        command_shortcuts,
    })
}

pub fn get_preferred_editor(
    database: &Database,
) -> Result<String, String> {
    settings_repository::load_setting(
        database,
        "preferred_editor",
    )
    .map_err(|e| e.to_string())
    .map(|editor| {
        editor.unwrap_or_else(|| "vscode".to_string())
    })
}