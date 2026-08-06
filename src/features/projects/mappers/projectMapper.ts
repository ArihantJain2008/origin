import { Project } from "../types/project";

export interface ProjectDto {
  id: string;
  name: string;
  path: string;

  framework: string;
  language: string;

  favorite: boolean;

  created_at: string;
  updated_at: string;

  last_opened?: string | null;
}

export function mapProjectDto(dto: ProjectDto): Project {
  return {
    id: dto.id,
    name: dto.name,
    path: dto.path,

    metadata: {
      framework: dto.framework,
      language: dto.language,
    },

    favorite: dto.favorite,

    createdAt: dto.created_at,
    updatedAt: dto.updated_at,

    lastOpened: dto.last_opened ?? undefined,
  };
}