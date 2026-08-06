use tauri::State;

use crate::{
    database::database::Database, models::settings::SettingsDto, services::settings_service,
};

#[tauri::command]
pub fn save_settings(database: State<'_, Database>, settings: SettingsDto) -> Result<(), String> {
    settings_service::save_settings(&database, settings)
}

#[tauri::command]
pub fn load_settings(database: State<'_, Database>) -> Result<SettingsDto, String> {
    settings_service::load_settings(&database)
}
