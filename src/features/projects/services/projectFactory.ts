import { readJsonFile } from "./fileService";
import { detectFramework } from "./frameworkDetector";
import { detectLanguage } from "./languageDetector";
import { PackageJson } from "../types/packageJson";
import { Project } from "../types/project";
import { v4 as uuid } from "uuid";

export async function createProject(path: string): Promise<Project> {
  const packageJson = await readJsonFile<PackageJson>(
    `${path}\\package.json`
  );

  const framework = packageJson
    ? detectFramework(packageJson)
    : "Unknown";

  const language = detectLanguage(framework);

  const now = new Date().toISOString();

  return {
    id: uuid(),
    name: path.split(/[/\\]/).pop() ?? "Project",
    path,

    metadata: {
      framework,
      language,
    },

    favorite: false,
    createdAt: now,
    updatedAt: now,
  };
}