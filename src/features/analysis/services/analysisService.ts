import { invoke } from "@tauri-apps/api/core";
import { AnalysisDto } from "../types/analysis";

export async function analyzeProject(
  path: string
): Promise<AnalysisDto> {
  return invoke<AnalysisDto>("analyze_project", {
    path,
  });
}