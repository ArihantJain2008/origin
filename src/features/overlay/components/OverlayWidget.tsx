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

  const updateWidgetPosition =
    useOverlayStore(
      (state) => state.updateWidgetPosition
    );

  const [dragging, setDragging] =
    useState(false);

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

    const dragHandle =
      target.closest(
        "[data-overlay-drag-handle]"
      );

    if (!dragHandle) {
      return;
    }

    event.preventDefault();

    const element =
      event.currentTarget;

    const rect =
      element.getBoundingClientRect();

    dragOffset.current = {
      x:
        event.clientX -
        rect.left,

      y:
        event.clientY -
        rect.top,
    };

    element.setPointerCapture(
      event.pointerId
    );

    setDragging(true);
  };

  const handlePointerMove = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    if (!dragging) {
      return;
    }

    const x =
      event.clientX -
      dragOffset.current.x;

    const y =
      event.clientY -
      dragOffset.current.y;

    updateWidgetPosition(
      id,
      Math.max(0, x),
      Math.max(0, y)
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
        ${dragging
          ? "cursor-grabbing"
          : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}