import { ReactNode } from "react";
import Sidebar from "@/components/navigation/Sidebar";
import Topbar from "@/components/navigation/Topbar";
import { Outlet } from "react-router-dom";

interface MainLayoutProps {
  children?: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-50">
      <Sidebar />

      <main className="flex flex-1 flex-col">
  <Topbar />

  <div className="flex flex-1 items-center justify-center">
    <div className="flex-1 overflow-auto">
    <Outlet />
</div>
  </div>
</main>
    </div>
  );
}