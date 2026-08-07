import { create } from "zustand";

import { analyzeProject } from "../services/analysisService";

import { AnalysisDto } from "../types/analysis";

interface AnalysisStore {
  analysis: Record<string, AnalysisDto>;

  loading: Record<string, boolean>;

  analyze: (
    projectId: string,
    path: string
  ) => Promise<void>;
}

export const useAnalysisStore =
  create<AnalysisStore>((set) => ({
    analysis: {},
    loading: {},
    analyze: async (projectId, path) => {
  set((state) => ({
    loading: {
      ...state.loading,
      [projectId]: true,
    },
  }));

  const result = await analyzeProject(path);

  set((state) => ({
  analysis: {
    ...state.analysis,
    [projectId]: result,
  },

  loading: {
    ...state.loading,
    [projectId]: false,
  },
}));
},
  }));