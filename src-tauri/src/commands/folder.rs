use serde::Serialize;
use std::collections::HashSet;
use std::fs;
use std::path::Path;

#[derive(Debug, Serialize)]
pub struct FolderEntry {
    pub name: String,
    pub path: String,
    pub kind: String,
    pub is_project: bool,
    pub project_type: Option<String>,
}

#[tauri::command]
pub fn read_folder_contents(folder_path: String) -> Result<Vec<FolderEntry>, String> {
    let path = Path::new(&folder_path);

    if !path.exists() {
        return Err("Folder does not exist.".to_string());
    }

    if !path.is_dir() {
        return Err("The selected path is not a folder.".to_string());
    }

    let mut entries = Vec::new();

    let read_dir =
        fs::read_dir(path).map_err(|error| format!("Failed to read folder: {}", error))?;

    /*
     * We read the directory once.
     *
     * The same entries are then used for:
     * - displaying the folder
     * - detecting projects
     *
     * This avoids repeatedly scanning the same directory.
     */

    let mut directory_entries = Vec::new();

    for entry in read_dir {
        let entry = match entry {
            Ok(entry) => entry,

            Err(error) => {
                eprintln!("[FOLDER] Failed to read entry: {}", error);

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
                    entry_path, error
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

        directory_entries.push((entry_path, file_name, kind.to_string()));
    }

    /*
     * Build a signature of the current directory.
     *
     * This is used when determining whether the directory
     * itself is a project.
     */

    /*
     * Create the UI entries.
     */

    for (entry_path, file_name, kind) in directory_entries {
        let is_directory = kind == "folder";

        let (is_project, project_type) = if is_directory {
            detect_project(&entry_path)
        } else {
            (false, None)
        };

        entries.push(FolderEntry {
            name: file_name,
            path: entry_path.to_string_lossy().to_string(),
            kind,
            is_project,
            project_type,
        });
    }

    /*
     * `signature` represents the folder that was opened.
     *
     * Keep it alive here because project detection can be
     * performed independently for child folders.
     */

    /*
     * Folders first.
     *
     * Within folders:
     *   1. Projects
     *   2. Normal folders
     *
     * Files come last.
     *
     * Alphabetical ordering within each group.
     */

    entries.sort_by(|a, b| {
        let order_a = if a.kind == "folder" {
            if a.is_project {
                0
            } else {
                1
            }
        } else {
            2
        };

        let order_b = if b.kind == "folder" {
            if b.is_project {
                0
            } else {
                1
            }
        } else {
            2
        };

        order_a
            .cmp(&order_b)
            .then_with(|| a.name.to_lowercase().cmp(&b.name.to_lowercase()))
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

fn detect_project(path: &Path) -> (bool, Option<String>) {
    /*
     * Read the directory once.
     */

    let read_dir = match fs::read_dir(path) {
        Ok(read_dir) => read_dir,

        Err(_) => {
            return (false, None);
        }
    };

    let mut entries = Vec::new();

    for entry in read_dir.flatten() {
        let entry_path = entry.path();

        let file_name = match entry.file_name().into_string() {
            Ok(name) => name.to_lowercase(),

            Err(_) => continue,
        };

        let metadata = match entry.metadata() {
            Ok(metadata) => metadata,

            Err(_) => continue,
        };

        if !metadata.is_file() {
            continue;
        }

        entries.push((entry_path, file_name));
    }

    let mut files = HashSet::new();
    let mut extensions = HashSet::new();

    for (path, file_name) in &entries {
        files.insert(file_name.clone());

        if let Some(extension) = path.extension() {
            extensions.insert(extension.to_string_lossy().to_lowercase());
        }
    }

    /*
     * ========================================================
     * STRONG PROJECT SIGNATURES
     * ========================================================
     */

    /*
     * Node / React / Vue / Angular / Svelte / Vite /
     * Next.js / JavaScript / TypeScript
     */

    if files.contains("package.json") {
        return (true, Some(detect_node_project_type(path)));
    }

    /*
     * Rust
     */

    if files.contains("cargo.toml") {
        return (true, Some("Rust".to_string()));
    }

    /*
     * Go
     */

    if files.contains("go.mod") {
        return (true, Some("Go".to_string()));
    }

    /*
     * Java / Maven
     */

    if files.contains("pom.xml") {
        return (true, Some("Java / Maven".to_string()));
    }

    /*
     * Java / Gradle
     */

    if files.contains("build.gradle") || files.contains("build.gradle.kts") {
        return (true, Some("Java / Gradle".to_string()));
    }

    /*
     * Python
     */

    if has_multiple_files_with_extension(path, "py", 2) {
        return (true, Some("Python".to_string()));
    }

    /*
     * requirements.txt is slightly weaker than pyproject.toml,
     * but it is still a very common Python project signature.
     */

    if files.contains("requirements.txt")
        && (extensions.contains("py") || files.contains("main.py") || files.contains("app.py"))
    {
        return (true, Some("Python".to_string()));
    }

    /*
     * .NET / C#
     */

    if files.iter().any(|file| {
        file.ends_with(".csproj")
            || file.ends_with(".fsproj")
            || file.ends_with(".vbproj")
            || file.ends_with(".sln")
    }) {
        return (true, Some(".NET".to_string()));
    }

    /*
     * PHP / Composer
     */

    if files.contains("composer.json") {
        return (true, Some("PHP".to_string()));
    }

    /*
     * Ruby
     */

    if files.contains("gemfile") || files.contains("rakefile") {
        return (true, Some("Ruby".to_string()));
    }

    /*
     * Swift
     */

    if files.contains("package.swift") {
        return (true, Some("Swift".to_string()));
    }

    /*
     * Dart / Flutter
     */

    if files.contains("pubspec.yaml") {
        return (true, Some(detect_dart_project_type(path)));
    }

    /*
     * C / C++
     */

    if files.contains("cmakelists.txt") {
        return (true, Some(detect_cpp_project_type(&extensions)));
    }

    /*
     * Makefile projects.
     *
     * We require actual C/C++ source evidence so that a random
     * directory containing a Makefile is not automatically
     * classified as a C/C++ project.
     */

    if files.contains("makefile")
        && (extensions.contains("c")
            || extensions.contains("h")
            || extensions.contains("cpp")
            || extensions.contains("cc")
            || extensions.contains("cxx")
            || extensions.contains("hpp"))
    {
        return (true, Some(detect_cpp_project_type(&extensions)));
    }

    /*
     * ========================================================
     * SOURCE-BASED PROJECT DETECTION
     * ========================================================
     *
     * These are projects that don't necessarily have a package
     * manager or configuration file.
     */

    /*
     * HTML / CSS / JavaScript
     *
     * This specifically handles traditional projects such as:
     *
     * index.html
     * style.css
     * script.js
     *
     * No package.json required.
     */

    let has_html = extensions.contains("html");
    let has_css = extensions.contains("css");
    let has_javascript = extensions.contains("js");
    let has_typescript = extensions.contains("ts");

    if has_html && (has_css || has_javascript || has_typescript) {
        return (true, Some("HTML / CSS / JavaScript".to_string()));
    }

    /*
     * Java source-only project.
     */

    if extensions.contains("java") {
        return (true, Some("Java".to_string()));
    }

    /*
     * Kotlin source-only project.
     */

    if extensions.contains("kt") || extensions.contains("kts") {
        return (true, Some("Kotlin".to_string()));
    }

    /*
     * Python source-only project.
     *
     * Require at least two Python files so a random folder
     * containing one script isn't automatically classified
     * as a project.
     */

    if has_multiple_files_with_extension(path, "py", 2) {
        return (true, Some("Python".to_string()));
    }

    /*
     * C / C++ source-only project.
     */

    if extensions.contains("cpp") || extensions.contains("cc") || extensions.contains("cxx") {
        return (true, Some("C++".to_string()));
    }

    if extensions.contains("c") {
        return (true, Some("C".to_string()));
    }

    /*
     * Swift source-only project.
     */

    if extensions.contains("swift") {
        return (true, Some("Swift".to_string()));
    }

    /*
     * Ruby source-only project.
     */

    if extensions.contains("rb") {
        return (true, Some("Ruby".to_string()));
    }

    /*
     * PHP source-only project.
     */

    if extensions.contains("php") {
        return (true, Some("PHP".to_string()));
    }

    /*
     * Dart source-only project.
     */

    if extensions.contains("dart") {
        return (true, Some("Dart".to_string()));
    }

    /*
     * ========================================================
     * NO PROJECT DETECTED
     * ========================================================
     */

    (false, None)
}

/* ============================================================
NODE PROJECT DETECTION
============================================================ */

fn detect_node_project_type(path: &Path) -> String {
    let package_path = path.join("package.json");

    let contents = match fs::read_to_string(package_path) {
        Ok(contents) => contents,

        Err(_) => {
            return "Node.js".to_string();
        }
    };

    let package_lower = contents.to_lowercase();

    /*
     * React
     */

    if package_lower.contains("\"react\"") || package_lower.contains("\"react-dom\"") {
        if package_lower.contains("\"vite\"") {
            return "React / Vite".to_string();
        }

        if package_lower.contains("\"next\"") {
            return "Next.js / React".to_string();
        }

        return "React".to_string();
    }

    /*
     * Vue
     */

    if package_lower.contains("\"vue\"") {
        if package_lower.contains("\"vite\"") {
            return "Vue / Vite".to_string();
        }

        return "Vue".to_string();
    }

    /*
     * Angular
     */

    if package_lower.contains("\"@angular/core\"") {
        return "Angular".to_string();
    }

    /*
     * Svelte
     */

    if package_lower.contains("\"svelte\"") {
        return "Svelte".to_string();
    }

    /*
     * Next.js
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
     * Vite without a recognized frontend framework.
     */

    if package_lower.contains("\"vite\"") {
        return "Vite".to_string();
    }

    /*
     * Electron
     */

    if package_lower.contains("\"electron\"") {
        return "Electron".to_string();
    }

    /*
     * TypeScript project.
     */

    if package_lower.contains("\"typescript\"") {
        return "Node.js / TypeScript".to_string();
    }

    "Node.js".to_string()
}

/* ============================================================
DART / FLUTTER DETECTION
============================================================ */

fn detect_dart_project_type(path: &Path) -> String {
    let pubspec_path = path.join("pubspec.yaml");

    let contents = match fs::read_to_string(pubspec_path) {
        Ok(contents) => contents.to_lowercase(),

        Err(_) => {
            return "Dart".to_string();
        }
    };

    if contents.contains("flutter:") {
        return "Flutter".to_string();
    }

    "Dart".to_string()
}

/* ============================================================
C / C++ DETECTION
============================================================ */

fn detect_cpp_project_type(extensions: &HashSet<String>) -> String {
    if extensions.contains("cpp")
        || extensions.contains("cc")
        || extensions.contains("cxx")
        || extensions.contains("hpp")
    {
        return "C++".to_string();
    }

    "C".to_string()
}

/* ============================================================
HELPERS
============================================================ */

fn has_multiple_files_with_extension(path: &Path, extension: &str, minimum: usize) -> bool {
    let read_dir = match fs::read_dir(path) {
        Ok(read_dir) => read_dir,
        Err(_) => return false,
    };

    let mut count = 0;

    for entry in read_dir.flatten() {
        let entry_path = entry.path();

        if !entry_path.is_file() {
            continue;
        }

        let matches = entry_path
            .extension()
            .map(|ext| ext.to_string_lossy().eq_ignore_ascii_case(extension))
            .unwrap_or(false);

        if matches {
            count += 1;

            if count >= minimum {
                return true;
            }
        }
    }

    false
}
