"use client";

import { useState, useMemo } from 'react';
import { useEnergyData } from '@/hooks/use-energy-data';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { MetricCard } from '@/components/dashboard/metric-card';
import { HistoryChart } from '@/components/dashboard/history-chart';
import { PowerHistoryChart } from '@/components/dashboard/power-history-chart';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { SettingsModal } from '@/components/dashboard/settings-modal';
import { Zap, PlugZap, AreaChart, CalendarDays } from 'lucide-react';
import type { EnergyData } from '@/lib/types';
import { ref, set } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function Home() {
  const { 
    energyData, 
    rawHistory, 
    powerHistory,
    tariff, 
    setTariff, 
    initialReading,
    setInitialReading,
    isLoading 
  } = useEnergyData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const currentMonthData = useMemo(() => {
    const currentMonthKey = format(new Date(), 'MMyyyy');
    let monthlyKWh = 0;
    
    Object.entries(rawHistory).forEach(([key, value]) => {
      if (key.endsWith(currentMonthKey)) {
        monthlyKWh += value;
      }
    });

    return {
      kwh: monthlyKWh,
      cost: monthlyKWh * tariff
    };
  }, [rawHistory, tariff]);

  if (isLoading || !energyData) {
    return <DashboardSkeleton />;
  }

  const {
    potencia_atual_watts,
    consumo_hoje_kwh,
    consumo_total_kwh,
    ultima_atualizacao
  } = energyData as EnergyData;

  const costToday = (consumo_hoje_kwh * tariff).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  
  const totalConsumptionWithOffset = consumo_total_kwh + initialReading;
  const isPowerHigh = potencia_atual_watts > 4000;

  const handleSaveSettings = async (newTariff: number, newInitialReading: number) => {
    if (!db) {
      toast({
        title: "Erro de Conexão",
        description: "A conexão com o banco de dados não foi estabelecida.",
        variant: "destructive",
      });
      return;
    }
    try {
      await set(ref(db, '/config/tarifa'), newTariff);
      await set(ref(db, '/config/leituraInicial'), newInitialReading);
      
      setTariff(newTariff);
      setInitialReading(newInitialReading);
      
      toast({
        title: "Sucesso!",
        description: "As configurações foram atualizadas.",
      });
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível atualizar as configurações.",
        variant: "destructive",
      });
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4 md:p-8">
        <DashboardHeader
          lastUpdateTimestamp={ultima_atualizacao}
          onSettingsClick={() => setIsModalOpen(true)}
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-8">
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
            title="Consumo Mês"
            icon={CalendarDays}
            value={currentMonthData.kwh.toFixed(1)}
            unit="kWh"
            footerText={`Custo: ${currentMonthData.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
          />
          <MetricCard
            title="Consumo Total"
            icon={AreaChart}
            value={totalConsumptionWithOffset.toFixed(1)}
            unit="kWh"
          />
        </div>

        <div className="mt-8 space-y-8">
          <HistoryChart rawHistory={rawHistory} tariff={tariff} />
          <PowerHistoryChart powerHistory={powerHistory} />
        </div>

        <footer className="text-center mt-12 text-muted-foreground text-sm">
          <p>Consumo de Energia - Feito com ❤️ para monitoramento residencial.</p>
        </footer>
      </div>
      <SettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSettings}
        initialTariff={tariff}
        initialInitialReading={initialReading}
      />
    </main>
  );
}
