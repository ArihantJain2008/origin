import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  OverlayWidgetId,
  OverlayWidgetState,
} from "../types/overlay";

interface OverlayStore {
  widgets: Record<
    OverlayWidgetId,
    OverlayWidgetState
  >;

  widgetAppearance: "glass" | "solid";

  accentColor:
    | "green"
    | "blue"
    | "cyan"
    | "purple"
    | "red";

  transparency: number;

  setWidgetAppearance: (
    value: "glass" | "solid"
  ) => void;

  setAccentColor: (
    c:
      | "green"
      | "blue"
      | "cyan"
      | "purple"
      | "red"
  ) => void;

  setTransparency: (
    value: number
  ) => void;

  updateWidgetPosition: (
    id: OverlayWidgetId,
    x: number,
    y: number
  ) => void;

  toggleWidget: (
    id: OverlayWidgetId
  ) => void;

  resetLayout: () => void;
}

const defaultWidgets: Record<
  OverlayWidgetId,
  OverlayWidgetState
> = {
  notes: {
    id: "notes",
    position: {
      x: 40,
      y: 160,
    },
    visible: true,
  },

  music: {
    id: "music",
    position: {
      x: 1120,
      y: 160,
    },
    visible: true,
  },

  todos: {
    id: "todos",
    position: {
      x: 1050,
      y: 420,
    },
    visible: true,
  },

  project: {
    id: "project",
    position: {
      x: 40,
      y: 420,
    },
    visible: true,
  },

  git: {
    id: "git",
    position: {
      x: 420,
      y: 420,
    },
    visible: true,
  },
};

export const useOverlayStore =
  create<OverlayStore>()(
    persist(
      (set) => ({
        widgets: defaultWidgets,

        widgetAppearance: "glass",

        accentColor: "blue",

        transparency: 28,

        updateWidgetPosition: (
          id,
          x,
          y
        ) => {
          set((state) => ({
            widgets: {
              ...state.widgets,

              [id]: {
                ...state.widgets[id],

                position: {
                  x,
                  y,
                },
              },
            },
          }));
        },

        toggleWidget: (id) => {
          set((state) => ({
            widgets: {
              ...state.widgets,

              [id]: {
                ...state.widgets[id],

                visible:
                  !state.widgets[id]
                    .visible,
              },
            },
          }));
        },

        resetLayout: () => {
          set({
            widgets: {
              ...defaultWidgets,
            },
          });
        },

        setWidgetAppearance: (
          value
        ) => {
          set({
            widgetAppearance: value,
          });
        },

        setAccentColor: (c) => {
          set({
            accentColor: c,
          });
        },

        setTransparency: (
          value
        ) => {
          set({
            transparency: Math.max(
              0,
              Math.min(100, value)
            ),
          });
        },
      }),

      {
        name: "origin-overlay-layout",

        /*
         * Merge persisted state with the
         * current defaults.
         *
         * This is important when a new
         * widget is added.
         */
        merge: (
          persistedState,
          currentState
        ) => {
          const persisted =
            persistedState as Partial<OverlayStore>;

          return {
            ...currentState,

            ...persisted,

            widgets: {
              ...defaultWidgets,

              ...(persisted.widgets ?? {}),
            },
          };
        },
      }
    )
  );