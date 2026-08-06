import Sidebar from "@/components/navigation/Sidebar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="flex h-screen w-screen bg-[var(--color-bg-canvas)] text-[var(--color-text-primary)]">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
