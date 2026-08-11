import {
  Grid2X2,
  List,
  Plus,
  Search,
  Folder,
  FolderPlus,
  ChevronRight,
  ChevronLeft,
  Trash2,
  FileText,
} from "lucide-react";

import { useState } from "react";

import ProjectCard from "@/features/projects/components/ProjectCard";

import {
  readFolderContents,
  type FolderEntry,
} from "@/features/projects/services/folderApi";

import {
  pickProjectFolder,
} from "@/features/projects/services/dialog";

import {
  createProject,
} from "@/features/projects/services/projectFactory";

import {
  saveProject,
} from "@/features/projects/services/projectApi";

import {
  useProjectStore,
} from "@/features/projects/store/projectStore";

import {
  Button,
  Input,
} from "@/shared/components/ui";

import {
  useUiPreferencesStore,
} from "@/shared/store/uiPreferencesStore";

import {
  sortProjectsByRecent,
} from "@/shared/utils/projectFormatting";

import {
  refreshApplicationState,
} from "@/features/app/coordinator/appCoordinator";

import {
  useProjectFolderStore,
} from "@/features/projects/store/projectFolderStore";


function normalizePath(path: string) {
  return path
    .replace(/\\/g, "/")
    .replace(/\/+$/, "")
    .toLowerCase();
}


export default function ProjectsPage() {
  const projects = useProjectStore(
    (state) => state.projects
  );

  const searchQuery = useProjectStore(
    (state) => state.searchQuery
  );

  const setSearchQuery = useProjectStore(
    (state) => state.setSearchQuery
  );

  const projectView = useUiPreferencesStore(
    (state) => state.projectView
  );

  const setProjectView = useUiPreferencesStore(
    (state) => state.setProjectView
  );

  const folders = useProjectFolderStore(
    (state) => state.folders
  );

  const addFolder = useProjectFolderStore(
    (state) => state.addFolder
  );

  const removeFolder = useProjectFolderStore(
    (state) => state.removeFolder
  );

  /*
   * Folder navigation state
   */

  const [openFolderId, setOpenFolderId] =
    useState<string | null>(null);

  const [folderContents, setFolderContents] =
    useState<FolderEntry[]>([]);

  const [loadingFolderContents, setLoadingFolderContents] =
    useState(false);

  const [folderContentsError, setFolderContentsError] =
    useState<string | null>(null);

  /*
   * Keeps track of the current filesystem directory.
   *
   * Example:
   *
   * Assignments
   *   -> 1ST YEAR
   *   -> Java
   *   -> src
   */

  const [currentFolderPath, setCurrentFolderPath] =
    useState<string | null>(null);

  /*
   * Navigation history.
   *
   * Example:
   *
   * [
   *   "C:/Assignments",
   *   "C:/Assignments/1ST YEAR",
   *   "C:/Assignments/1ST YEAR/Java"
   * ]
   */

  const [folderStack, setFolderStack] =
    useState<string[]>([]);

  /*
   * Read any directory from the filesystem.
   */

  const openDirectory = async (path: string) => {
    if (currentFolderPath) {
      setFolderStack((current) => [
        ...current,
        currentFolderPath,
      ]);
    }

    setCurrentFolderPath(path);

    setLoadingFolderContents(true);
    setFolderContentsError(null);

    try {
      const contents =
        await readFolderContents(path);

      setFolderContents(contents);
    } catch (error) {
      console.error(
        "[FOLDER] Failed to open directory:",
        error
      );

      setFolderContents([]);

      setFolderContentsError(
        String(error)
      );
    } finally {
      setLoadingFolderContents(false);
    }
  };

  /*
   * Navigate back one directory.
   */

  const goBackDirectory = async () => {
    const previousPath =
      folderStack[
        folderStack.length - 1
      ];

    /*
     * No previous directory means
     * we're at the root imported folder.
     */

    if (!previousPath) {
      setCurrentFolderPath(null);
      setFolderStack([]);
      setFolderContents([]);
      setOpenFolderId(null);
      return;
    }

    /*
     * Remove the current directory
     * from the navigation history.
     */

    setFolderStack((current) =>
      current.slice(0, -1)
    );

    setCurrentFolderPath(previousPath);

    setLoadingFolderContents(true);
    setFolderContentsError(null);

    try {
      const contents =
        await readFolderContents(
          previousPath
        );

      setFolderContents(contents);
    } catch (error) {
      console.error(
        "[FOLDER] Failed to go back:",
        error
      );

      setFolderContents([]);

      setFolderContentsError(
        String(error)
      );
    } finally {
      setLoadingFolderContents(false);
    }
  };

  /*
   * Filter projects
   */

  const filteredProjects =
    sortProjectsByRecent(projects).filter(
      (project) => {
        const query =
          searchQuery.toLowerCase();

        return (
          project.name
            .toLowerCase()
            .includes(query) ||

          project.path
            .toLowerCase()
            .includes(query) ||

          project.metadata.framework
            .toLowerCase()
            .includes(query) ||

          project.metadata.language
            .toLowerCase()
            .includes(query) ||

          project.gitBranch
            ?.toLowerCase()
            .includes(query)
        );
      }
    );

  /*
   * Create an Origin folder
   */

  const handleAddFolder = () => {
    const name = window.prompt(
      "Enter folder name"
    );

    if (!name?.trim()) {
      return;
    }

    addFolder(
      name.trim(),
      null,
      null
    );
  };

  /*
   * Add an existing filesystem folder
   */

  const handleAddExistingFolder =
    async () => {
      const folder =
        await pickProjectFolder();

      if (
        !folder ||
        typeof folder !== "string"
      ) {
        return;
      }

      const normalizedPath =
        normalizePath(folder);

      /*
       * Don't allow the same folder
       * to be added as a project.
       */

      const projectExists =
        projects.some(
          (project) =>
            normalizePath(
              project.path
            ) === normalizedPath
        );

      /*
       * Don't allow the same folder
       * to be imported twice.
       */

      const folderExists =
        folders.some(
          (item) =>
            item.path &&
            normalizePath(
              item.path
            ) === normalizedPath
        );

      if (
        projectExists ||
        folderExists
      ) {
        window.alert(
          "This folder is already added to Origin."
        );

        return;
      }

      const folderName =
        folder
          .split(/[\\/]/)
          .filter(Boolean)
          .pop() ??
        "Imported Folder";

      addFolder(
        folderName,
        null,
        folder
      );
    };

  /*
   * Add a project
   */

  const handleAddProject =
    async () => {
      const folder =
        await pickProjectFolder();

      if (
        !folder ||
        typeof folder !== "string"
      ) {
        return;
      }

      const normalizedPath =
        normalizePath(folder);

      /*
       * Don't allow duplicate projects.
       */

      const projectExists =
        projects.some(
          (project) =>
            normalizePath(
              project.path
            ) === normalizedPath
        );

      /*
       * Don't allow a folder to also
       * be registered as a project.
       */

      const folderExists =
        folders.some(
          (item) =>
            item.path &&
            normalizePath(
              item.path
            ) === normalizedPath
        );

      if (
        projectExists ||
        folderExists
      ) {
        window.alert(
          "This folder is already added to Origin."
        );

        return;
      }

      const project =
        await createProject(
          folder
        );

      await saveProject(
        project
      );

      await refreshApplicationState();
    };

  /*
   * Currently opened Origin folder.
   */

  const openFolder =
    folders.find(
      (folder) =>
        folder.id === openFolderId
    ) ?? null;

  /*
   * Open an imported folder.
   */

  const handleOpenFolder = async (
    folder: {
      id: string;
      name: string;
      path?: string | null;
    }
  ) => {
    setOpenFolderId(folder.id);

    /*
     * Start navigation from the
     * imported folder root.
     */

    setFolderStack([]);

    setCurrentFolderPath(null);

    setFolderContents([]);

    setFolderContentsError(null);

    if (!folder.path) {
      return;
    }

    /*
     * Read the root directory directly.
     * We intentionally don't use openDirectory()
     * here because there is no parent directory yet.
     */

    setCurrentFolderPath(folder.path);

    setLoadingFolderContents(true);

    try {
      const contents =
        await readFolderContents(
          folder.path
        );

      setFolderContents(contents);
    } catch (error) {
      console.error(
        "[FOLDER] Failed to open folder:",
        error
      );

      setFolderContents([]);

      setFolderContentsError(
        String(error)
      );
    } finally {
      setLoadingFolderContents(false);
    }
  };

  /*
   * Open a subfolder.
   *
   * This is different from opening
   * the imported root folder because
   * we need to preserve navigation history.
   */

  const handleOpenSubfolder = async (
    path: string
  ) => {
    if (currentFolderPath) {
      setFolderStack((current) => [
        ...current,
        currentFolderPath,
      ]);
    }

    setCurrentFolderPath(path);

    setLoadingFolderContents(true);
    setFolderContentsError(null);

    try {
      const contents =
        await readFolderContents(path);

      setFolderContents(contents);
    } catch (error) {
      console.error(
        "[FOLDER] Failed to open subfolder:",
        error
      );

      setFolderContents([]);

      setFolderContentsError(
        String(error)
      );
    } finally {
      setLoadingFolderContents(false);
    }
  };

  /*
   * Go back to the main Projects page.
   */

  const handleCloseFolder = () => {
    setOpenFolderId(null);

    setCurrentFolderPath(null);

    setFolderStack([]);

    setFolderContents([]);

    setFolderContentsError(null);
  };

    return (
    <div className="mx-auto max-w-7xl px-6 py-8">

      {openFolderId === null ? (
        <>
          {/* ==================================================
              PROJECTS PAGE
              ================================================== */}

          {/* Header */}

          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.02em] text-[var(--color-text-tertiary)]">
                Projects
              </p>

              <h1 className="mt-2 text-[28px] font-bold leading-none tracking-tight text-[var(--color-text-primary)]">
                Manage the list and get back to work.
              </h1>
            </div>

            <div className="flex items-center gap-2">

              {/* View switcher */}

              <div className="flex rounded-[8px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-1">

                <Button
                  variant={
                    projectView === "grid"
                      ? "secondary"
                      : "ghost"
                  }
                  size="sm"
                  onClick={() =>
                    setProjectView("grid")
                  }
                  aria-label="Grid view"
                >
                  <Grid2X2 size={14} />
                </Button>

                <Button
                  variant={
                    projectView === "list"
                      ? "secondary"
                      : "ghost"
                  }
                  size="sm"
                  onClick={() =>
                    setProjectView("list")
                  }
                  aria-label="List view"
                >
                  <List size={14} />
                </Button>

              </div>

              {/* Add controls */}

              <div className="flex items-center gap-2">

                <Button
                  variant="secondary"
                  onClick={handleAddFolder}
                >
                  <FolderPlus size={14} />
                  <span>New Folder</span>
                </Button>

                <Button
                  variant="secondary"
                  onClick={
                    handleAddExistingFolder
                  }
                >
                  <Folder size={14} />
                  <span>
                    Add Existing Folder
                  </span>
                </Button>

                <Button
                  onClick={handleAddProject}
                >
                  <Plus size={14} />
                  <span>Add Project</span>
                </Button>

              </div>

            </div>

          </div>

          {/* Search */}

          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

            <div className="w-full max-w-xl">

              <Input
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search projects, branches, paths..."
                leading={
                  <Search size={14} />
                }
                trailing={
                  <span className="rounded-[6px] bg-[var(--color-bg-elevated)] px-2 py-1 text-[12px] font-medium">
                    Ctrl+K
                  </span>
                }
              />

            </div>

            <p className="text-[12px] text-[var(--color-text-tertiary)]">
              {filteredProjects.length}{" "}
              project
              {filteredProjects.length === 1
                ? ""
                : "s"}
            </p>

          </div>

          {/* ==================================================
              FOLDERS
              ================================================== */}

          {folders.length > 0 && (
            <div className="mb-8">

              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                Folders
              </p>

              <div className="space-y-2">

                {folders.map((folder) => (

                  <div
                    key={folder.id}
                    className="
                      group
                      flex
                      items-center
                      gap-3
                      rounded-[10px]
                      border
                      border-[var(--color-border-subtle)]
                      bg-[var(--color-bg-surface)]
                      px-4
                      py-3
                      transition
                      hover:bg-[var(--color-bg-elevated)]
                    "
                  >

                    {/* Folder button */}

                    <button
                      type="button"
                      onClick={() =>
                        handleOpenFolder(
                          folder
                        )
                      }
                      className="
                        flex
                        min-w-0
                        flex-1
                        items-center
                        gap-3
                        text-left
                      "
                    >

                      <Folder
                        size={17}
                        className="
                          shrink-0
                          text-[var(--color-text-secondary)]
                        "
                      />

                      <div className="min-w-0">

                        <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                          {folder.name}
                        </p>

                        <p className="mt-0.5 truncate text-[10px] text-[var(--color-text-tertiary)]">
                          {folder.path ??
                            "Origin folder"}
                        </p>

                      </div>

                    </button>

                    <ChevronRight
                      size={15}
                      className="
                        shrink-0
                        text-[var(--color-text-tertiary)]
                      "
                    />

                    {/* Remove */}

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();

                        removeFolder(
                          folder.id
                        );
                      }}
                      title="Remove from Origin"
                      className="
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-md
                        text-[var(--color-text-tertiary)]
                        opacity-0
                        transition
                        hover:bg-red-400/[0.08]
                        hover:text-red-400
                        group-hover:opacity-100
                      "
                    >
                      <Trash2 size={14} />
                    </button>

                  </div>

                ))}

              </div>

            </div>
          )}

          {/* ==================================================
              PROJECTS
              ================================================== */}

          <div
            className={
              projectView === "grid"
                ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
                : "space-y-3"
            }
          >

            {filteredProjects.length === 0 ? (

              <div className="rounded-[10px] border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-8 text-center text-[var(--color-text-secondary)]">
                No matching projects found.
              </div>

            ) : (

              filteredProjects.map(
                (project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    view={projectView}
                  />
                )
              )

            )}

          </div>
        </>
      ) : (

        /* ==================================================
           OPEN FOLDER
           ================================================== */

        <div>

          {/* ==================================================
              FOLDER HEADER
              ================================================== */}

          <div className="mb-6 flex items-center gap-3">

            {/* Back */}

            <button
              type="button"
              onClick={() => {
                if (
                  folderStack.length > 0
                ) {
                  void goBackDirectory();
                } else {
                  handleCloseFolder();
                }
              }}
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-[var(--color-border-subtle)]
                text-[var(--color-text-tertiary)]
                transition
                hover:bg-[var(--color-bg-elevated)]
                hover:text-[var(--color-text-primary)]
              "
              title={
                folderStack.length > 0
                  ? "Go back"
                  : "Back to Projects"
              }
            >
              <ChevronLeft size={16} />
            </button>

            {/* Folder information */}

            <div className="min-w-0">

              <div className="flex items-center gap-2">

                <Folder
                  size={18}
                  className="
                    shrink-0
                    text-[var(--color-text-secondary)]
                  "
                />

                <h1 className="truncate text-[24px] font-semibold text-[var(--color-text-primary)]">
                  {currentFolderPath
                    ? currentFolderPath
                        .split(/[\\/]/)
                        .filter(Boolean)
                        .pop()
                    : openFolder?.name}
                </h1>

              </div>

              <p className="mt-1 truncate text-[11px] text-[var(--color-text-tertiary)]">
                {currentFolderPath ??
                  openFolder?.path ??
                  ""}
              </p>

            </div>

          </div>

          {/* ==================================================
              FOLDER CONTENTS
              ================================================== */}

          <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">

            <div className="border-b border-[var(--color-border-subtle)] px-4 py-3">

              <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                Folder Contents
              </p>

            </div>

            <div className="p-3">

              {/* Loading */}

              {loadingFolderContents ? (

                <div className="py-16 text-center">

                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    Loading folder contents...
                  </p>

                </div>

              ) : folderContentsError ? (

                /* Error */

                <div className="py-16 text-center">

                  <p className="text-sm text-red-400/80">
                    Failed to read folder
                  </p>

                  <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">
                    {folderContentsError}
                  </p>

                </div>

              ) : folderContents.length === 0 ? (

                /* Empty */

                <div className="py-16 text-center">

                  <Folder
                    size={30}
                    className="
                      mx-auto
                      mb-3
                      text-[var(--color-text-tertiary)]
                    "
                  />

                  <p className="text-sm text-[var(--color-text-secondary)]">
                    This folder is empty.
                  </p>

                </div>

              ) : (

                /* ==================================================
                   CONTENT
                   ================================================== */

                <div className="space-y-2">

                  {folderContents.map(
                    (entry) => {

                      /*
                       * Check whether this filesystem
                       * folder is already registered
                       * as an Origin project.
                       */

                      const matchingProject =
                        entry.kind === "folder"
                          ? projects.find(
                              (project) =>
                                normalizePath(
                                  project.path
                                ) ===
                                normalizePath(
                                  entry.path
                                )
                            )
                          : null;

                      /*
                       * Registered project
                       *
                       * Render the actual ProjectCard
                       * rather than treating it like
                       * an ordinary folder.
                       */

                      if (
                        matchingProject
                      ) {
                        return (
                          <div
                            key={
                              entry.path
                            }
                            className="rounded-[10px]"
                          >

                            <ProjectCard
                              project={
                                matchingProject
                              }
                              view="list"
                            />

                          </div>
                        );
                      }

                      /*
                       * Normal filesystem
                       * folder.
                       */

                      if (
                        entry.kind ===
                        "folder"
                      ) {
                        return (
                          <button
                            key={
                              entry.path
                            }
                            type="button"
                            onClick={() =>
                              void handleOpenSubfolder(
                                entry.path
                              )
                            }
                            className="
                              group
                              flex
                              w-full
                              items-center
                              gap-3
                              rounded-[10px]
                              border
                              border-transparent
                              px-4
                              py-3
                              text-left
                              transition
                              hover:border-[var(--color-border-subtle)]
                              hover:bg-[var(--color-bg-elevated)]
                            "
                          >

                            <Folder
                              size={19}
                              className="
                                shrink-0
                                text-[var(--color-text-secondary)]
                              "
                            />

                            <div className="min-w-0 flex-1">

                              <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                                {entry.name}
                              </p>

                              <p className="mt-0.5 text-[10px] text-[var(--color-text-tertiary)]">
                                Folder
                              </p>

                            </div>

                            <ChevronRight
                              size={16}
                              className="
                                shrink-0
                                text-[var(--color-text-tertiary)]
                                transition
                                group-hover:translate-x-0.5
                              "
                            />

                          </button>
                        );
                      }

                      /*
                       * Normal file.
                       */

                      return (
                        <div
                          key={
                            entry.path
                          }
                          className="
                            flex
                            items-center
                            gap-3
                            rounded-[10px]
                            px-4
                            py-3
                            transition
                            hover:bg-[var(--color-bg-elevated)]
                          "
                        >

                          <FileText
                            size={18}
                            className="
                              shrink-0
                              text-[var(--color-text-tertiary)]
                            "
                          />

                          <div className="min-w-0">

                            <p className="truncate text-sm text-[var(--color-text-primary)]">
                              {entry.name}
                            </p>

                            <p className="mt-0.5 text-[10px] text-[var(--color-text-tertiary)]">
                              File
                            </p>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}