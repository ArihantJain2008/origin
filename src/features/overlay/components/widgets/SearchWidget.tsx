import { Search } from "lucide-react";

export default function SearchWidget() {
  return (
    <div className="flex h-full w-full items-center gap-3 rounded-2xl border border-white/10 bg-[#131316]/95 px-5 shadow-2xl backdrop-blur-xl">
      <Search
        size={18}
        className="shrink-0 text-[#6b6b72]"
      />

      <input
        autoFocus
        placeholder="Search Origin..."
        className="min-w-0 flex-1 bg-transparent text-[15px] text-[#edefef] outline-none placeholder:text-[#6b6b72]"
      />

      <kbd className="rounded-md border border-white/10 bg-[#0a0a0b] px-2 py-1 font-mono text-[11px] text-[#6b6b72]">
        ESC
      </kbd>
    </div>
  );
}