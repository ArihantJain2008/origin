import { useEffect } from "react";
import { useCommandPaletteStore } from "../store/commandPaletteStore";

export function useCommandPalette() {
  const open = useCommandPaletteStore((state) => state.open);
  const close = useCommandPaletteStore((state) => state.close);
  const toggle = useCommandPaletteStore((state) => state.toggle);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggle();
      }

      if (event.key === "Escape") {
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggle, close]);

  return {
    open,
    close,
    toggle,
  };
}