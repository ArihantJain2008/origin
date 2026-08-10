import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useProjectStore } from "@/features/projects/store/projectStore";

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

interface TodosStore {
  todosByProject: Record<string, Todo[]>;

  addTodo: (text: string) => void;

  updateTodo: (id: string, text: string) => void;

  toggleTodo: (id: string) => void;

  deleteTodo: (id: string) => void;

  addTodoForProject: (projectPath: string, text: string) => void;

  updateTodoForProject: (projectPath: string, id: string, text: string) => void;

  toggleTodoForProject: (projectPath: string, id: string) => void;

  deleteTodoForProject: (projectPath: string, id: string) => void;
}

function getActiveProjectPath() {
  const { projects, activeProjectId } = useProjectStore.getState();

  return projects.find((p) => p.id === activeProjectId)?.path ?? null;
}

export const useTodosStore = create<TodosStore>()(
  persist(
    (set) => ({
      todosByProject: {},

      addTodo: (text) => {
        const trimmed = text.trim();

        if (!trimmed) return;

        const projectPath = getActiveProjectPath();

        if (!projectPath) {
          console.warn("Cannot add todo: no active project.");
          return;
        }

        const now = Date.now();

        const todo: Todo = {
          id: crypto.randomUUID(),
          text: trimmed,
          completed: false,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          todosByProject: {
            ...state.todosByProject,

            [projectPath]: [todo, ...(state.todosByProject[projectPath] ?? [])],
          },
        }));
      },

      addTodoForProject: (projectPath, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        const now = Date.now();

        const todo: Todo = {
          id: crypto.randomUUID(),
          text: trimmed,
          completed: false,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          todosByProject: {
            ...state.todosByProject,

            [projectPath]: [todo, ...(state.todosByProject[projectPath] ?? [])],
          },
        }));
      },

      updateTodo: (id, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        const projectPath = getActiveProjectPath();
        if (!projectPath) return;

        set((state) => ({
          todosByProject: {
            ...state.todosByProject,

            [projectPath]: (state.todosByProject[projectPath] ?? []).map((todo) =>
              todo.id === id ? { ...todo, text: trimmed, updatedAt: Date.now() } : todo
            ),
          },
        }));
      },

      updateTodoForProject: (projectPath, id, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        set((state) => ({
          todosByProject: {
            ...state.todosByProject,

            [projectPath]: (state.todosByProject[projectPath] ?? []).map((todo) =>
              todo.id === id ? { ...todo, text: trimmed, updatedAt: Date.now() } : todo
            ),
          },
        }));
      },

      toggleTodo: (id) => {
        const projectPath = getActiveProjectPath();
        if (!projectPath) return;

        set((state) => ({
          todosByProject: {
            ...state.todosByProject,

            [projectPath]: (state.todosByProject[projectPath] ?? []).map((todo) =>
              todo.id === id ? { ...todo, completed: !todo.completed, updatedAt: Date.now() } : todo
            ),
          },
        }));
      },

      toggleTodoForProject: (projectPath, id) => {
        set((state) => ({
          todosByProject: {
            ...state.todosByProject,

            [projectPath]: (state.todosByProject[projectPath] ?? []).map((todo) =>
              todo.id === id ? { ...todo, completed: !todo.completed, updatedAt: Date.now() } : todo
            ),
          },
        }));
      },

      deleteTodoForProject: (projectPath, id) => {
        set((state) => ({
          todosByProject: {
            ...state.todosByProject,

            [projectPath]: (state.todosByProject[projectPath] ?? []).filter((todo) => todo.id !== id),
          },
        }));
      },

      deleteTodo: (id) => {
        const projectPath = getActiveProjectPath();
        if (!projectPath) return;

        set((state) => ({
          todosByProject: {
            ...state.todosByProject,

            [projectPath]: (state.todosByProject[projectPath] ?? []).filter((todo) => todo.id !== id),
          },
        }));
      },
    }),
    {
      name: "origin-todos",
    }
  )
);
