use std::{fs, path::Path};
use crate::analysis::dto::ReadmeInfo;

pub fn scan(project_path: &str) -> ReadmeInfo {
    let candidates = [
        "README.md",
        "Readme.md",
        "readme.md",
    ];

    for file in candidates {
        let path = Path::new(project_path).join(file);

        if !path.exists() {
            continue;
        }

        let content = match fs::read_to_string(&path) {
            Ok(content) => content,
            Err(_) => continue,
        };

        return parse_readme(&content);
    }

    ReadmeInfo {
        title: None,
        description: None,
    }
}

fn parse_readme(content: &str) -> ReadmeInfo {
    let mut title = None;
    let mut description = None;

    for line in content.lines() {
        let line = line.trim();

        if title.is_none() && line.starts_with("# ") {
            title = Some(
                line.trim_start_matches("# ")
                    .trim()
                    .to_string(),
            );

            continue;
        }

        if description.is_none() && !line.is_empty() {
            description = Some(line.to_string());
            break;
        }
    }

    ReadmeInfo {
        title,
        description,
    }
}