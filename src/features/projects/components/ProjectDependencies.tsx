import {
  Boxes,
  PackageOpen,
} from "lucide-react";

import { Card } from "@/shared/components/ui";

import { ProjectDetailsModel } from "../model/projectDetailsModel";

interface ProjectDependenciesProps {
  model: ProjectDetailsModel;
}

export default function ProjectDependencies({
  model,
}: ProjectDependenciesProps) {
  const dependencies =
    model.analysis?.dependencies ?? [];

  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <Boxes
          size={22}
          className="text-[var(--color-accent-primary)]"
        />

        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Dependencies
          </h2>

          <p className="text-sm text-[var(--color-text-secondary)]">
            Packages detected in this project.
          </p>
        </div>
      </div>

      {dependencies.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border-default)] py-10">
          <PackageOpen
            size={36}
            className="mb-3 text-[var(--color-text-tertiary)]"
          />

          <p className="font-medium text-[var(--color-text-primary)]">
            No dependencies found
          </p>

          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Origin couldn't detect any package dependencies.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-[var(--color-text-secondary)]">
              {dependencies.length} package
              {dependencies.length !== 1 && "s"} detected
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {dependencies.map((dependency) => (
              <div
                key={dependency}
                className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-border-default)]"
              >
                {dependency}
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}