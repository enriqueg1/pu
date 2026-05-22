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
import { format, parse, isWithinInterval, startOfMonth, endOfMonth, parseISO } from 'date-fns';

export default function Home() {
  const { 
    energyData, 
    rawHistory, 
    powerHistory,
    tariff, 
    initialReading,
    lastReadingDate,
    nextReadingDate,
    monthlyGoal,
    lastInvoiceReading,
    isLoading 
  } = useEnergyData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const currentMonthData = useMemo(() => {
    let monthlyKWh = 0;
    
    // Se tivermos datas de leitura, usamos esse intervalo para o cálculo do "Mês"
    if (lastReadingDate && nextReadingDate) {
      const start = parseISO(lastReadingDate);
      const end = parseISO(nextReadingDate);
      
      Object.entries(rawHistory).forEach(([key, value]) => {
        const date = parse(key, 'ddMMyyyy', new Date());
        if (isWithinInterval(date, { start, end })) {
          monthlyKWh += value;
        }
      });
    } else {
      // Caso contrário, usa o mês civil atual como padrão
      const currentMonthKey = format(new Date(), 'MMyyyy');
      Object.entries(rawHistory).forEach(([key, value]) => {
        if (key.endsWith(currentMonthKey)) {
          monthlyKWh += value;
        }
      });
    }

    return {
      kwh: monthlyKWh,
      cost: monthlyKWh * tariff
    };
  }, [rawHistory, tariff, lastReadingDate, nextReadingDate]);

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

  const handleSaveSettings = async (values: any) => {
    if (!db) {
      toast({ title: "Erro de Conexão", description: "Firebase não inicializado.", variant: "destructive" });
      return;
    }
    
    try {
      await set(ref(db, '/config/tarifa'), values.tariff);
      await set(ref(db, '/config/leituraInicial'), values.initialReading);
      await set(ref(db, '/config/dataUltimaLeitura'), values.lastReadingDate);
      await set(ref(db, '/config/dataProximaLeitura'), values.nextReadingDate);
      await set(ref(db, '/config/metaMensal'), values.monthlyGoal);
      await set(ref(db, '/config/leituraFaturaAnterior'), values.lastInvoiceReading);
      
      toast({ title: "Sucesso!", description: "Configurações atualizadas." });
      setIsModalOpen(false);
    } catch (error) {
      toast({ title: "Erro ao Salvar", description: "Falha na comunicação com o banco.", variant: "destructive" });
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4 md:p-8">
        <DashboardHeader
          lastUpdateTimestamp={ultima_atualizacao}
          onSettingsClick={() => setIsModalOpen(true)}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mt-6 md:mt-8">
          <MetricCard
            title="Potência"
            icon={Zap}
            value={potencia_atual_watts.toFixed(0)}
            unit="W"
            valueClassName={isPowerHigh ? 'text-destructive' : 'text-primary'}
            footerText={isPowerHigh ? "Elevado!" : "Normal"}
          />
          <MetricCard
            title="Hoje"
            icon={PlugZap}
            value={consumo_hoje_kwh.toFixed(2)}
            unit="kWh"
            valueClassName="text-accent"
            footerText={`Custo: ${costToday}`}
          />
          <MetricCard
            title={lastReadingDate ? "Ciclo Atual" : "Este Mês"}
            icon={CalendarDays}
            value={currentMonthData.kwh.toFixed(1)}
            unit="kWh"
            footerText={`R$ ${currentMonthData.cost.toFixed(2)}`}
          />
          <MetricCard
            title="Total"
            icon={AreaChart}
            value={totalConsumptionWithOffset.toFixed(1)}
            unit="kWh"
            footerText={monthlyGoal > 0 ? `Meta: ${monthlyGoal} kWh` : undefined}
          />
        </div>

        <div className="mt-6 md:mt-8 space-y-6 md:space-y-8">
          <HistoryChart rawHistory={rawHistory} tariff={tariff} />
          <PowerHistoryChart powerHistory={powerHistory} />
        </div>

        <footer className="text-center mt-12 pb-8 text-muted-foreground text-[10px] md:text-sm">
          <p>Consumo de Energia - Feito com ❤️ para monitoramento residencial.</p>
        </footer>
      </div>
      
      <SettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSettings}
        initialValues={{
          tariff,
          initialReading,
          lastReadingDate,
          nextReadingDate,
          monthlyGoal,
          lastInvoiceReading
        }}
      />
    </main>
  );
}