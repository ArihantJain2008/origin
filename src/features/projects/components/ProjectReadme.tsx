import {
  BookOpen,
  FileText,
} from "lucide-react";

import {
  Badge,
  Button,
  Card,
} from "@/shared/components/ui";

import { ProjectDetailsModel } from "../model/projectDetailsModel";

interface ProjectReadmeProps {
  model: ProjectDetailsModel;
}

export default function ProjectReadme({
  model,
}: ProjectReadmeProps) {
  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <BookOpen
          size={22}
          className="text-[var(--color-accent)]"
        />

        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            README
          </h2>

          <p className="text-sm text-[var(--color-text-secondary)]">
            Project documentation status.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText size={18} />

            <div>
              <p className="font-medium">
                README.md
              </p>

              <p className="text-sm text-[var(--color-text-secondary)]">
                {model.readmeAvailable
                  ? "Documentation detected."
                  : "README not found."}
              </p>
            </div>
          </div>

          <Badge
            tone={
              model.readmeAvailable
                ? "success"
                : "warning"
            }
          >
            {model.readmeAvailable
              ? "Available"
              : "Missing"}
          </Badge>
        </div>

        <Button
          disabled
          className="mt-5 w-full"
        >
          View README
        </Button>

        <p className="mt-2 text-center text-xs text-[var(--color-text-tertiary)]">
          Markdown preview arrives in Story 034.
        </p>
      </div>
    </Card>
  );
}