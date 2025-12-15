use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};
use rusqlite::{Connection, Result};
use std::env;

#[derive(Deserialize, Serialize)]
struct Sample {
    id: i32,
    grid: f64,
    solar: f64,
    home: f64,
    timestamp: String,
}

#[derive(Deserialize)]
struct QueryParams {
    start_timestamp: String,
    end_timestamp: String,
    limit: Option<i32>,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: {} <database_path>", args[0]);
        std::process::exit(1);
    }
    let database_path = args[1].clone();
    
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(database_path.clone()))
            .service(
                web::scope("/api/v1")
                    .service(get_samples)
            )
    })
    .bind("127.0.0.1:3001")?
    .run()
    .await
}

#[get("/samples/{table}")]
async fn get_samples(
    database_path: web::Data<String>,
    table_request: web::Path<String>,
    query_params: web::Query<QueryParams>,
) -> impl Responder {
    let table = match table_request.into_inner().as_str() {
        "raw" => "samples",
        "fiveminute" => "fiveminute",
        "hourly" => "hourly",
        _ => return HttpResponse::BadRequest().body("Invalid table"),
    };
    let samples = match get_samples_from_database(database_path.as_str(), table, &query_params.into_inner()) {
        Ok(samples) => samples,
        Err(e) => return HttpResponse::InternalServerError().body(e.to_string()),
    };
    HttpResponse::Ok().json(samples)
}

fn get_samples_from_database(database_path: &str, table: &str, query_params: &QueryParams) -> Result<Vec<Sample>> {
    let conn = Connection::open(database_path)?;
    let mut stmt = conn.prepare(format!(
        "SELECT * FROM {} WHERE timestamp >= ? AND timestamp <= ? order by id desc limit {}",
        table,
        query_params.limit.unwrap_or(100)
    ).as_str())?;
    let samples_iter = stmt.query_map([query_params.start_timestamp.clone(), query_params.end_timestamp.clone()], |row| {
        Ok(Sample {
            id: row.get(0)?,
            grid: row.get(1)?,
            solar: row.get(2)?,
            home: row.get(3)?,
            timestamp: row.get(4)?,
        })
    })?;
    samples_iter.collect::<Result<Vec<Sample>>>()
}
