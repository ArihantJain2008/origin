use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct SettingsDto {
    pub preferred_editor: String,

    #[serde(default = "default_theme")]
    pub theme: String,

    #[serde(default)]
    pub command_shortcuts: HashMap<String, String>,
}

fn default_theme() -> String {
    "dark".to_string()
}
