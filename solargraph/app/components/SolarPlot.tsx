'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

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
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    const updateWidth = () => {
      setWidth(Math.min(window.innerWidth, 1200));
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const solar_trace = {
    x: samples.map((sample: SolarStatus) => new Date(sample.timestamp)),
    y: samples.map((sample: SolarStatus) => sample.solar),
    type: 'scatter' as const,
    mode: 'lines' as const,
    marker: { color: 'green' },
    name: 'Solar'
  }
  const grid_trace = {
    x: samples.map((sample: SolarStatus) => new Date(sample.timestamp)),
    y: samples.map((sample: SolarStatus) => sample.grid),
    type: 'scatter' as const,
    mode: 'lines' as const,
    marker: { color: 'blue' },
    name: 'Grid'
  }
  const home_trace = {
    x: samples.map((sample: SolarStatus) => new Date(sample.timestamp)),
    y: samples.map((sample: SolarStatus) => sample.home),
    type: 'scatter' as const,
    mode: 'lines' as const,
    marker: { color: 'orange' },
    name: 'Home'
  }

  const layout = {
    width: width,
    height: 480,
    title: { text: 'Solar Production, Grid Usage and Home Consumption' },
    ...(width < 900 && {
      legend: {
        orientation: 'h' as const,
        y: -0.15,
        x: 0.5,
        xanchor: 'center' as const
      }
    })
  };

  return (
    <Plot
      data={[solar_trace, grid_trace, home_trace]}
      layout={layout}
      config={{ responsive: true }}
    />
  );
}
