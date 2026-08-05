use rusqlite::Result;

use crate::{
    database::database::Database,
    models::project::ProjectDto,
};

pub fn save_project(
    database: &Database,
    project: &ProjectDto,
) -> Result<()> {

    let connection = database.connection();

    connection.execute(
        "
        INSERT OR REPLACE INTO projects
        (
            id,
            name,
            path,
            framework,
            language,
            favorite,
            created_at,
            updated_at
        )
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
        ",
        (
            &project.id,
            &project.name,
            &project.path,
            &project.framework,
            &project.language,
            project.favorite,
            &project.created_at,
            &project.updated_at,
        ),
    )?;

    Ok(())
}