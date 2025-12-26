'use client';

import { useState, useEffect } from 'react';

import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line } from 'recharts';

interface SolarStatus {
  solar: number;
  grid: number;
  home: number;
  timestamp: string;
}

export default function SolarPlot({ samples }: { samples: SolarStatus[] }) {
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    const updateWidth = () => {
      setWidth(Math.min(window.innerWidth, 1200));
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const plot_data = samples.map((sample: SolarStatus) => {
    const datetime = new Date(sample.timestamp)
    return {
    name: datetime.toDateString() + ' ' + datetime.toTimeString(),
    ... sample
    }
  }).reverse();

  return (
    <LineChart
      style={{ width: '100%', maxWidth: width, maxHeight: '400px', aspectRatio: 1.618 }}
      responsive
      data={plot_data}
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis width="auto" />
      <Tooltip />
      <Legend />
      <Line type="monotone" name="Solar Production" dataKey="solar" stroke="#6dffbb" strokeWidth="2" dot={false}  />
      <Line type="monotone" name="Grid Power Use" dataKey="grid" stroke="#6db1ff" strokeWidth="2" dot={false}  />
      <Line type="monotone" name="Home Power Use" dataKey="home" stroke="#ffbb6d" strokeWidth="2" dot={false}  />
    </LineChart>
  );
}
