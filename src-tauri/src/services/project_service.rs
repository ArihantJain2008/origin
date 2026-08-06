use crate::{
    database::{database::Database, project_repository},
    models::project::ProjectDto,
    services::git_service,
};

pub fn save_project(database: &Database, project: ProjectDto) -> Result<(), String> {
    project_repository::save_project(database, &project).map_err(|e| e.to_string())
}

pub fn load_projects(
    database: &Database,
) -> Result<Vec<ProjectDto>, String> {

    let mut projects =
        project_repository::load_projects(database)
            .map_err(|e| e.to_string())?;

    for project in &mut projects {
        let git =
            git_service::get_git_status(&project.path);

        project.git_branch = git.branch;
        project.git_dirty = git.dirty;
    }

    Ok(projects)
}

pub fn remove_project(
    database: &Database,
    id: String,
) -> Result<(), String> {
    project_repository::remove_project(
        database,
        &id,
    )
    .map_err(|e| e.to_string())
}

pub fn update_project_favorite(
    database: &Database,
    id: String,
    favorite: bool,
) -> Result<(), String> {
    project_repository::update_project_favorite(
        database,
        &id,
        favorite,
    )
    .map_err(|e| e.to_string())
}