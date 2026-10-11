import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type { Update } from "@tauri-apps/plugin-updater";
import { getVersion } from "@tauri-apps/api/app";

import {
  checkForUpdate,
  installUpdate,
} from "../services/updaterService";

export function useUpdater() {
  const [update, setUpdate] =
    useState<Update | null>(null);

  const [status, setStatus] =
    useState<
      "idle" |
      "checking" |
      "available" |
      "downloading" |
      "up-to-date" |
      "error"
    >("idle");

    const [dismissed, setDismissed] =
  useState(false);

  const [progress, setProgress] =
    useState(0);

  const [error, setError] =
    useState<string | null>(null);

  const [installedVersion, setInstalledVersion] =
    useState<string | null>(null);

  const checkForUpdates =
    useCallback(async () => {
      setStatus("checking");
      setError(null);

      try {
        const [currentVersion, available] = await Promise.all([
          getVersion(),
          checkForUpdate(),
        ]);
        setInstalledVersion(currentVersion);

        if (available) {
          setUpdate(available);
          setDismissed(false);
          setStatus("available");

          console.log(
            `[UPDATER] Update available: ${available.version}`
          );
        } else {
          setUpdate(null);
          setStatus("up-to-date");

          console.log(
            "[UPDATER] Origin is up to date."
          );
        }
      } catch (error) {
        console.error(
          "[UPDATER] Update check failed:",
          error
        );

        setUpdate(null);
        setStatus("error");

        setError(
          error instanceof Error
            ? error.message
            : String(error)
        );
      }
    }, []);

  const install = useCallback(
    async () => {
      if (!update) {
        return;
      }

      setStatus("downloading");
      setProgress(0);
      setError(null);

      try {
        await installUpdate(
          update,
          (value) => {
            setProgress(value);
          }
        );
      } catch (error) {
        console.error(
          "[UPDATER] Installation failed:",
          error
        );

        setStatus("error");

        setError(
          error instanceof Error
            ? error.message
            : String(error)
        );
      }
    },
    [update]
  );

  useEffect(() => {
    void checkForUpdates();
  }, [checkForUpdates]);

  return {
  update,
  status,
  progress,
  error,
  installedVersion,
  dismissed,
  dismiss: () => setDismissed(true),
  checkForUpdates,
  install,
};

}