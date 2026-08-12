import {
  Download,
  RefreshCw,
  X,
} from "lucide-react";

import { Button } from "@/shared/components/ui";

import { useUpdater } from "../hooks/useUpdater";

export default function UpdateIndicator() {
  const {
    update,
    status,
    progress,
    error,
    dismissed,
    install,
    dismiss,
  } = useUpdater();

  if (
    dismissed ||
    status === "idle" ||
    status === "checking"
  ) {
    return null;
  }

  if (status === "error") {
    return (
      <div
        className="
          fixed
          right-5
          top-5
          z-[9999]
          w-[340px]
          rounded-xl
          border
          border-red-400/20
          bg-[var(--color-bg-surface)]
          p-4
          shadow-2xl
        "
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <X
              size={16}
              className="text-red-400"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              Update check failed
            </p>

            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!update) {
    return null;
  }

  const isDownloading =
    status === "downloading";

  const isInstalling =
    status === "installing";

  return (
    <div
      className="
        fixed
        right-5
        top-5
        z-[9999]
        w-[360px]
        overflow-hidden
        rounded-xl
        border
        border-[var(--color-border-subtle)]
        bg-[var(--color-bg-surface)]
        shadow-2xl
      "
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-[var(--color-bg-elevated)]
            "
          >
            {isDownloading || isInstalling ? (
              <RefreshCw
                size={16}
                className="animate-spin text-[var(--color-text-secondary)]"
              />
            ) : (
              <Download
                size={16}
                className="text-[var(--color-text-secondary)]"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              {isInstalling
                ? "Restarting Origin..."
                : isDownloading
                  ? "Updating Origin..."
                  : "Update available"}
            </p>

            {!isDownloading &&
              !isInstalling && (
                <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                  Origin {update.version} is
                  available.
                </p>
              )}
          </div>
        </div>

        {!isDownloading &&
          !isInstalling &&
          update.body && (
            <div
              className="
                mt-3
                max-h-24
                overflow-auto
                rounded-lg
                bg-[var(--color-bg-elevated)]
                p-3
                text-xs
                leading-relaxed
                text-[var(--color-text-secondary)]
              "
            >
              {update.body}
            </div>
          )}

        {isDownloading && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] text-[var(--color-text-tertiary)]">
                Downloading update
              </span>

              <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">
                {progress}%
              </span>
            </div>

            <div
              className="
                h-1.5
                overflow-hidden
                rounded-full
                bg-[var(--color-bg-elevated)]
              "
            >
              <div
                className="
                  h-full
                  rounded-full
                  bg-[var(--color-text-primary)]
                  transition-[width]
                  duration-200
                "
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        )}

        {isInstalling && (
          <p className="mt-3 text-xs text-[var(--color-text-tertiary)]">
            The update has been installed.
            Origin will restart automatically.
          </p>
        )}

        {!isDownloading &&
          !isInstalling && (
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={dismiss}
              >
                Later
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  void install();
                }}
              >
                <Download size={13} />
                Update Now
              </Button>
            </div>
          )}
      </div>
    </div>
  );
}