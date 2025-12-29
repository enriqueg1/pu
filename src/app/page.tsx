"use client";

import { useState } from 'react';
import { useEnergyData } from '@/hooks/use-energy-data';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { MetricCard } from '@/components/dashboard/metric-card';
import { HistoryChart } from '@/components/dashboard/history-chart';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { SettingsModal } from '@/components/dashboard/settings-modal';
import { Zap, PlugZap, AreaChart } from 'lucide-react';
import type { EnergyData } from '@/lib/types';
import { ref, set } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { energyData, historyData, tariff, setTariff, isLoading } = useEnergyData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

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

  const isPowerHigh = potencia_atual_watts > 4000;

  const handleSaveTariff = async (newTariff: number) => {
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
      setTariff(newTariff);
      toast({
        title: "Sucesso!",
        description: "O valor da tarifa foi atualizado.",
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar a tarifa: ", error);
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível atualizar o valor da tarifa. Tente novamente.",
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
          <p>Consumo de Energia - Feito com ❤️ para monitoramento de energia.</p>
        </footer>
      </div>
      <SettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTariff}
        initialTariff={tariff}
      />
    </main>
  );
}
