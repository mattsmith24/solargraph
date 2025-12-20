import DateSelector from '../components/DateSelector';
import SolarPlot from '../components/SolarPlot';
import DerivedSolarPlot from '../components/DerivedSolarPlot';
import { getApiBaseUrl } from '../lib/api';

interface DailyProps {
  searchParams: Promise<{ start_timestamp?: string; end_timestamp?: string }>;
}

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

export default async function DailyPage({ searchParams }: DailyProps) {
  // Await searchParams as it's now a Promise in Next.js 16
  const params = await searchParams;
  
  // Default to yesterday to now if no params provided
  const defaultStart = new Date();
  defaultStart.setMonth(defaultStart.getMonth() - 1);
  defaultStart.setDate(defaultStart.getDate() - 1);
  const defaultEnd = new Date();

  const startTimestamp = params.start_timestamp || defaultStart.toISOString();
  const endTimestamp = params.end_timestamp || defaultEnd.toISOString();

  const query_str = `start_timestamp=${encodeURIComponent(startTimestamp)}&end_timestamp=${encodeURIComponent(endTimestamp)}`;
  const apiBaseUrl = getApiBaseUrl();
  const data = await fetch(
    `${apiBaseUrl}/api/v1/daily?${query_str}`
  );
  const samples = await data.json() as SolarStatus[];
  const average_solar = samples.length > 0 
    ? samples.reduce((sum, sample) => sum + sample.solar, 0) / samples.length 
    : 0;
  const averge_grid = samples.length > 0 
  ? samples.reduce((sum, sample) => sum + sample.grid, 0) / samples.length 
  : 0;
  const averge_home = samples.length > 0 
  ? samples.reduce((sum, sample) => sum + sample.home, 0) / samples.length 
  : 0;

  const derived_samples = deriveDailyData(samples)
  const averge_surplus_solar = derived_samples.length > 0 
  ? derived_samples.reduce((sum, sample) => sum + sample.surplus_solar, 0) / derived_samples.length 
  : 0;
  const averge_self_consumption = derived_samples.length > 0 
  ? derived_samples.reduce((sum, sample) => sum + sample.self_consumption, 0) / derived_samples.length 
  : 0;

  return (
    <div>
        <h1>Daily Data</h1>
        <DateSelector 
          defaultStart={startTimestamp} 
          defaultEnd={endTimestamp} 
        />
        <SolarPlot samples={samples} />
        <DerivedSolarPlot samples={samples} derived_samples={derived_samples}/>
        <h1>Daily Averages</h1>
        <table>
          <tbody>
          <tr>
            <td>Average Solar</td>
            <td>{average_solar.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Average Grid</td>
            <td>{averge_grid.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Average Home</td>
            <td>{averge_home.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Average Surplus Solar</td>
            <td>{averge_surplus_solar.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Average Self Consumption</td>
            <td>{averge_self_consumption.toFixed(2)}</td>
          </tr>
          </tbody>
        </table>
    </div>
  );
}

function deriveDailyData(samples: SolarStatus[]) : DerivedSolarStatus[] {
  return samples.map((sample: SolarStatus) => {
    return { 
      surplus_solar: sample.solar - (sample.home - sample.grid),
      self_consumption: sample.home - sample.grid,
      timestamp: sample.timestamp
    } as DerivedSolarStatus;
  })
}