use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TodoItem {
    pub file: String,
    pub line: usize,
    pub kind: String,
    pub text: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReadmeInfo {
    pub title: Option<String>,
    pub description: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StatsInfo {
    pub files: u32,
    pub lines: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HealthInfo {
    pub score: u32,
    pub rating: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AnalysisDto {
    pub todos: Vec<TodoItem>,
    pub dependencies: Vec<String>,
    pub readme: ReadmeInfo,
    pub stats: StatsInfo,
    pub health: HealthInfo,
}