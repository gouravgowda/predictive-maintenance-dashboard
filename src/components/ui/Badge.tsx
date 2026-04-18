import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

type BadgeStatus = 'running' | 'warning' | 'fault' | 'waiting';

interface BadgeProps {
  status: BadgeStatus;
  children: React.ReactNode;
}

export function Badge({ status, children }: BadgeProps) {
  const styles: Record<BadgeStatus, string> = {
    running: 'bg-green/10 text-green border-green/25 border',
    warning: 'bg-yellow/10 text-yellow border-yellow/25 border',
    fault: 'bg-red/15 text-red border-red/30 border animate-pulse shadow-[0_0_10px_rgba(255,51,85,0.4)]',
    waiting: 'bg-dim/15 text-dim border-dim/25 border',
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      key={status}
      className={cn(
        "font-mono text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-sm uppercase whitespace-nowrap",
        styles[status]
      )}
    >
      {children}
    </motion.span>
  );
}
