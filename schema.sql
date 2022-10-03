create table if not exists samples (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grid real,
    solar real,
    home real,
    timestamp text
);
create table if not exists daily (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grid real,
    solar real,
    home real,
    timestamp text
);
create table if not exists fiveminute (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grid real,
    solar real,
    home real,
    timestamp text
);
create table if not exists hourly (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grid real,
    solar real,
    home real,
    timestamp text
);
create table if not exists weekly (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grid real,
    solar real,
    home real,
    timestamp text
);
create table if not exists monthly (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grid real,
    solar real,
    home real,
    timestamp text
);
