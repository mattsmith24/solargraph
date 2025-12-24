'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarRectangleItem } from 'recharts';

interface SolarStatusBarRectangleItem extends BarRectangleItem {
    timestamp?: string;
}

interface Legend {
    key: string,
    name: string,
    color: string
}

interface SolarData {
    timestamp: string
}

export default function SolarPlot({ samples, legend, aggregation_type }
    : { samples: SolarData[], legend: Legend[], aggregation_type: string }) {
    const [width, setWidth] = useState(1200);
    const router = useRouter();
    const handlePlotClick = (data: SolarStatusBarRectangleItem) => {
        const start_datetime = new Date(data.timestamp ?? '');
        start_datetime.setHours(0);
        const start_timestamp = start_datetime.toISOString();
        const end_datetime = new Date(data.timestamp ?? '');
        if (aggregation_type == 'monthly') {
            end_datetime.setMonth(end_datetime.getMonth() + 1);
        } else {
            end_datetime.setDate(end_datetime.getDate() + 1);
        }
        end_datetime.setHours(0);
        const end_timestamp = end_datetime.toISOString();

        const params = new URLSearchParams();
        params.set('start_timestamp', start_timestamp);
        params.set('end_timestamp', end_timestamp);
        if (aggregation_type == 'monthly') {
            router.push(`/daily?${params.toString()}`);
        } else {
            router.push(`/samples?${params.toString()}`);
        }
    }


    useEffect(() => {
        const updateWidth = () => {
            setWidth(Math.min(window.innerWidth, 1200));
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    const data = samples.map((sample: SolarData) => {
        return {
        name: new Date(sample.timestamp).toDateString(),
        ... sample
        }
    }).reverse();

    const bars = [];
    for (let i = 0; i < legend.length; i++) {
        const bar = legend[i];
        bars.push(
            <Bar
                key={i}
                name={bar.name}
                dataKey={bar.key}
                fill={bar.color}
                activeBar={{ fill: bar.color, stroke: bar.color }}
                radius={[10, 10, 0, 0]} onClick={handlePlotClick} />
        );
    }

    return (
        <BarChart
            style={{ width: '100%', maxWidth: width, maxHeight: '400px', aspectRatio: 1.618 }}
            responsive
            data={data}
            margin={{
                top: 5,
                right: 0,
                left: 0,
                bottom: 5,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis width="auto" />
            <Tooltip />
            <Legend />
            {bars}
        </BarChart>
    );
}
