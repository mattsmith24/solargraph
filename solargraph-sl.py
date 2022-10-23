import os
import sqlite3
import datetime

import streamlit as st
import pandas as pd
import numpy as np
import appdirs
import plotly.express as px


SOLARLOGGING_DATA_DIR = appdirs.user_data_dir("solarlogging", "mattsmith24")
SOLARLOGGING_DB_PATH = os.path.join(SOLARLOGGING_DATA_DIR, "solarlogging.db")

sqlcon = sqlite3.connect(SOLARLOGGING_DB_PATH)
sqlcon.row_factory = sqlite3.Row

timescale = st.sidebar.selectbox(
    'Timescale',
     [
        'Samples',
        '5 Minute',
        'Hourly',
        'Daily',
        'Weekly',
        'Monthly'
     ],
     index=0
)

cur = sqlcon.cursor()

if timescale == 'Samples':
    minutes_ago = st.sidebar.slider('Minutes ago', min_value=1, max_value=360, value=60)
    minutes_to_show = st.sidebar.slider('Minutes to show', min_value=1, max_value=360, value=60)
    start_time = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=minutes_ago)
    end_time = start_time + datetime.timedelta(minutes=minutes_to_show)
    res = cur.execute("SELECT * from samples where timestamp > ? and timestamp < ? order by id",
        (start_time.isoformat(), end_time.isoformat()))
elif timescale == '5 Minute':
    hours_ago = st.sidebar.slider('Hours ago', min_value=1, max_value=250, value=24)
    hours_to_show = st.sidebar.slider('Hours to show', min_value=1, max_value=250, value=24)
    start_time = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=hours_ago)
    end_time = start_time + datetime.timedelta(hours=hours_to_show)
    res = cur.execute(f"SELECT * from fiveminute where timestamp > ? and timestamp < ? order by id",
        (start_time.isoformat(), end_time.isoformat()))
elif timescale == 'Hourly':
    days_ago = st.sidebar.slider('Days ago', min_value=1, max_value=14, value=7)
    days_to_show = st.sidebar.slider('Days to show', min_value=1, max_value=14, value=7)
    start_time = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=days_ago)
    end_time = start_time + datetime.timedelta(days=days_to_show)
    res = cur.execute(f"SELECT * from hourly where timestamp > ? and timestamp < ? order by id",
        (start_time.isoformat(), end_time.isoformat()))
elif timescale == 'Daily':
    weeks_ago = st.sidebar.slider('Weeks ago', min_value=1, max_value=8, value=4)
    weeks_to_show = st.sidebar.slider('Weeks to show', min_value=1, max_value=8, value=4)
    start_time = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(weeks=weeks_ago)
    end_time = start_time + datetime.timedelta(weeks=weeks_to_show)
    res = cur.execute(f"SELECT * from daily where timestamp > ? and timestamp < ? order by id",
        (start_time.isoformat(), end_time.isoformat()))
elif timescale == 'Weekly':
    months_ago = st.sidebar.slider('Months ago', min_value=1, max_value=24, value=12)
    months_to_show = st.sidebar.slider('Months to show', min_value=1, max_value=24, value=12)
    start_time = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=months_ago*31)).replace(day=1)
    end_time = (start_time + datetime.timedelta(days=(months_to_show+1)*31)).replace(day=1)
    res = cur.execute(f"SELECT * from weekly where timestamp > ? and timestamp < ? order by id",
        (start_time.isoformat(), end_time.isoformat()))
elif timescale == 'Monthly':
    years_ago = st.sidebar.slider('Years ago', min_value=1, max_value=10, value=2)
    years_to_show = st.sidebar.slider('Years to show', min_value=1, max_value=10, value=2)
    start_time = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=366 * years_ago)).replace(day=1)
    end_time = (start_time + datetime.timedelta(days=(years_to_show+1)*366)).replace(month=1,day=1)
    res = cur.execute(f"SELECT * from monthly where timestamp > ? and timestamp < ? order by id",
        (start_time.isoformat(), end_time.isoformat()))

grid_vals = []
solar_vals = []
home_vals = []
timestamps = []
for row in res:
    timestamps.append(datetime.datetime.fromisoformat(row["timestamp"]))
    grid_vals.append(float(row["grid"]))
    solar_vals.append(float(row["solar"]))
    home_vals.append(float(row["home"]))
    

dataframe_dict = {}
if st.sidebar.checkbox('Show Grid', value=True):
    dataframe_dict['Grid'] = np.array(grid_vals)
if st.sidebar.checkbox('Show Solar', value=True):
    dataframe_dict['Solar'] = np.array(solar_vals)
if st.sidebar.checkbox('Show Home', value=True):
    dataframe_dict['Home'] = np.array(home_vals)

dataframe = pd.DataFrame(data=dataframe_dict, index=np.array(timestamps))

#st.line_chart(dataframe)


#fig = px.histogram(dataframe, x=dataframe.index, y=['Grid','Solar','Home'], barmode='group')
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
    plot_bgcolor='rgb(40, 40, 40)'
)

st.plotly_chart(fig)