import { Code2 } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center gap-3 border-b border-zinc-800 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
        <Code2 size={20} />
      </div>

      <div>
        <h1 className="font-semibold tracking-tight">
          Origin
        </h1>

        <p className="text-xs text-zinc-500">
          Developer Workspace
        </p>
      </div>
    </div>
  );
}