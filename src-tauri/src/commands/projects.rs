use tauri::State;

use crate::{
    database::database::Database,
    models::project::ProjectDto,
    services::project_service,
};

#[tauri::command]
pub fn save_project(
    database: State<'_, Database>,
    project: ProjectDto,
) -> Result<(), String> {

    project_service::save_project(
        &database,
        project,
    )
}