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

interface DerivedSolarStatus {
  surplus_solar: number;
  self_consumption: number;
  timestamp: string;
}

export default function DerivedSolarPlot({ samples, derived_samples }: { samples: SolarStatus[], derived_samples: DerivedSolarStatus[] }) {
  const solar_trace = {
    x: derived_samples.map((sample: DerivedSolarStatus) => new Date(sample.timestamp)),
    y: derived_samples.map((sample: DerivedSolarStatus) => sample.surplus_solar),
    type: 'scatter' as const,
    mode: 'lines' as const,
    marker: { color: 'green' },
    name: 'Surplus Solar'
  }
  const grid_trace = {
    x: samples.map((sample: SolarStatus) => new Date(sample.timestamp)),
    y: samples.map((sample: SolarStatus) => sample.grid),
    type: 'scatter' as const,
    mode: 'lines' as const,
    marker: { color: 'blue' },
    name: 'Grid'
  }
  const self_trace = {
    x: derived_samples.map((sample: DerivedSolarStatus) => new Date(sample.timestamp)),
    y: derived_samples.map((sample: DerivedSolarStatus) => sample.self_consumption),
    type: 'scatter' as const,
    mode: 'lines' as const,
    marker: { color: 'orange' },
    name: 'Self Consumption'
  }

  return (
    <Plot
      data={[solar_trace, grid_trace, self_trace]}
      layout={{ width: 1200, height: 480, title: { text: 'Surplus Solar, Grid Usage and Self Consumption' } }}
    />
  );
}
