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
    // ---------------------------------------------
    // Validate command
    // ---------------------------------------------

    if command.trim().is_empty() {
        return Err("Command cannot be empty".to_string());
    }

    // ---------------------------------------------
    // Validate working directory
    // ---------------------------------------------

    if working_directory.trim().is_empty() {
        return Err(
            "Working directory cannot be empty".to_string()
        );
    }

    // ---------------------------------------------
    // Windows
    // ---------------------------------------------

    #[cfg(target_os = "windows")]
    let child = {
        use std::os::windows::process::CommandExt;

        const CREATE_NEW_CONSOLE: u32 = 0x00000010;

        // Normalize Windows and Unix line endings.
        //
        // Windows:
        //   \r\n
        //
        // Unix:
        //   \n
        //
        // Both become:
        //   \n
        let normalized_command = command
            .replace("\r\n", "\n")
            .replace('\r', "\n");

        // Split the command into individual lines.
        //
        // Example:
        //
        // cd frontend
        // npm install
        // npm run dev
        //
        // becomes:
        //
        // [
        //   "cd frontend",
        //   "npm install",
        //   "npm run dev"
        // ]
        let commands: Vec<String> = normalized_command
            .lines()
            .map(str::trim)
            .filter(|line| !line.is_empty())
            .map(String::from)
            .collect();

        if commands.is_empty() {
            return Err(
                "Command cannot be empty".to_string()
            );
        }

        // Join all commands into one command sequence.
        //
        // Using && means:
        //
        // command 2 only runs if command 1 succeeds.
        //
        // Example:
        //
        // cd frontend
        // npm install
        // npm run dev
        //
        // becomes:
        //
        // cd frontend && npm install && npm run dev
        let command_script = commands.join(" && ");

        println!(
            "Origin launching command sequence:\n{}",
            command_script
        );

        // IMPORTANT:
        // Everything runs inside ONE cmd.exe session.
        //
        // /K keeps the terminal open after the commands
        // finish, which is useful for development servers.
        Command::new("cmd.exe")
            .args(["/K", &command_script])
            .current_dir(&working_directory)
            .creation_flags(CREATE_NEW_CONSOLE)
            .spawn()
    };

    // ---------------------------------------------
    // macOS / Linux
    // ---------------------------------------------

    #[cfg(not(target_os = "windows"))]
    let child = {
        // Normalize line endings first.
        let normalized_command = command
            .replace("\r\n", "\n")
            .replace('\r', "\n");

        println!(
            "Origin launching command sequence:\n{}",
            normalized_command
        );

        // Execute the entire multiline script in one shell
        // session.
        //
        // Example:
        //
        // cd frontend
        // npm install
        // npm run dev
        //
        // stays as three commands in the same shell.
        Command::new("sh")
            .arg("-c")
            .arg(&normalized_command)
            .current_dir(&working_directory)
            .spawn()
    };

    // ---------------------------------------------
    // Spawn process
    // ---------------------------------------------

    let child = child.map_err(|error| {
        format!(
            "Failed to start command: {}",
            error
        )
    })?;

    let pid = child.id();

    // ---------------------------------------------
    // Store process
    // ---------------------------------------------

    let mut processes =
        state.processes.lock().map_err(|_| {
            "Failed to access process state".to_string()
        })?;

    processes.insert(id.clone(), pid);

    println!(
        "Origin process started: {} (PID {})",
        id,
        pid
    );

    // ---------------------------------------------
    // Return process information
    // ---------------------------------------------

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
    // ---------------------------------------------
    // Access process state
    // ---------------------------------------------

    let mut processes =
        state.processes.lock().map_err(|_| {
            "Failed to access process state".to_string()
        })?;

    // ---------------------------------------------
    // Find process
    // ---------------------------------------------

    let pid = match processes.remove(&id) {
        Some(pid) => pid,

        None => {
            // Nothing is running for this command.
            return Ok(());
        }
    };

    // ---------------------------------------------
    // Windows
    // ---------------------------------------------

    #[cfg(target_os = "windows")]
    {
        // /T = terminate child processes as well.
        //
        // This is important for commands such as:
        //
        // npm run dev
        //
        // because npm can spawn additional processes.
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

    // ---------------------------------------------
    // macOS / Linux
    // ---------------------------------------------

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
        id,
        pid
    );

    Ok(())
}