'use client'

import dynamic from 'next/dynamic';
const Plot = dynamic(() => import('react-plotly.js'), {
    ssr: false, // don't render on the server
  });

import { useState, useEffect } from 'react';

import { use } from 'react'
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
            x: ['Solar', 'Grid', 'Home'],
            y: [currentStatus.solar ?? 0, currentStatus.grid ?? 0, currentStatus.home ?? 0],
            type: 'bar' as const
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
                    <Plot
                    data={plot_data}
                    layout={{ width: 400, height: 300, title: { text: 'Current Solar Status' } }}
                    />
                    <p>Timestamp: {timestamp}</p>
                </div>
            )}
        </div>
    );
}
