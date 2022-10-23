import os
import sqlite3
import datetime

import streamlit as st
import pandas as pd
import numpy as np
import appdirs


SOLARLOGGING_DATA_DIR = appdirs.user_data_dir("solarlogging", "mattsmith24")
SOLARLOGGING_DB_PATH = os.path.join(SOLARLOGGING_DATA_DIR, "solarlogging.db")

sqlcon = sqlite3.connect(SOLARLOGGING_DB_PATH)
sqlcon.row_factory = sqlite3.Row

timescale = st.selectbox(
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
    hours_ago = st.slider('Hours ago', min_value=1, max_value=48, value=24)
    hours_to_show = st.slider('Hours to show', min_value=1, max_value=48, value=24)
    start_time = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=hours_ago)
    end_time = start_time + datetime.timedelta(hours=hours_to_show)
    res = cur.execute("SELECT * from samples where timestamp > ? and timestamp < ? order by id",
        (start_time.isoformat(), end_time.isoformat()))
elif timescale == '5 Minute':
    hours_ago = st.slider('Hours ago', min_value=1, max_value=250, value=24)
    hours_to_show = st.slider('Hours to show', min_value=1, max_value=250, value=24)
    start_time = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=hours_ago)
    end_time = start_time + datetime.timedelta(hours=hours_to_show)
    res = cur.execute(f"SELECT * from fiveminute where timestamp > ? and timestamp < ? order by id",
        (start_time.isoformat(), end_time.isoformat()))
elif timescale == 'Hourly':
    days_ago = st.slider('Days ago', min_value=1, max_value=14, value=7)
    days_to_show = st.slider('Days to show', min_value=1, max_value=14, value=7)
    start_time = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=days_ago)
    end_time = start_time + datetime.timedelta(days=days_to_show)
    res = cur.execute(f"SELECT * from hourly where timestamp > ? and timestamp < ? order by id",
        (start_time.isoformat(), end_time.isoformat()))
elif timescale == 'Daily':
    weeks_ago = st.slider('Weeks ago', min_value=1, max_value=8, value=4)
    weeks_to_show = st.slider('Weeks to show', min_value=1, max_value=8, value=4)
    start_time = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(weeks=weeks_ago)
    end_time = start_time + datetime.timedelta(weeks=weeks_to_show)
    res = cur.execute(f"SELECT * from daily where timestamp > ? and timestamp < ? order by id",
        (start_time.isoformat(), end_time.isoformat()))
elif timescale == 'Weekly':
    months_ago = st.slider('Months ago', min_value=1, max_value=24, value=12)
    months_to_show = st.slider('Months to show', min_value=1, max_value=24, value=12)
    start_time = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=months_ago*31)).replace(day=1)
    end_time = (start_time + datetime.timedelta(days=months_to_show*31)).replace(day=1)
    res = cur.execute(f"SELECT * from weekly where timestamp > ? and timestamp < ? order by id",
        (start_time.isoformat(), end_time.isoformat()))
elif timescale == 'Monthly':
    months_ago = st.slider('Months ago', min_value=1, max_value=24, value=12)
    months_to_show = st.slider('Months to show', min_value=1, max_value=24, value=12)
    start_time = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=months_ago*31)).replace(day=1)
    end_time = (start_time + datetime.timedelta(days=months_to_show*31)).replace(day=1)
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
if st.checkbox('Show Grid', value=True):
    dataframe_dict['Grid'] = np.array(grid_vals)
if st.checkbox('Show Solar', value=True):
    dataframe_dict['Solar'] = np.array(solar_vals)
if st.checkbox('Show Home', value=True):
    dataframe_dict['Home'] = np.array(home_vals)

dataframe = pd.DataFrame(data=dataframe_dict, index=np.array(timestamps))

st.line_chart(dataframe)
