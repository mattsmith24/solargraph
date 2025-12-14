# Run this app with `python solargraph-dash.py` and
# visit http://127.0.0.1:8050/ in your web browser.

from pathlib import Path
import sqlite3
import datetime
import argparse

from dash import Dash, html, dcc, Output, Input
import plotly.express as px
import pandas as pd
import numpy as np

import appdirs

SOLARLOGGING_DATA_DIR = appdirs.user_data_dir("solarlogging", "mattsmith24")
SOLARLOGGING_DB_PATH = Path(SOLARLOGGING_DATA_DIR, "solarlogging.db")
database = SOLARLOGGING_DB_PATH

SAMPLES = 60 * 60 * 24 / 30

app = Dash(__name__)

app.layout = html.Div(
    children=[
        html.H1(children='Solar Graph'),

        html.P('''
            Time series solar data graph
        ''', className="paragraph"),

        # Add a store component to trigger callbacks on page load
        dcc.Store(id='page-load-trigger'),

        html.P(
            dcc.Dropdown(
                [
                    'Samples',
                    '5 Minute',
                    'Hourly',
                    'Daily',
                    'Weekly',
                    'Monthly'
                ],
                'Samples',
                id='timescale',
                style={'background-color': '#101010', 'color': '#e0e0e0'}
            )
        ),

        html.P(
            dcc.DatePickerSingle(
                id='end-date',
                min_date_allowed=datetime.date(2020, 1, 1),
                max_date_allowed=datetime.date(2120, 12, 31),
                date=datetime.date.today(),
                display_format='MMM Do, Y',
            )
        ),

        dcc.Checklist(
            ['Grid', 'Solar', 'Home'],
            ['Grid', 'Solar', 'Home'],
            id='series-selection'
        ),

        dcc.Graph(id='solar-graph')
    ]
)

# Add callback to update date picker to today's date on page load
@app.callback(
    Output('end-date', 'date'),
    Input('page-load-trigger', 'data')
)
def update_date_on_load(data):
    return datetime.date.today()

@app.callback(
    Output('solar-graph', 'figure'),
    Input('timescale', 'value'),
    Input('series-selection', 'value'),
    Input('end-date', 'date'),
)
def update_graph(timescale, series_selection, end_date):
    sqlcon = sqlite3.connect(database)
    sqlcon.row_factory = sqlite3.Row
    cur = sqlcon.cursor()

    table = timescale.lower()    
    if timescale == '5 Minute':
        table = 'fiveminute'
    # End date should be queried in utc
    end_date = datetime.datetime.fromisoformat(end_date).astimezone(tz=datetime.timezone.utc)
    # End date should add a day since it's inclusive of the selected day
    end_date += datetime.timedelta(days=1)
    # Note this gets the last N rows but reverses them
    res = cur.execute(f"SELECT * from {table} where timestamp < ? order by id desc limit {SAMPLES}", (end_date.isoformat(),))
    
    grid_vals = []
    solar_vals = []
    home_vals = []
    timestamps = []
    for row in res:
        # Convert timestamps to localtime for display
        timestamps.append(
            datetime.datetime.fromisoformat(row["timestamp"])
            .astimezone(tz=None)
        )
        grid_vals.append(float(row["grid"]))
        solar_vals.append(float(row["solar"]))
        home_vals.append(float(row["home"]))

    show_grid = 'Grid' in series_selection
    show_solar = 'Solar' in series_selection
    show_home = 'Home' in series_selection

    # Need to unreverse the arrays because the SQL result is reversed
    dataframe_dict = {}
    if show_grid:
        dataframe_dict['Grid'] = np.array(reversed(grid_vals))
    if show_solar:
        dataframe_dict['Solar'] = np.array(reversed(solar_vals))
    if show_home:
        dataframe_dict['Home'] = np.array(reversed(home_vals))

    dataframe = pd.DataFrame(data=dataframe_dict, index=np.array(reversed(timestamps)))
    
    fig = px.line(dataframe)
    fig.update_layout(
        xaxis=dict(
            showgrid=True,
            gridcolor='rgb(82, 82, 82)',
            showline=False,
            showticklabels=True,
            ticks='outside',
            tickfont=dict(
                family='Arial',
                size=12,
                color='rgb(82, 82, 82)',
            ),
        ),
        yaxis=dict(
            showgrid=True,
            gridcolor='rgb(82, 82, 82)',
            zeroline=False,
            showline=False,
            showticklabels=True,
            ticks='outside',
            tickfont=dict(
                family='Arial',
                size=12,
                color='rgb(82, 82, 82)',
            ),
        ),
        paper_bgcolor='rgb(16,16,16)',
        plot_bgcolor='rgb(40, 40, 40)'
    )
    return fig


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Solar grapher')
    parser.add_argument('--database', help='Path to sqlite3 database')

    args = parser.parse_args()
    if args.database:
        database = Path(args.database)

    app.run_server(host='0.0.0.0', debug=True)
