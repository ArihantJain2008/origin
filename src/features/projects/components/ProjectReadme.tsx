import {
  BookOpen,
  FileText,
  LoaderCircle,
} from "lucide-react";

import { useState } from "react";

import {
  readDir,
} from "@tauri-apps/plugin-fs";

import {
  Badge,
  Button,
  Card,
} from "@/shared/components/ui";

import { readFile } from "../services/fileService";
import { ProjectDetailsModel } from "../model/projectDetailsModel";

interface ProjectReadmeProps {
  model: ProjectDetailsModel;
}

export default function ProjectReadme({
  model,
}: ProjectReadmeProps) {
  const [isOpen, setIsOpen] =
    useState(false);

  const [content, setContent] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const handleViewReadme = async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    if (content !== null) {
      setIsOpen(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const entries = await readDir(
        model.project.path
      );

      const readmeEntry = entries.find(
        (entry) =>
          entry.name?.toLowerCase() ===
            "readme.md"
      );

      if (!readmeEntry?.name) {
        setError(
          "README.md could not be found in the project folder."
        );

        return;
      }

      const separator =
        model.project.path.includes("\\")
          ? "\\"
          : "/";

      const readmePath =
        `${model.project.path}${separator}${readmeEntry.name}`;

      const result =
        await readFile(readmePath);

      if (result === null) {
        setError(
          "README.md was found but could not be read."
        );

        return;
      }

      setContent(result);
      setIsOpen(true);
    } catch (error) {
      console.error(
        "Failed to read README:",
        error
      );

      setError(
        "Unable to open README.md."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <BookOpen
          size={22}
          className="text-[var(--color-accent-primary)]"
        />

        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            README
          </h2>

          <p className="text-sm text-[var(--color-text-secondary)]">
            Project documentation status.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <FileText
              size={18}
              className="shrink-0 text-[var(--color-text-secondary)]"
            />

            <div className="min-w-0">
              <p className="font-medium text-[var(--color-text-primary)]">
                README.md
              </p>

              <p className="text-sm text-[var(--color-text-secondary)]">
                {model.readmeAvailable
                  ? "Documentation detected."
                  : "README not found."}
              </p>
            </div>
          </div>

          <Badge
            tone={
              model.readmeAvailable
                ? "success"
                : "warning"
            }
          >
            {model.readmeAvailable
              ? "Available"
              : "Missing"}
          </Badge>
        </div>

        <Button
          disabled={
            !model.readmeAvailable ||
            loading
          }
          onClick={handleViewReadme}
          className="mt-5 w-full"
        >
          {loading ? (
            <>
              <LoaderCircle
                size={15}
                className="animate-spin"
              />

              <span>
                Loading README...
              </span>
            </>
          ) : (
            <span>
              {isOpen
                ? "Hide README"
                : "View README"}
            </span>
          )}
        </Button>

        {error && (
          <p className="mt-3 text-center text-xs text-red-400">
            {error}
          </p>
        )}
      </div>

      {isOpen && content !== null && (
        <div className="mt-4 overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
          <div className="border-b border-[var(--color-border-subtle)] px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
              README.md
            </p>
          </div>

          <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-[12px] leading-6 text-[var(--color-text-secondary)]">
            {content}
          </pre>
        </div>
      )}
    </Card>
  );
}