use serde::Serialize;
use std::collections::HashMap;
use std::io::{BufRead, BufReader, Read};
use std::process::Command;
#[cfg(not(target_os = "windows"))]
use std::process::Stdio;
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::{AppHandle, Emitter, State};

#[derive(Default)]
pub struct ProcessState {
    pub processes: Arc<Mutex<HashMap<String, u32>>>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct RunCommandOutput {
    id: String,
    stream: String,
    text: String,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct RunCommandExited {
    id: String,
    success: bool,
    code: Option<i32>,
}

#[derive(Debug, Serialize)]
pub struct LaunchProcessResult {
    pub id: String,
    pub pid: u32,
}

fn spawn_output_reader<R: Read + Send + 'static>(
    app: AppHandle,
    id: String,
    stream: &'static str,
    output: R,
) {
    thread::spawn(move || {
        for line in BufReader::new(output).lines().map_while(Result::ok) {
            let _ = app.emit(
                "run-command-output",
                RunCommandOutput {
                    id: id.clone(),
                    stream: stream.to_string(),
                    text: line,
                },
            );
        }
    });
}

#[tauri::command]
pub fn launch_run_command(
    app: AppHandle,
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
        return Err("Working directory cannot be empty".to_string());
    }

    let mut processes = state
        .processes
        .lock()
        .map_err(|_| "Failed to access process state".to_string())?;

    if processes.contains_key(&id) {
        return Err("Command is already running".to_string());
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
        let normalized_command = command.replace("\r\n", "\n").replace('\r', "\n");

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
            return Err("Command cannot be empty".to_string());
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
        let normalized_command = command.replace("\r\n", "\n").replace('\r', "\n");

        Command::new("sh")
            .arg("-c")
            .arg(&normalized_command)
            .current_dir(&working_directory)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
    };

    // ---------------------------------------------
    // Spawn process
    // ---------------------------------------------

    let child = child.map_err(|error| format!("Failed to start command: {}", error))?;

    let pid = child.id();

    processes.insert(id.clone(), pid);
    let processes = Arc::clone(&state.processes);
    let event_id = id.clone();

    thread::spawn(move || {
        let mut child = child;

        if let Some(output) = child.stdout.take() {
            spawn_output_reader(app.clone(), event_id.clone(), "stdout", output);
        }
        if let Some(output) = child.stderr.take() {
            spawn_output_reader(app.clone(), event_id.clone(), "stderr", output);
        }

        let result = child.wait();
        if let Ok(mut processes) = processes.lock() {
            processes.remove(&event_id);
        }

        if let Ok(status) = result {
            let _ = app.emit(
                "run-command-exited",
                RunCommandExited {
                    id: event_id,
                    success: status.success(),
                    code: status.code(),
                },
            );
        }
    });

    println!("Origin process started: {} (PID {})", id, pid);

    // ---------------------------------------------
    // Return process information
    // ---------------------------------------------

    Ok(LaunchProcessResult { id, pid })
}

#[tauri::command]
pub fn stop_run_command(state: State<'_, ProcessState>, id: String) -> Result<(), String> {
    // ---------------------------------------------
    // Access process state
    // ---------------------------------------------

    let mut processes = state
        .processes
        .lock()
        .map_err(|_| "Failed to access process state".to_string())?;

    // ---------------------------------------------
    // Find process
    // ---------------------------------------------

    let pid = match processes.get(&id).copied() {
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
        let status = Command::new("taskkill")
            .args(["/PID", &pid.to_string(), "/T", "/F"])
            .status()
            .map_err(|error| format!("Failed to stop process: {}", error))?;

        if !status.success() {
            return Err(format!("Failed to stop process (status: {})", status));
        }
    }

    // ---------------------------------------------
    // macOS / Linux
    // ---------------------------------------------

    #[cfg(not(target_os = "windows"))]
    {
        // Shell commands such as npm can leave a direct child behind.
        // pkill may return 1 when there are no matching children, which is harmless.
        let _ = Command::new("pkill")
            .args(["-TERM", "-P", &pid.to_string()])
            .status();

        let status = Command::new("kill")
            .arg(pid.to_string())
            .status()
            .map_err(|error| format!("Failed to stop process: {}", error))?;

        if !status.success() {
            return Err(format!("Failed to stop process (status: {})", status));
        }
    }

    processes.remove(&id);

    println!("Origin process stopped: {} (PID {})", id, pid);

    Ok(())
}
