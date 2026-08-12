#[cfg(target_os = "windows")]
use windows::Win32::UI::WindowsAndMessaging::{
    SendMessageW,
    HWND_BROADCAST,
    WM_APPCOMMAND,
};


#[cfg(target_os = "windows")]
const APPCOMMAND_MEDIA_NEXTTRACK: u16 = 11;


#[cfg(target_os = "windows")]
const APPCOMMAND_MEDIA_PREVIOUSTRACK: u16 = 12;


#[cfg(target_os = "windows")]
const APPCOMMAND_MEDIA_PLAY_PAUSE: u16 = 14;


#[cfg(target_os = "windows")]
fn send_media_command(command: u16) -> Result<(), String> {
    println!(
        "[MEDIA] sending WM_APPCOMMAND command={}",
        command
    );

    unsafe {
        let lparam = ((command as isize) << 16) as isize;

        SendMessageW(
            HWND_BROADCAST,
            WM_APPCOMMAND,
            Default::default(),
            Some(
                windows::Win32::Foundation::LPARAM(lparam)
            ),
        );
    }

    println!(
        "[MEDIA] WM_APPCOMMAND sent successfully"
    );

    Ok(())
}


#[cfg(not(target_os = "windows"))]
fn send_media_command(
    _command: u16,
) -> Result<(), String> {
    Err(
        "System media controls are only supported on Windows."
            .to_string()
    )
}


#[tauri::command]
pub fn media_play_pause() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        return send_media_command(APPCOMMAND_MEDIA_PLAY_PAUSE);
    }

    #[cfg(not(target_os = "windows"))]
    {
        return send_media_command(0);
    }
}

#[tauri::command]
pub fn media_next() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        return send_media_command(APPCOMMAND_MEDIA_NEXTTRACK);
    }

    #[cfg(not(target_os = "windows"))]
    {
        return send_media_command(0);
    }
}

#[tauri::command]
pub fn media_previous() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        return send_media_command(APPCOMMAND_MEDIA_PREVIOUSTRACK);
    }

    #[cfg(not(target_os = "windows"))]
    {
        return send_media_command(0);
    }
}