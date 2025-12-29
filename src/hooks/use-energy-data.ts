"use client";

import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { EnergyData, HistoryData, ChartDataPoint } from '@/lib/types';
import { subDays, format, parse } from 'date-fns';

export function useEnergyData() {
  const { toast } = useToast();
  const [energyData, setEnergyData] = useState<EnergyData | null>(null);
  const [historyData, setHistoryData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      if (isLoading) setIsLoading(false);
      return;
    }

    const energyRef = ref(db, 'casa/energia');
    const historyRef = ref(db, 'historico');

    const onEnergyValue = onValue(energyRef, (snapshot) => {
      if (snapshot.exists()) {
        setEnergyData(snapshot.val());
      } else {
        console.warn("Nenhum dado encontrado em /casa/energia. Aguardando dados...");
      }
      if(isLoading) setIsLoading(false);
    }, (error) => {
      console.error(error);
      toast({
        title: "Erro ao buscar dados em tempo real",
        description: error.message,
        variant: "destructive",
      });
      if(isLoading) setIsLoading(false);
    });

    const onHistoryValue = onValue(historyRef, (snapshot) => {
      const today = new Date();
      const last7DaysKeys = Array.from({ length: 7 }, (_, i) => format(subDays(today, i), 'ddMMyyyy')).reverse();
      
      let processedData: ChartDataPoint[] = [];
      if (snapshot.exists()) {
        const rawHistory: HistoryData = snapshot.val();
        processedData = last7DaysKeys.map(key => {
          const date = parse(key, 'ddMMyyyy', new Date());
          return {
            date: format(date, 'dd/MM'),
            consumo: rawHistory[key] || 0
          };
        });
      } else {
         console.warn("Nenhum dado encontrado em /historico. Exibindo gráfico zerado.");
         processedData = last7DaysKeys.map(key => {
            const date = parse(key, 'ddMMyyyy', new Date());
            return {
                date: format(date, 'dd/MM'),
                consumo: 0
            };
        });
      }
      setHistoryData(processedData);

    }, (error) => {
      console.error(error);
      toast({
        title: "Erro ao buscar histórico",
        description: error.message,
        variant: "destructive",
      });
    });

    return () => {
      off(energyRef, 'value', onEnergyValue);
      off(historyRef, 'value', onHistoryValue);
    };
  // The toast function is stable and doesn't need to be in the dependency array.
  // isLoading is used to prevent multiple executions, so it should be a dependency.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return { energyData, historyData, isLoading };
}
