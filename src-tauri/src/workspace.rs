use std::process::Command;

#[tauri::command]
pub fn launch_project(path: String) -> Result<(), String> {
    Command::new("cmd")
        .args([
            "/C",
            "code",
            &path,
        ])
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(())
}