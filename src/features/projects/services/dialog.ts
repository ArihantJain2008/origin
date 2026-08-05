import { open } from "@tauri-apps/plugin-dialog";

export async function pickProjectFolder() {
  const folder = await open({
    directory: true,
    multiple: false,
    title: "Select Project Folder",
  });

  return folder;
}