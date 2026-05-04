"use client";

import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { EnergyData, HistoryData } from '@/lib/types';

const DEFAULT_TARIFA = 0.90;
const DEFAULT_INITIAL_READING = 0;

export function useEnergyData() {
  const { toast } = useToast();
  const [energyData, setEnergyData] = useState<EnergyData | null>(null);
  const [rawHistory, setRawHistory] = useState<HistoryData>({});
  const [tariff, setTariff] = useState<number>(DEFAULT_TARIFA);
  const [initialReading, setInitialReading] = useState<number>(DEFAULT_INITIAL_READING);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }

    const energyRef = ref(db, 'casa/energia');
    const historyRef = ref(db, 'historico');
    const tariffRef = ref(db, '/config/tarifa');
    const initialReadingRef = ref(db, '/config/leituraInicial');

    const unsubscribeEnergy = onValue(energyRef, (snapshot) => {
      if (snapshot.exists()) {
        setEnergyData(snapshot.val());
      }
      setIsLoading(false);
    });

    const unsubscribeHistory = onValue(historyRef, (snapshot) => {
      if (snapshot.exists()) {
        setRawHistory(snapshot.val());
      }
    });

    const unsubscribeTariff = onValue(tariffRef, (snapshot) => {
      if (snapshot.exists()) {
        setTariff(snapshot.val());
      }
    });

    const unsubscribeInitialReading = onValue(initialReadingRef, (snapshot) => {
      if (snapshot.exists()) {
        setInitialReading(snapshot.val());
      }
    });

    return () => {
      off(energyRef);
      off(historyRef);
      off(tariffRef);
      off(initialReadingRef);
    };
  }, []);

  return { 
    energyData, 
    rawHistory, 
    tariff, 
    setTariff, 
    initialReading, 
    setInitialReading, 
    isLoading 
  };
}
