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
    use std::os::windows::process::CommandExt;
    use std::path::PathBuf;

    const CREATE_NO_WINDOW: u32 = 0x08000000;

    fn executable_name(command: &str) -> &'static str {
        match command {
            "cursor" => "Cursor.exe",
            "windsurf" => "Windsurf.exe",
            _ => "Code.exe",
        }
    }

    fn known_install_paths(command: &str) -> Vec<PathBuf> {
        let exe = executable_name(command);

        let mut paths = Vec::new();

        if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
            let local_app_data = PathBuf::from(local_app_data);

            match command {
                "cursor" => {
                    paths.push(local_app_data.join("Programs").join("Cursor").join(exe));
                }
                "windsurf" => {
                    paths.push(local_app_data.join("Programs").join("Windsurf").join(exe));
                }
                _ => {
                    paths.push(
                        local_app_data
                            .join("Programs")
                            .join("Microsoft VS Code")
                            .join(exe),
                    );
                }
            }
        }

        for variable in ["ProgramFiles", "ProgramFiles(x86)"] {
            if let Ok(program_files) = std::env::var(variable) {
                let program_files = PathBuf::from(program_files);

                match command {
                    "cursor" => paths.push(program_files.join("Cursor").join(exe)),
                    "windsurf" => paths.push(program_files.join("Windsurf").join(exe)),
                    _ => paths.push(program_files.join("Microsoft VS Code").join(exe)),
                }
            }
        }

        paths
    }

    fn executable_near_path_shim(command: &str) -> Vec<PathBuf> {
        let exe = executable_name(command);
        let mut paths = Vec::new();

        if let Some(path_var) = std::env::var_os("PATH") {
            for path in std::env::split_paths(&path_var) {
                for extension in ["cmd", "bat", "exe"] {
                    let shim = path.join(format!("{}.{}", command, extension));

                    if !shim.exists() {
                        continue;
                    }

                    if let Some(parent) = path.parent() {
                        paths.push(parent.join(exe));
                    }

                    paths.push(path.join(exe));
                }
            }
        }

        paths
    }

    let mut candidates = vec![PathBuf::from(executable)];

    candidates.extend(known_install_paths(executable));
    candidates.extend(executable_near_path_shim(executable));

    let mut last_error = None;

    for candidate in candidates {
        match Command::new(&candidate)
            .args(["--wait", path])
            .creation_flags(CREATE_NO_WINDOW)
            .spawn()
        {
            Ok(child) => return Ok(child),
            Err(error) => {
                last_error = Some(error);
            }
        }
    }

    Err(format!(
        "Failed to launch {}: {}",
        executable,
        last_error
            .map(|error| error.to_string())
            .unwrap_or_else(|| "no launch candidates found".to_string())
    ))
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
