
interface DailyProps {
  searchParams: Promise<{ start_timestamp?: string; end_timestamp?: string }>;
}

export default async function DailyPage({ searchParams }: DailyProps) {
  // Await searchParams as it's now a Promise in Next.js 16
  const params = await searchParams;
  
  // Default to yesterday to now if no params provided
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 1);
  const defaultEnd = new Date();

  const startTimestamp = params.start_timestamp || defaultStart.toISOString();
  const endTimestamp = params.end_timestamp || defaultEnd.toISOString();

  return (
    <div>
        <h1>Daily Data</h1>
        <p>Insert daily chart here</p>
    </div>
  );
}
