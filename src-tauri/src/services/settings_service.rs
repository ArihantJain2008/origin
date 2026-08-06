use crate::{
    database::{database::Database, settings_repository},
    models::settings::SettingsDto,
};

pub fn save_settings(database: &Database, settings: SettingsDto) -> Result<(), String> {
    settings_repository::save_setting(database, "preferred_editor", &settings.preferred_editor)
        .map_err(|e| e.to_string())
}

pub fn load_settings(database: &Database) -> Result<SettingsDto, String> {
    let preferred_editor = settings_repository::load_setting(database, "preferred_editor")
        .map_err(|e| e.to_string())?
        .unwrap_or_else(|| "vscode".to_string());

    Ok(SettingsDto { preferred_editor })
}
