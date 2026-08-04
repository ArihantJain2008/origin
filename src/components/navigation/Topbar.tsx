import { Bell, Search, Settings } from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6">
      <div>
        <h2 className="text-lg font-semibold">Home</h2>
        <p className="text-sm text-zinc-500">
          Welcome back.
        </p>
      </div>

      <div className="flex items-center gap-3">

        <button className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white">
          <Search size={18} />
        </button>

        <button className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white">
          <Bell size={18} />
        </button>

        <button className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white">
          <Settings size={18} />
        </button>

      </div>
    </header>
  );
}