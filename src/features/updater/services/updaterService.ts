import { getVersion } from "@tauri-apps/api/app";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export type UpdateStatus =
  | "idle"
  | "checking"
  | "available"
  | "downloading"
  | "up-to-date"
  | "error";

export interface UpdateState {
  status: UpdateStatus;
  update: Update | null;
  progress: number;
  error: string | null;
}

export async function checkForUpdate(): Promise<Update | null> {
  try {
    const [update, installedVersion] = await Promise.all([
      check(),
      getVersion(),
    ]);

    if (!update || compareVersions(update.version, installedVersion) <= 0) {
      return null;
    }

    return update;
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

export function compareVersions(left: string, right: string): number {
  const parse = (version: string) =>
    version
      .replace(/^v/i, "")
      .split("-")[0]
      .split(".")
      .map((part) => Number.parseInt(part, 10) || 0);

  const leftParts = parse(left);
  const rightParts = parse(right);
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference !== 0) return difference;
  }

  return 0;
}