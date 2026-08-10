use std::process::Command;

pub struct GitStatus {
    pub branch: Option<String>,
    pub dirty: bool,
}

pub fn get_git_status(path: &str) -> GitStatus {
    let branch = Command::new("git")
        .args(["-C", path, "branch", "--show-current"])
        .output();

    match branch {
        Ok(output) if output.status.success() => {
            let branch = String::from_utf8_lossy(&output.stdout).trim().to_string();

            let dirty = Command::new("git")
                .args(["-C", path, "status", "--porcelain"])
                .output()
                .map(|output| !output.stdout.is_empty())
                .unwrap_or(false);

            GitStatus {
                branch: Some(branch),
                dirty,
            }
        }

        _ => GitStatus {
            branch: None,
            dirty: false,
        },
    }
}
