import { Project } from "@/features/projects/types/project";

export function formatRelativeDate(value?: string) {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.RelativeTimeFormat("en", {
    numeric: "auto",
  }).format(...getRelativeTimeParts(date, new Date()));
}

function getRelativeTimeParts(
  target: Date,
  base: Date
): [number, Intl.RelativeTimeFormatUnit] {
  const diffMs = target.getTime() - base.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (Math.abs(diffMs) < hour) {
    return [Math.round(diffMs / minute), "minute"];
  }

  if (Math.abs(diffMs) < day) {
    return [Math.round(diffMs / hour), "hour"];
  }

  if (Math.abs(diffMs) < week) {
    return [Math.round(diffMs / day), "day"];
  }

  return [Math.round(diffMs / week), "week"];
}

export function sortProjectsByRecent(projects: Project[]) {
  return [...projects].sort((left, right) => {
    const leftTime = new Date(left.lastOpened ?? left.updatedAt).getTime();
    const rightTime = new Date(right.lastOpened ?? right.updatedAt).getTime();

    return rightTime - leftTime;
  });
}

export function getProjectStatusLabel(project: Project) {
  if (!project.gitBranch) {
    return "No git";
  }

  return project.gitDirty ? "Modified" : "Clean";
}
