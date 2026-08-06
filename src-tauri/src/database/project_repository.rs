use chrono::Utc;
use rusqlite::Result;

use crate::{database::database::Database, models::project::ProjectDto};

pub fn save_project(database: &Database, project: &ProjectDto) -> Result<()> {
    let connection = database.connection();

    let rows_affected = connection.execute(
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

    println!(
        "save_project: path={} rows_affected={}",
        project.path, rows_affected
    );

    Ok(())
}

pub fn load_projects(database: &Database) -> Result<Vec<ProjectDto>> {
    let connection = database.connection();

    let mut statement = connection.prepare(
        "
        SELECT
            id,
            name,
            path,
            framework,
            language,
            favorite,
            created_at,
            updated_at,
            last_opened
        FROM projects
        ORDER BY
            last_opened IS NULL,
            last_opened DESC,
            updated_at DESC
        ",
    )?;

    let projects = statement
        .query_map([], |row| {
            Ok(ProjectDto {
                id: row.get(0)?,
                name: row.get(1)?,
                path: row.get(2)?,
                framework: row.get(3)?,
                language: row.get(4)?,
                favorite: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
                last_opened: row.get(8)?,
            })
        })?
        .collect::<Result<Vec<_>>>()?;

    Ok(projects)
}

pub fn update_project_last_opened(database: &Database, id: &str) -> Result<()> {
    let connection = database.connection();

    let rows_affected = connection.execute(
        "
        UPDATE projects
        SET last_opened = ?1
        WHERE id = ?2
        ",
        (Utc::now().to_rfc3339(), id),
    )?;

    println!(
        "update_project_last_opened: id={} rows_affected={}",
        id, rows_affected
    );

    Ok(())
}
