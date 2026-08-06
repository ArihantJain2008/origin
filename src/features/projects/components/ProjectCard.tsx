import {
  FolderOpen,
  Star,
  GitBranch,
  Circle,
} from "lucide-react";
import { confirm } from "@tauri-apps/plugin-dialog";

import { Project } from "../types/project";
import { launchProject } from "@/features/workspace/services/launcher";
import {
  removeProject,
  updateProjectFavorite,
} from "../services/projectApi";
import { useProjectStore } from "../store/projectStore";

interface Props {
  project: Project;
}

export default function ProjectCard({ project }: Props) {
  const loadProjects = useProjectStore(
    (state) => state.loadProjects
  );

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-blue-500">

      <div className="flex justify-between items-start">

        <div className="flex gap-4">

          <FolderOpen
            size={28}
            className="mt-1 text-blue-400"
          />

          <div>

            <div className="flex items-center gap-2">

              <button
                onClick={async () => {
                  await updateProjectFavorite(
                    project.id,
                    !project.favorite
                  );

                  await loadProjects();
                }}
                className="transition hover:scale-110"
              >
                <Star
                  size={18}
                  fill={
                    project.favorite
                      ? "currentColor"
                      : "none"
                  }
                  className={
                    project.favorite
                      ? "text-yellow-400"
                      : "text-zinc-500"
                  }
                />
              </button>

              <h3 className="font-semibold text-lg">
                {project.name}
              </h3>

            </div>

            <p className="text-sm text-blue-400">
              {project.metadata.framework} •{" "}
              {project.metadata.language}
            </p>

            {project.gitBranch ? (
  <div className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
    <GitBranch size={14} />

    <span>{project.gitBranch}</span>

    <Circle
      size={10}
      fill={project.gitDirty ? "#f59e0b" : "#22c55e"}
      className={
        project.gitDirty
          ? "text-amber-500"
          : "text-green-500"
      }
    />

    <span>
      {project.gitDirty
        ? "Modified"
        : "Clean"}
    </span>
  </div>
) : (
  <p className="mt-2 text-sm text-zinc-500">
    Not a Git repository
  </p>
)}

            <p className="mt-1 text-sm text-zinc-500 break-all">
              {project.path}
            </p>

          </div>

        </div>

      </div>

      <div className="mt-5 flex gap-3">

        <button
          onClick={async () => {
            await launchProject(
              project.id,
              project.path
            );

            await loadProjects();
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-500"
        >
          Open
        </button>

        <button
          onClick={async () => {
            const confirmed = await confirm(
              `Remove "${project.name}" from Origin?\n\nYour project files will NOT be deleted.`,
              {
                title: "Remove Project",
                kind: "warning",
                okLabel: "Remove",
                cancelLabel: "Cancel",
              }
            );

            if (!confirmed) return;

            try {
              await removeProject(project.id);
              await loadProjects();
            } catch (error) {
              console.error(error);
            }
          }}
          className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-500"
        >
          Remove
        </button>

      </div>

    </div>
  );
}