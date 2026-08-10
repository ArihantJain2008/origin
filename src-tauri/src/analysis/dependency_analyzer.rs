use std::{collections::HashSet, fs, path::Path};

use serde_json::Value;

pub fn scan(project_path: &str) -> Vec<String> {
    let package_json_path = Path::new(project_path).join("package.json");

    if !package_json_path.exists() {
        return Vec::new();
    }

    let content = match fs::read_to_string(package_json_path) {
        Ok(content) => content,
        Err(_) => return Vec::new(),
    };

    let json: Value = match serde_json::from_str(&content) {
        Ok(json) => json,
        Err(_) => return Vec::new(),
    };

    let mut dependencies = HashSet::new();

    extract_dependencies(&json, "dependencies", &mut dependencies);

    extract_dependencies(&json, "devDependencies", &mut dependencies);

    let mut result: Vec<String> = dependencies.into_iter().collect();

    result.sort();

    result
}

fn extract_dependencies(json: &Value, key: &str, output: &mut HashSet<String>) {
    let Some(object) = json.get(key).and_then(|v| v.as_object()) else {
        return;
    };

    for (name, _) in object {
        output.insert(name.clone());
    }
}
