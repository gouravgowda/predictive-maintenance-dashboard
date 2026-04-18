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
    fetch(`${API_URL}/history/${machineId}`, {
      headers: { "ngrok-skip-browser-warning": "true" }
    })
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

    const connect = async () => {
      try {
        const response = await fetch(`${API_URL}/stream/${machineId}`, {
          headers: { 
            "ngrok-skip-browser-warning": "true",
            "Accept": "text/event-stream"
          }
        });
        
        if (!response.body) return;
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const dataString = line.slice(6).trim();
                if (!dataString) continue;
                const reading: SensorReading = JSON.parse(dataString);
                
                if (!isMounted) return;
                setLatestReading(reading);
                
                const newHistory = [...historyRef.current, reading].slice(-MAX_HISTORY);
                historyRef.current = newHistory;
                setHistory(newHistory);
              } catch (err) {
                // Ignore parse errors from chunk fragmentation
              }
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setTimeout(connect, 3000);
        }
      }
    };

    connect();

    return () => {
      isMounted = false;
    };
  }, [machineId, API_URL]);

  return { latestReading, history };
}
