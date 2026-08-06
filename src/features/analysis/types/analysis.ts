export interface TodoItem {
  file: string;
  line: number;
  kind: string;
  text: string;
}

export interface AnalysisDto {
  todos: TodoItem[];
}