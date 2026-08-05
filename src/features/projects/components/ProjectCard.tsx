import { FolderOpen } from "lucide-react";
import { Project } from "../types/project";

interface Props {
  project: Project;
}

export default function ProjectCard({ project }: Props) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-blue-500">
      <div className="flex items-center gap-3">
        <FolderOpen className="text-blue-400" />

        <div>
          <h3 className="font-semibold">{project.name}</h3>

          <p className="text-sm text-blue-400">
            {project.metadata.framework} • {project.metadata.language}
          </p>

          <p className="text-sm text-zinc-500">{project.path}</p>
        </div>
      </div>
    </div>
  );
}
