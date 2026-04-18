import { useState, useEffect, useRef } from 'react';
import type { SensorReading } from '../components/MachineCard';

const MAX_HISTORY = 60; // Keep 60 points for the sparkline chart

export function useMachineStream(machineId: string) {
  const [latestReading, setLatestReading] = useState<SensorReading | undefined>();
  const [history, setHistory] = useState<SensorReading[]>([]);
  const API_URL = import.meta.env.VITE_API_URL;
  
  const historyRef = useRef<SensorReading[]>([]);

  useEffect(() => {
    let es: EventSource | null = null;
    let isMounted = true;

    // Fetch initial history to avoid empty chart at load
    fetch(`${API_URL}/history/${machineId}`)
      .then(res => res.json())
      .then((data: SensorReading[]) => {
        if (!isMounted) return;
        const recent = data.slice(-MAX_HISTORY);
        historyRef.current = recent;
        setHistory(recent);
        if (recent.length > 0 && !latestReading) {
           setLatestReading(recent[recent.length - 1]);
        }
      })
      .catch(e => console.error(e));

    const connect = () => {
      es = new EventSource(`${API_URL}/stream/${machineId}`);

      es.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const reading: SensorReading = JSON.parse(event.data);
          
          setLatestReading(reading);
          
          const newHistory = [...historyRef.current, reading].slice(-MAX_HISTORY);
          historyRef.current = newHistory;
          setHistory(newHistory);
        } catch (err) {
          console.error("Error parsing stream data", err);
        }
      };

      es.onerror = () => {
        es?.close();
        if (isMounted) {
          setTimeout(connect, 3000);
        }
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (es) es.close();
    };
  }, [machineId, API_URL]);

  return { latestReading, history };
}
