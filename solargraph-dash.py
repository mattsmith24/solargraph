# Run this app with `python solargraph-dash.py` and
# visit http://127.0.0.1:8050/ in your web browser.

import os
import sqlite3
import datetime

from dash import Dash, html, dcc, Output, Input
import plotly.express as px
import pandas as pd
import numpy as np

import appdirs

app = Dash(__name__)

SOLARLOGGING_DATA_DIR = appdirs.user_data_dir("solarlogging", "mattsmith24")
SOLARLOGGING_DB_PATH = os.path.join(SOLARLOGGING_DATA_DIR, "solarlogging.db")

app.layout = html.Div(
    children=[
        html.H1(children='Solar Graph'),

        html.P('''
            Time series solar data graph
        ''', className="paragraph"),

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
        )),

        html.P(
            [dcc.Slider(1, 360, value=60, step=10, id='time-ago'),
            dcc.Slider(1, 360, value=360, step=10, id='time-to-show')]
        ),

        dcc.Checklist(
            ['Grid', 'Solar', 'Home'],
            ['Grid', 'Solar', 'Home'],
            id='series-selection'
        ),

        dcc.Graph(id='solar-graph')
    ]
)

@app.callback(
    Output('time-ago', 'max'),
    Output('time-ago', 'step'),
    Output('time-ago', 'value'),
    Output('time-to-show', 'max'),
    Output('time-to-show', 'step'),
    Output('time-to-show', 'value'),
    Input('timescale', 'value')
)
def update_time_ago(timescale):
    if timescale == 'Samples':
        return (360, 10, 60, 360, 10, 360)
    elif timescale == '5 Minute':
        return (250, 10, 8, 250, 10, 250)
    elif timescale == 'Hourly':
        return (14, 1, 2, 14, 1, 14)
    elif timescale == 'Daily':
        return (8, 1, 1, 8, 1, 8)
    elif timescale == 'Weekly':
        return (24, 1, 1, 24, 1, 24)
    elif timescale == 'Monthly':
        return (10, 1, 1, 10, 1, 10)


@app.callback(
    Output('solar-graph', 'figure'),
    Input('timescale', 'value'),
    Input('series-selection', 'value'),
    Input('time-ago', 'value'),
    Input('time-to-show', 'value')
)
def update_graph(timescale, series_selection, time_ago, time_to_show):
    sqlcon = sqlite3.connect(SOLARLOGGING_DB_PATH)
    sqlcon.row_factory = sqlite3.Row
    cur = sqlcon.cursor()
    
    if timescale == 'Samples':
        minutes_ago = time_ago
        minutes_to_show = time_to_show
        start_time = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=minutes_ago)
        end_time = start_time + datetime.timedelta(minutes=minutes_to_show)
        res = cur.execute("SELECT * from samples where timestamp > ? and timestamp < ? order by id",
            (start_time.isoformat(), end_time.isoformat()))
    elif timescale == '5 Minute':
        hours_ago = time_ago
        hours_to_show = time_to_show
        start_time = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=hours_ago)
        end_time = start_time + datetime.timedelta(hours=hours_to_show)
        res = cur.execute(f"SELECT * from fiveminute where timestamp > ? and timestamp < ? order by id",
            (start_time.isoformat(), end_time.isoformat()))
    elif timescale == 'Hourly':
        days_ago = time_ago
        days_to_show = time_to_show
        start_time = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=days_ago)
        end_time = start_time + datetime.timedelta(days=days_to_show)
        res = cur.execute(f"SELECT * from hourly where timestamp > ? and timestamp < ? order by id",
            (start_time.isoformat(), end_time.isoformat()))
    elif timescale == 'Daily':
        weeks_ago = time_ago
        weeks_to_show = time_to_show
        start_time = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(weeks=weeks_ago)
        end_time = start_time + datetime.timedelta(weeks=weeks_to_show)
        res = cur.execute(f"SELECT * from daily where timestamp > ? and timestamp < ? order by id",
            (start_time.isoformat(), end_time.isoformat()))
    elif timescale == 'Weekly':
        months_ago = time_ago
        months_to_show = time_to_show
        start_time = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=months_ago*31)).replace(day=1)
        end_time = (start_time + datetime.timedelta(days=(months_to_show+1)*31)).replace(day=1)
        res = cur.execute(f"SELECT * from weekly where timestamp > ? and timestamp < ? order by id",
            (start_time.isoformat(), end_time.isoformat()))
    elif timescale == 'Monthly':
        years_ago = time_ago
        years_to_show = time_to_show
        start_time = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=366 * years_ago)).replace(day=1)
        end_time = (start_time + datetime.timedelta(days=(years_to_show+1)*366)).replace(month=1,day=1)
        res = cur.execute(f"SELECT * from monthly where timestamp > ? and timestamp < ? order by id",
            (start_time.isoformat(), end_time.isoformat()))

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

    dataframe_dict = {}
    if show_grid:
        dataframe_dict['Grid'] = np.array(grid_vals)
    if show_solar:
        dataframe_dict['Solar'] = np.array(solar_vals)
    if show_home:
        dataframe_dict['Home'] = np.array(home_vals)

    dataframe = pd.DataFrame(data=dataframe_dict, index=np.array(timestamps))
    
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
    app.run_server(debug=True)
