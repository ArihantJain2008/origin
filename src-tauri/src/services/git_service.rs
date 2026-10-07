use std::process::Command;
use serde::Serialize;

#[cfg(target_os = "windows")]
fn git_command() -> Command {
    use std::os::windows::process::CommandExt;

    const CREATE_NO_WINDOW: u32 = 0x08000000;

    let mut command = Command::new("git");
    command.creation_flags(CREATE_NO_WINDOW);
    command
}

#[cfg(not(target_os = "windows"))]
fn git_command() -> Command {
    Command::new("git")
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitStatus {
    pub branch: Option<String>,
    pub dirty: bool,
}

pub fn get_git_status(path: &str) -> GitStatus {
    let branch = git_command()
        .args(["-C", path, "branch", "--show-current"])
        .output();

    match branch {
        Ok(output) if output.status.success() => {
            let branch = String::from_utf8_lossy(&output.stdout).trim().to_string();

            let dirty = git_command()
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
