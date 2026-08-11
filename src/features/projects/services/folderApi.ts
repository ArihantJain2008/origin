import { invoke } from "@tauri-apps/api/core";

export interface FolderEntry {
  name: string;
  path: string;
  kind: "folder" | "file";

  isProject: boolean;
  projectType?: string;
}

export async function readFolderContents(
  folderPath: string
): Promise<FolderEntry[]> {
  return await invoke<FolderEntry[]>(
    "read_folder_contents",
    {
      folderPath,
    }
  );
}