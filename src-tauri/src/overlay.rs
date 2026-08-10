use tauri::{
    AppHandle,
    Manager,
    WebviewUrl,
    WebviewWindowBuilder,
};

const OVERLAY_LABEL: &str = "overlay";

pub fn toggle_overlay(app: &AppHandle, detected_project_path: Option<String>) {
    if let Some(window) =
        app.get_webview_window(OVERLAY_LABEL)
    {
        match window.is_visible() {
            Ok(true) => {
                println!("Origin overlay → hide");

                if let Err(error) = window.hide() {
                    eprintln!(
                        "Failed to hide Origin overlay: {}",
                        error
                    );
                }
            }

            Ok(false) => {
                println!("Origin overlay → show");

                if let Err(error) = window.show() {
                    eprintln!(
                        "Failed to show Origin overlay: {}",
                        error
                    );

                    return;
                }

                // No direct project-context emission. Frontend will invoke the
                // `get_active_project_context` command when it gains focus.

                if let Err(error) = window.set_focus() {
                    eprintln!(
                        "Failed to focus Origin overlay: {}",
                        error
                    );
                }
            }

            Err(error) => {
                eprintln!(
                    "Failed to check Origin overlay: {}",
                    error
                );
            }
        }

            return;
    }

        create_overlay_window(app, detected_project_path);
}

    fn create_overlay_window(app: &AppHandle, _detected_project_path: Option<String>) {
    println!("Creating Origin overlay...");

    let result = WebviewWindowBuilder::new(
        app,
        OVERLAY_LABEL,
        WebviewUrl::App(
            "/?overlay=1".into(),
        ),
    )
    .title("Origin Overlay")
    .inner_size(1400.0, 900.0)
    .position(0.0, 0.0)
    .transparent(true)
.background_color(
    tauri::window::Color(0, 0, 0, 0)
)
.decorations(false)
    .always_on_top(true)
    .skip_taskbar(true)
    .resizable(false)
    .maximizable(false)
    .minimizable(false)
    .focused(true)
    .visible(true)
    .build();

    match result {
        Ok(window) => {
            println!(
                "Origin overlay created successfully"
            );

            // No emission here; frontend will invoke the Tauri command to pull the
            // currently stored project context when the overlay is shown/focused.

            // If we were given a detected project context earlier via app state,
            // it will be emitted by the caller just after creating/showing the window.

            let callback_window =
                window.clone();

            window.on_window_event(
                move |event| {
                    if let tauri::WindowEvent::Focused(
                        false,
                    ) = event
                    {
                        println!(
                            "Origin overlay lost focus → hide"
                        );

                        if let Err(error) =
                            callback_window.hide()
                        {
                            eprintln!(
                                "Failed to hide Origin overlay: {}",
                                error
                            );
                        }
                    }
                },
            );
        }

        Err(error) => {
            eprintln!(
                "Failed to create Origin overlay: {}",
                error
            );
        }
    }
}