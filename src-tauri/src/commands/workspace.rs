use tauri::State;

use crate::{database::database::Database, services::workspace_service};

#[tauri::command]
pub fn launch_project(
    database: State<'_, Database>,
    id: String,
    path: String,
) -> Result<(), String> {
    workspace_service::launch_project(&database, id, path)
}

#[tauri::command]
pub fn reveal_project(path: String) -> Result<(), String> {
    workspace_service::reveal_project(path)
}
