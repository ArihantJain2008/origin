use std::process::Command;

fn run_git(
    project_path: &str,
    args: &[&str],
) -> Result<String, String> {
    if project_path.trim().is_empty() {
        return Err("Project path cannot be empty".to_string());
    }

    let output = Command::new("git")
        .args(args)
        .current_dir(project_path)
        .output()
        .map_err(|error| {
            format!("Failed to execute git: {}", error)
        })?;

    let stdout = String::from_utf8_lossy(&output.stdout)
        .trim()
        .to_string();

    let stderr = String::from_utf8_lossy(&output.stderr)
        .trim()
        .to_string();

    println!(
        "[git] command: git {}",
        args.join(" ")
    );

    println!(
        "[git] project: {}",
        project_path
    );

    println!(
        "[git] exit status: {}",
        output.status
    );

    if !stdout.is_empty() {
        println!("[git] stdout: {}", stdout);
    }

    if !stderr.is_empty() {
        println!("[git] stderr: {}", stderr);
    }

    if output.status.success() {
        if stdout.is_empty() {
            Ok("Git command completed successfully.".to_string())
        } else {
            Ok(stdout)
        }
    } else {
        Err(if !stderr.is_empty() {
            stderr
        } else if !stdout.is_empty() {
            stdout
        } else {
            format!(
                "Git command failed with status {}",
                output.status
            )
        })
    }
}

#[tauri::command]
pub fn git_status(
    project_path: String,
) -> Result<String, String> {
    run_git(
        &project_path,
        &[
            "status",
            "--short",
            "--branch",
        ],
    )
}

#[tauri::command]
pub fn git_branch(
    project_path: String,
) -> Result<String, String> {
    run_git(
        &project_path,
        &[
            "branch",
            "--show-current",
        ],
    )
}

#[tauri::command]
pub fn git_commit(
    project_path: String,
    message: String,
) -> Result<String, String> {
    let message = message.trim();

    if message.is_empty() {
        return Err(
            "Commit message cannot be empty"
                .to_string(),
        );
    }

    // Stage all project changes.
    run_git(
        &project_path,
        &["add", "."],
    )?;

    // Create the commit.
    run_git(
        &project_path,
        &[
            "commit",
            "-m",
            message,
        ],
    )
}

#[tauri::command]
pub fn git_push(
    project_path: String,
) -> Result<String, String> {
    run_git(
        &project_path,
        &["push"],
    )
}

#[tauri::command]
pub fn git_branches(
    project_path: String,
) -> Result<String, String> {
    run_git(
        &project_path,
        &[
            "branch",
            "--format=%(refname:short)",
        ],
    )
}

#[tauri::command]
pub fn git_checkout(
    project_path: String,
    branch: String,
) -> Result<String, String> {
    let branch = branch.trim();

    if branch.is_empty() {
        return Err(
            "Branch cannot be empty"
                .to_string(),
        );
    }

    run_git(
        &project_path,
        &[
            "checkout",
            branch,
        ],
    )
}

