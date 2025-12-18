'use client';

import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false, // don't render on the server
});

interface SolarStatus {
  solar: number;
  grid: number;
  home: number;
  timestamp: string;
}

export default function SolarPlot({ samples }: { samples: SolarStatus[] }) {
  const solar_trace = {
    x: samples.map((sample: SolarStatus) => new Date(sample.timestamp)),
    y: samples.map((sample: SolarStatus) => sample.solar),
    type: 'scatter',
    mode: 'lines',
    marker: { color: 'green' },
    name: 'Solar'
  }
  const grid_trace = {
    x: samples.map((sample: SolarStatus) => new Date(sample.timestamp)),
    y: samples.map((sample: SolarStatus) => sample.grid),
    type: 'scatter',
    mode: 'lines',
    marker: { color: 'blue' },
    name: 'Grid'
  }
  const home_trace = {
    x: samples.map((sample: SolarStatus) => new Date(sample.timestamp)),
    y: samples.map((sample: SolarStatus) => sample.home),
    type: 'scatter',
    mode: 'lines',
    marker: { color: 'orange' },
    name: 'Home'
  }

  return (
    <Plot
      data={[solar_trace, grid_trace, home_trace]}
      layout={{ width: 1200, height: 480, title: { text: 'Samples' } }}
    />
  );
}
