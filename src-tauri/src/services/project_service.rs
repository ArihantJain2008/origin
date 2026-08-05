use crate::{
    database::{
        database::Database,
        project_repository,
    },
    models::project::ProjectDto,
};

pub fn save_project(
    database: &Database,
    project: ProjectDto,
) -> Result<(), String> {

    project_repository::save_project(
        database,
        &project,
    )
    .map_err(|e| e.to_string())
}