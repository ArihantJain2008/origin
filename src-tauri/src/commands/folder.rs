use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Serialize)]
pub struct FolderEntry {
    pub name: String,
    pub path: String,
    pub kind: String,
    pub is_project: bool,
    pub project_type: Option<String>,
}

#[tauri::command]
pub fn read_folder_contents(
    folder_path: String,
) -> Result<Vec<FolderEntry>, String> {
    let path = Path::new(&folder_path);

    if !path.exists() {
        return Err("Folder does not exist.".to_string());
    }

    if !path.is_dir() {
        return Err("The selected path is not a folder.".to_string());
    }

    let mut entries = Vec::new();

    let read_dir = fs::read_dir(path).map_err(|error| {
        format!("Failed to read folder: {}", error)
    })?;

    for entry in read_dir {
        let entry = match entry {
            Ok(entry) => entry,

            Err(error) => {
                eprintln!(
                    "[FOLDER] Failed to read entry: {}",
                    error
                );

                continue;
            }
        };

        let entry_path = entry.path();

        let file_name = match entry.file_name().into_string() {
            Ok(name) => name,

            Err(_) => continue,
        };

        let metadata = match entry.metadata() {
            Ok(metadata) => metadata,

            Err(error) => {
                eprintln!(
                    "[FOLDER] Failed to read metadata for {:?}: {}",
                    entry_path,
                    error
                );

                continue;
            }
        };

        let kind = if metadata.is_dir() {
            "folder"
        } else if metadata.is_file() {
            "file"
        } else {
            continue;
        };

        /*
         * Only folders can be projects.
         *
         * A normal file such as README.md,
         * notes.txt, image.png, etc. can never
         * be treated as a project.
         */

        let (is_project, project_type) =
            if metadata.is_dir() {
                detect_project(&entry_path)
            } else {
                (false, None)
            };

        entries.push(FolderEntry {
            name: file_name,
            path: entry_path.to_string_lossy().to_string(),
            kind: kind.to_string(),
            is_project,
            project_type,
        });
    }

    // Folders first, then files.
    //
    // Within folders:
    //   Projects first
    //   Normal folders second
    //
    // Files come last.

    entries.sort_by(|a, b| {
        let kind_order_a = if a.kind == "folder" {
            if a.is_project {
                0
            } else {
                1
            }
        } else {
            2
        };

        let kind_order_b = if b.kind == "folder" {
            if b.is_project {
                0
            } else {
                1
            }
        } else {
            2
        };

        kind_order_a
            .cmp(&kind_order_b)
            .then_with(|| {
                a.name
                    .to_lowercase()
                    .cmp(&b.name.to_lowercase())
            })
    });

    println!(
        "[FOLDER] Read {} entries from {}",
        entries.len(),
        folder_path
    );

    Ok(entries)
}


/* ============================================================
   PROJECT DETECTION
   ============================================================ */

fn detect_project(
    path: &Path,
) -> (bool, Option<String>) {

    /*
     * Node / React / Vite / Next / JavaScript /
     * TypeScript projects
     */

    if has_file(path, "package.json") {
        return (
            true,
            Some(detect_node_project_type(path)),
        );
    }

    /*
     * Rust
     */

    if has_file(path, "Cargo.toml") {
        return (
            true,
            Some("Rust".to_string()),
        );
    }

    /*
     * Java Maven
     */

    if has_file(path, "pom.xml") {
        return (
            true,
            Some("Java / Maven".to_string()),
        );
    }

    /*
     * Java Gradle
     */

    if has_file(path, "build.gradle")
        || has_file(path, "build.gradle.kts")
    {
        return (
            true,
            Some("Java / Gradle".to_string()),
        );
    }

    /*
     * Python
     */

    if has_file(path, "pyproject.toml") {
        return (
            true,
            Some("Python".to_string()),
        );
    }

    if has_file(path, "requirements.txt") {
        return (
            true,
            Some("Python".to_string()),
        );
    }

    /*
     * Go
     */

    if has_file(path, "go.mod") {
        return (
            true,
            Some("Go".to_string()),
        );
    }

    /*
     * .NET / C#
     */

    if contains_extension(path, "csproj")
        || contains_extension(path, "sln")
    {
        return (
            true,
            Some(".NET / C#".to_string()),
        );
    }

    /*
     * PHP / Composer
     */

    if has_file(path, "composer.json") {
        return (
            true,
            Some("PHP".to_string()),
        );
    }

    /*
     * No recognized project signature.
     */

    (false, None)
}


/* ============================================================
   NODE PROJECT DETECTION
   ============================================================ */

fn detect_node_project_type(
    path: &Path,
) -> String {

    let package_path =
        path.join("package.json");

    let contents =
        match fs::read_to_string(package_path) {
            Ok(contents) => contents,

            Err(_) => {
                return "Node.js".to_string();
            }
        };

    let package_lower =
        contents.to_lowercase();

    /*
     * React
     */

    if package_lower.contains("\"react\"")
        || package_lower.contains("\"react-dom\"")
    {
        /*
         * Vite + React
         */

        if package_lower.contains("\"vite\"") {
            return "React / Vite".to_string();
        }

        /*
         * Next.js
         */

        if package_lower.contains("\"next\"") {
            return "Next.js / React".to_string();
        }

        return "React".to_string();
    }

    /*
     * Next.js without React
     * being explicitly detected.
     */

    if package_lower.contains("\"next\"") {
        return "Next.js".to_string();
    }

    /*
     * Express
     */

    if package_lower.contains("\"express\"") {
        return "Node.js / Express".to_string();
    }

    /*
     * Vite without React.
     */

    if package_lower.contains("\"vite\"") {
        return "Vite".to_string();
    }

    "Node.js".to_string()
}


/* ============================================================
   HELPERS
   ============================================================ */

fn has_file(
    path: &Path,
    file_name: &str,
) -> bool {
    path.join(file_name).is_file()
}


fn contains_extension(
    path: &Path,
    extension: &str,
) -> bool {

    let read_dir =
        match fs::read_dir(path) {
            Ok(read_dir) => read_dir,

            Err(_) => return false,
        };

    for entry in read_dir.flatten() {

        let entry_path =
            entry.path();

        if !entry_path.is_file() {
            continue;
        }

        if let Some(ext) =
            entry_path.extension()
        {
            if ext
                .to_string_lossy()
                .eq_ignore_ascii_case(
                    extension,
                )
            {
                return true;
            }
        }
    }

    false
}