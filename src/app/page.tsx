"use client";

import { useEnergyData } from '@/hooks/use-energy-data';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { MetricCard } from '@/components/dashboard/metric-card';
import { HistoryChart } from '@/components/dashboard/history-chart';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { Zap, PlugZap, AreaChart } from 'lucide-react';
import type { EnergyData } from '@/lib/types';

const COST_PER_KWH = 0.90;

export default function Home() {
  const { energyData, historyData, isLoading } = useEnergyData();

  if (isLoading || !energyData) {
    return <DashboardSkeleton />;
  }

  const {
    potencia_atual_watts,
    consumo_hoje_kwh,
    consumo_total_kwh,
    ultima_atualizacao
  } = energyData as EnergyData;

  const costToday = (consumo_hoje_kwh * COST_PER_KWH).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const isPowerHigh = potencia_atual_watts > 4000;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4 md:p-8">
        <DashboardHeader lastUpdateTimestamp={ultima_atualizacao} />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          <MetricCard
            title="Potência Atual"
            icon={Zap}
            value={potencia_atual_watts.toFixed(1)}
            unit="W"
            valueClassName={isPowerHigh ? 'text-destructive' : 'text-primary'}
            footerText={isPowerHigh ? "Consumo elevado!" : "Consumo normal"}
          />
          <MetricCard
            title="Consumo Hoje"
            icon={PlugZap}
            value={consumo_hoje_kwh.toFixed(2)}
            unit="kWh"
            valueClassName="text-accent"
            footerText={`Custo estimado: ${costToday}`}
          />
          <MetricCard
            title="Consumo Total"
            icon={AreaChart}
            value={consumo_total_kwh.toFixed(1)}
            unit="kWh"
          />
        </div>

        <div className="mt-8">
          <HistoryChart data={historyData} />
        </div>

        <footer className="text-center mt-12 text-muted-foreground text-sm">
          <p>EnerDash - Feito com ❤️ para monitoramento de energia.</p>
        </footer>
      </div>
    </main>
  );
}
