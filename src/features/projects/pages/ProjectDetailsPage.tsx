import { Navigate, useParams } from "react-router-dom";

import { useProjectStore } from "../store/projectStore";

export default function ProjectDetailsPage() {
  const { id } = useParams();

  const projects = useProjectStore(
    (state) => state.projects
  );

  const project = projects.find(
    (project) => project.id === id
  );

  if (!projects.length) {
    return (
      <div className="p-8">
        Loading project...
      </div>
    );
  }

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">
        {project.name}
      </h1>

      <p>{project.path}</p>

      <p>
        {project.metadata.framework} •{" "}
        {project.metadata.language}
      </p>

      <p>{project.gitBranch ?? "No Git"}</p>
    </div>
  );
}