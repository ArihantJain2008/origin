use crate::models::project::ProjectDto;

#[tauri::command]
pub fn save_project(project: ProjectDto) {
    println!("{:#?}", project);
}