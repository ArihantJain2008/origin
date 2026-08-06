import { create } from "zustand";

import { analyzeProject } from "../services/analysisService";

import { AnalysisDto } from "../types/analysis";

interface AnalysisStore {
  analysis: Record<string, AnalysisDto>;

  analyze: (
    projectId: string,
    path: string
  ) => Promise<void>;
}

export const useAnalysisStore =
  create<AnalysisStore>((set) => ({
    analysis: {},

    analyze: async (
      projectId,
      path
    ) => {
      const result =
        await analyzeProject(path);

      set((state) => ({
        analysis: {
          ...state.analysis,

          [projectId]: result,
        },
      }));
    },
  }));