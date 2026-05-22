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
import { ScrollArea } from '@/components/ui/scroll-area';

type SettingsValues = {
  tariff: number;
  initialReading: number;
  lastReadingDate: string;
  nextReadingDate: string;
  monthlyGoal: number;
  lastInvoiceReading: number;
};

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: SettingsValues) => void;
  initialValues: SettingsValues;
};

export function SettingsModal({
  isOpen,
  onClose,
  onSave,
  initialValues,
}: SettingsModalProps) {
  const [tariffValue, setTariffValue] = useState(initialValues.tariff.toString());
  const [initialReadingValue, setInitialReadingValue] = useState(initialValues.initialReading.toString());
  const [lastReadingDate, setLastReadingDate] = useState(initialValues.lastReadingDate);
  const [nextReadingDate, setNextReadingDate] = useState(initialValues.nextReadingDate);
  const [monthlyGoal, setMonthlyGoal] = useState(initialValues.monthlyGoal.toString());
  const [lastInvoiceReading, setLastInvoiceReading] = useState(initialValues.lastInvoiceReading.toString());

  useEffect(() => {
    if (isOpen) {
      setTariffValue(initialValues.tariff.toString());
      setInitialReadingValue(initialValues.initialReading.toString());
      setLastReadingDate(initialValues.lastReadingDate || '');
      setNextReadingDate(initialValues.nextReadingDate || '');
      setMonthlyGoal(initialValues.monthlyGoal.toString());
      setLastInvoiceReading(initialValues.lastInvoiceReading.toString());
    }
  }, [initialValues, isOpen]);

  const handleSave = () => {
    onSave({
      tariff: parseFloat(tariffValue) || 0,
      initialReading: parseFloat(initialReadingValue) || 0,
      lastReadingDate: lastReadingDate,
      nextReadingDate: nextReadingDate,
      monthlyGoal: parseFloat(monthlyGoal) || 0,
      lastInvoiceReading: parseFloat(lastInvoiceReading) || 0,
    });
  };
  
  const handleNumericChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
        setter(value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription>
            Ajuste os parâmetros para cálculos de custo e ciclo de faturamento.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] px-6 py-4">
          <div className="grid gap-6 pr-4">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Financeiro</h4>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tarifa" className="text-right text-xs">Tarifa (R$/kWh)</Label>
                <Input id="tarifa" value={tariffValue} onChange={handleNumericChange(setTariffValue)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="meta" className="text-right text-xs">Meta Mensal (kWh)</Label>
                <Input id="meta" value={monthlyGoal} onChange={handleNumericChange(setMonthlyGoal)} className="col-span-3" />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Leituras</h4>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="leitura-inicial" className="text-right text-xs">Leitura Medidor (kWh)</Label>
                <Input id="leitura-inicial" value={initialReadingValue} onChange={handleNumericChange(setInitialReadingValue)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="leitura-fatura" className="text-right text-xs">Fatura Anterior (kWh)</Label>
                <Input id="leitura-fatura" value={lastInvoiceReading} onChange={handleNumericChange(setLastInvoiceReading)} className="col-span-3" />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Ciclo de Cobrança</h4>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="data-inicio" className="text-right text-xs">Última Leitura</Label>
                <Input id="data-inicio" type="date" value={lastReadingDate} onChange={(e) => setLastReadingDate(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="data-fim" className="text-right text-xs">Próxima Leitura</Label>
                <Input id="data-fim" type="date" value={nextReadingDate} onChange={(e) => setNextReadingDate(e.target.value)} className="col-span-3" />
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}