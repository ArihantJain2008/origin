// Learn more about Tauri commands at
// https://tauri.app/develop/calling-rust/

use std::sync::Mutex;

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
use services::settings_service;

use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

const DEBUG_OPEN_OVERLAY_ON_STARTUP: bool = false;

struct OverlayShortcutState(Mutex<Shortcut>);

fn default_overlay_shortcut() -> &'static str {
    #[cfg(target_os = "macos")]
    {
        return "CommandOrControl+Shift+Alt+O";
    }

    #[cfg(not(target_os = "macos"))]
    {
        "CommandOrControl+Shift+Space"
    }
}

fn parse_overlay_shortcut(value: Option<&String>) -> Shortcut {
    value
        .map(String::as_str)
        .unwrap_or(default_overlay_shortcut())
        .parse()
        .unwrap_or_else(|error| {
            eprintln!(
                "[SHORTCUT] invalid saved overlay shortcut, using default: {}",
                error
            );
            default_overlay_shortcut()
                .parse()
                .expect("default overlay shortcut must be valid")
        })
}

#[tauri::command]
fn update_overlay_shortcut(
    app: tauri::AppHandle,
    state: tauri::State<'_, OverlayShortcutState>,
    shortcut: String,
) -> Result<(), String> {
    let next = shortcut
        .parse::<Shortcut>()
        .map_err(|error| format!("Unsupported global shortcut: {}", error))?;

    let mut current = state
        .0
        .lock()
        .map_err(|_| "Global shortcut state is unavailable".to_string())?;

    if next == *current {
        return Ok(());
    }

    let previous = *current;

    app.global_shortcut()
        .unregister(previous)
        .map_err(|error| format!("Failed to unregister the previous shortcut: {}", error))?;

    if let Err(error) = app.global_shortcut().register(next) {
        let restore_result = app.global_shortcut().register(previous);

        return Err(match restore_result {
            Ok(()) => format!("Could not register that shortcut: {}", error),
            Err(restore_error) => format!(
                "Could not register that shortcut: {}; restoring the previous shortcut also failed: {}",
                error, restore_error
            ),
        });
    }

    *current = next;
    println!("[SHORTCUT] overlay shortcut updated to {}", next);

    Ok(())
}

#[tauri::command]
fn toggle_overlay_command(app: tauri::AppHandle) {
    overlay::toggle_overlay(&app, None);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        // =====================================================
        // Global Shortcut
        // =====================================================
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, shortcut, event| {
                    if event.state() != ShortcutState::Pressed {
                        return;
                    }

                    let overlay_shortcut = app.state::<OverlayShortcutState>();
                    let matches_overlay = overlay_shortcut
                        .0
                        .lock()
                        .map(|registered| shortcut == &*registered)
                        .unwrap_or(false);

                    if matches_overlay {
                        println!("Origin overlay shortcut pressed");

                        let callback_handle = app.clone();

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
                .expect("Failed to resolve app data directory");

            std::fs::create_dir_all(&app_data_dir).expect("Failed to create app data directory");

            let database_path = app_data_dir.join("origin.db");

            println!("Opening database at {}", database_path.display());

            let database = Database::new(&database_path).expect("Failed to open app database");

            database
                .initialize()
                .expect("Failed to initialize database");

            app.manage(database);

            // -------------------------------------------------
            // Process State
            // -------------------------------------------------

            app.manage(ProcessState::default());

            // -------------------------------------------------
            // Global Overlay Shortcut
            // -------------------------------------------------

            let overlay_shortcut = settings_service::load_settings(
                &app.state::<Database>()
            )
            .ok()
            .and_then(|settings| settings.command_shortcuts.get("overlay").cloned());
            let overlay_shortcut = parse_overlay_shortcut(overlay_shortcut.as_ref());

            app.manage(OverlayShortcutState(Mutex::new(overlay_shortcut)));

            app.global_shortcut()
                .register(overlay_shortcut)
                .map_err(|error| {
                    format!(
                        "Failed to register Origin's global overlay shortcut ({}). It may conflict with an operating-system shortcut or another application.",
                        error
                    )
                })?;

            println!("Origin overlay shortcut registered.");

            // -------------------------------------------------
            // System Tray
            // -------------------------------------------------

            let show_item = MenuItem::with_id(app, "show", "Open Origin", true, None::<&str>)?;

            let overlay_item =
                MenuItem::with_id(app, "overlay", "Open Overlay", true, None::<&str>)?;

            let quit_item = MenuItem::with_id(app, "quit", "Quit Origin", true, None::<&str>)?;

            let tray_menu = Menu::with_items(app, &[&show_item, &overlay_item, &quit_item])?;

            TrayIconBuilder::new()
                .icon(
                    app.default_window_icon()
                        .expect("Default window icon not available")
                        .clone(),
                )
                .menu(&tray_menu)
                .show_menu_on_left_click(false)
                .tooltip("Origin")
                .on_menu_event(|app, event| {
                    match event.id.as_ref() {
                        // ---------------------------------
                        // Open Origin launcher
                        // ---------------------------------
                        "show" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();

                                let _ = window.set_focus();
                            }
                        }

                        // ---------------------------------
                        // Open Origin overlay
                        // ---------------------------------
                        "overlay" => {
                            overlay::toggle_overlay(app, None);
                        }

                        // ---------------------------------
                        // Completely quit Origin
                        // ---------------------------------
                        "quit" => {
                            app.exit(0);
                        }

                        _ => {}
                    }
                })
                .build(app)?;

            println!("Origin system tray initialized.");

            if DEBUG_OPEN_OVERLAY_ON_STARTUP {
                println!("[OVERLAY] debug startup open requested");

                overlay::toggle_overlay(&app.handle(), None);
            }

            Ok(())
        })
        // =====================================================
        // Tauri Plugins
        // =====================================================
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        // =====================================================
        // Tauri Commands
        // =====================================================
        .invoke_handler(tauri::generate_handler![
            // General
            greet,
            debug_log,
            update_overlay_shortcut,
            toggle_overlay_command,
            // Workspace
            commands::workspace::launch_project,
            commands::workspace::reveal_project,
            commands::workspace::open_path_in_editor,
            // Projects
            commands::projects::save_project,
            commands::projects::load_projects,
            commands::projects::refresh_project_git,
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
            // Folders
            commands::folder::read_folder_contents,
            // System
            commands::system::system_get_stats,
        ])
        // =====================================================
        // Run Application
        // =====================================================
        .run(tauri::generate_context!())
        .expect("error while running Origin");
}
