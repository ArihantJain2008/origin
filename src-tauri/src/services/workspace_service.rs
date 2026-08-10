use std::process::Command;

use crate::{
    database::{database::Database, project_repository},
    services::settings_service,
};

pub fn launch_project(database: &Database, id: String, path: String) -> Result<(), String> {
    let editor = settings_service::get_preferred_editor(database)?;

    let executable = match editor.as_str() {
        "cursor" => "cursor",
        "windsurf" => "windsurf",
        _ => "code",
    };

    Command::new("cmd")
        .args(["/C", executable, &path])
        .spawn()
        .map_err(|e| e.to_string())?;

    project_repository::update_project_last_opened(database, &id).map_err(|e| e.to_string())?;

    Ok(())
}

pub fn reveal_project(path: String) -> Result<(), String> {
    Command::new("explorer")
        .arg(&path)
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(())
}
