use crate::analysis::{
    dependency_analyzer,
    dto::AnalysisDto,
    todo_analyzer,
    readme_analyzer,
    stats_analyzer
};

pub fn scan(path: &str) -> Result<AnalysisDto, String> {
    let todos = todo_analyzer::scan(path)?;
    let dependencies = dependency_analyzer::scan(path);
    let readme = readme_analyzer::scan(path);
    let stats = stats_analyzer::scan(path);

    Ok(AnalysisDto {
        todos,
        dependencies,
        readme,
        stats,
    })
}