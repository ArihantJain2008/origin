use serde::Serialize;
use std::collections::HashMap;
use std::process::Command;
use std::sync::Mutex;
use tauri::State;

#[derive(Default)]
pub struct ProcessState {
    pub processes: Mutex<HashMap<String, u32>>,
}

#[derive(Debug, Serialize)]
pub struct LaunchProcessResult {
    pub id: String,
    pub pid: u32,
}

#[tauri::command]
pub fn launch_run_command(
    state: State<'_, ProcessState>,
    id: String,
    command: String,
    working_directory: String,
) -> Result<LaunchProcessResult, String> {
    if command.trim().is_empty() {
        return Err(
            "Command cannot be empty".to_string()
        );
    }

    if working_directory.trim().is_empty() {
        return Err(
            "Working directory cannot be empty"
                .to_string()
        );
    }

    #[cfg(target_os = "windows")]
    let child = {
        use std::os::windows::process::CommandExt;

        const CREATE_NEW_CONSOLE: u32 = 0x00000010;

        Command::new("cmd.exe")
            .args(["/K", &command])
            .current_dir(&working_directory)
            .creation_flags(CREATE_NEW_CONSOLE)
            .spawn()
    };

    #[cfg(not(target_os = "windows"))]
    let child = Command::new("sh")
        .args(["-c", &command])
        .current_dir(&working_directory)
        .spawn();

    let child = child.map_err(|error| {
        format!(
            "Failed to start command: {}",
            error
        )
    })?;

    let pid = child.id();

    let mut processes =
        state.processes.lock().map_err(|_| {
            "Failed to access process state"
                .to_string()
        })?;

    processes.insert(id.clone(), pid);

    println!(
        "Origin process started: {} (PID {})",
        id, pid
    );

    Ok(LaunchProcessResult {
        id,
        pid,
    })
}

#[tauri::command]
pub fn stop_run_command(
    state: State<'_, ProcessState>,
    id: String,
) -> Result<(), String> {
    let mut processes =
        state.processes.lock().map_err(|_| {
            "Failed to access process state"
                .to_string()
        })?;

    let pid = match processes.remove(&id) {
        Some(pid) => pid,
        None => {
            return Ok(());
        }
    };

    #[cfg(target_os = "windows")]
    {
        Command::new("taskkill")
            .args([
                "/PID",
                &pid.to_string(),
                "/T",
                "/F",
            ])
            .output()
            .map_err(|error| {
                format!(
                    "Failed to stop process: {}",
                    error
                )
            })?;
    }

    #[cfg(not(target_os = "windows"))]
    {
        Command::new("kill")
            .arg(pid.to_string())
            .output()
            .map_err(|error| {
                format!(
                    "Failed to stop process: {}",
                    error
                )
            })?;
    }

    println!(
        "Origin process stopped: {} (PID {})",
        id, pid
    );

    Ok(())
}