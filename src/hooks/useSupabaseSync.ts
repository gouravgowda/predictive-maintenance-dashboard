import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { SensorReading } from '../components/MachineCard';

export function useSupabaseSync(latestReading?: SensorReading) {
  // Use a ref to track the last inserted timestamp per machine, so we don't insert duplicates
  const lastInserted = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!latestReading) return;
    
    const mId = latestReading.machine_id;
    // Deduplicate by hashing the actual sensor values, preventing back-to-back duplicate inserts
    const dataHash = `${latestReading.temperature_C.toFixed(2)}_${latestReading.vibration_mm_s.toFixed(2)}_${latestReading.rpm}`;

    if (lastInserted.current[mId] === dataHash) {
      return; // already synced this exact reading
    }

    lastInserted.current[mId] = dataHash;

    // 1. Insert the reading into historical data
    supabase
      .from('sensor_readings')
      .insert({
        machine_id: latestReading.machine_id,
        timestamp: latestReading.timestamp,
        temperature_c: latestReading.temperature_C,
        vibration_mm_s: latestReading.vibration_mm_s,
        rpm: latestReading.rpm,
        current_a: latestReading.current_A,
        status: latestReading.status
      })
      .then(({ error }) => {
        if (error) console.error("Error saving reading:", error);
      });

    // 2. Alert logic
    if (latestReading.status === 'fault' || latestReading.temperature_C > 100 || latestReading.vibration_mm_s > 5) {
      // Calculate a heuristic float risk score for the alert log to show varied critical ranges
      let approxRisk = 0.5;
      if (latestReading.vibration_mm_s > 6 || latestReading.temperature_C > 110) {
        approxRisk = 0.90 + Math.random() * 0.09; // 90-99%
      } else if (latestReading.vibration_mm_s > 4.5 || latestReading.temperature_C > 85) {
        approxRisk = 0.72 + Math.random() * 0.15; // 72-87%
      } else {
        approxRisk = 0.60 + Math.random() * 0.10; // 60-70%
      }

      // Create an alert
      const reason = `Critical fault detected: Temp ${latestReading.temperature_C.toFixed(1)}°C, Vib ${latestReading.vibration_mm_s.toFixed(2)}mm/s`;
      
      // We throttle alerts on the frontend to maybe 1 per 30 seconds per machine in a real app,
      // but for this hackathon, we can just insert them or add a simple throttle.
      const lastAlertKey = `alert_${mId}`;
      const lastAlertTime = sessionStorage.getItem(lastAlertKey);
      const now = Date.now();
      
      if (!lastAlertTime || (now - Number(lastAlertTime) > 30000)) {
        sessionStorage.setItem(lastAlertKey, now.toString());

        // Save to Supabase
        supabase
          .from('alerts')
          .insert({
            machine_id: mId,
            reason: reason,
            reading: latestReading,
            risk_score: approxRisk
          })
          .then(({ error }) => {
            if (!error) console.log("🚨 Alert saved to Supabase:", reason);
          });
          
        // Post to external ngrok API as required by hackathon rules
        fetch(`${import.meta.env.VITE_API_URL}/alert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            machine_id: mId,
            risk_score: approxRisk,
            reason: reason
          })
        }).catch(err => console.error("Error posting alert to ngrok:", err));
      }
    }
  }, [latestReading]);
}
