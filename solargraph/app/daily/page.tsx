import DateSelector from '../components/DateSelector';
import SolarBarPlot from '../components/SolarBarPlot';
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
  grid: number;
  self_consumption: number;
  timestamp: string;
}

interface Tariff {
  energy: number;  // kWH
  tariff: number;  // $
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

  const feedin_tariff = calcFeedInTariff(derived_samples);
  const general_tariff = calcGeneralTariff(derived_samples);
  const typical_demand = {
    energy: general_tariff.energy * 0.15,
    tariff: general_tariff.energy * 0.15 * 0.1686
  }
  const total_energy_cost = {
    energy: general_tariff.energy + typical_demand.energy - feedin_tariff.energy,
    tariff: general_tariff.tariff + typical_demand.tariff - feedin_tariff.tariff
  }
  const tariff_with_battery = tariffWithBattery(derived_samples);
  const savings_with_battery = total_energy_cost.tariff - tariff_with_battery.tariff;


  const solar_legend = [
    {
      key: 'solar',
      name: 'Solar Generation',
      color: '#6dffbb'
    },
    {
      key: 'grid',
      name: 'Grid Consumption',
      color: '#6db1ff'
    },
    {
      key: 'home',
      name: 'Home Power Use',
      color: '#ffbb6d'
    }
  ];

  const derived_legend = [
    {
      key: 'surplus_solar',
      name: 'Surplus Solar',
      color: '#6dffbb'
    },
    {
      key: 'grid',
      name: 'Grid Consumption',
      color: '#6db1ff'
    },
    {
      key: 'self_consumption',
      name: 'Solar Self Consumption',
      color: '#ffbb6d'
    }
  ];

  return (
    <div>
        <h1>Daily Data</h1>
        <DateSelector 
          defaultStart={startTimestamp} 
          defaultEnd={endTimestamp} 
        />
        <SolarBarPlot samples={samples} legend={solar_legend} aggregation_type='daily' />
        <SolarBarPlot samples={derived_samples} legend={derived_legend} aggregation_type='daily' />
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

        <h1>Tariff Estimates</h1>
        <p><i>Note: Demand is guessed based on a typical percentage. Calculations assume that the battery covers the
          demand period.</i></p>
          <p><i>Note: The actual bill includes a daily connection charge and GST.</i></p>
        <table>
          <tbody>
          <tr>
            <td>
              Feedin Tariff
            </td>
            <td>
              {feedin_tariff.energy.toFixed(2)} kWH
            </td>
            <td>
              ${feedin_tariff.tariff.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td>
              General Tariff
            </td>
            <td>
              {general_tariff.energy.toFixed(2)} kWH (includes demand kWH)
            </td>
            <td>
              ${general_tariff.tariff.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td>
              Typical Demand
            </td>
            <td>
              {typical_demand.energy.toFixed(2)} kWH
            </td>
            <td>
              ${typical_demand.tariff.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td>
              Monthly Energy Cost
            </td>
            <td>
              -
            </td>
            <td>
              ${total_energy_cost.tariff.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td>
              Bill if a 30kWh battery was installed
            </td>
            <td>
              {tariff_with_battery.energy.toFixed(2)} kWH
            </td>
            <td>
              ${tariff_with_battery.tariff.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td>
              Savings if a 30kWh battery was installed
            </td>
            <td>
              -
            </td>
            <td>
              ${savings_with_battery.toFixed(2)}
            </td>
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
      grid: sample.grid,
      timestamp: sample.timestamp
    } as DerivedSolarStatus;
  })
}

function calcFeedInTariff(samples: DerivedSolarStatus[]): Tariff {
  const result = { energy: 0, tariff: 0 } as Tariff;
  return samples.reduce(
    (result: Tariff, sample: DerivedSolarStatus) => {
      const energy = sample.surplus_solar ?? 0;
      const result_energy = result.energy ?? 0;
      const result_tariff = result.tariff ?? 0;
      // AGL first 10 kWH is 10c/kwh
      let remaining_kWH = energy;
      let tariff = 0;
      if (remaining_kWH > 10) {
        tariff += 0.1 * 10;
        remaining_kWH -= 10;
      } else {
        tariff += 0.1 * remaining_kWH;
        remaining_kWH = 0;
      }
      // After that it's 3 c/kWH
      tariff += 0.03 * remaining_kWH;
      result.energy = result_energy + energy;
      result.tariff = result_tariff + tariff;
      return result;
    },
    result  // initial value
  )
}

function calcGeneralTariff(samples: DerivedSolarStatus[]): Tariff {
  const result = { energy: 0, tariff: 0 } as Tariff;
  return samples.reduce(
    (result: Tariff, sample: DerivedSolarStatus) => {
      const result_energy = result.energy ?? 0;
      const result_tariff = result.tariff ?? 0;
      const sample_grid = sample.grid ?? 0;
      if (sample_grid > 0) {
        result.energy = result_energy + sample_grid;
      }
      result.tariff = result_tariff + 0.307 * sample_grid;
      return result;
    },
    result  // initial value
  )
}

function tariffWithBattery(samples: DerivedSolarStatus[]): Tariff {
  const result = { energy: 0, tariff: 0 } as Tariff;
  return samples.reduce(
    (result: Tariff, sample: DerivedSolarStatus) => {
      const battery_charge = Math.min(sample.surplus_solar ?? 0, 30);
      let new_general = sample.grid ?? 0;
      if (new_general < battery_charge) {
        new_general = 0;
      } else {
        new_general -= battery_charge;
      }
    
      const result_energy = result.energy ?? 0;
      const result_tariff = result.tariff ?? 0;
      result.energy = result_energy + new_general;
      result.tariff = result_tariff + new_general * 0.307;
      return result;
    },
    result  // initial value
  )

}
