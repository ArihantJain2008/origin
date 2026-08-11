import {
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";

import { useOverlayStore } from "../store/overlayStore";
import type { OverlayWidgetId } from "../types/overlay";

interface OverlayWidgetProps {
  id: OverlayWidgetId;
  children: ReactNode;
  className?: string;
}

export default function OverlayWidget({
  id,
  children,
  className = "",
}: OverlayWidgetProps) {
  const widget = useOverlayStore(
    (state) => state.widgets[id]
  );

  const updateWidgetPosition = useOverlayStore(
    (state) => state.updateWidgetPosition
  );

  const [dragging, setDragging] = useState(false);

  const dragOffset = useRef({
    x: 0,
    y: 0,
  });

  if (!widget.visible) {
    return null;
  }

  const handlePointerDown = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    const target = event.target as HTMLElement;

    const dragHandle = target.closest(
      "[data-overlay-drag-handle]"
    );

    if (!dragHandle) {
      return;
    }

    event.preventDefault();

    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();

    dragOffset.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    element.setPointerCapture(event.pointerId);

    setDragging(true);
  };

  const handlePointerMove = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    if (!dragging) {
      return;
    }

    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();

    /*
     * Current widget dimensions.
     * We use the actual rendered size instead of
     * assuming a fixed widget width/height.
     */
    const widgetWidth = rect.width;
    const widgetHeight = rect.height;

    /*
     * Full overlay viewport.
     *
     * Because the Tauri overlay will now be fullscreen,
     * these correspond to the actual available screen area.
     */
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const rawX =
      event.clientX -
      dragOffset.current.x;

    const rawY =
      event.clientY -
      dragOffset.current.y;

    /*
     * Keep the ENTIRE widget inside the viewport.
     */
    const maxX = Math.max(
      0,
      viewportWidth - widgetWidth
    );

    const maxY = Math.max(
      0,
      viewportHeight - widgetHeight
    );

    const x = Math.min(
      Math.max(0, rawX),
      maxX
    );

    const y = Math.min(
      Math.max(0, rawY),
      maxY
    );

    updateWidgetPosition(
      id,
      x,
      y
    );
  };

  const handlePointerUp = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    if (!dragging) {
      return;
    }

    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    }

    setDragging(false);
  };

  return (
  <div
    data-overlay-widget
    onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: "fixed",
        left: widget.position.x,
        top: widget.position.y,
        zIndex: dragging ? 100 : 10,
        touchAction: "none",
      }}
      className={`
        select-none
        ${dragging ? "cursor-grabbing" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}