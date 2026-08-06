use tauri::State;

use crate::{database::database::Database, models::project::ProjectDto, services::project_service};

#[tauri::command]
pub fn save_project(database: State<'_, Database>, project: ProjectDto) -> Result<(), String> {
    project_service::save_project(&database, project)
}

#[tauri::command]
pub fn load_projects(database: State<'_, Database>) -> Result<Vec<ProjectDto>, String> {
    project_service::load_projects(&database)
}

#[tauri::command]
pub fn remove_project(
    database: State<'_, Database>,
    id: String,
) -> Result<(), String> {
    project_service::remove_project(
        &database,
        id,
    )
}