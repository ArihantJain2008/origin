use crate::analysis::{
    dto::{HealthInfo, ReadmeInfo, StatsInfo, TodoItem},
};

pub fn calculate(
    todos: &[TodoItem],
    dependencies: &[String],
    readme: &ReadmeInfo,
    stats: &StatsInfo,
    has_git: bool,
) -> HealthInfo {
    let mut score = 0;

    if readme.description.is_some() {
        score += 20;
    }

    if !dependencies.is_empty() {
        score += 20;
    }

    if has_git {
        score += 20;
    }

    if todos.len() < 10 {
        score += 20;
    }

    if stats.files > 0 {
        score += 20;
    }

    let rating = if score >= 90 {
        "Excellent"
    } else if score >= 75 {
        "Good"
    } else if score >= 50 {
        "Fair"
    } else {
        "Poor"
    };

    HealthInfo {
        score,
        rating: rating.to_string(),
    }
}