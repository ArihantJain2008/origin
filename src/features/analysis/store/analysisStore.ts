import { create } from "zustand";

import { analyzeProject } from "../services/analysisService";
import { AnalysisDto } from "../types/analysis";

interface AnalysisStore {
  analysis: Record<string, AnalysisDto>;

  loading: Record<string, boolean>;

  clearAnalysis: () => void;

  removeAnalysis: (
    projectId: string
  ) => void;

  analyze: (
    projectId: string,
    path: string
  ) => Promise<void>;
}

export const useAnalysisStore = create<AnalysisStore>(
  (set, get) => ({
    analysis: {},

    loading: {},

    clearAnalysis: () =>
      set({
        analysis: {},
        loading: {},
      }),

  removeAnalysis: (projectId) =>
      set((state) => {
        const analysis = { ...state.analysis };
        const loading = { ...state.loading };

        delete analysis[projectId];
        delete loading[projectId];

        return {
          analysis,
          loading,
        };
      }),

    analyze: async (projectId, path) => {
      if (get().loading[projectId]) {
        return;
      }

      set((state) => ({
        loading: {
          ...state.loading,
          [projectId]: true,
        },
      }));

      try {
        const result = await analyzeProject(path);

        set((state) => ({
          analysis: {
            ...state.analysis,
            [projectId]: result,
          },
        }));
      } catch (error) {
        // DEBUG (Sprint 6 - Analysis Stabilization)
        // Keep the failure visible while debugging synchronization issues.
        // Uncomment only while debugging.
        /*
        console.error("Failed to analyze project:", projectId, error);
        */
      } finally {
        set((state) => ({
          loading: {
            ...state.loading,
            [projectId]: false,
          },
        }));
      }
    },
  })
);