import {
  BookOpen,
  Boxes,
  CheckCircle2,
  FileCode2,
  GitBranch,
  Languages,
  ListTodo,
  XCircle,
} from "lucide-react";

import { Card } from "@/shared/components/ui";

import { ProjectDetailsModel } from "../model/projectDetailsModel";

interface ProjectOverviewProps {
  model: ProjectDetailsModel;
}

export default function ProjectOverview({
  model,
}: ProjectOverviewProps) {
  const overviewItems = [
    {
      icon: <FileCode2 size={18} />,
      label: "Framework",
      value: model.framework,
    },
    {
      icon: <Languages size={18} />,
      label: "Language",
      value: model.language,
    },
    {
      icon: <GitBranch size={18} />,
      label: "Git Branch",
      value: model.gitBranch,
    },
    {
      icon: <Boxes size={18} />,
      label: "Dependencies",
      value: model.dependencyCount.toString(),
    },
    {
      icon: <ListTodo size={18} />,
      label: "TODOs",
      value: model.todoCount.toString(),
    },
    {
      icon: <BookOpen size={18} />,
      label: "README",
      value: model.readmeAvailable
        ? "Available"
        : "Missing",
      status: model.readmeAvailable,
    },
  ];

  return (
    <Card className="p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Project Overview
        </h2>

        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          General information about this project.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {overviewItems.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4 transition-colors hover:border-[var(--color-border-default)]"
          >
            <div className="mb-3 flex items-center gap-2 text-[var(--color-text-secondary)]">
              {item.icon}

              <span className="text-sm font-medium">
                {item.label}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                {item.value}
              </p>

              {item.label === "README" && (
                item.status ? (
                  <CheckCircle2
                    size={18}
                    className="text-green-500"
                  />
                ) : (
                  <XCircle
                    size={18}
                    className="text-red-500"
                  />
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}