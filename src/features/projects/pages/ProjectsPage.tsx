import ProjectCard from "@/features/projects/components/ProjectCard";
import { useProjectStore } from "@/features/projects/store/projectStore";
import { pickProjectFolder } from "@/features/projects/services/dialog";
import { createProject } from "@/features/projects/services/projectFactory";
import { saveProject } from "@/features/projects/services/projectApi";
import { useEffect } from "react";

export default function ProjectsPage() {
  const projects = useProjectStore((state) => state.projects);
  const addProject = useProjectStore((state) => state.addProject);
  const loadProjects = useProjectStore((state) => state.loadProjects);

useEffect(() => {
  const initialize = async () => {
    try {
      await loadProjects();
    } catch (error) {
      console.error("Failed to load projects:", error);
    }
  };

  initialize();
}, [loadProjects]);

  const handleAddProject = async () => {
  const folder = await pickProjectFolder();

  if (!folder || typeof folder !== "string") return;

  const project = await createProject(folder);

  await saveProject(project);
  addProject(project);
};

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Projects</h1>

        <button
          className="rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-500"
          onClick={handleAddProject}
        >
          Add Project
        </button>
      </div>

      <div className="grid gap-4">
        {projects.length === 0 ? (
          <p className="text-zinc-500">No projects yet.</p>
        ) : (
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
            />
          ))
        )}
      </div>
    </div>
  );
}