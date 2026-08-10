use tauri::State;

use crate::{
    analysis::{dto::AnalysisDto, service},
    database::database::Database,
};

#[tauri::command]
pub fn analyze_project(
    _database: State<'_, Database>,
    path: String,
) -> Result<AnalysisDto, String> {
    service::analyze_project(&path)
}
