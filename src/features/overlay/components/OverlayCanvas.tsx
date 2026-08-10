import React, { useState, useEffect } from "react";

import OverlayWidget from "./OverlayWidget";

import NotesWidget from "./widgets/NotesWidget";
import TodosWidget from "./widgets/TodosWidget";
import ProjectWidget from "./widgets/ProjectWidget";

import WidgetManager, {
  WidgetManagerTrigger,
} from "./WidgetManager";
import SearchBar from "./SearchBar";
import SettingsPanel from "./SettingsPanel";

import { useProjectStore } from "@/features/projects/store/projectStore";
import { useOverlayStore } from "@/features/overlay/store/overlayStore";
function WidgetShell({ title, children }: { title: string; children: React.ReactNode }) {
  const appearance = useOverlayStore((s) => s.widgetAppearance);
  const accent = useOverlayStore((s) => s.accentColor);
  const transparency = useOverlayStore((s) => s.transparency);

  const glass = appearance === "glass";

  // map transparency (0..100) to background alpha, but keep a sensible minimum
  const rawAlpha = 1 - transparency / 100;
  const alpha = Math.max(0.12, Math.min(0.95, rawAlpha));

  const bg = glass ? `rgba(6,6,8,${alpha * 0.6})` : `rgba(6,6,8,${alpha})`;

  const borderColor = `var(--origin-accent-border, rgba(255,255,255,0.06))`;

  return (
    <div
      style={{ background: bg, borderColor }}
      className={`
        overflow-hidden
        rounded-2xl
        border
        shadow-2xl
        ${glass ? "backdrop-blur-xl" : ""}
      `}
    >
      <div
        data-overlay-drag-handle
        className={`
          flex
          items-center
          justify-between
          border-b
          border-white/[0.05]
          px-4
          py-3
        `}
      >
        <span className={`text-xs font-medium ${glass ? "text-white/60" : "text-white"}`}>
          {title}
        </span>

        <span style={{ color: glass ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.4)" }}>
          ⋮⋮
        </span>
      </div>

      <div className="p-4">{children}</div>
    </div>
  );
}

export default function OverlayCanvas() {
  const [managerOpen, setManagerOpen] =
    useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const accent = useOverlayStore((s) => s.accentColor);
  const transparency = useOverlayStore((s) => s.transparency);
  const appearance = useOverlayStore((s) => s.widgetAppearance);

  // Apply CSS variables for the active accent and related tokens.
  useEffect(() => {
    const map: Record<string, { accent: string; accentSoft: string; accentBorder: string; accentGlow: string }> = {
      green: {
        accent: "#2ecc71",
        accentSoft: "rgba(46,204,113,0.10)",
        accentBorder: "rgba(46,204,113,0.14)",
        accentGlow: "rgba(46,204,113,0.12)",
      },
      blue: {
        accent: "#60a5fa",
        accentSoft: "rgba(96,165,250,0.10)",
        accentBorder: "rgba(96,165,250,0.14)",
        accentGlow: "rgba(96,165,250,0.12)",
      },
      cyan: {
        accent: "#22d3ee",
        accentSoft: "rgba(34,211,238,0.10)",
        accentBorder: "rgba(34,211,238,0.14)",
        accentGlow: "rgba(34,211,238,0.12)",
      },
      purple: {
        accent: "#a78bfa",
        accentSoft: "rgba(167,139,250,0.10)",
        accentBorder: "rgba(167,139,250,0.14)",
        accentGlow: "rgba(167,139,250,0.12)",
      },
      red: {
        accent: "#f87171",
        accentSoft: "rgba(248,113,113,0.10)",
        accentBorder: "rgba(248,113,113,0.14)",
        accentGlow: "rgba(248,113,113,0.12)",
      },
    };

    const tokens = map[accent] ?? map.blue;

    const root = document.documentElement;
    root.style.setProperty("--origin-accent", tokens.accent);
    root.style.setProperty("--origin-accent-soft", tokens.accentSoft);
    root.style.setProperty("--origin-accent-border", tokens.accentBorder);
    root.style.setProperty("--origin-accent-glow", tokens.accentGlow);

    // also expose appearance/transparency as CSS vars for components to consume
    root.style.setProperty("--origin-appearance", appearance);
    root.style.setProperty("--origin-transparency", String(transparency));
  }, [accent, transparency, appearance]);

  const projects =
    useProjectStore(
      (state) => state.projects
    );

  const activeProjectId = useProjectStore((state) => state.activeProjectId);

  const activeProject = projects.find((project) => project.id === activeProjectId) ?? null;

  const setActiveProject = useProjectStore((s) => s.setActiveProject);

  // Project selection is explicit and persisted; activeProjectId is managed by the project store.

  return (
    <div className="pointer-events-none relative h-full w-full">
      <SearchBar />

      {/* Gear / settings */}
      <div className="pointer-events-auto fixed right-6 top-6">
        <button
          onClick={() => setSettingsOpen((s) => !s)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0b0b0d]/70 text-white/40 shadow-lg backdrop-blur-xl hover:text-white/70"
        >
          ⚙
        </button>

        {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
      </div>

      {/* Notes */}
      <div className="pointer-events-auto">
        <OverlayWidget id="notes">
          <WidgetShell title="Notes">
            <NotesWidget projectPath={activeProject?.path ?? null} />
          </WidgetShell>
        </OverlayWidget>
      </div>

      {/* Music */}
      <div className="pointer-events-auto">
        <OverlayWidget id="music">
          <WidgetShell title="Music">
            <div className="text-sm text-white/80">Everything In Its Right Place</div>

            <div className="mt-1 text-xs text-white/35">Radiohead</div>
          </WidgetShell>
        </OverlayWidget>
      </div>

      {/* Todos */}
      <div className="pointer-events-auto">
        <OverlayWidget id="todos">
          <WidgetShell title="Todos">
            <TodosWidget projectPath={activeProject?.path ?? null} />
          </WidgetShell>
        </OverlayWidget>
      </div>

      {/* Project */}
      <div className="pointer-events-auto">
        <OverlayWidget id="project">
          <WidgetShell title="Project">
            <ProjectWidget />
          </WidgetShell>
        </OverlayWidget>
      </div>

      {/* Bottom bar */}
      <div className="pointer-events-none fixed left-0 right-0 bottom-6 flex justify-center z-40">
        <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-black/60 px-3 py-2 border border-white/[0.04] text-white/50 text-xs">
          <div className="h-2 w-2 rounded-full bg-white/70" />
          <div className="font-medium">ORIGIN</div>
          <div className="text-[12px] text-white/30">Ctrl + Shift + Space</div>
        </div>
      </div>
    </div>
  );
}