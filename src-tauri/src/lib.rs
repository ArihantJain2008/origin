// Learn more about Tauri commands at
// https://tauri.app/develop/calling-rust/

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

mod analysis;
mod commands;
mod database;
mod models;
mod overlay;
mod services;
mod state;

use crate::database::database::Database;

use tauri::Manager;

use commands::processes::ProcessState;

use crate::services::project_service;

use tauri_plugin_global_shortcut::{
    Code,
    GlobalShortcutExt,
    Modifiers,
    Shortcut,
    ShortcutState,
};

// project_context and project_context_state removed: project selection is now explicit and frontend-driven

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()

        // =====================================================
        // Global Shortcut Plugin
        // =====================================================

        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, shortcut, event| {
                    // Only react when the key is actually pressed.
                    if event.state() != ShortcutState::Pressed {
                        return;
                    }

                    // Ctrl + Shift + Space
                    let overlay_shortcut = Shortcut::new(
                        Some(
                            Modifiers::CONTROL
                                | Modifiers::SHIFT,
                        ),
                        Code::Space,
                    );

                    if shortcut == &overlay_shortcut {
                        println!(
                            "Origin overlay shortcut pressed"
                        );

                        // IMPORTANT:
                        // app is borrowed by run_on_main_thread().
                        // A separate clone is moved into the closure.
                        let callback_handle = app.clone();

                        // Simpler behavior: toggle the overlay only. No automatic project detection.
                        let _ = app.run_on_main_thread(move || {
                            overlay::toggle_overlay(&callback_handle, None);
                        });
                    }
                })
                .build(),
        )

        // =====================================================
        // Application Setup
        // =====================================================

            .setup(|app| {
            // -------------------------------------------------
            // Database
            // -------------------------------------------------

            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect(
                    "Failed to resolve app data directory",
                );

            std::fs::create_dir_all(&app_data_dir)
                .expect(
                    "Failed to create app data directory",
                );

            let database_path =
                app_data_dir.join("origin.db");

            println!(
                "Opening database at {}",
                database_path.display()
            );

            let database =
                Database::new(&database_path)
                    .expect(
                        "Failed to open app database",
                    );

            database
                .initialize()
                .expect(
                    "Failed to initialize database",
                );

            app.manage(database);
            // project_context_state removed; active project is persisted via settings and managed by the frontend
            app.manage(ProcessState::default());

            // -------------------------------------------------
            // Global Overlay Shortcut
            // Ctrl + Shift + Space
            // -------------------------------------------------

            let overlay_shortcut =
                Shortcut::new(
                    Some(
                        Modifiers::CONTROL
                            | Modifiers::SHIFT,
                    ),
                    Code::Space,
                );

            app.global_shortcut()
                .register(overlay_shortcut)
                .expect(
                    "Failed to register overlay shortcut",
                );

            println!(
                "Origin overlay shortcut registered."
            );

            Ok(())
        })

        // =====================================================
        // Tauri Plugins
        // =====================================================

        .plugin(
            tauri_plugin_opener::init()
        )

        .plugin(
            tauri_plugin_dialog::init()
        )

        .plugin(
            tauri_plugin_fs::init()
        )

        .plugin(
            tauri_plugin_shell::init()
        )

        // =====================================================
        // Tauri Commands
        // =====================================================

        .invoke_handler(
            tauri::generate_handler![
                // General
                greet,

                // Workspace
                commands::workspace::launch_project,
                commands::workspace::reveal_project,

                // Projects
                commands::projects::save_project,
                commands::projects::load_projects,
                commands::projects::remove_project,
                commands::projects::update_project_favorite,

                // Settings
                commands::settings::save_settings,
                commands::settings::load_settings,
                commands::settings::save_active_project,
                commands::settings::load_active_project,

                // Analysis
                commands::analysis::analyze_project,

                // Processes
                commands::processes::launch_run_command,
                commands::processes::stop_run_command,
                // legacy project context removed
            ],
        )

        // =====================================================
        // Run Application
        // =====================================================

        .run(
            tauri::generate_context!()
        )

        .expect(
            "error while running Origin",
        );
}