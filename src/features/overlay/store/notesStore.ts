import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useProjectStore } from "@/features/projects/store/projectStore";

export interface Note {
  id: string;
  text: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

interface NotesStore {
  notesByProject: Record<string, Note[]>;

  addNote: (text: string) => void;

  updateNote: (id: string, text: string) => void;

  deleteNote: (id: string) => void;

  togglePin: (id: string) => void;

  // Project-scoped variants that accept an explicit project path
  addNoteForProject: (projectPath: string, text: string) => void;

  updateNoteForProject: (projectPath: string, id: string, text: string) => void;

  deleteNoteForProject: (projectPath: string, id: string) => void;

  togglePinForProject: (projectPath: string, id: string) => void;
}

function getActiveProjectPath() {
  const { projects, activeProjectId } = useProjectStore.getState();

  return (
    projects.find((p) => p.id === activeProjectId)?.path ?? null
  );
}

export const useNotesStore =
  create<NotesStore>()(
    persist(
      (set) => ({
        notesByProject: {},

        addNote: (text) => {
          const trimmed =
            text.trim();

          if (!trimmed) {
            return;
          }

          const projectPath = getActiveProjectPath();

          if (!projectPath) {
            console.warn("Cannot add note: no active project.");
            return;
          }

          const now =
            Date.now();

          const note: Note = {
            id: crypto.randomUUID(),
            text: trimmed,
            pinned: false,
            createdAt: now,
            updatedAt: now,
          };

          set((state) => ({
            notesByProject: {
              ...state.notesByProject,

              [projectPath]: [note, ...(state.notesByProject[projectPath] ?? [])],
            },
          }));
        },

        addNoteForProject: (projectPath, text) => {
          const trimmed = text.trim();

          if (!trimmed) {
            return;
          }

          const now = Date.now();

          const note: Note = {
            id: crypto.randomUUID(),
            text: trimmed,
            pinned: false,
            createdAt: now,
            updatedAt: now,
          };

          set((state) => ({
            notesByProject: {
              ...state.notesByProject,

              [projectPath]: [note, ...(state.notesByProject[projectPath] ?? [])],
            },
          }));
        },

        updateNote: (
          id,
          text
        ) => {
          const trimmed =
            text.trim();

          if (!trimmed) {
            return;
          }

          const projectPath = getActiveProjectPath();

          if (!projectPath) {
            return;
          }

          set((state) => ({
            notesByProject: {
              ...state.notesByProject,

              [projectPath]: (state.notesByProject[projectPath] ?? []).map((note) =>
                note.id === id ? { ...note, text: trimmed, updatedAt: Date.now() } : note
              ),
            },
          }));
        },

        updateNoteForProject: (projectPath, id, text) => {
          const trimmed = text.trim();

          if (!trimmed) {
            return;
          }

          set((state) => ({
            notesByProject: {
              ...state.notesByProject,

              [projectPath]: (state.notesByProject[projectPath] ?? []).map((note) =>
                note.id === id ? { ...note, text: trimmed, updatedAt: Date.now() } : note
              ),
            },
          }));
        },

        deleteNote: (id) => {
          const projectPath = getActiveProjectPath();

          if (!projectPath) {
            return;
          }

          set((state) => ({
            notesByProject: {
              ...state.notesByProject,

              [projectPath]: (state.notesByProject[projectPath] ?? []).filter((note) => note.id !== id),
            },
          }));
        },

        deleteNoteForProject: (projectPath, id) => {
          set((state) => ({
            notesByProject: {
              ...state.notesByProject,

              [projectPath]: (state.notesByProject[projectPath] ?? []).filter((note) => note.id !== id),
            },
          }));
        },

        togglePin: (id) => {
          const projectPath = getActiveProjectPath();

          if (!projectPath) {
            return;
          }

          set((state) => ({
            notesByProject: {
              ...state.notesByProject,

              [projectPath]: (state.notesByProject[projectPath] ?? []).map((note) =>
                note.id === id ? { ...note, pinned: !note.pinned, updatedAt: Date.now() } : note
              ),
            },
          }));
        },

        togglePinForProject: (projectPath, id) => {
          set((state) => ({
            notesByProject: {
              ...state.notesByProject,

              [projectPath]: (state.notesByProject[projectPath] ?? []).map((note) =>
                note.id === id ? { ...note, pinned: !note.pinned, updatedAt: Date.now() } : note
              ),
            },
          }));
        },
      }),

      {
        name: "origin-notes",
      }
    )
  );