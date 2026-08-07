use std::{fs, path::Path};

use crate::analysis::dto::StatsInfo;
use walkdir::WalkDir;

pub fn scan(project_path: &str) -> StatsInfo {
    let mut files = 0u32;
    let mut lines = 0u32;

    for entry in WalkDir::new(project_path) {
        let entry = match entry {
            Ok(entry) => entry,
            Err(_) => continue,
        };

        if !entry.file_type().is_file() {
            continue;
        }

        let path = entry.path();

        if should_ignore(path) {
            continue;
        }

        files += 1;

        if let Ok(content) = fs::read_to_string(path) {
            lines += content.lines().count() as u32;
        }
    }

    StatsInfo {
        files,
        lines,
    }
}

fn should_ignore(path: &Path) -> bool {
    let ignored = [
        "node_modules",
        ".git",
        "dist",
        "build",
        "target",
        ".next",
        ".turbo",
        "coverage",
    ];

    path.components().any(|component| {
        let name = component.as_os_str().to_string_lossy();

        ignored.contains(&name.as_ref())
    })
}