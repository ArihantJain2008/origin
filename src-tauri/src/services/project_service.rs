use crate::{
    database::{database::Database, project_repository},
    models::project::ProjectDto,
};

pub fn save_project(database: &Database, project: ProjectDto) -> Result<(), String> {
    project_repository::save_project(database, &project).map_err(|e| e.to_string())
}

pub fn load_projects(database: &Database) -> Result<Vec<ProjectDto>, String> {
    project_repository::load_projects(database).map_err(|e| e.to_string())
}
