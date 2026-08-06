use crate::analysis::{
    dto::AnalysisDto,
    todo_analyzer,
};

pub fn analyze_project(
    path: &str,
) -> Result<AnalysisDto, String> {

    let analysis =
        todo_analyzer::scan(path)?;

    Ok(analysis)
}