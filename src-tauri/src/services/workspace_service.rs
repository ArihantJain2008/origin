use std::process::Command;

use crate::database::{database::Database, project_repository};

pub fn launch_project(database: &Database, id: String, path: String) -> Result<(), String> {
    Command::new("cmd")
        .args(["/C", "code", &path])
        .spawn()
        .map_err(|e| e.to_string())?;

    project_repository::update_project_last_opened(database, &id).map_err(|e| e.to_string())?;

    Ok(())
}
