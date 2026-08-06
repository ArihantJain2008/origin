import { useCommandPalette } from "@/features/command-palette/hooks/useCommandPalette";
import { useCommandPaletteStore } from "@/features/command-palette/store/commandPaletteStore";
import CommandPalette from "@/features/command-palette/components/CommandPalette";

import Sidebar from "@/components/navigation/Sidebar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  useCommandPalette();

  const isOpen = useCommandPaletteStore(
    (state) => state.isOpen
  );


  return (
  <div className="flex h-screen w-screen bg-[var(--color-bg-canvas)] text-[var(--color-text-primary)]">
    <Sidebar />

    <main className="min-w-0 flex-1 overflow-auto">
      <Outlet />
    </main>

    <CommandPalette />
  </div>
);
}