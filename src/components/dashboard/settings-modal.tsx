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
  onSave: (newTariff: number) => void;
  initialTariff: number;
};

export function SettingsModal({
  isOpen,
  onClose,
  onSave,
  initialTariff,
}: SettingsModalProps) {
  const [tariffValue, setTariffValue] = useState(initialTariff.toFixed(4));

  useEffect(() => {
    setTariffValue(initialTariff.toFixed(4));
  }, [initialTariff, isOpen]);

  const handleSave = () => {
    const newTariff = parseFloat(tariffValue);
    if (!isNaN(newTariff) && newTariff > 0) {
      onSave(newTariff);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and a single dot
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
        setTariffValue(value);
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
              type="text" // Use text to allow for more flexible input formatting control
              value={tariffValue}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="Ex: 0.90"
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
