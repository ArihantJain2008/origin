import { invoke } from "@tauri-apps/api/core";

export async function launchProject(path: string) {
  try {
    await invoke("launch_project", {
      path,
    });
  } catch (error) {
    console.error("Failed to launch project:", error);
  }
}