'use client';

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
            setCurrentStatus(samples[0] || {});
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

    return (
        <div>
            <h1>Current Solar Status</h1>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <ul>
                    <li>Solar: {currentStatus.solar ?? 'N/A'}</li>
                    <li>Grid: {currentStatus.grid ?? 'N/A'}</li>
                    <li>Home: {currentStatus.home ?? 'N/A'}</li>
                    <li>Timestamp: {currentStatus.timestamp ?? 'N/A'}</li>
                </ul>
            )}
        </div>
    );
}
