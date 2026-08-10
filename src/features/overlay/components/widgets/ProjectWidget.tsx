import { useEffect } from "react";
import {
  CircleDot,
  Folder,
  GitBranch,
} from "lucide-react";

import { useProjectStore } from "@/features/projects/store/projectStore";
import RunCommandsWidget from "./RunCommandsWidget";

function formatLastOpened(timestamp?: string) {
  if (!timestamp) {
    return "Never opened";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  const difference =
    Date.now() - date.getTime();

  const minutes = Math.floor(
    difference / 60000
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString();
}

export default function ProjectWidget() {

  const projects = useProjectStore((state) => state.projects);

  const loadProjects = useProjectStore((state) => state.loadProjects);

  const activeProjectId = useProjectStore((state) => state.activeProjectId);

  useEffect(() => {
    if (projects.length === 0) {
      loadProjects().catch((error) => {
        console.error(
          "Failed to load projects for overlay:",
          error
        );
      });
    }
  }, [projects.length, loadProjects]);

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? null;

  if (!activeProject) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Folder
            size={15}
            className="text-white/30"
          />

          <span className="text-xs text-white/40">No project selected</span>
        </div>

        <p className="text-[11px] leading-5 text-white/25">Pick a project to view details.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Project identity */}
      <div>
        <p className="text-sm font-medium text-white/80">
          {activeProject.name}
        </p>

        <p
          title={activeProject.path}
          className="
            mt-1
            truncate
            text-[10px]
            text-white/25
          "
        >
          {activeProject.path}
        </p>
      </div>

      {/* Project metadata */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <Folder
            size={13}
            className="text-white/25"
          />

          <span className="text-xs text-white/40">
            {activeProject.metadata.framework}
          </span>

          <span className="text-white/15">
            ·
          </span>

          <span className="text-xs text-white/40">
            {activeProject.metadata.language}
          </span>
        </div>

        {/* Git */}
        <div className="flex items-center gap-2">
          <GitBranch
            size={13}
            className="text-white/25"
          />

          <span className="text-xs text-white/40">
            {activeProject.gitBranch ??
              "No branch"}
          </span>

          <span
            className={`
              ml-auto
              flex
              items-center
              gap-1.5
              text-[10px]
              ${
                activeProject.gitDirty
                  ? "text-amber-400/70"
                  : "text-emerald-400/60"
              }
            `}
          >
            <CircleDot size={9} />

            {activeProject.gitDirty
              ? "Modified"
              : "Clean"}
          </span>
        </div>

        <div
  className="
    border-t
    border-white/[0.05]
    pt-3
  "
>
  <p
    className="
      mb-2
      text-[10px]
      font-medium
      uppercase
      tracking-[0.12em]
      text-white/25
    "
  >
    Run
  </p>

  <RunCommandsWidget
    projectId={activeProject.id}
    projectPath={activeProject.path}
  />
</div>
      </div>

      {/* Last opened */}
      <div
        className="
          border-t
          border-white/[0.05]
          pt-3
        "
      >
        <p className="text-[10px] text-white/20">
          Last opened
        </p>

        <p className="mt-1 text-[11px] text-white/35">
          {formatLastOpened(
            activeProject.lastOpened
          )}
        </p>
      </div>
    </div>
  );
}