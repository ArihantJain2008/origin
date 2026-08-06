#[derive(Debug)]
pub struct ProjectRecord {
    pub id: String,
    pub name: String,
    pub path: String,

    pub framework: String,
    pub language: String,

    pub favorite: bool,

    pub created_at: String,
    pub updated_at: String,

    pub last_opened: Option<String>,
}