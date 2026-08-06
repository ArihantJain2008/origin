import { invoke } from "@tauri-apps/api/core";

export async function launchProject(
  id: string,
  path: string
) {
  await invoke("launch_project", {
    id,
    path,
  });
}