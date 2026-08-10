import React, { useEffect, useState } from "react";

import OverlayWidget from "./OverlayWidget";

import NotesWidget from "./widgets/NotesWidget";
import TodosWidget from "./widgets/TodosWidget";
import ProjectWidget from "./widgets/ProjectWidget";
import MusicWidget from "@/features/music/components/MusicWidget";

import SearchBar from "./SearchBar";
import SettingsPanel from "./SettingsPanel";

import { useProjectStore } from "@/features/projects/store/projectStore";
import { useOverlayStore } from "@/features/overlay/store/overlayStore";
import SystemStatusBar from "./SystemStatusBar";

interface WidgetShellProps {
  title: string;
  children: React.ReactNode;
}

function WidgetShell({
  title,
  children,
}: WidgetShellProps) {
  const appearance = useOverlayStore(
    (state) => state.widgetAppearance
  );

  const transparency = useOverlayStore(
    (state) => state.transparency
  );

  const glass = appearance === "glass";

  /*
   * Transparency
   * 0   = opaque
   * 100 = highly transparent
   */
  const rawAlpha = 1 - transparency / 100;

  const alpha = Math.max(
    0.12,
    Math.min(0.95, rawAlpha)
  );

  const background = glass
    ? `rgba(6, 6, 8, ${alpha * 0.6})`
    : `rgba(6, 6, 8, ${alpha})`;

  const borderColor =
    "var(--origin-accent-border, rgba(255,255,255,0.06))";

  return (
    <div
      style={{
        background,
        borderColor,
      }}
      className={`
        overflow-hidden
        rounded-2xl
        border
        shadow-2xl
        ${
          glass
            ? "backdrop-blur-xl"
            : ""
        }
      `}
    >
      {/* Widget header */}
      <div
        data-overlay-drag-handle
        className="
          flex
          items-center
          justify-between
          border-b
          border-white/[0.05]
          px-4
          py-3
        "
      >
        <span
          className={`
            text-xs
            font-medium
            ${
              glass
                ? "text-white/60"
                : "text-white"
            }
          `}
        >
          {title}
        </span>

        <span
          style={{
            color: glass
              ? "rgba(255,255,255,0.18)"
              : "rgba(255,255,255,0.4)",
          }}
          className="
            select-none
            text-sm
          "
        >
          ⋮⋮
        </span>
      </div>

      {/* Widget content */}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

export default function OverlayCanvas() {
  const [settingsOpen, setSettingsOpen] =
    useState(false);

  const accent = useOverlayStore(
    (state) => state.accentColor
  );

  const transparency = useOverlayStore(
    (state) => state.transparency
  );

  const appearance = useOverlayStore(
    (state) => state.widgetAppearance
  );

  /*
   * ==========================================
   * ACCENT THEME
   * ==========================================
   */

  useEffect(() => {
    const accentMap: Record<
      string,
      {
        accent: string;
        accentSoft: string;
        accentBorder: string;
        accentGlow: string;
      }
    > = {
      green: {
        accent: "#2ecc71",
        accentSoft:
          "rgba(46,204,113,0.10)",
        accentBorder:
          "rgba(46,204,113,0.14)",
        accentGlow:
          "rgba(46,204,113,0.12)",
      },

      blue: {
        accent: "#60a5fa",
        accentSoft:
          "rgba(96,165,250,0.10)",
        accentBorder:
          "rgba(96,165,250,0.14)",
        accentGlow:
          "rgba(96,165,250,0.12)",
      },

      cyan: {
        accent: "#22d3ee",
        accentSoft:
          "rgba(34,211,238,0.10)",
        accentBorder:
          "rgba(34,211,238,0.14)",
        accentGlow:
          "rgba(34,211,238,0.12)",
      },

      purple: {
        accent: "#a78bfa",
        accentSoft:
          "rgba(167,139,250,0.10)",
        accentBorder:
          "rgba(167,139,250,0.14)",
        accentGlow:
          "rgba(167,139,250,0.12)",
      },

      red: {
        accent: "#f87171",
        accentSoft:
          "rgba(248,113,113,0.10)",
        accentBorder:
          "rgba(248,113,113,0.14)",
        accentGlow:
          "rgba(248,113,113,0.12)",
      },
    };

    const tokens =
      accentMap[accent] ??
      accentMap.blue;

    const root =
      document.documentElement;

    root.style.setProperty(
      "--origin-accent",
      tokens.accent
    );

    root.style.setProperty(
      "--origin-accent-soft",
      tokens.accentSoft
    );

    root.style.setProperty(
      "--origin-accent-border",
      tokens.accentBorder
    );

    root.style.setProperty(
      "--origin-accent-glow",
      tokens.accentGlow
    );

    root.style.setProperty(
      "--origin-appearance",
      appearance
    );

    root.style.setProperty(
      "--origin-transparency",
      String(transparency)
    );
  }, [
    accent,
    transparency,
    appearance,
  ]);

  /*
   * ==========================================
   * ACTIVE PROJECT
   * ==========================================
   */

  const projects =
    useProjectStore(
      (state) => state.projects
    );

  const activeProjectId =
    useProjectStore(
      (state) => state.activeProjectId
    );

  const activeProject =
    projects.find(
      (project) =>
        project.id === activeProjectId
    ) ?? null;

  /*
   * ==========================================
   * RENDER
   * ==========================================
   *
   * IMPORTANT:
   * No outer wrapper here.
   *
   * OverlayWidget handles positioning,
   * while each WidgetShell handles its
   * own visual surface.
   */

  return (
    <>
      {/* ======================================
          SEARCH BAR
         ====================================== */}

      <div
        className="
          pointer-events-auto
          fixed
          left-1/2
          top-5
          z-50
          -translate-x-1/2
        "
      >
        <SearchBar />
      </div>

      {/* ======================================
          SETTINGS
         ====================================== */}

      <div
        className="
          pointer-events-auto
          fixed
          right-6
          top-6
          z-50
        "
      >
        <button
          type="button"
          onClick={() =>
            setSettingsOpen(
              (open) => !open
            )
          }
          aria-label="Open Origin settings"
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            border
            border-white/[0.08]
            bg-[#0b0b0d]/70
            text-white/40
            shadow-lg
            backdrop-blur-xl
            transition
            hover:border-[var(--origin-accent-border)]
            hover:text-[var(--origin-accent)]
          "
        >
          ⚙
        </button>

        {settingsOpen && (
          <SettingsPanel
            onClose={() =>
              setSettingsOpen(false)
            }
          />
        )}
      </div>

      {/* ======================================
          NOTES
         ====================================== */}

      <div className="pointer-events-auto">
        <OverlayWidget id="notes">
          <WidgetShell title="Notes">
            <NotesWidget
              projectPath={
                activeProject?.path ??
                null
              }
            />
          </WidgetShell>
        </OverlayWidget>
      </div>

      {/* ======================================
    MUSIC
   ====================================== */}

<div className="pointer-events-auto">
  <OverlayWidget id="music">
    <WidgetShell title="Music">
      <MusicWidget />
    </WidgetShell>
  </OverlayWidget>
</div>

      {/* ======================================
          TODOS
         ====================================== */}

      <div className="pointer-events-auto">
        <OverlayWidget id="todos">
          <WidgetShell title="Todos">
            <TodosWidget
              projectPath={
                activeProject?.path ??
                null
              }
            />
          </WidgetShell>
        </OverlayWidget>
      </div>

      {/* ======================================
          PROJECT + GIT + RUN COMMANDS
         ====================================== */}

      <div className="pointer-events-auto">
        <OverlayWidget id="project">
          <WidgetShell title="Project">
            <ProjectWidget />
          </WidgetShell>
        </OverlayWidget>
      </div>

      {/* ==========================================
    SYSTEM STATUS BAR
   ========================================== */}

<div
  className="
    pointer-events-none
    fixed
    bottom-6
    left-0
    right-0
    z-40
    flex
    justify-center
  "
>
  <SystemStatusBar />
</div>
    </>
  );
}