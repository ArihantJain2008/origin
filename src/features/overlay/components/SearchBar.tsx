import React, { useState, useMemo, useRef, useEffect } from "react";
import { useProjectStore } from "@/features/projects/store/projectStore";
import { useOverlayStore } from "@/features/overlay/store/overlayStore";

export default function SearchBar() {
  const projects = useProjectStore((s) => s.projects);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const setActiveProject = useProjectStore((s) => s.setActiveProject);

  const accent = useOverlayStore((s) => s.accentColor);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(q) || p.path.toLowerCase().includes(q));
  }, [projects, query]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const current = projects.find((p) => p.id === activeProjectId) ?? null;

  const onKey = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "Escape") return setOpen(false);
    if (e.key === "ArrowDown") return setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    if (e.key === "ArrowUp") return setHighlight((h) => Math.max(h - 1, 0));
    if (e.key === "Enter") {
      const sel = filtered[highlight];
      if (sel) {
        setActiveProject(sel.id);
        setOpen(false);
      }
    }
  };

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-6 z-50 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-3 rounded-xl px-3 py-2" style={{ backdropFilter: "none" }}>
        <div className="flex items-center gap-3 rounded-2xl px-3 py-2" style={{ background: "rgba(8,8,10,0.5)", border: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="flex items-center justify-center shrink-0 h-8 w-8 rounded-full bg-white/[0.03]">
            <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-white/10 to-white/6 flex items-center justify-center text-xs text-white/90">O</div>
          </div>

          <div className="relative">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setOpen(true)}
              onKeyDown={onKey}
              placeholder="Search Origin..."
              className="w-80 rounded-md bg-transparent px-3 py-2 text-sm text-white/85 outline-none"
              style={{
                boxShadow: `0 0 0 0 transparent`,
              }}
              onFocusCapture={(e) => {
                (e.target as HTMLInputElement).style.boxShadow = `0 6px 28px var(--origin-accent-glow)`;
                (e.target as HTMLInputElement).style.borderColor = `var(--origin-accent)`;
              }}
              onBlurCapture={(e) => {
                (e.target as HTMLInputElement).style.boxShadow = "";
                (e.target as HTMLInputElement).style.borderColor = "";
              }}
            />

            {open && (
              <div className="mt-2 w-80 rounded-lg bg-black/80 p-2 shadow-lg">
                {filtered.length === 0 ? (
                  <div className="py-2 px-2 text-xs text-white/30">No projects</div>
                ) : (
                  filtered.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActiveProject(p.id);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={`w-full text-left px-2 py-2 text-sm ${idx === highlight ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"}`}
                    >
                      <div className="font-medium">{p.name}</div>
                      <div className="text-[11px] text-white/30 truncate">{p.path}</div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="ml-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ background: "var(--origin-accent)" }} />
            <div className="text-sm text-white/80">{current ? current.name : "No project selected"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
