import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type { Update } from "@tauri-apps/plugin-updater";

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
      "installing" |
      "error"
    >("idle");

    const [dismissed, setDismissed] =
  useState(false);

  const [progress, setProgress] =
    useState(0);

  const [error, setError] =
    useState<string | null>(null);

  const checkForUpdates =
    useCallback(async () => {
      setStatus("checking");
      setError(null);

      try {
        const available =
          await checkForUpdate();

        if (available) {
          setUpdate(available);
          setDismissed(false);
          setStatus("available");

          console.log(
            `[UPDATER] Update available: ${available.version}`
          );
        } else {
          setUpdate(null);
          setStatus("idle");

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

            if (value >= 100) {
              setStatus("installing");
            }
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
  dismissed,
  dismiss: () => setDismissed(true),
  checkForUpdates,
  install,
};

}