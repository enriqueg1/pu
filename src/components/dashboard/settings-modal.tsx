"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newTariff: number, newInitialReading: number) => void;
  initialTariff: number;
  initialInitialReading: number;
};

export function SettingsModal({
  isOpen,
  onClose,
  onSave,
  initialTariff,
  initialInitialReading,
}: SettingsModalProps) {
  const [tariffValue, setTariffValue] = useState(initialTariff.toFixed(4));
  const [initialReadingValue, setInitialReadingValue] = useState(initialInitialReading.toFixed(2));

  useEffect(() => {
    if (isOpen) {
      setTariffValue(initialTariff.toFixed(4));
      setInitialReadingValue(initialInitialReading.toFixed(2));
    }
  }, [initialTariff, initialInitialReading, isOpen]);

  const handleSave = () => {
    const newTariff = parseFloat(tariffValue);
    const newInitialReading = parseFloat(initialReadingValue);
    
    const isTariffValid = !isNaN(newTariff) && newTariff > 0;
    const isInitialReadingValid = !isNaN(newInitialReading) && newInitialReading >= 0;

    if (isTariffValid && isInitialReadingValid) {
      onSave(newTariff, newInitialReading);
    }
  };
  
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
        setter(value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription>
            Ajuste as configurações do seu dashboard de energia.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tarifa" className="text-right">
              Tarifa (R$/kWh)
            </Label>
            <Input
              id="tarifa"
              type="text"
              value={tariffValue}
              onChange={handleInputChange(setTariffValue)}
              className="col-span-3"
              placeholder="Ex: 0.90"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="leitura-inicial" className="text-right text-xs sm:text-sm">
              Leitura Inicial (kWh)
            </Label>
            <Input
              id="leitura-inicial"
              type="text"
              value={initialReadingValue}
              onChange={handleInputChange(setInitialReadingValue)}
              className="col-span-3"
              placeholder="Ex: 12345.6"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
