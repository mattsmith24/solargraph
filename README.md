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





