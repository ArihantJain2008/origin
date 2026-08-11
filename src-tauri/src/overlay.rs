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
                println!("[OVERLAY] toggle requested -> hide");

                if let Err(error) = window.hide() {
                    eprintln!(
                        "[OVERLAY] failed to hide overlay: {}",
                        error
                    );
                }
            }

            Ok(false) => {
                println!("[OVERLAY] toggle requested -> show");

                if let Err(error) = window.show() {
                    eprintln!(
                        "[OVERLAY] failed to show overlay: {}",
                        error
                    );

                    return;
                }

                if let Err(error) = window.set_focus() {
                    eprintln!(
                        "[OVERLAY] failed to focus overlay: {}",
                        error
                    );
                }
            }

            Err(error) => {
                eprintln!(
                    "[OVERLAY] failed to read visibility: {}",
                    error
                );
            }
        }

        return;
    }

    create_overlay_window(
        app,
        detected_project_path,
    );
}

fn create_overlay_window(
    app: &AppHandle,
    _detected_project_path: Option<String>,
) {
    println!("[OVERLAY] creating overlay window");

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
        tauri::window::Color(
            0,
            0,
            0,
            0,
        ),
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
                "[OVERLAY] overlay window created"
            );

            let callback_window =
                window.clone();

            window.on_window_event(
                move |event| match event {
                    tauri::WindowEvent::Focused(
                        true,
                    ) => {
                        println!(
                            "[OVERLAY] Focused true"
                        );
                    }

                    tauri::WindowEvent::Focused(
                        false,
                    ) => {
                        println!(
                            "[OVERLAY] Focused false -> hide"
                        );

                        if let Err(error) =
                            callback_window.hide()
                        {
                            eprintln!(
                                "[OVERLAY] failed to hide overlay after focus loss: {}",
                                error
                            );
                        }
                    }

                    tauri::WindowEvent::CloseRequested {
                        ..
                    } => {
                        println!(
                            "[OVERLAY] CloseRequested"
                        );
                    }

                    tauri::WindowEvent::Destroyed => {
                        println!(
                            "[OVERLAY] Destroyed"
                        );
                    }

                    _ => {}
                },
            );
        }

        Err(error) => {
            eprintln!(
                "[OVERLAY] failed to create overlay window: {}",
                error
            );
        }
    }
}
