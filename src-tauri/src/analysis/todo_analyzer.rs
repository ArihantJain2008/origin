use std::{fs, path::Path};

use regex::Regex;
use walkdir::WalkDir;

use crate::analysis::dto::{TodoItem};

pub fn scan(path: &str) -> Result<Vec<TodoItem>, String> {
    // Matches:
    // // TODO:
    // // FIXME:
    // // HACK:
    // # TODO:
    // /* TODO:
    // * TODO:
    // -- TODO:
    let todo_regex = Regex::new(
        r#"^\s*(//|#|--|/\*|\*)\s*(TODO|FIXME|HACK)\s*:(.*)$"#
    )
    .unwrap();

    let mut todos = Vec::new();

    for entry in WalkDir::new(path) {
        let entry = match entry {
            Ok(entry) => entry,
            Err(_) => continue,
        };

        if !entry.file_type().is_file() {
            continue;
        }

        let file_path = entry.path();

        if should_ignore(file_path) {
            continue;
        }

        let content = match fs::read_to_string(file_path) {
            Ok(content) => content,
            Err(_) => continue,
        };

        for (index, line) in content.lines().enumerate() {
            if let Some(captures) = todo_regex.captures(line) {
                todos.push(TodoItem {
                    file: file_path.display().to_string(),
                    line: index + 1,
                    kind: captures[2].to_string(),
                    text: captures[3].trim().to_string(),
                });
            }
        }
    }

    Ok(todos)
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