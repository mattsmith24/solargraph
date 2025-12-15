use actix_web::{Error, error, web};
use serde::{Deserialize, Serialize};

pub type Pool = r2d2::Pool<r2d2_sqlite::SqliteConnectionManager>;

#[derive(Debug, Deserialize, Serialize)]
pub struct Sample {
    id: i32,
    grid: f64,
    solar: f64,
    home: f64,
    timestamp: String,
}

pub async fn get_samples(
    pool: &Pool,
    table: String,
    start_timestamp: String,
    end_timestamp: String,
) -> Result<Vec<Sample>, Error> {
    let pool = pool.clone();
    let conn = web::block(move || pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)?;

    web::block(move || {
        let mut stmt = conn.prepare(
            format!(
                "SELECT * FROM {} WHERE timestamp >= ? AND timestamp <= ? order by id desc",
                table
            )
            .as_str(),
        )?;
        stmt.query_map([start_timestamp, end_timestamp], |row| {
            Ok(Sample {
                id: row.get(0)?,
                grid: row.get(1)?,
                solar: row.get(2)?,
                home: row.get(3)?,
                timestamp: row.get(4)?,
            })
        })
        .and_then(Iterator::collect)
    })
    .await?
    .map_err(error::ErrorInternalServerError)
}
