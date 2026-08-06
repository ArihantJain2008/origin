use rusqlite::Result;

use crate::database::database::Database;

pub fn save_setting(
    database: &Database,
    key: &str,
    value: &str,
) -> Result<()> {
    let connection = database.connection();

    connection.execute(
        "
        INSERT OR REPLACE INTO settings
        (key, value)
        VALUES (?1, ?2)
        ",
        (key, value),
    )?;

    Ok(())
}

pub fn load_setting(
    database: &Database,
    key: &str,
) -> Result<Option<String>> {
    let connection = database.connection();

    let mut statement = connection.prepare(
        "
        SELECT value
        FROM settings
        WHERE key = ?1
        ",
    )?;

    let mut rows = statement.query([key])?;

    if let Some(row) = rows.next()? {
        Ok(Some(row.get(0)?))
    } else {
        Ok(None)
    }
}