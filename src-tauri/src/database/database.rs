use rusqlite::{Connection, Result};

pub struct Database {
    connection: Connection,
}

impl Database {
    pub fn new() -> Result<Self> {
        let connection = Connection::open("origin.db")?;

        Ok(Self { connection })
    }

    pub fn connection(&self) -> &Connection {
        &self.connection
    }

    pub fn initialize(&self) -> Result<()> {
        self.connection.execute_batch(
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