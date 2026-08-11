use std::process::Command;
use std::thread;

use tauri::AppHandle;

use crate::{
    database::{database::Database, project_repository},
    services::settings_service,
};

pub fn launch_project(
    app: &AppHandle,
    database: &Database,
    id: String,
    path: String,
) -> Result<(), String> {
    let editor =
        settings_service::get_preferred_editor(database)?;

    let executable = match editor.as_str() {
        "cursor" => "cursor",
        "windsurf" => "windsurf",
        _ => "code",
    };

    let project_path = path.clone();
    let app_handle = app.clone();

    let mut child = Command::new("cmd")
        .args([
            "/C",
            executable,
            "--wait",
            &project_path,
        ])
        .spawn()
        .map_err(|error| {
            format!(
                "Failed to launch {}: {}",
                executable,
                error
            )
        })?;

    project_repository::update_project_last_opened(
        database,
        &id,
    )
    .map_err(|error| error.to_string())?;

    thread::spawn(move || {
        match child.wait() {
            Ok(status) => {
                println!(
                    "[WORKSPACE] {} closed with status: {}",
                    executable,
                    status
                );

                if status.success() {
                    println!(
                        "[WORKSPACE] Preferred editor closed -> exiting Origin"
                    );

                    app_handle.exit(0);
                } else {
                    eprintln!(
                        "[WORKSPACE] Editor process exited unsuccessfully: {}",
                        status
                    );
                }
            }

            Err(error) => {
                eprintln!(
                    "[WORKSPACE] Failed while waiting for editor: {}",
                    error
                );
            }
        }
    });

    Ok(())
}

pub fn reveal_project(
    path: String,
) -> Result<(), String> {
    Command::new("explorer")
        .arg(&path)
        .spawn()
        .map_err(|error| error.to_string())?;

    Ok(())
}