use crate::analysis::{
    dependency_analyzer, dto::AnalysisDto, health_analyzer, readme_analyzer, stats_analyzer,
    todo_analyzer,
};

pub fn scan(path: &str) -> Result<AnalysisDto, String> {
    let todos = todo_analyzer::scan(path)?;
    let dependencies = dependency_analyzer::scan(path);
    let readme = readme_analyzer::scan(path);
    let stats = stats_analyzer::scan(path);
    let has_git = std::path::Path::new(path).join(".git").exists();

    let health = health_analyzer::calculate(&todos, &dependencies, &readme, &stats, has_git);

    Ok(AnalysisDto {
        todos,
        dependencies,
        readme,
        stats,
        health,
    })
}
