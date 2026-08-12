import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export type UpdateStatus =
  | "idle"
  | "checking"
  | "available"
  | "downloading"
  | "installing"
  | "error";

export interface UpdateState {
  status: UpdateStatus;
  update: Update | null;
  progress: number;
  error: string | null;
}

export async function checkForUpdate(): Promise<Update | null> {
  try {
    const update = await check();

    return update ?? null;
  } catch (error) {
    console.error(
      "[UPDATER] Failed to check for updates:",
      error
    );

    throw error;
  }
}

export async function installUpdate(
  update: Update,
  onProgress?: (progress: number) => void
): Promise<void> {
  let downloaded = 0;
  let total = 0;

  await update.downloadAndInstall((event) => {
    switch (event.event) {
      case "Started":
        total = event.data.contentLength ?? 0;
        downloaded = 0;

        onProgress?.(0);

        console.log(
          "[UPDATER] Download started:",
          total,
          "bytes"
        );
        break;

      case "Progress":
        downloaded += event.data.chunkLength;

        if (total > 0) {
          const progress = Math.min(
            100,
            Math.round(
              (downloaded / total) * 100
            )
          );

          onProgress?.(progress);
        }

        break;

      case "Finished":
        onProgress?.(100);

        console.log(
          "[UPDATER] Download finished"
        );

        break;
    }
  });

  console.log(
    "[UPDATER] Update installed. Restarting Origin..."
  );

  await relaunch();
}