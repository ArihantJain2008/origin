import ProjectCard from "@/features/projects/components/ProjectCard";
import { useProjectStore } from "@/features/projects/store/projectStore";
import { pickProjectFolder } from "@/features/projects/services/dialog";
import { createProject } from "@/features/projects/services/projectFactory";
import { saveProject } from "@/features/projects/services/projectApi";
import { useEffect } from "react";
import { Search } from "lucide-react";

export default function ProjectsPage() {
  const projects = useProjectStore((state) => state.projects);
  const loadProjects = useProjectStore((state) => state.loadProjects);

  const searchQuery = useProjectStore(
    (state) => state.searchQuery
  );

  const setSearchQuery = useProjectStore(
    (state) => state.setSearchQuery
  );

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

  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase();

    return (
      project.name.toLowerCase().includes(query) ||
      project.metadata.framework
        .toLowerCase()
        .includes(query) ||
      project.metadata.language
        .toLowerCase()
        .includes(query)
    );
  });

  const handleAddProject = async () => {
    const folder = await pickProjectFolder();

    if (!folder || typeof folder !== "string") return;

    const project = await createProject(folder);

    await saveProject(project);
    await loadProjects();
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Projects
        </h1>

        <button
          className="rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-500"
          onClick={handleAddProject}
        >
          Add Project
        </button>
      </div>

      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
        />

        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) =>
            setSearchQuery(e.target.value)
          }
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500"
        />
      </div>

      <div className="grid gap-4">
        {filteredProjects.length === 0 ? (
          <p className="text-zinc-500">
            No matching projects found.
          </p>
        ) : (
          filteredProjects.map((project) => (
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