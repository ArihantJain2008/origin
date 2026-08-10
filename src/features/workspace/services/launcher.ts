import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

export async function launchProject(
  id: string,
  path: string
) {
  try {
    await invoke("launch_project", {
      id,
      path,
    });

    const window = getCurrentWindow();

    try {
      await window.setSkipTaskbar(true);
    } catch (error) {
      console.debug(
        "Skip-taskbar not supported:",
        error
      );
    }

    await window.hide();
  } catch (error) {
    console.error(
      "Failed to launch project:",
      error
    );
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
    console.error(
      "Failed to reveal project:",
      error
    );
  }
}