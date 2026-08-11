use std::env;

use windows::Media::Control::GlobalSystemMediaTransportControlsSessionManager;
use windows::Win32::System::Com::{
    CoInitializeEx,
    CoUninitialize,
    COINIT_APARTMENTTHREADED,
    COINIT_MULTITHREADED,
};
use windows::Win32::System::WinRT::{
    RoInitialize,
    RoUninitialize,
    RO_INIT_SINGLETHREADED,
    RO_INIT_MULTITHREADED,
};

fn log(message: &str) {
    println!("[MEDIA_PROBE] {}", message);
}

fn main() {
    let mode =
        env::args().nth(1).unwrap_or_else(|| "com".to_string());

    let result =
        match mode.as_str() {
            "com-mta" => run_with_com(COINIT_MULTITHREADED, "CoInitializeEx(MTA)"),
            "com-sta" => run_with_com(
                COINIT_APARTMENTTHREADED,
                "CoInitializeEx(STA)",
            ),
            "winrt-mta" => run_with_winrt(
                RO_INIT_MULTITHREADED,
                "RoInitialize(MTA)",
            ),
            "winrt-sta" => run_with_winrt(
                RO_INIT_SINGLETHREADED,
                "RoInitialize(STA)",
            ),
            "com" => run_with_com(COINIT_MULTITHREADED, "CoInitializeEx(MTA)"),
            "winrt" => run_with_winrt(
                RO_INIT_MULTITHREADED,
                "RoInitialize(MTA)",
            ),
            other => Err(format!(
                "Unknown mode '{other}'. Use com-mta, com-sta, winrt-mta, or winrt-sta."
            )),
        };

    match result {
        Ok(()) => {
            log("probe completed successfully");
        }
        Err(error) => {
            eprintln!("[MEDIA_PROBE] {}", error);
            std::process::exit(1);
        }
    }
}

fn run_with_com(
    model: windows::Win32::System::Com::COINIT,
    label: &str,
) -> Result<(), String> {
    log(&format!("initializing COM with {label}"));

    unsafe {
        CoInitializeEx(None, model)
            .ok()
            .map_err(|error| format!("CoInitializeEx failed: {error}"))?;
    }

    let result = run_probe_body();

    unsafe {
        CoUninitialize();
    }

    result
}

fn run_with_winrt(
    model: windows::Win32::System::WinRT::RO_INIT_TYPE,
    label: &str,
) -> Result<(), String> {
    log(&format!("initializing WinRT with {label}"));

    unsafe {
        RoInitialize(model)
            .map_err(|error| format!("RoInitialize failed: {error}"))?;
    }

    let result = run_probe_body();

    unsafe {
        RoUninitialize();
    }

    result
}

fn run_probe_body() -> Result<(), String> {
    log("calling RequestAsync");

    let operation =
        GlobalSystemMediaTransportControlsSessionManager::RequestAsync()
            .map_err(|error| format!("RequestAsync failed: {error}"))?;

    log("RequestAsync returned successfully");

    let status = operation
        .Status()
        .map_err(|error| format!("Status failed: {error}"))?;

    log(&format!("initial async status: {status:?}"));
    log("waiting for RequestAsync result");

    let manager = operation
        .join()
        .map_err(|error| format!("join failed: {error}"))?;

    log("session manager obtained");

    match manager.GetCurrentSession() {
        Ok(session) => {
            let source = session
                .SourceAppUserModelId()
                .unwrap_or_default()
                .to_string();

            log(&format!("current session source: {source}"));
        }
        Err(error) => {
            log(&format!("GetCurrentSession returned error: {error}"));
        }
    }

    Ok(())
}
