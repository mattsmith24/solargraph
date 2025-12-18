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
  const x = samples.map((sample: SolarStatus) => new Date(sample.timestamp))
  const y = samples.map((sample: SolarStatus) => sample.solar)

  return (
    <Plot
      data={[
        {
          x,
          y,
          type: 'scatter',
          mode: 'lines',
          marker: { color: 'red' },
        },
      ]}
      layout={{ width: 1200, height: 480, title: { text: 'Samples' } }}
    />
  );
}
