use crate::{
    database::{database::Database, project_repository},
    models::project::ProjectDto,
};
use chrono::Utc;
use std::fs;
use std::path::PathBuf;

fn validate_project_name(name: &str) -> Result<String, String> {
    let trimmed = name.trim();

    if trimmed.is_empty() {
        return Err("Project name cannot be empty.".to_string());
    }

    if trimmed == "."
        || trimmed == ".."
        || trimmed.chars().any(|character| {
            character.is_control()
                || matches!(
                    character,
                    '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|'
                )
        })
    {
        return Err(
            "Project name contains characters that are not valid for a directory name.".to_string(),
        );
    }

    if trimmed.ends_with('.') || trimmed.ends_with(' ') {
        return Err("Project name cannot end with a space or period.".to_string());
    }

    let reserved = [
        "CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8",
        "COM9", "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
    ];
    let stem = trimmed.split('.').next().unwrap_or_default();
    if reserved
        .iter()
        .any(|value| value.eq_ignore_ascii_case(stem))
    {
        return Err("Project name is reserved by the operating system.".to_string());
    }

    Ok(trimmed.to_string())
}

pub fn create_project(
    database: &Database,
    parent_path: String,
    name: String,
) -> Result<ProjectDto, String> {
    let name = validate_project_name(&name)?;
    let parent = PathBuf::from(parent_path.trim());

    if !parent.is_dir() {
        return Err(
            "The selected parent directory does not exist or is not a directory.".to_string(),
        );
    }

    let parent = parent
        .canonicalize()
        .map_err(|error| format!("Failed to access the parent directory: {error}"))?;
    let project_path = parent.join(&name);

    if project_path.exists() {
        return Err("A directory with this project name already exists.".to_string());
    }

    fs::create_dir(&project_path)
        .map_err(|error| format!("Failed to create the project directory: {error}"))?;

    let now = Utc::now().to_rfc3339();
    let project = ProjectDto {
        id: format!(
            "project-{}",
            Utc::now().timestamp_nanos_opt().unwrap_or_default()
        ),
        name,
        path: project_path.to_string_lossy().to_string(),
        framework: "Empty Project".to_string(),
        language: "Unknown".to_string(),
        favorite: false,
        created_at: now.clone(),
        updated_at: now,
        last_opened: None,
        git_branch: None,
        git_dirty: false,
    };

    if let Err(error) = project_repository::save_project(database, &project) {
        let _ = fs::remove_dir(&project_path);
        return Err(format!("Failed to register the new project: {error}"));
    }

    Ok(project)
}

pub fn save_project(database: &Database, project: ProjectDto) -> Result<(), String> {
    project_repository::save_project(database, &project).map_err(|e| e.to_string())
}

pub fn load_projects(database: &Database) -> Result<Vec<ProjectDto>, String> {
    project_repository::load_projects(database).map_err(|e| e.to_string())
}

pub fn remove_project(database: &Database, id: String) -> Result<(), String> {
    project_repository::remove_project(database, &id).map_err(|e| e.to_string())
}

pub fn update_project_favorite(
    database: &Database,
    id: String,
    favorite: bool,
) -> Result<(), String> {
    project_repository::update_project_favorite(database, &id, favorite).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::validate_project_name;

    #[test]
    fn accepts_names_supported_by_all_target_platforms() {
        assert_eq!(validate_project_name("my project"), Ok("my project".to_string()));
        assert_eq!(validate_project_name("cafe"), Ok("cafe".to_string()));
    }

    #[test]
    fn rejects_unsafe_project_names() {
        for name in ["", "..", "../outside", "bad/name", "CON", "project."] {
            assert!(validate_project_name(name).is_err(), "accepted unsafe name: {name}");
        }
    }
}
