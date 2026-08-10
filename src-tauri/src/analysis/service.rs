use crate::analysis::{analyzer, dto::AnalysisDto};

pub fn analyze_project(path: &str) -> Result<AnalysisDto, String> {
    let analysis = analyzer::scan(path)?;

    Ok(analysis)
}
