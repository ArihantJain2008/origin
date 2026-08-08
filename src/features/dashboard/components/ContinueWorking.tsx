import {
  ArrowRight,
  FolderOpen,
  Sparkles,
} from "lucide-react";

import { Badge, Button, Card } from "@/shared/components/ui";
import { formatRelativeDate } from "@/shared/utils/projectFormatting";

import { Project } from "@/features/projects/types/project";

interface ContinueWorkingProps {
  project?: Project;

  onContinue: (
    projectId: string,
    path: string
  ) => void | Promise<void>;
}

export default function ContinueWorking({
  project,
  onContinue,
}: ContinueWorkingProps) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[18px] font-semibold text-[var(--color-text-primary)]">
          Continue Working
        </h2>
      </div>

      {project ? (
        <Card className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="mb-4 flex items-center gap-2 text-[12px] text-[var(--color-text-tertiary)]">
                <Sparkles
                  size={14}
                  className="text-[var(--color-accent)]"
                />

                <span>Most recent project</span>
              </div>

              <h3 className="text-[28px] font-bold leading-none tracking-tight text-[var(--color-text-primary)]">
                {project.name}
              </h3>

              <p className="mt-3 text-[13px] text-[var(--color-text-secondary)]">
                {project.metadata.framework} ·{" "}
                {project.metadata.language}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Badge
                  tone={
                    project.gitDirty
                      ? "warning"
                      : "success"
                  }
                >
                  {project.gitDirty
                    ? "Modified"
                    : "Clean"}
                </Badge>

                <Badge>
                  {project.gitBranch ?? "No Git"}
                </Badge>

                <Badge>
                  {formatRelativeDate(
                    project.lastOpened
                  )}
                </Badge>
              </div>
            </div>

            <Button
              onClick={() =>
                onContinue(
                  project.id,
                  project.path
                )
              }
            >
              <span>Continue in VS Code</span>

              <ArrowRight size={14} />
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="flex flex-col items-center justify-center gap-3 border-dashed bg-[var(--color-bg-surface)] py-10 text-center">
          <FolderOpen
            size={24}
            className="text-[var(--color-text-tertiary)]"
          />

          <h3 className="text-[15px] font-medium">
            No projects yet
          </h3>

          <p className="text-[13px] text-[var(--color-text-secondary)]">
            Add your first project from the Projects page.
          </p>
        </Card>
      )}
    </section>
  );
}