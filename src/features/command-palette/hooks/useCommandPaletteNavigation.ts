import { useEffect } from "react";
import { Command } from "../types/command";

interface Props {
  isOpen: boolean;
  commands: Command[];
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  resetPalette: () => void;
}

export function useCommandPaletteNavigation({
  isOpen,
  commands,
  selectedIndex,
  setSelectedIndex,
  resetPalette,
}: Props) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();

          setSelectedIndex((current) => {
            if (commands.length === 0) return 0;

            return (current + 1) % commands.length;
          });

          break;

        case "ArrowUp":
          event.preventDefault();

          setSelectedIndex((current) => {
            if (commands.length === 0) return 0;

            return current === 0
              ? commands.length - 1
              : current - 1;
          });

          break;

        case "Enter":
          event.preventDefault();

          const command = commands[selectedIndex];

          if (!command) return;

          resetPalette();
          command.action();

          break;

        case "Escape":
          event.preventDefault();
          resetPalette();
          break;
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    isOpen,
    commands,
    selectedIndex,
    resetPalette,
    setSelectedIndex,
  ]);
}