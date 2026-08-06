import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Clock3,
  FolderOpen,
  GitBranch,
  Pin,
  Search,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useProjectStore } from "@/features/projects/store/projectStore";
import { launchProject } from "@/features/workspace/services/launcher";
import { Badge, Button, Card, Input } from "@/shared/components/ui";
import {
  formatRelativeDate,
  getProjectStatusLabel,
  sortProjectsByRecent,
} from "@/shared/utils/projectFormatting";

export default function HomePage() {
  const navigate = useNavigate();
  const projects = useProjectStore((state) => state.projects);
  const loadProjects = useProjectStore((state) => state.loadProjects);
  const [query, setQuery] = useState("");

  useEffect(() => {
    loadProjects().catch((error) => {
      console.error("Failed to load projects:", error);
    });
  }, [loadProjects]);

  const sortedProjects = useMemo(
    () => sortProjectsByRecent(projects),
    [projects]
  );

  const continueProject = sortedProjects[0];
  const pinnedProjects = sortedProjects
    .filter((project) => project.favorite)
    .slice(0, 4);
  const recentProjects = sortedProjects
    .filter((project) => project.id !== continueProject?.id)
    .slice(0, 6);

  const filteredProjects = useMemo(() => {
    if (!query.trim()) {
      return sortedProjects.slice(0, 6);
    }

    const normalized = query.toLowerCase();

    return sortedProjects.filter((project) => {
      return (
        project.name.toLowerCase().includes(normalized) ||
        project.path.toLowerCase().includes(normalized) ||
        project.metadata.framework.toLowerCase().includes(normalized) ||
        project.metadata.language.toLowerCase().includes(normalized) ||
        project.gitBranch?.toLowerCase().includes(normalized)
      );
    });
  }, [query, sortedProjects]);

  const activityItems = sortedProjects
    .slice(0, 4)
    .map((project) => ({
      id: project.id,
      title: project.name,
      detail: project.gitBranch
        ? `${project.gitBranch} · ${getProjectStatusLabel(project)}`
        : "Tracked outside git",
      time: formatRelativeDate(
        project.lastOpened ?? project.updatedAt
      ),
    }));

  const openProject = async (
    projectId: string,
    path: string
  ) => {
    await launchProject(projectId, path);
    await loadProjects();
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-[12px] font-medium uppercase tracking-[0.02em] text-[var(--color-text-tertiary)]">
          Dashboard
        </p>

        <h1 className="max-w-3xl text-[28px] font-bold leading-none tracking-tight text-[var(--color-text-primary)]">
          Quiet, precise, and fast.
        </h1>

        <p className="max-w-2xl text-[14px] text-[var(--color-text-secondary)]">
          Origin should get you back into motion without asking for attention it hasn&apos;t earned.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-6">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-[var(--color-text-primary)]">
                Continue Working
              </h2>
            </div>

            {continueProject ? (
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
                      {continueProject.name}
                    </h3>

                    <p className="mt-3 text-[13px] text-[var(--color-text-secondary)]">
                      {continueProject.metadata.framework} · {continueProject.metadata.language}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <Badge tone={continueProject.gitDirty ? "warning" : "success"}>
                        {continueProject.gitDirty ? "Modified" : "Clean"}
                      </Badge>

                      <Badge>
                        {continueProject.gitBranch ?? "No git"}
                      </Badge>

                      <Badge>
                        {formatRelativeDate(continueProject.lastOpened)}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    onClick={() =>
                      openProject(
                        continueProject.id,
                        continueProject.path
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

          <section>
            <div className="mb-3">
              <h2 className="text-[18px] font-semibold text-[var(--color-text-primary)]">
                Quick Search
              </h2>
            </div>

            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter projects instantly..."
              leading={<Search size={14} />}
              trailing={
                <span className="rounded-[6px] bg-[var(--color-bg-elevated)] px-2 py-1 text-[12px] font-medium">
                  Ctrl+K
                </span>
              }
            />

            {query ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() =>
                        openProject(project.id, project.path)
                      }
                      className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-4 text-left transition duration-100 hover:border-[var(--color-border-default)]"
                    >
                      <p className="truncate text-[15px] font-medium">
                        {project.name}
                      </p>

                      <p className="mt-1 truncate text-[12px] text-[var(--color-text-tertiary)]">
                        {project.metadata.framework} · {project.metadata.language}
                      </p>
                    </button>
                  ))
                ) : (
                  <Card className="md:col-span-2 xl:col-span-3">
                    <p className="text-[13px] text-[var(--color-text-secondary)]">
                      No projects match &quot;{query}&quot;.
                    </p>
                  </Card>
                )}
              </div>
            ) : null}
          </section>

          {pinnedProjects.length > 0 ? (
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Pin
                  size={14}
                  className="text-[var(--color-text-tertiary)]"
                />

                <h2 className="text-[18px] font-semibold text-[var(--color-text-primary)]">
                  Pinned Projects
                </h2>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {pinnedProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() =>
                      openProject(project.id, project.path)
                    }
                    className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-4 text-left transition duration-100 hover:border-[var(--color-border-default)]"
                  >
                    <p className="truncate text-[15px] font-medium">
                      {project.name}
                    </p>

                    <p className="mt-2 truncate font-mono text-[12px] text-[var(--color-text-tertiary)]">
                      {project.gitBranch ?? "No git"}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-[var(--color-text-primary)]">
                Recent Projects
              </h2>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/projects")}
              >
                View all
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {recentProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() =>
                    openProject(project.id, project.path)
                  }
                  className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-4 text-left transition duration-100 hover:border-[var(--color-border-default)]"
                >
                  <p className="truncate text-[15px] font-medium">
                    {project.name}
                  </p>

                  <p className="mt-1 truncate text-[12px] text-[var(--color-text-tertiary)]">
                    {project.metadata.framework} · {project.metadata.language}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-[12px] text-[var(--color-text-secondary)]">
                    <GitBranch size={14} />
                    <span className="font-mono">
                      {project.gitBranch ?? "No git"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Clock3
                size={14}
                className="text-[var(--color-text-tertiary)]"
              />

              <h2 className="text-[18px] font-semibold text-[var(--color-text-primary)]">
                Recent Activity
              </h2>
            </div>

            <Card className="space-y-4">
              {activityItems.length > 0 ? (
                activityItems.map((item) => (
                  <div
                    key={item.id}
                    className="border-b border-[var(--color-border-subtle)] pb-4 last:border-b-0 last:pb-0"
                  >
                    <p className="text-[13px] font-medium text-[var(--color-text-primary)]">
                      {item.title}
                    </p>

                    <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">
                      {item.detail}
                    </p>

                    <p className="mt-1 text-[12px] text-[var(--color-text-tertiary)]">
                      {item.time}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[13px] text-[var(--color-text-secondary)]">
                  No recent activity yet.
                </p>
              )}
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-[18px] font-semibold text-[var(--color-text-primary)]">
              Statistics
            </h2>

            <Card className="space-y-3">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[var(--color-text-secondary)]">
                  Tracked projects
                </span>

                <span className="font-medium text-[var(--color-text-primary)]">
                  {projects.length}
                </span>
              </div>

              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[var(--color-text-secondary)]">
                  Pinned
                </span>

                <span className="font-medium text-[var(--color-text-primary)]">
                  {pinnedProjects.length}
                </span>
              </div>

              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[var(--color-text-secondary)]">
                  Dirty branches
                </span>

                <span className="font-medium text-[var(--color-text-primary)]">
                  {
                    projects.filter((project) => project.gitDirty)
                      .length
                  }
                </span>
              </div>
            </Card>
          </section>
        </aside>
      </div>
    </div>
  );
}
