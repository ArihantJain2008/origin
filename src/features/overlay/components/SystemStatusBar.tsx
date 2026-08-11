import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface SystemStats {
  cpuUsage: number;
  memoryUsed: number;
  memoryTotal: number;
  memoryUsage: number;
}

export default function SystemStatusBar() {
  const [stats, setStats] =
    useState<SystemStats | null>(null);

  const [detailed, setDetailed] =
    useState(false);

  /*
   * Session start.
   *
   * This is intentionally kept in sessionStorage rather than
   * localStorage. Closing/restarting Origin creates a new session,
   * while hiding/showing the window does not.
   */
  const [sessionStart] =
    useState(() => {
      const stored =
        sessionStorage.getItem(
          "origin-session-start"
        );

      if (stored) {
        return Number(stored);
      }

      const now = Date.now();

      sessionStorage.setItem(
        "origin-session-start",
        String(now)
      );

      return now;
    });

  const [sessionSeconds, setSessionSeconds] =
    useState(() =>
      Math.max(
        0,
        Math.floor(
          (Date.now() -
            sessionStart) /
            1000
        )
      )
    );

  /*
   * System metrics
   */

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      try {
        const result =
          await invoke<SystemStats>(
            "system_get_stats"
          );

        if (mounted) {
          setStats(result);
        }
      } catch (error) {
        console.error(
          "Failed to get system stats:",
          error
        );
      }
    }

    loadStats();

    const interval =
      window.setInterval(
        loadStats,
        1000
      );

    return () => {
      mounted = false;
      window.clearInterval(
        interval
      );
    };
  }, []);

  /*
   * Session timer
   */

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        setSessionSeconds(
          Math.max(
            0,
            Math.floor(
              (Date.now() -
                sessionStart) /
                1000
            )
          )
        );
      }, 1000);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [sessionStart]);

  /*
   * Format session time
   */

  const formattedSession =
    useMemo(() => {
      const hours =
        Math.floor(
          sessionSeconds / 3600
        );

      const minutes =
        Math.floor(
          (sessionSeconds % 3600) /
            60
        );

      const seconds =
        sessionSeconds % 60;

      return [
        hours
          .toString()
          .padStart(2, "0"),

        minutes
          .toString()
          .padStart(2, "0"),

        seconds
          .toString()
          .padStart(2, "0"),
      ].join(":");
    }, [sessionSeconds]);

  /*
   * Format RAM
   */

  const memoryText = useMemo(() => {
    if (!stats) {
      return "--";
    }

    const usedGB =
      stats.memoryUsed /
      1024 /
      1024 /
      1024;

    const totalGB =
      stats.memoryTotal /
      1024 /
      1024 /
      1024;

    return `${usedGB.toFixed(
      1
    )}/${totalGB.toFixed(0)} GB`;
  }, [stats]);

  /*
   * Values
   */

  const cpuText =
    stats
      ? `${Math.round(
          stats.cpuUsage
        )}%`
      : "--";

  const ramText =
    stats
      ? `${Math.round(
          stats.memoryUsage
        )}%`
      : "--";

  return (
    <button
      type="button"
      onClick={() =>
        setDetailed(
          (value) => !value
        )
      }
      title="Click to toggle system details • Ctrl + Shift + Space to toggle overlay"
      className="
        pointer-events-auto
        flex
        items-center
        gap-3
        rounded-full
        border
        border-white/[0.04]
        bg-black/60
        px-3
        py-2
        text-[11px]
        text-white/45
        backdrop-blur-xl
        transition
        duration-200
        hover:border-white/[0.08]
        hover:bg-black/70
        hover:text-white/70
      "
    >
      {/* Status */}

      <span
        className="
          h-1.5
          w-1.5
          shrink-0
          rounded-full
          bg-[var(--origin-accent)]
          shadow-[0_0_8px_var(--origin-accent-glow)]
        "
      />

      {detailed ? (
        <>
          <span>
            CPU{" "}
            <strong className="font-medium text-white/65">
              {cpuText}
            </strong>
          </span>

          <span className="text-white/15">
            ·
          </span>

          <span>
            RAM{" "}
            <strong className="font-medium text-white/65">
              {memoryText}
            </strong>
          </span>

          <span className="text-white/15">
            ·
          </span>

          <span className="text-white/15">
            ·
          </span>

          <span>
            SESSION{" "}
            <strong
              className="
                font-medium
                text-[var(--origin-accent)]
              "
            >
              {formattedSession}
            </strong>
          </span>
        </>
      ) : (
        <>
          <span>
            {cpuText} CPU
          </span>

          <span className="text-white/15">
            ·
          </span>

          <span>
            {ramText} RAM
          </span>

          <span className="text-white/15">
            ·
          </span>


          <span className="text-white/15">
            ·
          </span>

          <span
            className="
              text-[var(--origin-accent)]
            "
          >
            {formattedSession}
          </span>
        </>
      )}
    </button>
  );
}