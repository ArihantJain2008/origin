import { useMemo, useState } from "react";
import {
  GitBranch,
  Pin,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useProjectStore } from "@/features/projects/store/projectStore";
import { launchProject } from "@/features/workspace/services/launcher";
import { Button, Card, Input } from "@/shared/components/ui";
import SummaryCards from "@/features/dashboard/components/SummaryCards";
import InsightsPanel from "@/features/dashboard/components/InsightsPanel";
import { useAppStore } from "@/features/app/store/appStore";
import { refreshApplicationState } from "@/features/app/coordinator/appCoordinator";
import ContinueWorking from "@/features/dashboard/components/ContinueWorking";
import RecentActivity from "@/features/dashboard/components/RecentActivity";
import Statistics from "@/features/dashboard/components/Statistics";
import {
  formatRelativeDate,
  getProjectStatusLabel,
  sortProjectsByRecent,
} from "@/shared/utils/projectFormatting";

export default function HomePage() {
  const navigate = useNavigate();

  const projects = useProjectStore((state) => state.projects);

  const ready = useAppStore((state) => state.ready);
  const initializing = useAppStore(
    (state) => state.initializing
  );

  const [query, setQuery] = useState("");

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
        project.metadata.framework
          .toLowerCase()
          .includes(normalized) ||
        project.metadata.language
          .toLowerCase()
          .includes(normalized) ||
        project.gitBranch
          ?.toLowerCase()
          .includes(normalized)
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
    // mark active project for overlay/widgets
    useProjectStore.getState().setActiveProject(projectId);

    await launchProject(projectId, path);
    await refreshApplicationState();
  };

  if (initializing || !ready) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Card className="w-full max-w-md p-8 text-center">
          <h2 className="text-xl font-semibold">
            Preparing Workspace
          </h2>

          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Loading your projects and analyzing your workspace...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 space-y-6">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.02em] text-[var(--color-text-tertiary)]">
            Dashboard
          </p>

          <h1 className="mt-2 text-[28px] font-bold leading-none tracking-tight text-[var(--color-text-primary)]">
            Quiet, precise, and fast.
          </h1>

          <p className="mt-3 max-w-2xl text-[14px] text-[var(--color-text-secondary)]">
            Origin should get you back into motion without asking for
            attention it hasn&apos;t earned.
          </p>
        </div>

        <SummaryCards />
      </div>

      <InsightsPanel />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-6">
          <ContinueWorking
  project={continueProject}
  onContinue={openProject}
  onViewDetails={(projectId) =>
    navigate(`/projects/${projectId}`)
  }
/>

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
          <RecentActivity items={activityItems}/>

          <Statistics
  statistics={{
    trackedProjects: projects.length,
    pinnedProjects: pinnedProjects.length,
    dirtyBranches: projects.filter(
      (project) => project.gitDirty
    ).length,
  }}
/>
        </aside>
      </div>
    </div>
  );
}
