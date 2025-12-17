use actix_web::{App, HttpResponse, HttpServer, Responder, get, web};
use actix_cors::Cors;
use r2d2_sqlite::SqliteConnectionManager;
use serde::Deserialize;
use std::env;

mod db;
use db::Pool;

#[derive(Deserialize)]
struct QueryParams {
    start_timestamp: String,
    end_timestamp: String,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: {} <database_path>", args[0]);
        std::process::exit(1);
    }
    let database_path = args[1].clone();

    // connect to SQLite DB
    let manager = SqliteConnectionManager::file(database_path);
    let pool = Pool::new(manager).unwrap();

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);
        
        App::new()
            .wrap(cors)
            .app_data(web::Data::new(pool.clone()))
            .service(web::scope("/api/v1").service(get_samples))
    })
    .bind("127.0.0.1:3001")?
    .run()
    .await
}

#[get("/samples/{table}")]
async fn get_samples(
    db: web::Data<Pool>,
    table_request: web::Path<String>,
    query_params: web::Query<QueryParams>,
) -> impl Responder {
    let table = match table_request.into_inner().as_str() {
        "raw" => "samples",
        "fiveminute" => "fiveminute",
        "hourly" => "hourly",
        _ => return HttpResponse::BadRequest().body("Invalid table"),
    };
    let samples = match db::get_samples(
        &db,
        String::from(table),
        query_params.start_timestamp.clone(),
        query_params.end_timestamp.clone(),
    )
    .await
    {
        Ok(samples) => samples,
        Err(e) => return HttpResponse::InternalServerError().body(e.to_string()),
    };
    HttpResponse::Ok().json(samples)
}
