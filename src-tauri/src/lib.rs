// Learn more about Tauri commands at
// https://tauri.app/develop/calling-rust/

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn debug_log(message: String) {
    println!("[FRONTEND] {}", message);
}

mod analysis;
mod commands;
mod database;
mod models;
mod overlay;
mod services;
mod state;

use crate::database::database::Database;

use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager,
};

use commands::processes::ProcessState;

use tauri_plugin_global_shortcut::{
    Code,
    GlobalShortcutExt,
    Modifiers,
    Shortcut,
    ShortcutState,
};

const DEBUG_OPEN_OVERLAY_ON_STARTUP: bool = false;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()

        // =====================================================
        // Global Shortcut
        // =====================================================

        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, shortcut, event| {

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

                        let callback_handle = app.clone();

                        let _ = app.run_on_main_thread(
                            move || {
                                overlay::toggle_overlay(
                                    &callback_handle,
                                    None,
                                );
                            },
                        );
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

            // -------------------------------------------------
            // Process State
            // -------------------------------------------------

            app.manage(
                ProcessState::default()
            );

            // -------------------------------------------------
            // Global Overlay Shortcut
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

            // -------------------------------------------------
            // System Tray
            // -------------------------------------------------

            let show_item = MenuItem::with_id(
                app,
                "show",
                "Open Origin",
                true,
                None::<&str>,
            )?;

            let overlay_item = MenuItem::with_id(
                app,
                "overlay",
                "Open Overlay",
                true,
                None::<&str>,
            )?;

            let quit_item = MenuItem::with_id(
                app,
                "quit",
                "Quit Origin",
                true,
                None::<&str>,
            )?;

            let tray_menu = Menu::with_items(
                app,
                &[
                    &show_item,
                    &overlay_item,
                    &quit_item,
                ],
            )?;

            TrayIconBuilder::new()
                .icon(
                    app.default_window_icon()
                        .expect(
                            "Default window icon not available",
                        )
                        .clone(),
                )
                .menu(&tray_menu)
                .show_menu_on_left_click(false)
                .tooltip("Origin")
                .on_menu_event(
                    |app, event| {
                        match event.id.as_ref() {

                            // ---------------------------------
                            // Open Origin launcher
                            // ---------------------------------

                            "show" => {
                                if let Some(window) =
                                    app.get_webview_window("main")
                                {
                                    let _ =
                                        window.show();

                                    let _ =
                                        window.set_focus();
                                }
                            }

                            // ---------------------------------
                            // Open Origin overlay
                            // ---------------------------------

                            "overlay" => {
                                overlay::toggle_overlay(
                                    app,
                                    None,
                                );
                            }

                            // ---------------------------------
                            // Completely quit Origin
                            // ---------------------------------

                            "quit" => {
                                app.exit(0);
                            }

                            _ => {}
                        }
                    },
                )
                .build(app)?;

            println!(
                "Origin system tray initialized."
            );

            if DEBUG_OPEN_OVERLAY_ON_STARTUP {
                println!(
                    "[OVERLAY] debug startup open requested"
                );

                overlay::toggle_overlay(
                    &app.handle(),
                    None,
                );
            }

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
                debug_log,

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

                // Git
                commands::git::git_status,
                commands::git::git_branch,
                commands::git::git_commit,
                commands::git::git_push,
                commands::git::git_branches,
                commands::git::git_checkout,
                commands::git::git_changes,

                // Media
                commands::media::media_play_pause,
                commands::media::media_next,
                commands::media::media_previous,

                // System
                commands::system::system_get_stats,
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
