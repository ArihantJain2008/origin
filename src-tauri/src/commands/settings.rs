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

#[tauri::command]
pub fn save_active_project(
    database: State<'_, Database>,
    id: Option<String>,
) -> Result<(), String> {
    // Persist the active project id (or null) in settings table under key 'active_project_id'
    let val = id.unwrap_or_default();
    crate::database::settings_repository::save_setting(&database, "active_project_id", &val)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn load_active_project(database: State<'_, Database>) -> Result<Option<String>, String> {
    match crate::database::settings_repository::load_setting(&database, "active_project_id") {
        Ok(Some(s)) if s.len() > 0 => Ok(Some(s)),
        Ok(_) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}
