#[cfg(target_os = "windows")]
use std::path::Path;
#[cfg(any(target_os = "macos", target_os = "linux"))]
use std::path::PathBuf;
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
        "xcode" => "xcode",
        _ => "code",
    }
}

#[cfg(target_os = "windows")]
fn launch_editor(executable: &str, path: &str) -> Result<Option<std::process::Child>, String> {
    if !Path::new(path).is_dir() {
        return Err(format!("Project directory does not exist: {}", path));
    }

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
            Ok(child) => return Ok(Some(child)),
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
fn launch_editor(executable: &str, path: &str) -> Result<Option<std::process::Child>, String> {
    if executable == "xcode" {
        #[cfg(not(target_os = "macos"))]
        return Err("Xcode is only available on macOS".to_string());
    }

    let mut candidates = vec![PathBuf::from(executable)];

    #[cfg(target_os = "macos")]
    {
        let target_path = if executable == "xcode" {
            resolve_xcode_target(path)?
        } else {
            PathBuf::from(path)
        };

        let app_name = match executable {
            "cursor" => "Cursor.app",
            "windsurf" => "Windsurf.app",
            "xcode" => "Xcode.app",
            _ => "Visual Studio Code.app",
        };
        let mut app_paths = vec![
            PathBuf::from("/Applications").join(app_name),
            PathBuf::from("/System/Applications").join(app_name),
        ];

        if let Some(home) = std::env::var_os("HOME") {
            app_paths.push(PathBuf::from(home).join("Applications").join(app_name));
        }

        for app_path in &app_paths {
            if executable == "xcode" {
                continue;
            }

            candidates.push(
                app_path
                    .join("Contents")
                    .join("Resources")
                    .join("app")
                    .join("bin")
                    .join(executable),
            );
        }

        let mut last_error = None;
        if executable != "xcode" {
            for candidate in candidates {
                match Command::new(&candidate).args(["--wait", path]).spawn() {
                    Ok(child) => return Ok(Some(child)),
                    Err(error) => last_error = Some(error),
                }
            }
        }

        for app_path in app_paths {
            if !app_path.is_dir() {
                continue;
            }

            let app_path = app_path.to_string_lossy().into_owned();
            let mut command = Command::new("open");
            command.args(["-a", &app_path]);

            if executable == "xcode" {
                command.arg(&target_path);
            } else {
                command.arg(path);
            }

            let mut child = command
                .spawn()
                .map_err(|error| format!("Failed to launch {}: {}", executable, error))?;

            let status = child.wait().map_err(|error| {
                format!(
                    "Failed while waiting for {} to launch: {}",
                    executable, error
                )
            })?;

            if !status.success() {
                return Err(format!(
                    "Failed to launch {} from {} (status: {})",
                    executable, app_path, status
                ));
            }

            return Ok(None);
        }

        if executable == "xcode" {
            let status = Command::new("open")
                .args(["-a", "Xcode"])
                .arg(&target_path)
                .status()
                .map_err(|error| format!("Failed to launch Xcode: {}", error))?;

            if status.success() {
                return Ok(None);
            }

            return Err(format!(
                "Xcode is not installed or could not be launched (status: {})",
                status
            ));
        }

        return Err(format!(
            "Could not find {} on PATH or in /Applications or ~/Applications: {}",
            executable,
            last_error
                .map(|error| error.to_string())
                .unwrap_or_else(|| "no launch candidates found".to_string())
        ));
    }

    #[cfg(target_os = "linux")]
    {
        Command::new(&candidates[0])
            .args(["--wait", path])
            .spawn()
            .map(Some)
            .map_err(|error| format!("Failed to launch {}: {}", executable, error))
    }
}

#[cfg(target_os = "macos")]
fn resolve_xcode_target(path: &str) -> Result<PathBuf, String> {
    let path = PathBuf::from(path);

    if !path.exists() {
        return Err(format!(
            "Xcode project path does not exist: {}",
            path.display()
        ));
    }

    if path.is_dir() {
        match path.extension().and_then(|extension| extension.to_str()) {
            Some("xcodeproj") | Some("xcworkspace") => return Ok(path),
            _ => {}
        }

        let mut workspaces = Vec::new();
        let mut projects = Vec::new();
        for entry in std::fs::read_dir(&path)
            .map_err(|error| format!("Could not inspect {}: {}", path.display(), error))?
        {
            let entry = entry.map_err(|error| error.to_string())?;
            let entry_path = entry.path();
            match entry_path
                .extension()
                .and_then(|extension| extension.to_str())
            {
                Some("xcworkspace") => workspaces.push(entry_path),
                Some("xcodeproj") => projects.push(entry_path),
                _ => {}
            }
        }

        if let Some(workspace) = workspaces.into_iter().next() {
            return Ok(workspace);
        }

        if let Some(project) = projects.into_iter().next() {
            return Ok(project);
        }
    }

    Err(format!(
        "Xcode can only open .xcodeproj or .xcworkspace paths. No Xcode project was found in {}",
        path.display()
    ))
}

pub fn launch_project(
    app: &AppHandle,
    database: &Database,
    id: String,
    path: String,
) -> Result<(), String> {
    let editor = settings_service::get_preferred_editor(database)?;

    let executable = editor_executable(&editor);

    let child = launch_editor(executable, &path)?;

    project_repository::update_project_last_opened(database, &id)
        .map_err(|error| error.to_string())?;

    if let Some(mut child) = child {
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
            Err(error) => eprintln!("[WORKSPACE] Failed while waiting for editor: {}", error),
        });
    }

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
