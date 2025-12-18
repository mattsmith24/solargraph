import DateSelector from '../components/DateSelector';
import SolarPlot from '../components/SolarPlot';

interface SamplesProps {
  searchParams: Promise<{ start_timestamp?: string; end_timestamp?: string }>;
}

export default async function SamplesPage({ searchParams }: SamplesProps) {
  // Await searchParams as it's now a Promise in Next.js 16
  const params = await searchParams;
  
  // Default to yesterday to now if no params provided
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 1);
  const defaultEnd = new Date();

  const startTimestamp = params.start_timestamp || defaultStart.toISOString();
  const endTimestamp = params.end_timestamp || defaultEnd.toISOString();

  const query_str = `start_timestamp=${encodeURIComponent(startTimestamp)}&end_timestamp=${encodeURIComponent(endTimestamp)}`;
  const data = await fetch(
    `http://192.168.1.27:3001/api/v1/samples/raw?${query_str}`
  );
  const samples = await data.json();

  return (
    <div>
        <h1>Samples</h1>
        <DateSelector 
          defaultStart={startTimestamp} 
          defaultEnd={endTimestamp} 
        />
        <SolarPlot samples={samples} />
    </div>
  );
}
