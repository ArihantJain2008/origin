import { confirm } from "@tauri-apps/plugin-dialog";
import {
  Circle,
  Ellipsis,
  FileText,
  Files,
  FolderOpen,
  GitBranch,
  Star,
  ListTodo,
  LoaderCircle
} from "lucide-react";

import { Project } from "../types/project";
import {
  launchProject,
  revealProject,
} from "@/features/workspace/services/launcher";
import {
  removeProject,
  updateProjectFavorite,
} from "../services/projectApi";
import { useProjectStore } from "../store/projectStore";
import { Badge, Button, Card } from "@/shared/components/ui";
import { cn } from "@/lib/utils";
import { useAnalysisStore } from "@/features/analysis/store/analysisStore";
import { useEffect, useRef, useState } from "react";

interface Props {
  project: Project;
  view?: "grid" | "list";
}



export default function ProjectCard({
  project,
  view = "grid",
}: Props) {
  const loadProjects = useProjectStore(
    (state) => state.loadProjects
  );

  const analysis = useAnalysisStore(
  (state) => state.analysis[project.id]
);

useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node)
    ) {
      setMenuOpen(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );
  };
}, []);

//  for checking if analysis is being fetched correctly

// console.log("Dependencies:", analysis?.dependencies);
// console.log(project.name);
// console.log(analysis?.todos);
// console.log("Readme:", analysis?.readme);
// console.log(analysis?.stats);
// console.log("Health:", analysis?.health);a

  const handleOpenProject = async () => {
    await launchProject(project.id, project.path);
    await loadProjects();
  };

  const [menuOpen, setMenuOpen] = useState(false);

const menuRef = useRef<HTMLDivElement>(null);

  const handleToggleFavorite = async () => {
    await updateProjectFavorite(
      project.id,
      !project.favorite
    );
    await loadProjects();
  };

  const loading = useAnalysisStore(
  (state) => state.loading[project.id]
);

const analyze = useAnalysisStore(
  (state) => state.analyze
);

const handleRefreshAnalysis = async (
  event: React.MouseEvent
) => {
  event.stopPropagation();

  await analyze(project.id, project.path);
};
  const handleRemoveProject = async () => {
    const confirmed = await confirm(
      `Remove "${project.name}" from Origin?\n\nThis won't delete any files. Origin will just stop tracking it.`,
      {
        title: "Remove this project?",
        kind: "warning",
        okLabel: "Remove",
        cancelLabel: "Cancel",
      }
    );

    if (!confirmed) {
      return;
    }

    await removeProject(project.id);
    await loadProjects();
  };

  const gitTone = !project.gitBranch
    ? "neutral"
    : project.gitDirty
      ? "warning"
      : "success";

  if (view === "list") {
    return (
      <Card className="p-0">
        <div className="flex min-h-16 items-center gap-4 px-4 py-3">
          <button
            onClick={handleOpenProject}
            className="min-w-0 flex-1 text-left"
          >
            <div className="flex items-center gap-3">
              <FolderOpen
                size={16}
                className="text-[var(--color-text-tertiary)]"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <span className="truncate text-[15px] font-medium text-[var(--color-text-primary)]">
                    {project.name}
                  </span>

                  <span className="truncate font-mono text-[12px] text-[var(--color-text-tertiary)]">
                    {project.gitBranch ?? "No git"}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-3 text-[12px] text-[var(--color-text-secondary)]">
                  <span className="truncate">
                    {project.path}
                  </span>

                  <span>
                    {project.metadata.framework} · {project.metadata.language}
                  </span>
                </div>
              </div>
            </div>
          </button>

          <Badge tone={gitTone}>
            {project.gitDirty
              ? "Modified"
              : project.gitBranch
                ? "Clean"
                : "No git"}
          </Badge>

          <Button
  variant="ghost"
  size="sm"
  onClick={handleToggleFavorite}
>
  <Star
    size={14}
    fill={project.favorite ? "currentColor" : "none"}
    className={
      project.favorite
        ? "text-[var(--color-accent)]"
        : "text-[var(--color-text-tertiary)]"
    }
  />
</Button>

          <div
  ref={menuRef}
  className="relative"
>
            <button
  onClick={(event) => {
    event.stopPropagation();
    setMenuOpen((open) => !open);
  }}
  className="flex h-7 w-7 items-center justify-center rounded-[8px] text-[var(--color-text-tertiary)] transition hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
>
  <Ellipsis size={15} />
</button>

{menuOpen && (
  <div className="absolute right-0 top-9 z-20 min-w-40 rounded-[8px] border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-1 shadow-[var(--shadow-float)]">
    <button
      className="block w-full rounded-[6px] px-3 py-2 text-left text-[13px] hover:bg-[var(--color-bg-hover)]"
      onClick={handleOpenProject}
    >
                Open project
              </button>

              <button
                className="block w-full rounded-[6px] px-3 py-2 text-left text-[13px] hover:bg-[var(--color-bg-hover)]"
                onClick={() => revealProject(project.path)}
              >
                Reveal in Explorer
              </button>

              <button
  className="flex w-full items-center gap-2 rounded-[6px] px-3 py-2 text-left text-[13px] hover:bg-[var(--color-bg-hover)]"
  onClick={handleRefreshAnalysis}
>
  Refresh Analysis
</button>

              <button
                className="block w-full rounded-[6px] px-3 py-2 text-left text-[13px] text-[var(--color-danger)] hover:bg-[var(--color-bg-hover)]"
                onClick={handleRemoveProject}
              >
                Remove project
              </button>
            </div>
)}
          </div>
        </div>
      </Card>
    );
  }

  return (
  <Card className="overflow-visible p-4 transition duration-100 hover:border-[var(--color-border-default)]">
  <div className="h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Circle
              size={8}
              fill="currentColor"
              className="text-[var(--color-accent)]"
            />

            <h3 className="truncate text-[15px] font-medium text-[var(--color-text-primary)]">
              {project.name}
            </h3>
          </div>

          <p className="mt-1 truncate text-[12px] text-[var(--color-text-tertiary)]">
            {project.metadata.framework} · {project.metadata.language}
          </p>

          {analysis?.readme.description && (
            <p className="mt-2 line-clamp-2 text-[13px] text-[var(--color-text-secondary)]">
              {analysis.readme.description}
            </p>
          )}

          {analysis && (
            <div className="mt-3">
              <Badge
                tone={
                  analysis.health.score >= 90
                    ? "success"
                    : analysis.health.score >= 75
                    ? "warning"
                    : analysis.health.score >= 50
                    ? "neutral"
                    : "danger"
                }
              >
                {analysis.health.rating} • {analysis.health.score}%
              </Badge>
            </div>
          )}

          {analysis && (
            <div className="mt-3 flex items-center gap-4 text-[12px] text-[var(--color-text-secondary)]">
              <div className="flex items-center gap-1.5">
                <Files size={14} />
                <span>{analysis.stats.files.toLocaleString()} Files</span>
              </div>

              <div className="flex items-center gap-1.5">
                <FileText size={14} />
                <span>{analysis.stats.lines.toLocaleString()} Lines</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(event) => {
              event.stopPropagation();
              void handleToggleFavorite();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-[8px] text-[var(--color-text-tertiary)] transition hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-accent)]"
            aria-label={
              project.favorite
                ? "Unfavorite project"
                : "Favorite project"
            }
          >
            <Star
              size={15}
              fill={project.favorite ? "currentColor" : "none"}
              className={
                project.favorite
                  ? "text-[var(--color-accent)]"
                  : ""
              }
            />
          </button>

          <div
  ref={menuRef}
  className="relative"
>
  <button
    onClick={(event) => {
      event.stopPropagation();
      setMenuOpen((open) => !open);
    }}
    className="flex h-7 w-7 items-center justify-center rounded-[8px] text-[var(--color-text-tertiary)] transition hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
    aria-label="Project menu"
  >
    <Ellipsis size={15} />
  </button>

  {menuOpen && (
    <div className="absolute right-0 top-9 z-20 min-w-44 rounded-[8px] border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-1 shadow-[var(--shadow-float)]">
      <button
        className="block w-full rounded-[6px] px-3 py-2 text-left text-[13px] hover:bg-[var(--color-bg-hover)]"
        onClick={() => {
          revealProject(project.path);
          setMenuOpen(false);
        }}
      >
        Reveal in Explorer
      </button>

      <button
        className="flex w-full items-center gap-2 rounded-[6px] px-3 py-2 text-left text-[13px] hover:bg-[var(--color-bg-hover)]"
        onClick={async (event) => {
          await handleRefreshAnalysis(event);
          setMenuOpen(false);
        }}
      >
        Refresh Analysis
      </button>

      <button
        className="block w-full rounded-[6px] px-3 py-2 text-left text-[13px] text-[var(--color-danger)] hover:bg-[var(--color-bg-hover)]"
        onClick={async () => {
          await handleRemoveProject();
          setMenuOpen(false);
        }}
      >
        Remove Project
      </button>
    </div>
  )}
</div>
        </div>
      </div>

      <div className="mt-4">
  <Button
    onClick={handleOpenProject}
    className="w-full"
  >
    Open Project
  </Button>
</div>

      <div className="mt-5 flex items-center gap-2">
        <GitBranch
          size={14}
          className="text-[var(--color-text-tertiary)]"
        />

        <span className="font-mono text-[12px] text-[var(--color-text-secondary)]">
          {project.gitBranch ?? "No git"}
        </span>

        <Badge tone={gitTone}>
          {project.gitDirty
            ? "Modified"
            : project.gitBranch
            ? "Clean"
            : "No git"}
        </Badge>
      </div>

      {loading ? (
  <div className="mt-3">
    <Badge tone="neutral">
      <LoaderCircle
        size={12}
        className="mr-1 animate-spin"
      />
      Analyzing
    </Badge>
  </div>
) : (
  analysis && (
    <div className="mt-3">
      {/* TODO Status */}
      <div className="flex flex-wrap gap-2">
        {analysis.todos.length === 0 ? (
          <Badge tone="success">
            No TODOs detected
          </Badge>
        ) : (
          <Badge tone="neutral">
            <ListTodo
              size={12}
              className="mr-1"
            />
            {analysis.todos.length} TODO
            {analysis.todos.length !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Dependencies */}
      <div className="mt-2 flex flex-wrap gap-2">
        {analysis.dependencies.length === 0 ? (
          <Badge tone="neutral">
            No dependencies detected
          </Badge>
        ) : (
          <>
            {analysis.dependencies
              .slice()
              .sort()
              .slice(0, 5)
              .map((dependency) => (
                <Badge
                  key={dependency}
                  tone="success"
                >
                  {dependency}
                </Badge>
              ))}

            {analysis.dependencies.length > 5 && (
              <Badge tone="neutral">
                +{analysis.dependencies.length - 5}
              </Badge>
            )}
          </>
        )}
      </div>
    </div>
  )
)}

<p
  className={cn(
    "mt-3 line-clamp-2 text-[12px] text-[var(--color-text-tertiary)]",
    view === "grid" ? "min-h-9" : ""
  )}
>
  {project.path}
</p>
    </div>
  </Card>
);
}
