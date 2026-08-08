import type { Theme } from "../types/settings";

export function applyTheme(theme: Theme) {
  const root =
    document.documentElement;

  root.classList.remove(
    "light",
    "dark"
  );

  if (theme === "light") {
    root.classList.add("light");
    return;
  }

  if (theme === "dark") {
    root.classList.add("dark");
    return;
  }

  const prefersDark =
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

  root.classList.add(
    prefersDark ? "dark" : "light"
  );
}