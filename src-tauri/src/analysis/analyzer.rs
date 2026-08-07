use crate::analysis::{
    dependency_analyzer,
    dto::AnalysisDto,
    todo_analyzer,
};

pub fn scan(path: &str) -> Result<AnalysisDto, String> {
    let todos = todo_analyzer::scan(path)?;
    let dependencies = dependency_analyzer::scan(path);

    Ok(AnalysisDto {
        todos,
        dependencies,
    })
}