"use client";

import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { EnergyData, HistoryData, PowerHistoryData } from '@/lib/types';

const DEFAULT_TARIFA = 0.90;
const DEFAULT_INITIAL_READING = 0;

export function useEnergyData() {
  const { toast } = useToast();
  const [energyData, setEnergyData] = useState<EnergyData | null>(null);
  const [rawHistory, setRawHistory] = useState<HistoryData>({});
  const [powerHistory, setPowerHistory] = useState<PowerHistoryData>({});
  const [tariff, setTariff] = useState<number>(DEFAULT_TARIFA);
  const [initialReading, setInitialReading] = useState<number>(DEFAULT_INITIAL_READING);
  
  // Configurações de Ciclo
  const [previousReadingDate, setPreviousReadingDate] = useState<string>(''); // Data que iniciou a fatura anterior
  const [lastReadingDate, setLastReadingDate] = useState<string>('');     // Data que fechou a fatura anterior e iniciou a atual
  const [nextReadingDate, setNextReadingDate] = useState<string>('');     // Previsão de fechamento da atual
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }

    const energyRef = ref(db, 'casa/energia');
    const historyRef = ref(db, 'historico');
    const powerHistoryRef = ref(db, 'historico_potencia');
    const tariffRef = ref(db, '/config/tarifa');
    const initialReadingRef = ref(db, '/config/leituraInicial');
    const previousReadingDateRef = ref(db, '/config/dataPenultimaLeitura');
    const lastReadingDateRef = ref(db, '/config/dataUltimaLeitura');
    const nextReadingDateRef = ref(db, '/config/dataProximaLeitura');

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

    const unsubscribePowerHistory = onValue(powerHistoryRef, (snapshot) => {
      if (snapshot.exists()) {
        setPowerHistory(snapshot.val());
      }
    });

    const unsubscribeTariff = onValue(tariffRef, (snapshot) => {
      if (snapshot.exists()) setTariff(snapshot.val());
    });

    const unsubscribeInitialReading = onValue(initialReadingRef, (snapshot) => {
      if (snapshot.exists()) setInitialReading(snapshot.val());
    });

    const unsubscribePreviousDate = onValue(previousReadingDateRef, (snapshot) => {
      if (snapshot.exists()) setPreviousReadingDate(snapshot.val());
    });

    const unsubscribeLastDate = onValue(lastReadingDateRef, (snapshot) => {
      if (snapshot.exists()) setLastReadingDate(snapshot.val());
    });

    const unsubscribeNextDate = onValue(nextReadingDateRef, (snapshot) => {
      if (snapshot.exists()) setNextReadingDate(snapshot.val());
    });

    return () => {
      off(energyRef);
      off(historyRef);
      off(powerHistoryRef);
      off(tariffRef);
      off(initialReadingRef);
      off(previousReadingDateRef);
      off(lastReadingDateRef);
      off(nextReadingDateRef);
    };
  }, []);

  return { 
    energyData, 
    rawHistory, 
    powerHistory,
    tariff, 
    initialReading, 
    previousReadingDate,
    lastReadingDate,
    nextReadingDate,
    isLoading 
  };
}
