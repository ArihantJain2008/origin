import { ProjectMetadata } from "./projectMetadata";

export interface Project {
  id: string;
  name: string;
  path: string;

  metadata: ProjectMetadata;

  favorite: boolean;

  createdAt: string;
  updatedAt: string;

  lastOpened?: string;

  gitBranch?: string;
  gitDirty: boolean;
}

