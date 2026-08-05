use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectDto {
    pub id: String,
    pub name: String,
    pub path: String,

    pub framework: String,
    pub language: String,

    pub favorite: bool,

    pub created_at: String,
    pub updated_at: String,
}