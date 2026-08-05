import { v4 as uuid } from "uuid";
import { Project } from "../types/project";

export function createProject(path: string): Project {
  const now = new Date().toISOString();

  return {
    id: uuid(),
    name: path.split(/[/\\]/).pop() ?? "Project",
    path,
    favorite: false,
    createdAt: now,
    updatedAt: now,
  };
}