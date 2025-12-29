"use client";

import { useState, useEffect } from 'react';

type DashboardHeaderProps = {
  lastUpdateTimestamp: number | undefined;
};

export function DashboardHeader({ lastUpdateTimestamp }: DashboardHeaderProps) {
  const [status, setStatus] = useState<'online' | 'offline' | 'unknown'>('unknown');

  useEffect(() => {
    const checkStatus = () => {
      if (typeof lastUpdateTimestamp !== 'number') {
        setStatus('unknown');
        return;
      }
      const now = Date.now() / 1000;
      const isOnline = (now - lastUpdateTimestamp) < 60;
      setStatus(isOnline ? 'online' : 'offline');
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [lastUpdateTimestamp]);

  const getStatusInfo = () => {
    switch (status) {
      case 'online':
        return {
          color: 'bg-primary animate-pulse-online',
          text: 'Online',
        };
      case 'offline':
        return {
          color: 'bg-destructive',
          text: 'Offline',
        };
      default:
        return {
          color: 'bg-muted-foreground',
          text: 'Verificando...',
        };
    }
  };

  const { color, text } = getStatusInfo();

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl md:text-4xl font-black text-foreground font-headline">
        EnerDash
      </h1>
      <div className="flex items-center gap-3 bg-card/50 px-4 py-2 rounded-full border border-white/10">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <span className="text-sm font-medium text-muted-foreground">{text}</span>
      </div>
    </div>
  );
}
