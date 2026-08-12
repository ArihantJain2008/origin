use std::process::Command;
use std::thread;

use tauri::AppHandle;

use crate::{
    database::{database::Database, project_repository},
    services::settings_service,
};

fn editor_executable(editor: &str) -> &'static str {
    match editor {
        "cursor" => "cursor",
        "windsurf" => "windsurf",
        _ => "code",
    }
}

#[cfg(target_os = "windows")]
fn launch_editor(executable: &str, path: &str) -> Result<std::process::Child, String> {
    Command::new("cmd")
        .args(["/C", executable, "--wait", path])
        .spawn()
        .map_err(|error| format!("Failed to launch {}: {}", executable, error))
}

#[cfg(not(target_os = "windows"))]
fn launch_editor(executable: &str, path: &str) -> Result<std::process::Child, String> {
    Command::new(executable)
        .args(["--wait", path])
        .spawn()
        .map_err(|error| format!("Failed to launch {}: {}", executable, error))
}

pub fn launch_project(
    app: &AppHandle,
    database: &Database,
    id: String,
    path: String,
) -> Result<(), String> {
    let editor = settings_service::get_preferred_editor(database)?;

    let executable = editor_executable(&editor);

    let mut child = launch_editor(executable, &path)?;

    project_repository::update_project_last_opened(database, &id)
        .map_err(|error| error.to_string())?;

    let app_handle = app.clone();
    let editor_name = executable.to_string();

    thread::spawn(move || match child.wait() {
        Ok(status) => {
            println!("[WORKSPACE] {} closed with status: {}", editor_name, status);

            if status.success() {
                println!("[WORKSPACE] Preferred editor closed -> exiting Origin");

                app_handle.exit(0);
            } else {
                eprintln!("[WORKSPACE] Editor exited unsuccessfully: {}", status);
            }
        }

        Err(error) => {
            eprintln!("[WORKSPACE] Failed while waiting for editor: {}", error);
        }
    });

    Ok(())
}

pub fn open_path_in_editor(database: &Database, path: String) -> Result<(), String> {
    let editor = settings_service::get_preferred_editor(database)?;

    let executable = editor_executable(&editor);

    launch_editor(executable, &path)?;

    println!("[WORKSPACE] Opened {} in {}", path, executable);

    Ok(())
}

pub fn reveal_project(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|error| error.to_string())?;
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|error| error.to_string())?;
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|error| error.to_string())?;
    }

    Ok(())
}
