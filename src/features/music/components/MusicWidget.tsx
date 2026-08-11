import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function MusicWidget() {
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  async function sendCommand(command: string) {
    setError(null);

    try {
      await invoke(command);

      // Update the button only after the command succeeds.
      if (command === "media_play_pause") {
        setIsPlaying((current) => !current);
      }
    } catch (err) {
      console.error(`[MUSIC] ${command} failed:`, err);
      setError(String(err));
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold tracking-wide text-white">
            MUSIC
          </div>

          <div className="text-xs text-white/45">
            System media controls
          </div>
        </div>

        <div
          className="
            h-2 w-2 rounded-full
            bg-[var(--origin-accent)]
            shadow-[0_0_10px_var(--origin-accent)]
          "
        />
      </div>

      <div className="flex items-center justify-center gap-3">
        {/* Previous */}
        <button
          type="button"
          onClick={() => void sendCommand("media_previous")}
          className="
            flex h-10 w-10 items-center justify-center
            rounded-full
            bg-white/[0.06]
            text-white/70
            transition
            hover:bg-white/[0.10]
            hover:text-white
            active:scale-95
          "
          aria-label="Previous track"
          title="Previous track"
        >
          <span className="text-lg">⏮</span>
        </button>

        {/* Play / Pause */}
        <button
          type="button"
          onClick={() => void sendCommand("media_play_pause")}
          className="
            flex h-12 w-12 items-center justify-center
            rounded-full
            bg-[var(--origin-accent)]
            text-black
            shadow-[0_0_20px_var(--origin-accent)]
            transition
            hover:brightness-110
            active:scale-95
          "
          aria-label={isPlaying ? "Pause" : "Play"}
          title={isPlaying ? "Pause" : "Play"}
        >
          <span className="text-xl">
            {isPlaying ? "Ⅱ" : "▶"}
          </span>
        </button>

        {/* Next */}
        <button
          type="button"
          onClick={() => void sendCommand("media_next")}
          className="
            flex h-10 w-10 items-center justify-center
            rounded-full
            bg-white/[0.06]
            text-white/70
            transition
            hover:bg-white/[0.10]
            hover:text-white
            active:scale-95
          "
          aria-label="Next track"
          title="Next track"
        >
          <span className="text-lg">⏭</span>
        </button>
      </div>

      {error && (
        <div className="text-center text-[11px] text-red-400/80">
          Media control unavailable
        </div>
      )}
    </div>
  );
}