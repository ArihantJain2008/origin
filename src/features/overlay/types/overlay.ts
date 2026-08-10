export type OverlayWidgetId =
  | "notes"
  | "music"
  | "todos"
  | "project";

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface OverlayWidgetState {
  id: OverlayWidgetId;
  position: WidgetPosition;
  visible: boolean;
}

export interface OverlayLayout {
  widgets: Record<
    OverlayWidgetId,
    OverlayWidgetState
  >;
}