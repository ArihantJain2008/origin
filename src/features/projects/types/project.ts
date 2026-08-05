export interface Project {
  id: string;

  name: string;

  path: string;

  favorite: boolean;

  createdAt: string;

  updatedAt: string;

  lastOpened?: string;

  language?: string;

  framework?: string;
}