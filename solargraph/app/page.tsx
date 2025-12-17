import DateSelector from './components/DateSelector';

interface HomeProps {
  searchParams: Promise<{ start_timestamp?: string; end_timestamp?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  // Await searchParams as it's now a Promise in Next.js 16
  const params = await searchParams;
  
  // Default to yesterday to now if no params provided
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 1);
  const defaultEnd = new Date();

  const startTimestamp = params.start_timestamp || defaultStart.toISOString();
  const endTimestamp = params.end_timestamp || defaultEnd.toISOString();

  const data = await fetch(
    `http://127.0.0.1:3001/api/v1/samples/raw?start_timestamp=${encodeURIComponent(startTimestamp)}&end_timestamp=${encodeURIComponent(endTimestamp)}`
  );
  const samples = await data.json();

  return (
    <div>
      <h1>Samples</h1>
      <DateSelector 
        defaultStart={startTimestamp} 
        defaultEnd={endTimestamp} 
      />
      <ul>
        {samples.map((sample: any) => (
          <li key={sample.id}><ul>
            <li>grid: {sample.grid}</li>
            <li>solar: {sample.solar}</li>
            <li>home: {sample.home}</li>
            <li>timestamp: {sample.timestamp}</li>
          </ul></li>
        ))
        }
      </ul>
    </div>
  );
}
