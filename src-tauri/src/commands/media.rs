use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct MediaTrack {
    pub id: String,
    pub title: String,
    pub artist: String,
    pub album: Option<String>,
    pub artwork: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct MediaSession {
    pub id: String,
    pub source: String,
    pub track: Option<MediaTrack>,
    pub is_playing: bool,
    pub position: f64,
    pub duration: f64,
}

#[tauri::command]
pub fn media_get_current() -> Result<MediaSession, String> {
    #[cfg(target_os = "windows")]
    {
        get_current_windows_media()
    }

    #[cfg(not(target_os = "windows"))]
    {
        Err(
            "System media control is currently supported only on Windows."
                .to_string(),
        )
    }
}

#[cfg(target_os = "windows")]
fn get_current_windows_media() -> Result<MediaSession, String> {
    use windows::Media::Control::{
        GlobalSystemMediaTransportControlsSessionManager,
        GlobalSystemMediaTransportControlsSessionPlaybackStatus,
    };
    use chrono::Utc;

    let manager =
        GlobalSystemMediaTransportControlsSessionManager::RequestAsync()
            .map_err(|error| {
                format!(
                    "Failed to request media session manager: {}",
                    error
                )
            })?
            .join()
            .map_err(|error| {
                format!(
                    "Failed to get media session manager: {}",
                    error
                )
            })?;

    let session =
    manager
        .GetCurrentSession()
        .map_err(|error| {
            format!(
                "Failed to get current media session: {}",
                error
            )
        })?;

    let source =
        session
            .SourceAppUserModelId()
            .unwrap_or_default()
            .to_string();

    let playback_info =
        session
            .GetPlaybackInfo()
            .map_err(|error| {
                format!(
                    "Failed to get playback information: {}",
                    error
                )
            })?;

    let status =
        playback_info
            .PlaybackStatus()
            .unwrap_or(
                GlobalSystemMediaTransportControlsSessionPlaybackStatus::Closed,
            );

    let is_playing =
        status
            == GlobalSystemMediaTransportControlsSessionPlaybackStatus::Playing;

    let properties =
        session
            .TryGetMediaPropertiesAsync()
            .map_err(|error| {
                format!(
                    "Failed to request media properties: {}",
                    error
                )
            })?
            .join()
            .map_err(|error| {
                format!(
                    "Failed to get media properties: {}",
                    error
                )
            })?;

    let title =
        properties
            .Title()
            .unwrap_or_default()
            .to_string();

    let artist =
        properties
            .Artist()
            .unwrap_or_default()
            .to_string();

    let album =
        properties
            .AlbumTitle()
            .unwrap_or_default()
            .to_string();

    // Timeline properties include position, start/end, and a last-updated timestamp.
    // Use these to compute an effective current position while playing:
    // effective_position = position + elapsed_since_last_update * playback_rate
    let timeline = session
        .GetTimelineProperties()
        .map_err(|error| {
            format!("Failed to get media timeline: {}", error)
        })?;

    // Read raw ticks (100-nanosecond units) where available.
    let pos_ticks = timeline.Position().map(|p| p.Duration).unwrap_or(0);

    // Prefer StartTime/EndTime pair to compute total duration when present.
    let duration_seconds = match (timeline.StartTime(), timeline.EndTime()) {
        (Ok(start), Ok(end)) => {
            let start_ticks = start.Duration;
            let end_ticks = end.Duration;
            if end_ticks > start_ticks {
                (end_ticks - start_ticks) as f64 / 10_000_000.0
            } else {
                // Fallback: treat EndTime as a timespan if subtraction invalid.
                end_ticks as f64 / 10_000_000.0
            }
        }
        (Err(_), Ok(end)) => end.Duration as f64 / 10_000_000.0,
        (Ok(start), Err(_)) => start.Duration as f64 / 10_000_000.0,
        (Err(_), Err(_)) => 0.0,
    };

    // Compute effective position in seconds based on the timeline position ticks.
    // If playback is active, rely on the reported timeline position which is
    // expected to reflect the current position. When StartTime/EndTime are
    // available we use them to compute accurate duration above.
        // Try to read a last-updated timestamp if the API exposes it. This may
        // not be available on all platform versions; we probe it and ignore errors.
        let last_updated_ticks = match timeline.LastUpdatedTime() {
            Ok(t) => t.UniversalTime,
            Err(_) => 0,
        };

        let effective_position_seconds = if is_playing {
            // Current system time in 100ns ticks since 1601-01-01 UTC.
            let now = Utc::now();
            let unix_secs = now.timestamp();
            let unix_nanos = now.timestamp_subsec_nanos() as i64;
            let epoch_offset = 11644473600i64; // seconds between 1601 and 1970
            let now_ticks = (unix_secs + epoch_offset) * 10_000_000i64
                + (unix_nanos / 100) as i64;

            let mut elapsed_seconds = 0.0f64;

            if last_updated_ticks > 0 {
                let elapsed_ticks = now_ticks.saturating_sub(last_updated_ticks as i64);
                elapsed_seconds = elapsed_ticks as f64 / 10_000_000.0;
            }

            // Playback rate is optional; default to 1.0 if not provided.
            let playback_rate = playback_info.PlaybackRate().ok().and_then(|r| r.Value().ok()).unwrap_or(1.0);

            (pos_ticks as f64 / 10_000_000.0) + elapsed_seconds * playback_rate
        } else {
            pos_ticks as f64 / 10_000_000.0
        };

    

    Ok(MediaSession {
        id: source.clone(),

        source,

        track: Some(MediaTrack {
            id: format!(
                "{}:{}",
                title,
                artist
            ),

            title,

            artist,

            album: if album.is_empty() {
                None
            } else {
                Some(album)
            },

            artwork: None,
        }),

        is_playing,

        position: effective_position_seconds,

        duration: duration_seconds,
    })
}

#[tauri::command]
pub fn media_play() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        control_current_session(
            |session| session.TryPlayAsync(),
            "play",
        )
    }

    #[cfg(not(target_os = "windows"))]
    {
        Err(
            "System media control is currently supported only on Windows."
                .to_string(),
        )
    }
}

#[tauri::command]
pub fn media_pause() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        control_current_session(
            |session| session.TryPauseAsync(),
            "pause",
        )
    }

    #[cfg(not(target_os = "windows"))]
    {
        Err(
            "System media control is currently supported only on Windows."
                .to_string(),
        )
    }
}

#[tauri::command]
pub fn media_next() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        control_current_session(
            |session| session.TrySkipNextAsync(),
            "skip next",
        )
    }

    #[cfg(not(target_os = "windows"))]
    {
        Err(
            "System media control is currently supported only on Windows."
                .to_string(),
        )
    }
}

#[tauri::command]
pub fn media_previous() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        control_current_session(
            |session| session.TrySkipPreviousAsync(),
            "skip previous",
        )
    }

    #[cfg(not(target_os = "windows"))]
    {
        Err(
            "System media control is currently supported only on Windows."
                .to_string(),
        )
    }
}

#[tauri::command]
pub fn media_seek(
    position: f64,
) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        use windows::Media::Control::
            GlobalSystemMediaTransportControlsSessionManager;

        if !position.is_finite() || position < 0.0 {
            return Err(
                "Invalid media position."
                    .to_string(),
            );
        }

        let manager =
            GlobalSystemMediaTransportControlsSessionManager::RequestAsync()
                .map_err(|error| {
                    format!(
                        "Failed to request media session manager: {}",
                        error
                    )
                })?
                .join()
                .map_err(|error| {
                    format!(
                        "Failed to get media session manager: {}",
                        error
                    )
                })?;

        let session =
    manager
        .GetCurrentSession()
        .map_err(|error| {
            format!(
                "Failed to get current media session: {}",
                error
            )
        })?;

        let timeline =
            session
                .GetTimelineProperties()
                .map_err(|error| {
                    format!(
                        "Failed to get media timeline: {}",
                        error
                    )
                })?;

        let duration =
    timeline
        .EndTime()
        .map_err(|error| {
            format!(
                "Failed to get media duration: {}",
                error
            )
        })?
        .Duration as f64
        / 10_000_000.0;

        let target =
            position.min(duration);

        let ticks =
            (target * 10_000_000.0) as i64;

        session
            .TryChangePlaybackPositionAsync(
                ticks,
            )
            .map_err(|error| {
                format!(
                    "Failed to seek media: {}",
                    error
                )
            })?
            .join()
            .map_err(|error| {
                format!(
                    "Media seek failed: {}",
                    error
                )
            })?;

        Ok(())
    }

    #[cfg(not(target_os = "windows"))]
    {
        let _ = position;

        Err(
            "System media control is currently supported only on Windows."
                .to_string(),
        )
    }
}

#[cfg(target_os = "windows")]
fn control_current_session<F>(
    operation: F,
    name: &str,
) -> Result<(), String>
where
    F: FnOnce(
        &windows::Media::Control::GlobalSystemMediaTransportControlsSession,
    ) -> windows::core::Result<windows_future::IAsyncOperation<bool>>,
{
    use windows::Media::Control::
        GlobalSystemMediaTransportControlsSessionManager;

    let manager =
        GlobalSystemMediaTransportControlsSessionManager::RequestAsync()
            .map_err(|error| {
                format!(
                    "Failed to request media session manager: {}",
                    error
                )
            })?
            .join()
            .map_err(|error| {
                format!(
                    "Failed to get media session manager: {}",
                    error
                )
            })?;

    let session =
    manager
        .GetCurrentSession()
        .map_err(|error| {
            format!(
                "Failed to get current media session: {}",
                error
            )
        })?;

    let result =
        operation(&session)
            .map_err(|error| {
                format!(
                    "Failed to send {} command: {}",
                    name,
                    error
                )
            })?
            .join()
            .map_err(|error| {
                format!(
                    "Media {} command failed: {}",
                    name,
                    error
                )
            })?;

    if !result {
        return Err(format!(
            "Media application rejected the {} command.",
            name
        ));
    }

    Ok(())
}