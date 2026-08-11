import { useEffect, useState } from "react";

import {
  CircleDot,
  GitBranch,
  GitCommit,
  RefreshCw,
  Upload,
} from "lucide-react";

import { invoke } from "@tauri-apps/api/core";

import { useProjectStore } from "@/features/projects/store/projectStore";

import {
  getGitChanges,
  type GitChange,
} from "@/features/projects/services/gitApi";

export default function GitWidget() {
  const projects = useProjectStore(
    (state) => state.projects
  );

  const activeProjectId = useProjectStore(
    (state) => state.activeProjectId
  );

  const activeProject =
    projects.find(
      (project) =>
        project.id === activeProjectId
    ) ?? null;

    const [changesExpanded, setChangesExpanded] =
  useState(false);

  const [commitMessage, setCommitMessage] =
    useState("");

  const [branch, setBranch] =
    useState("");

  const [branches, setBranches] =
    useState<string[]>([]);

  const [gitStatus, setGitStatus] =
    useState("");

  const [gitChanges, setGitChanges] =
    useState<GitChange[]>([]);

  const [loadingGit, setLoadingGit] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState<
      "commit" | "push" | "branch" | null
    >(null);

  const [message, setMessage] =
    useState<{
      type: "success" | "error";
      text: string;
    } | null>(null);

  async function loadGitData() {
    if (!activeProject) {
      return;
    }

    setLoadingGit(true);
    setMessage(null);

    try {
      const [
        status,
        currentBranch,
        branchList,
        changes,
      ] = await Promise.all([
        invoke<string>(
          "git_status",
          {
            projectPath:
              activeProject.path,
          }
        ),

        invoke<string>(
          "git_branch",
          {
            projectPath:
              activeProject.path,
          }
        ),

        invoke<string>(
          "git_branches",
          {
            projectPath:
              activeProject.path,
          }
        ),

        getGitChanges(
          activeProject.path
        ),
      ]);

      setGitStatus(status);
      setBranch(currentBranch);
      setGitChanges(changes);

      setBranches(
        branchList
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
      );
    } catch (error) {
      console.error(
        "Failed to load Git data:",
        error
      );

      setGitStatus("");
      setBranch("");
      setBranches([]);
      setGitChanges([]);

      setMessage({
        type: "error",
        text: String(error),
      });
    } finally {
      setLoadingGit(false);
    }
  }

  useEffect(() => {
    setCommitMessage("");
    setMessage(null);
    setGitStatus("");
    setBranch("");
    setBranches([]);
    setGitChanges([]);

    if (activeProject) {
      loadGitData();
    }
  }, [activeProject?.id]);

  async function handleCommit() {
    if (!activeProject) {
      return;
    }

    if (!commitMessage.trim()) {
      setMessage({
        type: "error",
        text: "Enter a commit message.",
      });

      return;
    }

    setActionLoading("commit");
    setMessage(null);

    try {
      await invoke(
        "git_commit",
        {
          projectPath:
            activeProject.path,
          message:
            commitMessage.trim(),
        }
      );

      setCommitMessage("");

      setMessage({
        type: "success",
        text: "Commit created successfully.",
      });

      await loadGitData();
    } catch (error) {
      console.error(
        "Git commit failed:",
        error
      );

      setMessage({
        type: "error",
        text: String(error),
      });
    } finally {
      setActionLoading(null);
    }
  }

  async function handlePush() {
    if (!activeProject) {
      return;
    }

    setActionLoading("push");
    setMessage(null);

    try {
      await invoke(
        "git_push",
        {
          projectPath:
            activeProject.path,
        }
      );

      setMessage({
        type: "success",
        text: "Pushed successfully.",
      });

      await loadGitData();
    } catch (error) {
      console.error(
        "Git push failed:",
        error
      );

      setMessage({
        type: "error",
        text: String(error),
      });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleBranchChange(
    nextBranch: string
  ) {
    if (
      !activeProject ||
      !nextBranch ||
      nextBranch === branch
    ) {
      return;
    }

    setActionLoading("branch");
    setMessage(null);

    try {
      await invoke(
        "git_checkout",
        {
          projectPath:
            activeProject.path,
          branch: nextBranch,
        }
      );

      setBranch(nextBranch);

      setMessage({
        type: "success",
        text: `Switched to ${nextBranch}.`,
      });

      await loadGitData();
    } catch (error) {
      console.error(
        "Git branch switch failed:",
        error
      );

      setMessage({
        type: "error",
        text: String(error),
      });
    } finally {
      setActionLoading(null);
    }
  }

  if (!activeProject) {
    return (
      <div className="flex items-center gap-2">
        <GitBranch
          size={14}
          className="text-white/25"
        />

        <span className="text-xs text-white/40">
          No project selected
        </span>
      </div>
    );
  }

  const isDirty =
    gitStatus
      .split("\n")
      .some(
        (line) =>
          line.trim() &&
          !line.startsWith("##")
      );

  return (
    <div className="space-y-4">

      {/* Git header */}
      <div className="flex items-center gap-2">

        <GitBranch
          size={13}
          className="text-white/25"
        />

        <span className="text-xs text-white/45">
          {branch ||
            activeProject.gitBranch ||
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
              isDirty
                ? "text-amber-400/70"
                : "text-emerald-400/60"
            }
          `}
        >
          <CircleDot size={9} />

          {isDirty
            ? "Modified"
            : "Clean"}
        </span>

        <button
          type="button"
          onClick={loadGitData}
          disabled={loadingGit}
          className="
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
            disabled:opacity-30
          "
          title="Refresh Git status"
        >
          <RefreshCw
            size={11}
            className={
              loadingGit
                ? "animate-spin"
                : ""
            }
          />
        </button>
      </div>

      {/* Changes */}
<div className="
  border-t
  border-white/[0.05]
  pt-3
">
  <div className="
    mb-2
    flex
    items-center
    justify-between
  ">
    <p className="
      text-[10px]
      font-medium
      uppercase
      tracking-wider
      text-white/30
    ">
      Changes
    </p>

    {gitChanges.length > 0 && (
      <span className="
        rounded-full
        bg-white/[0.05]
        px-1.5
        py-0.5
        text-[9px]
        text-white/35
      ">
        {gitChanges.length}
      </span>
    )}
  </div>

  {loadingGit ? (
    <p className="text-[10px] text-white/20">
      Loading changes...
    </p>
  ) : gitChanges.length === 0 ? (
    <p className="text-[10px] text-white/20">
      Working tree clean
    </p>
  ) : (
    <div className="
      max-h-48
      space-y-1
      overflow-y-auto
      pr-1
    ">
      {(changesExpanded
        ? gitChanges
        : gitChanges.slice(0, 4)
      ).map((change) => {
        const status =
          change.status.trim();

        const fileName =
          change.path
            .split("/")
            .pop() ??
          change.path;

        const statusColor =
          status === "??"
            ? "text-emerald-400/60"
            : status.includes("A")
              ? "text-emerald-400/60"
              : status.includes("D")
                ? "text-red-400/60"
                : "text-amber-400/60";

        return (
          <div
            key={`${change.status}-${change.path}`}
            title={change.path}
            className="
              flex
              min-w-0
              items-center
              gap-2
              rounded-md
              px-1.5
              py-1
              transition
              hover:bg-white/[0.04]
            "
          >
            <span
              className={`
                w-4
                shrink-0
                font-mono
                text-[9px]
                ${statusColor}
              `}
            >
              {status}
            </span>

            <span className="
              truncate
              text-[10px]
              text-white/40
            ">
              {fileName}
            </span>
          </div>
        );
      })}

      {gitChanges.length > 4 && (
        <button
          type="button"
          onClick={() =>
            setChangesExpanded(
              (value) => !value
            )
          }
          className="
            px-1.5
            pt-1
            text-[9px]
            text-white/25
            transition
            hover:text-white/50
          "
        >
          {changesExpanded
            ? "Show less"
            : `+${gitChanges.length - 4} more`}
        </button>
      )}
    </div>
  )}
</div>

      {/* Git controls */}
      <div className="
        space-y-3
        border-t
        border-white/[0.05]
        pt-3
      ">

        <p className="
          text-[10px]
          font-medium
          uppercase
          tracking-wider
          text-white/30
        ">
          Git
        </p>

        {/* Commit message */}
        <textarea
          value={commitMessage}
          onChange={(event) =>
            setCommitMessage(
              event.target.value
            )
          }
          placeholder="Commit message..."
          rows={2}
          className="
            w-full
            resize-none
            rounded-lg
            border
            border-white/[0.06]
            bg-white/[0.03]
            px-3
            py-2
            text-[11px]
            text-white/70
            outline-none
            placeholder:text-white/20
            focus:border-white/[0.12]
          "
        />

        {/* Commit / Push */}
        <div className="flex gap-2">

          <button
            type="button"
            onClick={handleCommit}
            disabled={
              actionLoading !== null ||
              !commitMessage.trim()
            }
            className="
              flex
              flex-1
              items-center
              justify-center
              gap-1.5
              rounded-lg
              bg-white/[0.06]
              px-3
              py-2
              text-[10px]
              text-white/55
              transition
              hover:bg-white/[0.10]
              hover:text-white/80
              disabled:cursor-not-allowed
              disabled:opacity-30
            "
          >
            <GitCommit size={11} />

            {actionLoading === "commit"
              ? "Committing..."
              : "Commit"}
          </button>

          <button
            type="button"
            onClick={handlePush}
            disabled={
              actionLoading !== null
            }
            className="
              flex
              flex-1
              items-center
              justify-center
              gap-1.5
              rounded-lg
              bg-white/[0.06]
              px-3
              py-2
              text-[10px]
              text-white/55
              transition
              hover:bg-white/[0.10]
              hover:text-white/80
              disabled:cursor-not-allowed
              disabled:opacity-30
            "
          >
            <Upload size={11} />

            {actionLoading === "push"
              ? "Pushing..."
              : "Push"}
          </button>
        </div>

        {/* Branch */}
        <div>
          <p className="
            mb-1.5
            text-[10px]
            text-white/20
          ">
            Branch
          </p>

          <select
            value={branch}
            onChange={(event) =>
              handleBranchChange(
                event.target.value
              )
            }
            disabled={
              actionLoading !== null ||
              branches.length === 0
            }
            className="
              w-full
              rounded-lg
              border
              border-white/[0.06]
              bg-white/[0.03]
              px-3
              py-2
              text-[10px]
              text-white/55
              outline-none
              disabled:opacity-30
            "
          >
            {branches.length === 0 ? (
              <option value="">
                No branches
              </option>
            ) : (
              branches.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Feedback */}
        {message && (
          <div
            className={`
              rounded-lg
              border
              px-3
              py-2
              text-[10px]
              ${
                message.type === "success"
                  ? "border-emerald-400/10 bg-emerald-400/[0.04] text-emerald-400/60"
                  : "border-red-400/10 bg-red-400/[0.04] text-red-400/60"
              }
            `}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}