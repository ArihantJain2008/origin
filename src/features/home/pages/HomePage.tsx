import { useEffect } from "react";
import { FolderOpen, ArrowRight } from "lucide-react";

import { useProjectStore } from "@/features/projects/store/projectStore";
import { launchProject } from "@/features/workspace/services/launcher";

export default function HomePage() {
  const projects = useProjectStore((state) => state.projects);
  const loadProjects = useProjectStore((state) => state.loadProjects);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const continueProject = projects[0];
  const recentProjects = projects.slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl p-8">

      {/* Header */}

      <div className="mb-10">
        <h1 className="text-4xl font-bold">
          Welcome back 👋
        </h1>

        <p className="mt-2 text-zinc-400">
          Continue where you left off.
        </p>
      </div>

      {/* Continue Working */}

      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">
          Continue Working
        </h2>

        {continueProject ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">

            <div className="flex items-start gap-4">

              <FolderOpen
                size={30}
                className="mt-1 text-blue-400"
              />

              <div className="min-w-0 flex-1">

                <h3 className="text-2xl font-semibold">
                  {continueProject.name}
                </h3>

                <p className="mt-1 text-blue-400">
                  {continueProject.metadata.framework} •{" "}
                  {continueProject.metadata.language}
                </p>

                <p className="mt-2 truncate text-sm text-zinc-500">
                  {continueProject.path}
                </p>

              </div>

            </div>

            <button
              onClick={async () => {
                await launchProject(
                  continueProject.id,
                  continueProject.path
                );

                await loadProjects();
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium transition hover:bg-blue-500"
            >
              Open Project
              <ArrowRight size={18} />
            </button>

          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900 p-8 text-center">

            <FolderOpen
              size={42}
              className="mx-auto mb-4 text-zinc-600"
            />

            <h3 className="text-lg font-semibold">
              No projects yet
            </h3>

            <p className="mt-2 text-zinc-500">
              Import your first project from the Projects page.
            </p>

          </div>
        )}
      </section>

      {/* Recent Projects */}

      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Recent Projects
        </h2>

        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">

          {recentProjects.length === 0 ? (
            <p className="p-6 text-zinc-500">
              No recent projects.
            </p>
          ) : (
            recentProjects.map((project) => (
              <button
                key={project.id}
                onClick={async () => {
                  await launchProject(
                    project.id,
                    project.path
                  );

                  await loadProjects();
                }}
                className="flex w-full items-center justify-between border-b border-zinc-800 p-5 text-left transition hover:bg-zinc-800 last:border-none"
              >
                <div className="min-w-0">

                  <h3 className="font-semibold">
                    {project.name}
                  </h3>

                  <p className="text-sm text-blue-400">
                    {project.metadata.framework} •{" "}
                    {project.metadata.language}
                  </p>

                  <p className="truncate text-xs text-zinc-500">
                    {project.path}
                  </p>

                </div>

                <ArrowRight
                  size={18}
                  className="text-zinc-500"
                />
              </button>
            ))
          )}

        </div>
      </section>

    </div>
  );
}