import { invoke } from "@tauri-apps/api/core";

export interface GitStatus {
  is_repository: boolean;
  branch: string | null;
  staged: string[];
  modified: string[];
  untracked: string[];
}

export async function getGitStatus(
  projectPath: string
): Promise<GitStatus> {
  return await invoke<GitStatus>(
    "git_status",
    {
      projectPath,
    }
  );
}