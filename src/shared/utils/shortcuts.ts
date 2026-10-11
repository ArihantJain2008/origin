import { platform as getTauriPlatform } from "@tauri-apps/plugin-os";

export type OriginPlatform = "windows" | "macos" | "linux";

export const SHORTCUT_IDS = {
  home: "home",
  projects: "projects",
  settings: "settings",
  commandPalette: "command-palette",
  overlay: "overlay",
} as const;

export function getOriginPlatform(): OriginPlatform {
  let platform: string;

  try {
    platform = getTauriPlatform();
  } catch {
    return "windows";
  }

  if (platform === "macos") {
    return "macos";
  }

  if (platform === "linux") {
    return "linux";
  }

  return "windows";

  if (platform === "macos") {
    return "macos";
  }

  if (platform === "linux") {
    return "linux";
  }

  return "windows";
}

export function getDefaultShortcut(
  commandId: string,
  platform: OriginPlatform
): string | undefined {
  switch (commandId) {
    case SHORTCUT_IDS.home:
      return "CommandOrControl+H";
    case SHORTCUT_IDS.projects:
      return "CommandOrControl+2";
    case SHORTCUT_IDS.settings:
      return "CommandOrControl+,";
    case SHORTCUT_IDS.commandPalette:
      return "CommandOrControl+K";
    case SHORTCUT_IDS.overlay:
      return platform === "macos"
        ? "CommandOrControl+Shift+Alt+O"
        : "CommandOrControl+Shift+Space";
    default:
      return undefined;
  }
}

const modifierAliases: Record<string, string> = {
  ctrl: "CommandOrControl",
  control: "CommandOrControl",
  cmd: "CommandOrControl",
  command: "CommandOrControl",
  meta: "CommandOrControl",
  commandorcontrol: "CommandOrControl",
  commandorctrl: "CommandOrControl",
  cmdorcontrol: "CommandOrControl",
  cmdorctrl: "CommandOrControl",
  shift: "Shift",
  alt: "Alt",
  option: "Alt",
};

const modifierOrder = [
  "CommandOrControl",
  "Shift",
  "Alt",
];

export function normalizeShortcut(shortcut: string): string {
  const parts = shortcut
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean);

  const modifiers = new Set<string>();
  let key = "";

  for (const part of parts) {
    const alias = modifierAliases[part.toLowerCase()];

    if (alias) {
      modifiers.add(alias);
    } else {
      key = part.length === 1 ? part.toUpperCase() : part;
    }
  }

  return [
    ...modifierOrder.filter((modifier) =>
      modifiers.has(modifier)
    ),
    key,
  ]
    .filter(Boolean)
    .join("+");
}

export function displayShortcut(
  shortcut: string,
  platform: OriginPlatform
): string {
  return normalizeShortcut(shortcut)
    .split("+")
    .map((part) => {
      if (part === "CommandOrControl") {
        return platform === "macos" ? "⌘" : "Ctrl";
      }

      if (part === "Shift") {
        return platform === "macos" ? "⇧" : "Shift";
      }

      if (part === "Alt") {
        return platform === "macos" ? "⌥" : "Alt";
      }

      return part
        .replace("ArrowUp", "↑")
        .replace("ArrowDown", "↓")
        .replace("ArrowLeft", "←")
        .replace("ArrowRight", "→");
    })
    .join(platform === "macos" ? "" : "+");
}

export function captureShortcut(
  event: KeyboardEvent,
  platform: OriginPlatform
): string | null {
  if (["Control", "Shift", "Alt", "Meta"].includes(event.key)) {
    return null;
  }

  const parts: string[] = [];
  const usesPrimaryModifier =
    platform === "macos" ? event.metaKey : event.ctrlKey;

  if (usesPrimaryModifier) {
    parts.push("CommandOrControl");
  }

  if (platform === "macos" ? event.ctrlKey : event.metaKey) {
    parts.push(platform === "macos" ? "Control" : "Command");
  }

  if (event.shiftKey) {
    parts.push("Shift");
  }

  if (event.altKey) {
    parts.push("Alt");
  }

  parts.push(event.key.length === 1 ? event.key.toUpperCase() : event.key);

  return normalizeShortcut(parts.join("+"));
}

export function shortcutMatches(
  event: KeyboardEvent,
  shortcut: string,
  platform: OriginPlatform
): boolean {
  const parts = normalizeShortcut(shortcut)
    .split("+")
    .map((part) => part.toLowerCase());
  const key = parts.find(
    (part) =>
      !["commandorcontrol", "shift", "alt", "control", "command"].includes(
        part
      )
  );

  if (!key) {
    return false;
  }

  const hasPrimary = parts.includes("commandorcontrol");
  const hasControl = parts.includes("control");
  const hasCommand = parts.includes("command");

  return (
    (platform === "macos"
      ? event.metaKey === hasPrimary && event.ctrlKey === hasControl
      : event.ctrlKey === hasPrimary && event.metaKey === hasCommand) &&
    event.shiftKey === parts.includes("shift") &&
    event.altKey === parts.includes("alt") &&
    event.key.toLowerCase() === key
  );
}

export function isSupportedShortcut(
  shortcut: string
): boolean {
  const normalized = normalizeShortcut(shortcut);
  const parts = normalized.split("+");
  const key = parts[parts.length - 1];

  return Boolean(key) && parts.length > 1;
}
