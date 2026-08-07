export interface TodoItem {
  file: string;
  line: number;
  kind: string;
  text: string;
}

export interface ReadmeInfo {
    title: string | null;
    description: string | null;
}

export interface AnalysisDto {
  todos: TodoItem[];
  dependencies: string[];
  readme: ReadmeInfo;
  stats: StatsInfo;
  health: HealthInfo;
}

export interface StatsInfo {
  files: number;
  lines: number;
}

export interface HealthInfo {
  score: number;
  rating: string;
}