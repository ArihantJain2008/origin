export type Editor =
  | "vscode"
  | "cursor"
  | "windsurf"
  | "xcode";

import type { OriginPlatform } from "@/shared/utils/shortcuts";

export const editorLabels: Record<Editor, string> = {
  vscode: "VS Code",
  cursor: "Cursor",
  windsurf: "Windsurf",
  xcode: "Xcode",
};

const commonEditors: Editor[] = [
  "vscode",
  "cursor",
  "windsurf",
];

export function getAvailableEditors(
  platform: OriginPlatform
): Editor[] {
  return platform === "macos"
    ? [...commonEditors, "xcode"]
    : commonEditors;
}