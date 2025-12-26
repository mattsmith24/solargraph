'use client'

import { useState, useEffect, use } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

import { fetchStatus } from './CurrentSolarStatus'

interface SolarStatus {
    solar?: number;
    grid?: number;
    home?: number;
    timestamp?: string;
}

interface NewSolarStatus {
    samples: SolarStatus[];
    initialised: boolean;
}

export default function CurrentSolarStatusClient({status_promise}: {
    status_promise: Promise<SolarStatus[]>
  }) {
    const [newSamples, setNewSamples] = useState<NewSolarStatus>({samples: [], initialised: false});
    let isOffline = false;
    let currentStatus = {} as SolarStatus;
    const samples = newSamples.initialised ? newSamples.samples : use(status_promise);
    if (Array.isArray(samples) && samples.length > 0) {
        currentStatus = samples[0] as SolarStatus;
    } else {
        isOffline = true;
    }
    const timestamp = currentStatus.timestamp
        ? new Date(currentStatus.timestamp).toLocaleTimeString()
        : 'N/A';

    const plot_data = [
        {
            x: 'Solar',
            y: currentStatus.solar ?? 0,
        },
        {
            x: 'Grid',
            y: currentStatus.grid ?? 0,
        },
        {
            x: 'Home',
            y: currentStatus.home ?? 0,
        }
    ];

    useEffect(() => {
        const id = setInterval(async () => {
            const new_samples = {
                samples: await fetchStatus() as SolarStatus[],
                initialised: true
            };
            setNewSamples(new_samples);
        }, 10000);
        return () => clearInterval(id);
    }, []);

    return (
        <div>
            {isOffline ? (
                <p>PV System is Offline</p>
            ) : (
                <div>
                    <BarChart
                        style={{ width: '100%', maxWidth: '400px', maxHeight: '400px', aspectRatio: 1.618 }}
                        responsive
                        data={plot_data}
                        margin={{
                            top: 5,
                            right: 0,
                            left: 0,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="x" />
                        <YAxis width="auto" />
                        <Tooltip />
                        <Bar
                            name="Power"
                            dataKey="y"
                            fill="#ffbb6d"
                            activeBar={{ fill: "#ffbb6d", stroke: "#ffbb6d" }}
                            radius={[10, 10, 0, 0]} />
                    </BarChart>
                    <p>Timestamp: {timestamp}</p>
                </div>
            )}
        </div>
    );
}
