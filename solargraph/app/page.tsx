
export default async function Home() {
  const data = await fetch('http://127.0.0.1:3001/api/v1/samples/raw?start_timestamp=2025-12-15T00:00:00.000Z&end_timestamp=now()')
  const samples = await data.json()
  return (
    <div>
      <h1>Samples</h1>
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
