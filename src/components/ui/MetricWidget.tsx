import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface MetricWidgetProps {
  label: string;
  value: string | number;
  unit?: string;
  status?: 'normal' | 'warn' | 'crit';
}

export function MetricWidget({ label, value, unit, status = 'normal' }: MetricWidgetProps) {
  return (
    <div className="bg-bg border border-border rounded-md px-3 py-2 flex flex-col justify-center">
      <div className="text-[10px] tracking-widest text-dim uppercase mb-1">{label}</div>
      <div className="flex items-baseline">
        <motion.div 
          key={value}
          initial={{ y: -5, opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "font-mono text-2xl font-semibold",
            status === 'normal' && "text-white",
            status === 'warn' && "text-yellow",
            status === 'crit' && "text-red drop-shadow-[0_0_8px_rgba(255,51,85,0.6)]"
          )}
        >
          {value}
        </motion.div>
        {unit && <span className="font-mono text-[10px] text-dim ml-1">{unit}</span>}
      </div>
    </div>
  );
}
