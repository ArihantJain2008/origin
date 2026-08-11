import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Files,
  Folder,
} from "lucide-react";

import { useProjectStore } from "@/features/projects/store/projectStore";
import { useAnalysisStore } from "@/features/analysis/store/analysisStore";

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
  const projects = useProjectStore(
    (state) => state.projects
  );

  const loadProjects = useProjectStore(
    (state) => state.loadProjects
  );

  const activeProjectId = useProjectStore(
    (state) => state.activeProjectId
  );

  const activeProject =
    projects.find(
      (project) =>
        project.id === activeProjectId
    ) ?? null;

  const analysis = useAnalysisStore(
    (state) =>
      activeProject
        ? state.analysis[activeProject.id]
        : undefined
  );

  const analyze = useAnalysisStore(
    (state) => state.analyze
  );

  const [expanded, setExpanded] =
    useState(false);

  useEffect(() => {
    if (projects.length === 0) {
      loadProjects().catch((error) => {
        console.error(
          "Failed to load projects for overlay:",
          error
        );
      });
    }
  }, [
    projects.length,
    loadProjects,
  ]);

  /*
   * Make sure the overlay has project
   * analysis available.
   */
  useEffect(() => {
    if (
      activeProject &&
      !analysis
    ) {
      analyze(
        activeProject.id,
        activeProject.path
      ).catch((error) => {
        console.error(
          "Failed to analyze project for overlay:",
          error
        );
      });
    }
  }, [
    activeProject?.id,
    activeProject?.path,
    analysis,
    analyze,
  ]);

  if (!activeProject) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Folder
            size={14}
            className="text-white/25"
          />

          <span className="text-xs text-white/40">
            No project selected
          </span>
        </div>

        <p className="text-[11px] leading-5 text-white/25">
          Pick a project to view details.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Project identity */}
      <div>
        <div className="flex min-w-0 items-center gap-2">

          <h2 className="
            min-w-0
            truncate
            text-sm
            font-medium
            text-white/80
          ">
            {activeProject.name}
          </h2>

          <div className="
            flex
            shrink-0
            items-center
            gap-2
            text-[10px]
            text-white/30
          ">
            {analysis && (
              <>
                <span className="flex items-center gap-1">
                  <Files size={11} />
                  {analysis.stats.files.toLocaleString()}
                </span>

                <span className="text-white/15">
                  ·
                </span>

                <span className="flex items-center gap-1">
                  <FileText size={11} />
                  {analysis.stats.lines.toLocaleString()} LOC
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setExpanded((value) => !value)
            }
            className="
              ml-auto
              flex
              h-6
              w-6
              shrink-0
              items-center
              justify-center
              rounded-md
              text-white/30
              transition
              hover:bg-white/[0.05]
              hover:text-white/70
            "
            aria-label={
              expanded
                ? "Collapse project"
                : "Expand project"
            }
          >
            {expanded ? (
              <ChevronDown size={13} />
            ) : (
              <ChevronRight size={13} />
            )}
          </button>
        </div>

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

      {/* Expanded project information */}
      {expanded && (
        <div className="space-y-4">

          {/* Statistics */}
          <div className="
            flex
            items-center
            gap-4
            border-t
            border-white/[0.05]
            pt-3
          ">
            <div className="
              flex
              items-center
              gap-1.5
              text-[10px]
              text-white/35
            ">
              <Files size={12} />

              <span>
                {analysis
                  ? `${analysis.stats.files.toLocaleString()} Files`
                  : "Analyzing..."}
              </span>
            </div>

            <div className="
              flex
              items-center
              gap-1.5
              text-[10px]
              text-white/35
            ">
              <FileText size={12} />

              <span>
                {analysis
                  ? `${analysis.stats.lines.toLocaleString()} LOC`
                  : "Analyzing..."}
              </span>
            </div>
          </div>

          {/* Run Commands */}
          <div className="
            border-t
            border-white/[0.05]
            pt-3
          ">
            <RunCommandsWidget
              projectId={activeProject.id}
              projectPath={activeProject.path}
            />
          </div>

          {/* Last opened */}
          <div className="
            border-t
            border-white/[0.05]
            pt-3
          ">
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
      )}
    </div>
  );
}