import ProjectCard from "@/features/projects/components/ProjectCard";
import { useProjectStore } from "@/features/projects/store/projectStore";
import { v4 as uuid } from "uuid";

export default function ProjectsPage() {
  const projects = useProjectStore((state) => state.projects);
  const addProject = useProjectStore((state) => state.addProject);

  const createSampleProject = () => ({
    id: uuid(),
    name: "Expense Tracker",
    path: "D:\\Projects\\ExpenseTracker",
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Projects</h1>

        <button
          className="rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-500"
          onClick={() => {
            if (projects.length > 0) return;
            addProject(createSampleProject());
          }}
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