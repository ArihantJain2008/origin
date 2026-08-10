import { useCallback, useEffect, useState } from "react";

import {
  GitBranch,
  RefreshCw,
  CircleDot,
  FilePlus2,
  FilePen,
} from "lucide-react";

import {
  getGitStatus,
  GitStatus,
} from "@/features/projects/services/gitApi";

import { useProjectStore } from "@/features/projects/store/projectStore";

export default function GitWidget() {
  const projects = useProjectStore(
    (state) => state.projects
  );

  const activeProjectId =
    useProjectStore(
      (state) => state.activeProjectId
    );

  const activeProject =
    projects.find(
      (project) =>
        project.id === activeProjectId
    ) ?? null;

  const [status, setStatus] =
    useState<GitStatus | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!activeProject) {
      setStatus(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result =
        await getGitStatus(
          activeProject.path
        );

      setStatus(result);
    } catch (error) {
      console.error(
        "Failed to load Git status:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : String(error)
      );
    } finally {
      setLoading(false);
    }
  }, [activeProject]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!activeProject) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <GitBranch
            size={14}
            className="text-white/30"
          />

          <span className="text-xs text-white/40">
            Git
          </span>
        </div>

        <p className="text-[11px] text-white/25">
          Select a project to view Git status.
        </p>
      </div>
    );
  }

  if (loading && !status) {
    return (
      <div className="flex items-center gap-2 text-xs text-white/30">
        <RefreshCw
          size={12}
          className="animate-spin"
        />

        Loading Git status...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <p className="text-[10px] text-red-400/70">
          {error}
        </p>

        <button
          type="button"
          onClick={refresh}
          className="
            rounded-lg
            border
            border-white/[0.06]
            px-2.5
            py-1.5
            text-[10px]
            text-white/40
            hover:text-white/70
          "
        >
          Retry
        </button>
      </div>
    );
  }

  if (!status?.is_repository) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <GitBranch
            size={14}
            className="text-white/25"
          />

          <span className="text-xs text-white/45">
            Not a Git repository
          </span>
        </div>

        <p className="text-[10px] text-white/20">
          {activeProject.name} is not currently
          tracked by Git.
        </p>
      </div>
    );
  }

  const modifiedCount =
    status.modified.length;

  const stagedCount =
    status.staged.length;

  const untrackedCount =
    status.untracked.length;

  const totalChanges =
    modifiedCount +
    stagedCount +
    untrackedCount;

  return (
    <div className="space-y-3">
      {/* Header */}

      <div className="flex items-center gap-2">
        <GitBranch
          size={14}
          className="text-white/35"
        />

        <span className="text-xs text-white/65">
          {status.branch ?? "Detached HEAD"}
        </span>

        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="
            ml-auto
            flex
            h-6
            w-6
            items-center
            justify-center
            rounded-md
            text-white/25
            transition
            hover:bg-white/[0.05]
            hover:text-white/60
          "
          title="Refresh Git status"
        >
          <RefreshCw
            size={11}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />
        </button>
      </div>

      {/* Summary */}

      <div className="flex items-center gap-2">
        <CircleDot
          size={10}
          className={
            totalChanges > 0
              ? "text-amber-400/70"
              : "text-emerald-400/60"
          }
        />

        <span className="text-[10px] text-white/35">
          {totalChanges === 0
            ? "Working tree clean"
            : `${totalChanges} change${
                totalChanges === 1
                  ? ""
                  : "s"
              }`}
        </span>
      </div>

      {/* Counts */}

      {totalChanges > 0 && (
        <div className="grid grid-cols-3 gap-1.5">
          <div
            className="
              rounded-lg
              border
              border-white/[0.05]
              bg-white/[0.02]
              px-2
              py-2
            "
          >
            <p className="text-[9px] text-white/20">
              Staged
            </p>

            <p className="mt-1 text-xs text-white/55">
              {stagedCount}
            </p>
          </div>

          <div
            className="
              rounded-lg
              border
              border-white/[0.05]
              bg-white/[0.02]
              px-2
              py-2
            "
          >
            <p className="text-[9px] text-white/20">
              Modified
            </p>

            <p className="mt-1 text-xs text-white/55">
              {modifiedCount}
            </p>
          </div>

          <div
            className="
              rounded-lg
              border
              border-white/[0.05]
              bg-white/[0.02]
              px-2
              py-2
            "
          >
            <p className="text-[9px] text-white/20">
              New
            </p>

            <p className="mt-1 text-xs text-white/55">
              {untrackedCount}
            </p>
          </div>
        </div>
      )}

      {/* Files */}

      {totalChanges > 0 && (
        <div className="space-y-1.5">
          {[
            ...status.staged.map(
              (file) => ({
                file,
                type: "staged" as const,
              })
            ),

            ...status.modified.map(
              (file) => ({
                file,
                type: "modified" as const,
              })
            ),

            ...status.untracked.map(
              (file) => ({
                file,
                type: "untracked" as const,
              })
            ),
          ]
            .slice(0, 8)
            .map(({ file, type }) => (
              <div
                key={`${type}-${file}`}
                className="
                  flex
                  items-center
                  gap-2
                  min-w-0
                "
              >
                {type === "untracked" ? (
                  <FilePlus2
                    size={11}
                    className="shrink-0 text-white/25"
                  />
                ) : (
                  <FilePen
                    size={11}
                    className="shrink-0 text-white/25"
                  />
                )}

                <span
                  title={file}
                  className="
                    truncate
                    font-mono
                    text-[9px]
                    text-white/35
                  "
                >
                  {file}
                </span>
              </div>
            ))}
        </div>
      )}

      {totalChanges > 8 && (
        <p className="text-[9px] text-white/20">
          + {totalChanges - 8} more changes
        </p>
      )}
    </div>
  );
}