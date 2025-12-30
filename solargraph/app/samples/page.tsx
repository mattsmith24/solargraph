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

interface Tariff {
  energy: number;  // kWH
  tariff: number;  // $
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
  const padded_samples = padSamples(samples, startTimestamp);
  const feedin_tariff = calcFeedInTariff(samples);
  const demand_tariff = calcDemandTariff(samples);
  const general_tariff = calcGeneralTariff(samples);
  const total_tariff = {
    energy: feedin_tariff.energy + general_tariff.energy,
    tariff: feedin_tariff.tariff + general_tariff.tariff + demand_tariff.tariff
  }
  const tariff_with_battery = tariffWithBattery(feedin_tariff, demand_tariff, general_tariff);
  const savings_with_battery = total_tariff.tariff - tariff_with_battery.tariff;

  return (
    <div>
        <h1>Samples</h1>
        <DateSelector
          defaultStart={startTimestamp}
          defaultEnd={endTimestamp}
        />
        <SolarPlot samples={padded_samples} />
        <h1>Tariff Estimates</h1>
        <table>
          <tbody>
          <tr>
            <td>
              Feedin
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
              Demand
            </td>
            <td>
              {demand_tariff.energy.toFixed(2)} kWH
            </td>
            <td>
              ${demand_tariff.tariff.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td>
              General
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
              Total
            </td>
            <td>
              {total_tariff.energy.toFixed(2)} kWH
            </td>
            <td>
              ${total_tariff.tariff.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td>
              Tariff if a battery was installed
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
              Savings if a battery was installed
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

function padSamples(samples: SolarStatus[], startTimestamp: string): SolarStatus[] {
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
  return padded_samples;
}

function calcFeedInTariff(samples: SolarStatus[]): Tariff {
  const result = { grid: 0, timestamp: '' } as SolarStatus;
  const sum = samples.reduce(
    (result: SolarStatus, sample: SolarStatus) => {
      const new_grid = sample.grid ?? 0;
      const result_grid = result.grid ?? 0;
      if (new_grid < 0) {
        result.grid = new_grid + result_grid;
      }
      return result;
    },
    result  // initial value
  ).grid ?? 0;
  // sum is in units of W x 30s - need to convert to kWH
  const scale_factor = 30 / 1000 / 60 / 60;
  const feed_in_kWH = sum * scale_factor;
  // AGL first 10 kWH is 10c/kwh
  let remaining_kWH = feed_in_kWH;
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
  return {
    energy: feed_in_kWH,
    tariff: tariff
  };
}

function calcDemandTariff(samples: SolarStatus[]): Tariff {
  const result = { grid: 0, timestamp: "" } as SolarStatus;
  const sum = samples.reduce(
    (result: SolarStatus, sample: SolarStatus) => {
      const result_grid = result.grid ?? 0;
      const sample_grid = sample.grid ?? 0;
      const timestamp = new Date(sample.timestamp);
      if (sample_grid > 0 && timestamp.getHours() >= 16 && timestamp.getHours() < 21) {
        result.grid = result_grid + sample_grid;
      }
      return result;
    },
    result  // initial value
  ).grid ?? 0;
  // sum is in units of W x 30s - need to convert to kWH
  const scale_factor = 30 / 1000 / 60 / 60;
  const sum_kWH = sum * scale_factor;
  const tariff = 0.1686 * sum_kWH;
  return {
    energy: sum_kWH,
    tariff: tariff
  };
}

function calcGeneralTariff(samples: SolarStatus[]): Tariff {
  const result = { grid: 0, timestamp: "" } as SolarStatus;
  const sum = samples.reduce(
    (result: SolarStatus, sample: SolarStatus) => {
      const result_grid = result.grid ?? 0;
      const sample_grid = sample.grid ?? 0;
      if (sample_grid > 0) {
        result.grid = result_grid + sample_grid;
      }
      return result;
    },
    result  // initial value
  ).grid ?? 0;
  // sum is in units of W x 30s - need to convert to kWH
  const scale_factor = 30 / 1000 / 60 / 60;
  const sum_kWH = sum * scale_factor;
  const tariff = 0.307 * sum_kWH;
  return {
    energy: sum_kWH,
    tariff: tariff
  };
}

function tariffWithBattery(feedin_tariff: Tariff, demand_tariff: Tariff, general_tariff: Tariff): Tariff {
  let battery_charge = -feedin_tariff.energy;
  let new_demand = demand_tariff.energy;
  let new_general = general_tariff.energy;
  if (demand_tariff.energy < battery_charge) {
    new_demand = 0;
    new_general -= demand_tariff.energy;
    battery_charge -= demand_tariff.energy;
  } else {
    new_demand -= battery_charge;
    new_general -= battery_charge;
    battery_charge = 0;
  }
  if (new_general < battery_charge) {
    new_general = 0;
  } else {
    new_general -= battery_charge;
  }
  return {
    energy: new_general,
    tariff: new_general * 0.307 + new_demand * 0.1686
  }
}
