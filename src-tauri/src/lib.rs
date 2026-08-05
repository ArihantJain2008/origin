// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

mod commands;
mod database;
mod models;
mod services;
mod state;

use crate::database::database::Database;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {

    // Initialize database
    let database = Database::new()
        .expect("Failed to open database");

    database
        .initialize()
        .expect("Failed to initialize database");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::workspace::launch_project,
            commands::projects::save_project,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}