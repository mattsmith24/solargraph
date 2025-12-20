import DateSelector from '../components/DateSelector';
import SolarPlot from '../components/SolarPlot';
import DerivedSolarPlot from '../components/DerivedSolarPlot';
import { getApiBaseUrl } from '../lib/api';

interface MonthlyProps {
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
  
export default async function MonthlyPage({ searchParams }: MonthlyProps) {
    // Await searchParams as it's now a Promise in Next.js 16
    const params = await searchParams;

    // Default to yesterday to now if no params provided
    const defaultStart = new Date();
    defaultStart.setFullYear(defaultStart.getFullYear() - 1);
    if (defaultStart.getMonth() > 1) {
        defaultStart.setMonth(defaultStart.getMonth() - 1);
    } else {
        defaultStart.setMonth(12);
        defaultStart.setFullYear(defaultStart.getFullYear() - 1);
    }
    const defaultEnd = new Date();

    const startTimestamp = params.start_timestamp || defaultStart.toISOString();
    const endTimestamp = params.end_timestamp || defaultEnd.toISOString();

    const query_str = `start_timestamp=${encodeURIComponent(startTimestamp)}&end_timestamp=${encodeURIComponent(endTimestamp)}`;
    const apiBaseUrl = getApiBaseUrl();
    const data = await fetch(
      `${apiBaseUrl}/api/v1/monthly?${query_str}`
    );
    const samples = await data.json() as SolarStatus[];
    const derived_samples = deriveMonthlyData(samples)

    return (
        <div>
            <h1>Monthly Data</h1>
            <DateSelector 
            defaultStart={startTimestamp} 
            defaultEnd={endTimestamp} 
            />
            <SolarPlot samples={samples} />
            <DerivedSolarPlot samples={samples} derived_samples={derived_samples} />
        </div>
    )
}

function deriveMonthlyData(samples: SolarStatus[]) : DerivedSolarStatus[] {
    return samples.map((sample: SolarStatus) => {
      return { 
        surplus_solar: sample.solar - (sample.home - sample.grid),
        self_consumption: sample.home - sample.grid,
        timestamp: sample.timestamp
      } as DerivedSolarStatus;
    })
  }