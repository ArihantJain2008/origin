import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ProjectFolder {
  id: string;
  name: string;
  parentId: string | null;
  path: string | null;
  createdAt: number;
}

interface ProjectFolderStore {
  folders: ProjectFolder[];

  addFolder: (
    name: string,
    parentId?: string | null,
    path?: string | null
  ) => ProjectFolder | null;

  removeFolder: (id: string) => void;

  deleteFolder: (id: string) => void;

  updateFolder: (
    id: string,
    name: string
  ) => void;
}

export const useProjectFolderStore =
  create<ProjectFolderStore>()(
    persist(
      (set, get) => ({
        folders: [],

        addFolder: (
          name,
          parentId = null,
          path = null
        ) => {
          const trimmedName = name.trim();

          if (!trimmedName) {
            return null;
          }

          /*
           * Prevent the same filesystem folder
           * from being added twice.
           */
          if (path) {
            const normalizedPath =
              path.replace(/\\/g, "/").toLowerCase();

            const alreadyExists =
              get().folders.some(
                (folder) =>
                  folder.path
                    ?.replace(/\\/g, "/")
                    .toLowerCase() === normalizedPath
              );

            if (alreadyExists) {
              console.warn(
                "[PROJECT FOLDER] Folder already exists:",
                path
              );

              return null;
            }
          }

          const folder: ProjectFolder = {
            id: crypto.randomUUID(),
            name: trimmedName,
            parentId,
            path,
            createdAt: Date.now(),
          };

          set((state) => ({
            folders: [
              ...state.folders,
              folder,
            ],
          }));

          return folder;
        },

        /*
         * Remove from Origin only.
         *
         * The actual folder on disk remains untouched.
         */
        removeFolder: (id) => {
          set((state) => ({
            folders: state.folders.filter(
              (folder) =>
                folder.id !== id &&
                folder.parentId !== id
            ),
          }));
        },

        /*
         * Delete from Origin's store.
         *
         * Actual filesystem deletion will be
         * handled separately through Tauri.
         */
        deleteFolder: (id) => {
          set((state) => ({
            folders: state.folders.filter(
              (folder) =>
                folder.id !== id &&
                folder.parentId !== id
            ),
          }));
        },

        updateFolder: (
          id,
          name
        ) => {
          const trimmedName =
            name.trim();

          if (!trimmedName) {
            return;
          }

          set((state) => ({
            folders:
              state.folders.map(
                (folder) =>
                  folder.id === id
                    ? {
                        ...folder,
                        name: trimmedName,
                      }
                    : folder
              ),
          }));
        },
      }),

      {
        name: "origin-project-folders",
      }
    )
  );