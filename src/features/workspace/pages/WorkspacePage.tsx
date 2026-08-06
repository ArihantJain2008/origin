import { Card } from "@/shared/components/ui";

export default function WorkspacePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8">
        <p className="text-[12px] font-medium uppercase tracking-[0.02em] text-[var(--color-text-tertiary)]">
          Workspace
        </p>

        <h1 className="mt-2 text-[28px] font-bold leading-none tracking-tight text-[var(--color-text-primary)]">
          Launch and manage workspaces.
        </h1>
      </div>

      <Card className="max-w-2xl">
        <p className="text-[13px] text-[var(--color-text-secondary)]">
          This area is ready for future terminal, AI, and project-detail surfaces without changing the shell again.
        </p>
      </Card>
    </div>
  );
}
