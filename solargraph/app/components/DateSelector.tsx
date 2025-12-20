'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DateSelectorProps {
  defaultStart: string;
  defaultEnd: string;
}

export default function DateSelector({ defaultStart, defaultEnd }: DateSelectorProps) {
  const router = useRouter();
  
  // Convert ISO strings to datetime-local format (YYYY-MM-DDTHH:mm)
  const formatForInput = (isoString: string) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [startDate, setStartDate] = useState(() => formatForInput(defaultStart));
  const [endDate, setEndDate] = useState(() => formatForInput(defaultEnd));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert datetime-local format back to ISO string
    const startISO = new Date(startDate).toISOString();
    const endISO = new Date(endDate).toISOString();

    // Update URL with new search params
    const params = new URLSearchParams();
    params.set('start_timestamp', startISO);
    params.set('end_timestamp', endISO);
    router.push(`?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'end', flexWrap: 'wrap' }}>
        <div>
          <label htmlFor="start_timestamp" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Start Timestamp:
          </label>
          <input
            type="datetime-local"
            id="start_timestamp"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div>
          <label htmlFor="end_timestamp" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            End Timestamp:
          </label>
          <input
            type="datetime-local"
            id="end_timestamp"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            height: 'fit-content'
          }}
        >
          Update
        </button>
      </div>
    </form>
  );
}
