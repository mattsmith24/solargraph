import DateSelector from '../components/DateSelector';
import SolarPlot from '../components/SolarPlot';
import { getApiBaseUrl } from '../lib/api';

interface SamplesProps {
  searchParams: Promise<{ start_timestamp?: string; end_timestamp?: string }>;
}

interface SolarStatus {
  solar?: number;
  grid?: number;
  home?: number;
  timestamp: string;
}

export default async function SamplesPage({ searchParams }: SamplesProps) {
  // Await searchParams as it's now a Promise in Next.js 16
  const params = await searchParams;
  
  // Default to yesterday to now if no params provided
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 1);
  const defaultEnd = new Date();
  defaultEnd.setDate(defaultEnd.getDate() + 1);
  
  const startTimestamp = params.start_timestamp || defaultStart.toISOString();
  const endTimestamp = params.end_timestamp || defaultEnd.toISOString();

  const query_str = `start_timestamp=${encodeURIComponent(startTimestamp)}&end_timestamp=${encodeURIComponent(endTimestamp)}`;
  const apiBaseUrl = getApiBaseUrl();
  const data = await fetch(
    `${apiBaseUrl}/api/v1/samples/raw?${query_str}`
  );
  const samples = (await data.json() as SolarStatus[]).reverse();

  const padded_samples: SolarStatus[] = [];
  let previous_timestamp = new Date(startTimestamp);
  samples.forEach((sample: SolarStatus) => {
    // if the gap to the previous sample is within 30s give or take 10s then add to padded samples.
    const current_timestamp = new Date(sample.timestamp);
    let diffTime = Math.abs(current_timestamp.valueOf() - previous_timestamp.valueOf());  // ms
    let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    while (diffDays > 0 || diffTime >= (30000 + 10000)) {
      const pad_timestamp = new Date();
      pad_timestamp.setTime(previous_timestamp.getTime() + 30000);
      const pad_sample = {
        timestamp: pad_timestamp.toISOString()
      }
      padded_samples.push(pad_sample);
      previous_timestamp = pad_timestamp;
      diffTime = Math.abs(current_timestamp.valueOf() - previous_timestamp.valueOf());  // ms
      diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
    padded_samples.push(sample);
    previous_timestamp = new Date(sample.timestamp);
  });

  return (
    <div>
        <h1>Samples</h1>
        <DateSelector 
          defaultStart={startTimestamp} 
          defaultEnd={endTimestamp} 
        />
        <SolarPlot samples={padded_samples} />
    </div>
  );
}
