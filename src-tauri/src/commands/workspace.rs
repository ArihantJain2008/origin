use tauri::AppHandle;
use tauri::State;

use crate::{database::database::Database, services::workspace_service};

#[tauri::command]
pub fn launch_project(
    app: AppHandle,
    database: State<'_, Database>,
    id: String,
    path: String,
) -> Result<(), String> {
    workspace_service::launch_project(&app, &database, id, path)
}

#[tauri::command]
pub fn open_path_in_editor(database: State<'_, Database>, path: String) -> Result<(), String> {
    workspace_service::open_path_in_editor(&database, path)
}

#[tauri::command]
pub fn reveal_project(path: String) -> Result<(), String> {
    workspace_service::reveal_project(path)
}
