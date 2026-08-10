import React, { useState } from "react";
import WidgetManager from "./WidgetManager";
import { useOverlayStore } from "@/features/overlay/store/overlayStore";

  const accents = ["green", "blue", "cyan", "purple", "red"] as const;

  const colorMap: Record<string, string> = {
    green: "#2ecc71",
    blue: "#60a5fa",
    cyan: "#22d3ee",
    purple: "#a78bfa",
    red: "#f87171",
  };

export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  const widgetAppearance = useOverlayStore((s) => s.widgetAppearance);
  const setWidgetAppearance = useOverlayStore((s) => s.setWidgetAppearance);

  const accentColor = useOverlayStore((s) => s.accentColor);
  const setAccentColor = useOverlayStore((s) => s.setAccentColor);

  const transparency = useOverlayStore((s) => s.transparency);
  const setTransparency = useOverlayStore((s) => s.setTransparency);

  const [managerOpen, setManagerOpen] = useState(false);

  return (
    <div className="pointer-events-auto fixed right-6 top-6 z-60">
      <div className="w-80 overflow-hidden rounded-2xl border border-white/[0.06] bg-black/80 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
          <div className="text-xs font-medium text-white/80">Settings</div>
          <div className="ml-auto text-[11px] text-white/30">
            <button onClick={onClose} className="px-2 py-1 rounded hover:bg-white/[0.02]">Close</button>
          </div>
        </div>

        <div className="p-3 space-y-3">
          <div>
            <div className="text-[11px] text-white/30">Style</div>
            <div className="mt-2 flex gap-2">
              <button onClick={() => setWidgetAppearance("glass")} className={`px-3 py-1 rounded ${widgetAppearance === "glass" ? "bg-white/[0.06] text-white" : "text-white/40"}`}>Glass</button>
              <button onClick={() => setWidgetAppearance("solid")} className={`px-3 py-1 rounded ${widgetAppearance === "solid" ? "bg-white/[0.06] text-white" : "text-white/40"}`}>Solid</button>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-white/30">Accent</div>
            <div className="mt-2 flex gap-2">
              {accents.map((a) => (
                <button
                  key={a}
                  onClick={() => setAccentColor(a)}
                  className={`h-8 w-8 rounded ${accentColor === a ? "border-2" : "border"}`}
                  style={{
                    background: colorMap[a],
                    borderColor: accentColor === a ? "var(--origin-accent-border)" : "rgba(255,255,255,0.06)",
                    boxShadow: accentColor === a ? "0 8px 24px var(--origin-accent-glow)" : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-white/30">Transparency</div>
            <div className="mt-2 flex items-center gap-3">
              <input value={transparency} onChange={(e) => setTransparency(Number(e.target.value))} type="range" min={0} max={100} className="w-full" />
              <div className="text-[11px] text-white/40 w-10 text-right">{transparency}%</div>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-white/30">Widgets</div>
            <div className="mt-2">
              <button onClick={() => setManagerOpen((s) => !s)} className="px-3 py-2 rounded bg-white/[0.03] text-sm text-white/80">Manage widgets</button>
            </div>
          </div>
        </div>

        {managerOpen && (
          <div className="border-t border-white/[0.06]">
            <WidgetManager />
          </div>
        )}
      </div>
    </div>
  );
}
