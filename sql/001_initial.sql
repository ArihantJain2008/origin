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