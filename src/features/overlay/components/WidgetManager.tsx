import {
  Check,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

import { useOverlayStore } from "../store/overlayStore";
import type { OverlayWidgetId } from "../types/overlay";

const widgetLabels: Record<
  OverlayWidgetId,
  string
> = {
  notes: "Notes",
  todos: "Todos",
  project: "Project",
  music: "Music",
};

const widgetDescriptions: Record<
  OverlayWidgetId,
  string
> = {
  notes: "Quick notes and ideas",
  todos: "Tasks and reminders",
  project: "Current project status",
  music: "Music controls",
};

export default function WidgetManager() {
  const widgets = useOverlayStore(
    (state) => state.widgets
  );

  const toggleWidget =
    useOverlayStore(
      (state) => state.toggleWidget
    );

  const resetLayout =
    useOverlayStore(
      (state) => state.resetLayout
    );

  const widgetAppearance = useOverlayStore((s) => s.widgetAppearance);
  const setWidgetAppearance = useOverlayStore((s) => s.setWidgetAppearance);

  const widgetIds =
    Object.keys(
      widgetLabels
    ) as OverlayWidgetId[];

  return (
    <div
      className="
        w-[280px]
        overflow-hidden
        rounded-2xl
        border
        border-white/[0.08]
        bg-[#111216]/95
        shadow-[0_20px_60px_rgba(0,0,0,0.45)]
        backdrop-blur-xl
      "
    >
      {/* Header */}
      <div
        className="
          flex
          items-center
          gap-3
          border-b
          border-white/[0.06]
          px-4
          py-3
        "
      >
        <div
          className="
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-lg
            bg-white/[0.05]
          "
        >
          <SlidersHorizontal
            size={14}
            className="text-white/50"
          />
        </div>

        <div>
          <p className="text-xs font-medium text-white/75">
            Widgets
          </p>

          <p className="text-[10px] text-white/25">
            Customize your overlay
          </p>
        </div>
      </div>

      {/* Widget list */}
      <div className="p-2">
        {widgetIds.map((id) => {
          const widget =
            widgets[id];

          return (
            <button
              key={id}
              type="button"
              onClick={() =>
                toggleWidget(id)
              }
              className="
                group
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                px-3
                py-2.5
                text-left
                transition
                hover:bg-white/[0.04]
              "
            >
              <div
                className={`
                  flex
                  h-5
                  w-5
                  shrink-0
                  items-center
                  justify-center
                  rounded-md
                  border
                  transition
                  ${
                    widget.visible
                      ? "border-white/20 bg-white/[0.08]"
                      : "border-white/[0.08] bg-transparent"
                  }
                `}
              >
                {widget.visible && (
                  <Check
                    size={12}
                    className="text-white/60"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`
                    text-xs
                    ${
                      widget.visible
                        ? "text-white/70"
                        : "text-white/30"
                    }
                  `}
                >
                  {
                    widgetLabels[
                      id
                    ]
                  }
                </p>

                <p className="mt-0.5 text-[10px] text-white/20">
                  {
                    widgetDescriptions[
                      id
                    ]
                  }
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="
          border-t
          border-white/[0.06]
          p-2
        "
      >
        <button
          type="button"
          onClick={resetLayout}
          className="
            flex
            w-full
            items-center
            gap-2
            rounded-lg
            px-3
            py-2
            text-left
            text-[11px]
            text-white/30
            transition
            hover:bg-white/[0.04]
            hover:text-white/60
          "
        >
          <RotateCcw size={12} />

          <span>
            Reset layout
          </span>
        </button>

        <div className="mt-2 flex items-center gap-2">
          <p className="text-[11px] text-white/30 mr-2">Appearance</p>

          <button
            onClick={() => setWidgetAppearance("glass")}
            className={`px-2 py-1 rounded ${widgetAppearance === "glass" ? "bg-white/[0.08] text-white" : "text-white/40"}`}
          >
            Glass
          </button>

          <button
            onClick={() => setWidgetAppearance("solid")}
            className={`px-2 py-1 rounded ${widgetAppearance === "solid" ? "bg-white/[0.08] text-white" : "text-white/40"}`}
          >
            Solid
          </button>
        </div>
      </div>
    </div>
  );
}

export function WidgetManagerTrigger({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex
        h-8
        w-8
        items-center
        justify-center
        rounded-lg
        border
        border-white/[0.08]
        bg-[#111216]/80
        text-white/35
        shadow-lg
        backdrop-blur-xl
        transition
        hover:border-white/[0.14]
        hover:bg-[#17181d]
        hover:text-white/70
      "
      aria-label="Manage widgets"
    >
      ⋮
    </button>
  );
}