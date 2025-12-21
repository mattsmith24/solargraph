'use server'

import { getApiBaseUrl } from '../lib/api';
import { Suspense} from 'react';
import CurrentSolarStatusClient from './CurrentSolarStatusClient';

interface SolarStatus {
    solar?: number;
    grid?: number;
    home?: number;
    timestamp?: string;
}

export async function fetchStatus() : Promise<SolarStatus[]>{
    const startTimestamp = new Date();
    startTimestamp.setMinutes(startTimestamp.getMinutes() - 1);
    const endTimestamp = new Date();

    const query_str = `start_timestamp=${encodeURIComponent(startTimestamp.toISOString())}&end_timestamp=${encodeURIComponent(endTimestamp.toISOString())}`;
    const apiBaseUrl = getApiBaseUrl();

    return fetch(
        `${apiBaseUrl}/api/v1/samples/raw?${query_str}`
    ).then((response) => response.json());
}

export default async function CurrentSolarStatus() {
    const status_promise = fetchStatus();

    return (
        <>
            <h1>Current Solar Status</h1>
            <Suspense fallback={<div>Loading...</div>}>
                <CurrentSolarStatusClient status_promise={status_promise} />
            </Suspense>
        </>
    );
}
