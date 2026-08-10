use serde::Serialize;
use sysinfo::System;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemStats {
    pub cpu_usage: f32,
    pub memory_used: u64,
    pub memory_total: u64,
    pub memory_usage: f32,
    pub temperature: Option<f32>,
}

#[tauri::command]
pub fn system_get_stats() -> SystemStats {
    let mut system = System::new_all();

    // CPU usage requires two measurements.
    system.refresh_cpu_usage();

    std::thread::sleep(
        std::time::Duration::from_millis(100),
    );

    system.refresh_cpu_usage();
    system.refresh_memory();

    let cpu_usage =
        system.global_cpu_usage();

    let memory_total =
        system.total_memory();

    let memory_used =
        system.used_memory();

    let memory_usage =
        if memory_total > 0 {
            (memory_used as f32
                / memory_total as f32)
                * 100.0
        } else {
            0.0
        };

    SystemStats {
        cpu_usage,
        memory_used,
        memory_total,
        memory_usage,
        temperature: None,
    }
}