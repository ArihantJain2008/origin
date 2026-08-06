import { invoke } from "@tauri-apps/api/core";

export interface AnalysisDto {
  todo_count: number;
  fixme_count: number;
  hack_count: number;
}

export async function analyzeProject(path: string) {
  return invoke<AnalysisDto>("analyze_project", {
    path,
  });
}