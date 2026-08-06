import { invoke } from "@tauri-apps/api/core";

export async function launchProject(
  id: string,
  path: string
) {
  try {
    await invoke("launch_project", {
      id,
      path,
    });
  } catch (error) {
    console.error("Failed to launch project:", error);
  }
}

export async function revealProject(
  path: string
) {
  try {
    await invoke("reveal_project", {
      path,
    });
  } catch (error) {
    console.error("Failed to reveal project:", error);
  }
}