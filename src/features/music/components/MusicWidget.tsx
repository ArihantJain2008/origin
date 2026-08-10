import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";

import { invoke } from "@tauri-apps/api/core";

import { useMusicStore } from "../store/musicStore";

interface MediaTrack {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  artwork: string | null;
}

interface MediaSession {
  id: string;
  source: string;
  track: MediaTrack | null;
  is_playing: boolean;
  position: number;
  duration: number;
}

export default function MusicWidget() {
  const currentTrack = useMusicStore(
    (state) => state.currentTrack
  );

  const isPlaying = useMusicStore(
    (state) => state.isPlaying
  );

  const position = useMusicStore(
    (state) => state.position
  );

  const duration = useMusicStore(
    (state) => state.duration
  );

  const setCurrentTrack = useMusicStore(
    (state) => state.setCurrentTrack
  );

  const setPlayback = useMusicStore(
    (state) => state.setPlayback
  );

  const setPosition = useMusicStore(
    (state) => state.setPosition
  );

  const setDuration = useMusicStore(
    (state) => state.setDuration
  );

  // ============================================================
  // Local playback clock
  // ============================================================

  const [displayPosition, setDisplayPosition] =
    useState(position);

  // Last media state received from Windows.
  const lastWindowsPosition =
    useRef(position);

  const lastPlayingState =
    useRef(isPlaying);

  const lastTrackId =
    useRef<string | null>(
      currentTrack?.id ?? null
    );

    const initialSyncRef = useRef(true);

  // ============================================================
  // Synchronize with Windows
  // ============================================================

  useEffect(() => {
    let mounted = true;

    async function updateMedia() {
      try {
        const media =
          await invoke<MediaSession>(
            "media_get_current"
          );

        if (!mounted) {
          return;
        }

        // ------------------------------------------------------
        // Nothing playing
        // ------------------------------------------------------

        if (!media.track) {
          setCurrentTrack(null);
          setPlayback(false);
          setPosition(0);
          setDuration(0);
          setDisplayPosition(0);

          lastWindowsPosition.current = 0;
          lastTrackId.current = null;
          lastPlayingState.current = false;

          return;
        }

        const newTrackId =
  media.track.id;

const trackChanged =
  lastTrackId.current !==
  newTrackId;

const playbackChanged =
  lastPlayingState.current !==
  media.is_playing;

const shouldInitialSync =
  initialSyncRef.current;

        // ------------------------------------------------------
        // Track changed
        // ------------------------------------------------------

        // ======================================================
// Initial synchronization
// ======================================================
//
// When Origin launches while music is already playing,
// Windows is the authoritative source for:
// - current track
// - current position
// - duration
// - playback state
//
// Do this once regardless of what Zustand persisted.
// ======================================================

if (shouldInitialSync) {
  // Windows can expose the media session before its
  // timeline properties are ready.
  //
  // If duration is 0, do NOT consider startup
  // synchronization complete. The next poll will
  // try again.

  const timelineReady =
    media.duration > 0;

  setCurrentTrack({
    id: media.track.id,
    title: media.track.title,
    artist: media.track.artist,
    album:
      media.track.album ??
      undefined,
    artwork:
      media.track.artwork ??
      undefined,
  });

  setPlayback(
    media.is_playing
  );

  if (timelineReady) {
    setDuration(
      media.duration
    );

    setPosition(
      media.position
    );

    setDisplayPosition(
      media.position
    );

    lastWindowsPosition.current =
      media.position;

    lastTrackId.current =
      newTrackId;

    lastPlayingState.current =
      media.is_playing;

    initialSyncRef.current =
      false;
  }

  return;
}

        if (trackChanged) {
          setCurrentTrack({
            id: media.track.id,
            title: media.track.title,
            artist: media.track.artist,
            album:
              media.track.album ??
              undefined,
            artwork:
              media.track.artwork ??
              undefined,
          });

          // Duration should ONLY be
          // refreshed when the track changes.
          setDuration(
            media.duration
          );

          // Initial position of new track.
          setPosition(
            media.position
          );

          setDisplayPosition(
            media.position
          );

          lastWindowsPosition.current =
            media.position;

          lastTrackId.current =
            newTrackId;
        }

        // ------------------------------------------------------
        // Playback state changed
        // ------------------------------------------------------

        if (playbackChanged) {
          setPlayback(
            media.is_playing
          );

          // If Windows says playback has paused,
          // synchronize one final time.
          if (!media.is_playing) {
            setPosition(
              media.position
            );

            setDisplayPosition(
              media.position
            );

            lastWindowsPosition.current =
              media.position;
          }

          // If playback has started again,
          // synchronize the starting position.
          if (
            media.is_playing &&
            !lastPlayingState.current
          ) {
            setPosition(
              media.position
            );

            setDisplayPosition(
              media.position
            );

            lastWindowsPosition.current =
              media.position;
          }

          lastPlayingState.current =
            media.is_playing;
        }

        // ------------------------------------------------------
        // IMPORTANT:
        //
        // DO NOT update position here while playing.
        //
        // Our local clock is responsible for that.
        // ------------------------------------------------------

      } catch (error) {
        console.error(
          "Failed to read media session:",
          error
        );
      }
    }

    updateMedia();

    const interval =
      window.setInterval(
        updateMedia,
        1000
      );

    return () => {
      mounted = false;

      window.clearInterval(
        interval
      );
    };
  }, [
    setCurrentTrack,
    setPlayback,
    setPosition,
    setDuration,
  ]);

  // ============================================================
  // Local playback clock
  // ============================================================

  useEffect(() => {
    if (
      !isPlaying ||
      !currentTrack
    ) {
      return;
    }

    const interval =
      window.setInterval(() => {
        setDisplayPosition(
          (current) => {
            const next =
              current + 0.1;

            if (
              duration > 0 &&
              next >= duration
            ) {
              return duration;
            }

            return next;
          }
        );
      }, 100);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    isPlaying,
    currentTrack?.id,
    duration,
  ]);

  // ============================================================
  // Playback controls
  // ============================================================

  async function togglePlayback() {
    if (!currentTrack) {
      return;
    }

    try {
      if (isPlaying) {
        await invoke(
          "media_pause"
        );
      } else {
        await invoke(
          "media_play"
        );
      }
    } catch (error) {
      console.error(
        "Failed to toggle playback:",
        error
      );
    }
  }

  async function nextTrack() {
    try {
      await invoke(
        "media_next"
      );
    } catch (error) {
      console.error(
        "Failed to skip to next track:",
        error
      );
    }
  }

  async function previousTrack() {
    try {
      await invoke(
        "media_previous"
      );
    } catch (error) {
      console.error(
        "Failed to go to previous track:",
        error
      );
    }
  }

  // ============================================================
  // Seek
  // ============================================================

  async function seek(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const newPosition =
      Number(event.target.value);

    // Update immediately.
    setPosition(
      newPosition
    );

    setDisplayPosition(
      newPosition
    );

    lastWindowsPosition.current =
      newPosition;

    try {
      await invoke(
        "media_seek",
        {
          position:
            newPosition,
        }
      );
    } catch (error) {
      console.error(
        "Failed to seek media:",
        error
      );
    }
  }

  // ============================================================
  // Format time
  // ============================================================

  function formatTime(
    seconds: number
  ) {
    if (
      !Number.isFinite(
        seconds
      )
    ) {
      return "0:00";
    }

    const totalSeconds =
      Math.max(
        0,
        Math.floor(seconds)
      );

    const minutes =
      Math.floor(
        totalSeconds / 60
      );

    const remaining =
      totalSeconds % 60;

    return `${minutes}:${remaining
      .toString()
      .padStart(2, "0")}`;
  }

  // ============================================================
  // Slider
  // ============================================================

  const progress =
    duration > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (displayPosition /
              duration) *
              100
          )
        )
      : 0;

  const sliderBackground = `
    linear-gradient(
      to right,
      var(--origin-accent) 0%,
      var(--origin-accent) ${progress}%,
      rgba(255,255,255,0.10) ${progress}%,
      rgba(255,255,255,0.10) 100%
    )
  `;

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="space-y-4">

      {/* Track */}

      {currentTrack ? (
        <div className="min-w-0">

          <p className="
            truncate
            text-sm
            font-medium
            text-white/80
          ">
            {currentTrack.title}
          </p>

          <p className="
            mt-1
            truncate
            text-xs
            text-white/35
          ">
            {currentTrack.artist}
          </p>

          {currentTrack.album && (
            <p className="
              mt-0.5
              truncate
              text-[10px]
              text-white/20
            ">
              {currentTrack.album}
            </p>
          )}

        </div>
      ) : (
        <div className="py-3 text-center">

          <p className="
            text-sm
            text-white/35
          ">
            Nothing playing
          </p>

          <p className="
            mt-1
            text-[10px]
            text-white/20
          ">
            Play something on your computer.
          </p>

        </div>
      )}

      {/* Progress */}

      {currentTrack && (
        <div className="space-y-1.5">

          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(
              displayPosition,
              duration ||
                displayPosition
            )}
            onChange={seek}
            aria-label="Playback position"
            style={{
              background:
                sliderBackground,
            }}
            className="
              h-1.5
              w-full
              cursor-pointer
              appearance-none
              rounded-full
              accent-[var(--origin-accent)]
            "
          />

          <div className="
            flex
            justify-between
            text-[9px]
            text-white/30
          ">
            <span>
              {formatTime(
                displayPosition
              )}
            </span>

            <span>
              {formatTime(
                duration
              )}
            </span>
          </div>

        </div>
      )}

      {/* Controls */}

      <div className="
        flex
        items-center
        justify-center
        gap-5
      ">

        <button
          type="button"
          disabled={!currentTrack}
          onClick={
            previousTrack
          }
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            text-white/35
            transition
            hover:bg-white/[0.06]
            hover:text-white/80
            disabled:cursor-not-allowed
            disabled:opacity-30
          "
        >
          <SkipBack size={15} />
        </button>

        <button
          type="button"
          disabled={!currentTrack}
          onClick={
            togglePlayback
          }
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            bg-[var(--origin-accent)]
            text-black
            shadow-lg
            transition
            hover:scale-105
            hover:brightness-110
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          {isPlaying ? (
            <Pause
              size={17}
              strokeWidth={2.5}
            />
          ) : (
            <Play
              size={17}
              strokeWidth={2.5}
            />
          )}
        </button>

        <button
          type="button"
          disabled={!currentTrack}
          onClick={
            nextTrack
          }
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            text-white/35
            transition
            hover:bg-white/[0.06]
            hover:text-white/80
            disabled:cursor-not-allowed
            disabled:opacity-30
          "
        >
          <SkipForward size={15} />
        </button>

      </div>
    </div>
  );
}