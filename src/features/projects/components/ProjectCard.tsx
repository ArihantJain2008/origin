import { FolderOpen } from "lucide-react";
import { Project } from "../types/project";
import { launchProject } from "@/features/workspace/services/launcher";
import { useProjectStore } from "../store/projectStore";
import { removeProject } from "../services/projectApi";
import { confirm } from "@tauri-apps/plugin-dialog";
import ProjectMenu from "./ProjectMenu";

interface Props {
  project: Project;
}

export default function ProjectCard({ project }: Props) {
  const loadProjects = useProjectStore(
    (state) => state.loadProjects
  );


  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-blue-500">
      <div className="flex items-start justify-between">
        <FolderOpen className="text-blue-400" />

        <div>
          <h3 className="font-semibold">{project.name}</h3>

          <p className="text-sm text-blue-400">
            {project.metadata.framework} • {project.metadata.language}
          </p>

          <p className="text-sm text-zinc-500">{project.path}</p>

          <button
  onClick={async () => {
    await launchProject(project.id, project.path);
    await loadProjects();
  }}
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
    </div>
  );
}
