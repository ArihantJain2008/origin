import {
  Grid2X2,
  List,
  Plus,
  Search,
} from "lucide-react";
import { useEffect } from "react";
import { useAnalysisStore } from "@/features/analysis/store/analysisStore";
import ProjectCard from "@/features/projects/components/ProjectCard";
import { pickProjectFolder } from "@/features/projects/services/dialog";
import { createProject } from "@/features/projects/services/projectFactory";
import { saveProject } from "@/features/projects/services/projectApi";
import { useProjectStore } from "@/features/projects/store/projectStore";
import { Button, Input } from "@/shared/components/ui";
import { useUiPreferencesStore } from "@/shared/store/uiPreferencesStore";
import { sortProjectsByRecent } from "@/shared/utils/projectFormatting";

export default function ProjectsPage() {
  const projects = useProjectStore((state) => state.projects);
  const loadProjects = useProjectStore((state) => state.loadProjects);
  const searchQuery = useProjectStore((state) => state.searchQuery);
  const setSearchQuery = useProjectStore((state) => state.setSearchQuery);
  const projectView = useUiPreferencesStore((state) => state.projectView);
  const setProjectView = useUiPreferencesStore((state) => state.setProjectView);
  const analyze = useAnalysisStore((state) => state.analyze);
  const analysis = useAnalysisStore((state) => state.analysis);
  

  // Load projects
useEffect(() => {
  loadProjects().catch((error) => {
    console.error(error);
  });
}, [loadProjects]);

// Analyze projects once
useEffect(() => {
  if (projects.length === 0) {
    return;
  }

  projects.forEach((project) => {
    if (!analysis[project.id]) {
      void analyze(project.id, project.path);
    }
  });
}, [projects, analysis, analyze]);

  const filteredProjects = sortProjectsByRecent(projects).filter((project) => {
    const query = searchQuery.toLowerCase();

    return (
      project.name.toLowerCase().includes(query) ||
      project.path.toLowerCase().includes(query) ||
      project.metadata.framework.toLowerCase().includes(query) ||
      project.metadata.language.toLowerCase().includes(query) ||
      project.gitBranch?.toLowerCase().includes(query)
    );
  });

  const handleAddProject = async () => {
    const folder = await pickProjectFolder();

    if (!folder || typeof folder !== "string") {
      return;
    }

    const project = await createProject(folder);
    await saveProject(project);
    await loadProjects();
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.02em] text-[var(--color-text-tertiary)]">
            Projects
          </p>

          <h1 className="mt-2 text-[28px] font-bold leading-none tracking-tight text-[var(--color-text-primary)]">
            Manage the list and get back to work.
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-[8px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-1">
            <Button
              variant={projectView === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setProjectView("grid")}
              aria-label="Grid view"
            >
              <Grid2X2 size={14} />
            </Button>

            <Button
              variant={projectView === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setProjectView("list")}
              aria-label="List view"
            >
              <List size={14} />
            </Button>
          </div>

          <Button onClick={handleAddProject}>
            <Plus size={14} />
            <span>Add Project</span>
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full max-w-xl">
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search projects, branches, paths..."
            leading={<Search size={14} />}
            trailing={
              <span className="rounded-[6px] bg-[var(--color-bg-elevated)] px-2 py-1 text-[12px] font-medium">
                Ctrl+K
              </span>
            }
          />
        </div>

        <p className="text-[12px] text-[var(--color-text-tertiary)]">
          {filteredProjects.length} project{filteredProjects.length === 1 ? "" : "s"}
        </p>
      </div>

      <div
        className={
          projectView === "grid"
            ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            : "space-y-3"
        }
      >
        {filteredProjects.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-8 text-center text-[var(--color-text-secondary)]">
            No matching projects found.
          </div>
        ) : (
          filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              view={projectView}
            />
          ))
        )}
      </div>
    </div>
  );
}
