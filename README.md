# Solar Graph

This application is for viewing solar data from a sqlite3 database. The schema of the database is assumed to be as per the file schema.sql.

The source data has a few nuances as follows;
The `samples` table is assumed to be multiple times per minute e.g. 30 seconds. Units are watts.

* `grid` - This is negative when feeding in, or positive when drawing from the grid
* `solar` - This is the amount of power being generated from the solar panels. Always +ve
* `home` - This is the amount of power being consumed in the house / home / building whatever

The other tables are all aggregate data. The units are kwh and have slightly different meanings

* `grid` - This is the amount that was drawn from the grid during the sample time period and is always +ve
* `solar` - This is the amount that was generated during the sample time period and is always +ve
* `home` - This is the amount that was consumed during the sample time period and is always +ve

All of the tables have a `timestamp` column. Since sqlite3 doesn't have a datetime format, these are
expected to be stored as text representation of ISO 8601 format with UTC timestamps.
e.g. 2022-10-26T10:47:26.123+00:00 for October 26th 2022 at 10:47 AM and 26.123 seconds UTC.

For the aggregate data tables, the 'direct consumption' can be calculated from `home - grid` and the feedin can be calculated from `solar - direct_consumption`

# Requirements

python modules:

The environment manager pipenv is recommended. See Pipfile

- Common
  - appdirs

- Plotly and dash
  - plotly
  - pandas

- Streamlit
  - streamlit
  - numpy

# Running

The streamlit based grapher app is run with `streamlit run solargraph-sl.py` or if you're using pipenv: 
`pipenv run streamlit run solargraph-sl.py`. This will start a webservice on localhost accessible at http://localhost:8501/ .





