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

export interface GitChange {
  status: string;
  path: string;
}

export async function getGitChanges(
  projectPath: string
): Promise<GitChange[]> {
  const output = await invoke<string>(
    "git_changes",
    {
      projectPath,
    }
  );

  if (!output.trim()) {
    return [];
  }

  return output
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const status =
        line.slice(0, 2);

      const path =
        line.slice(3).trim();

      return {
        status,
        path,
      };
    });
}