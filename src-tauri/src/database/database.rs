use rusqlite::{Connection, Result};
use std::path::Path;
use std::sync::Mutex;

pub struct Database {
    connection: Mutex<Connection>,
}
impl Database {
    pub fn new(path: impl AsRef<Path>) -> Result<Self> {
    let connection = Connection::open(path)?;

    Ok(Self {
        connection: Mutex::new(connection),
    })
}

    pub fn connection(
    &self,
) -> std::sync::MutexGuard<'_, Connection> {
    self.connection.lock().unwrap()
}

    pub fn initialize(&self) -> Result<()> {
        let connection = self.connection.lock().unwrap();
        connection.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                path TEXT NOT NULL UNIQUE,

                framework TEXT,
                language TEXT,

                favorite INTEGER DEFAULT 0,

                created_at TEXT,
                updated_at TEXT,

                last_opened TEXT
            );

            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
            ",
        )?;

        Ok(())
    }
}
