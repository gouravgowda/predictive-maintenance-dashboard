import React from 'react';
import { Badge } from './ui/Badge';
import { MetricWidget } from './ui/MetricWidget';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

export interface SensorReading {
  machine_id: string;
  timestamp: string;
  temperature_C: number;
  vibration_mm_s: number;
  rpm: number;
  current_A: number;
  status: 'running' | 'warning' | 'fault' | 'waiting';
}

interface MachineCardProps {
  machineId: string;
  latestReading?: SensorReading;
  history?: Pick<SensorReading, 'vibration_mm_s' | 'timestamp'>[];
}

export function MachineCard({ machineId, latestReading, history = [] }: MachineCardProps) {
  const tStatus = latestReading ? (latestReading.temperature_C > 100 ? 'crit' : latestReading.temperature_C > 85 ? 'warn' : 'normal') : 'normal';
  const vStatus = latestReading ? (latestReading.vibration_mm_s > 5 ? 'crit' : latestReading.vibration_mm_s > 3 ? 'warn' : 'normal') : 'normal';
  const cStatus = latestReading ? (latestReading.current_A > 22 ? 'crit' : latestReading.current_A > 18 ? 'warn' : 'normal') : 'normal';

  const chartColor = vStatus === 'crit' ? '#ff3355' : vStatus === 'warn' ? '#ffcc00' : '#00ff88';

  return (
    <div className="bg-surface p-5 sm:p-6 h-[320px] flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-2xl font-black tracking-wider text-white uppercase">{machineId}</div>
          <div className="font-mono text-xs text-dim mt-1">SSE → /stream/{machineId}</div>
        </div>
        <Badge status={latestReading?.status || 'waiting'}>
          {latestReading?.status || 'Connecting...'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 shrink-0">
        <MetricWidget label="Temperature" value={latestReading ? latestReading.temperature_C.toFixed(1) : '—'} unit="°C" status={tStatus} />
        <MetricWidget label="Vibration" value={latestReading ? latestReading.vibration_mm_s.toFixed(2) : '—'} unit="mm/s" status={vStatus} />
        <MetricWidget label="RPM" value={latestReading ? latestReading.rpm : '—'} unit="rpm" />
        <MetricWidget label="Current" value={latestReading ? latestReading.current_A.toFixed(1) : '—'} unit="A" status={cStatus} />
      </div>

      <div className="mb-3 flex-grow relative min-h-[40px]">
        <div className="absolute inset-0 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <YAxis domain={['auto', 'auto']} hide />
              <Line 
                type="step" 
                dataKey="vibration_mm_s" 
                stroke={chartColor} 
                strokeWidth={1.5} 
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="font-mono text-[10px] text-dim shrink-0 pt-2 border-t border-border mt-1">
        {latestReading?.timestamp ? new Date(latestReading.timestamp).toLocaleTimeString() : 'Waiting for first reading...'}
      </div>
    </div>
  );
}
