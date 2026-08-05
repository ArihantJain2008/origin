import { exists, readTextFile } from "@tauri-apps/plugin-fs";

export async function readJsonFile<T>(path: string): Promise<T | null> {
  const fileExists = await exists(path);

  if (!fileExists) return null;

  try {
    const content = await readTextFile(path);
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}