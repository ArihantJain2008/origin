use crate::analysis::{
    dto::AnalysisDto,
    analyzer,
};

pub fn analyze_project(
    path: &str,
) -> Result<AnalysisDto, String> {

    let analysis =
        analyzer::scan(path)?;

    Ok(analysis)
}