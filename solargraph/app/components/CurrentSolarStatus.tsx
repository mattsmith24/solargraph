'use client';

import dynamic from 'next/dynamic';
const Plot = dynamic(() => import('react-plotly.js'), {
    ssr: false, // don't render on the server
  });
  
import { useState, useEffect } from 'react';

interface SolarStatus {
    solar?: number;
    grid?: number;
    home?: number;
    timestamp?: string;
}

export default function CurrentSolarStatus() {
    const [currentStatus, setCurrentStatus] = useState<SolarStatus>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(true);

    const fetchStatus = async () => {
        try {
            const startTimestamp = new Date();
            startTimestamp.setMinutes(startTimestamp.getMinutes() - 1);
            const endTimestamp = new Date();

            const query_str = `start_timestamp=${encodeURIComponent(startTimestamp.toISOString())}&end_timestamp=${encodeURIComponent(endTimestamp.toISOString())}`;
            
            const data = await fetch(
                `http://192.168.1.27:3001/api/v1/samples/raw?${query_str}`
            );
            const samples = await data.json();

            if (Array.isArray(samples) && samples.length > 0) {
                setCurrentStatus(samples[0] as SolarStatus);
                setIsOffline(false);
            } else {
                setIsOffline(true);
            }

            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching solar status:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Fetch immediately on mount
        fetchStatus();

        // Set up interval to fetch every 30 seconds
        const interval = setInterval(() => {
            fetchStatus();
        }, 30000); // 30 seconds

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, []);

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

    return (
        <div>
            <h1>Current Solar Status</h1>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
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
            )}
        </div>
    );
}
