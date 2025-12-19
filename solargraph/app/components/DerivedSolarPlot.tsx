'use client';

import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false, // don't render on the server
});

interface DerivedSolarStatus {
  surplus_solar: number;
  timestamp: string;
}

export default function DerivedSolarPlot({ samples }: { samples: DerivedSolarStatus[] }) {
  const solar_trace = {
    x: samples.map((sample: DerivedSolarStatus) => new Date(sample.timestamp)),
    y: samples.map((sample: DerivedSolarStatus) => sample.surplus_solar),
    type: 'scatter' as const,
    mode: 'lines' as const,
    marker: { color: 'green' },
    name: 'Surplus Solar'
  }

  return (
    <Plot
      data={[solar_trace]}
      layout={{ width: 1200, height: 480, title: { text: 'Surplus Solar' } }}
    />
  );
}
