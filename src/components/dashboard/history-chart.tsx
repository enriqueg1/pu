"use client";

import { useState, useMemo } from 'react';
import { Bar, ComposedChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, FilterX } from 'lucide-react';
import { format, parse, isWithinInterval, startOfDay, endOfDay, startOfWeek, startOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { HistoryData, ChartDataPoint } from '@/lib/types';

type HistoryChartProps = {
  rawHistory: HistoryData;
  tariff: number;
};

type ViewType = 'day' | 'week' | 'month';

export function HistoryChart({ rawHistory, tariff }: HistoryChartProps) {
  const [view, setView] = useState<ViewType>('day');
  const [startDate, setStartDate] = useState<Date | undefined>(startOfDay(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)));
  const [endDate, setEndDate] = useState<Date | undefined>(endOfDay(new Date()));

  const chartData = useMemo(() => {
    if (!startDate || !endDate) return [];

    const data: Record<string, number> = {};
    const sortedKeys = Object.keys(rawHistory).sort((a, b) => {
      const dateA = parse(a, 'ddMMyyyy', new Date());
      const dateB = parse(b, 'ddMMyyyy', new Date());
      return dateA.getTime() - dateB.getTime();
    });

    sortedKeys.forEach(key => {
      const date = parse(key, 'ddMMyyyy', new Date());
      if (isWithinInterval(date, { start: startDate, end: endDate })) {
        let groupKey = '';
        if (view === 'day') groupKey = format(date, 'dd/MM');
        else if (view === 'week') groupKey = `Sem ${format(startOfWeek(date), 'dd/MM')}`;
        else groupKey = format(startOfMonth(date), 'MMM/yy', { locale: ptBR });

        data[groupKey] = (data[groupKey] || 0) + rawHistory[key];
      }
    });

    let cumulativeConsumption = 0;
    return Object.entries(data).map(([date, consumo]) => {
      cumulativeConsumption += consumo;
      return {
        date,
        consumo: Number(consumo.toFixed(2)),
        custoAcumulado: Number((cumulativeConsumption * tariff).toFixed(2))
      };
    });
  }, [rawHistory, view, startDate, endDate, tariff]);

  const resetFilters = () => {
    setStartDate(startOfDay(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)));
    setEndDate(endOfDay(new Date()));
    setView('day');
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-white/10 shadow-lg">
      <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 space-y-0 pb-6">
        <div>
          <CardTitle className="text-base font-medium text-muted-foreground">
            Histórico de Consumo e Custos
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Barras: Consumo (kWh) | Linha: Custo (R$)</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as ViewType)} className="h-9">
            <TabsList className="bg-background/50 border border-white/10">
              <TabsTrigger value="day" className="text-xs">Dia</TabsTrigger>
              <TabsTrigger value="week" className="text-xs">Sem</TabsTrigger>
              <TabsTrigger value="month" className="text-xs">Mês</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-1 bg-background/50 border border-white/10 p-1 rounded-md">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2 gap-2">
                  <CalendarIcon className="h-3 w-3" />
                  {startDate ? format(startDate, 'dd/MM/yy') : 'Início'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
              </PopoverContent>
            </Popover>
            <span className="text-muted-foreground text-xs">-</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2 gap-2">
                  {endDate ? format(endDate, 'dd/MM/yy') : 'Fim'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <Button variant="outline" size="icon" className="h-9 w-9" onClick={resetFilters} title="Limpar Filtros">
            <FilterX className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}k`} />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--accent))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-card/90 backdrop-blur-md p-3 shadow-xl space-y-1">
                        <p className="text-xs font-bold border-b border-white/10 pb-1 mb-1">{payload[0].payload.date}</p>
                        <div className="flex justify-between gap-4 text-xs">
                          <span className="text-primary font-medium">Consumo:</span>
                          <span className="font-bold">{payload[0].value} kWh</span>
                        </div>
                        <div className="flex justify-between gap-4 text-xs">
                          <span className="text-accent font-medium">Custo Acum.:</span>
                          <span className="font-bold">R$ {payload[1].value}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar yAxisId="left" dataKey="consumo" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={view === 'day' ? 20 : 40} />
              <Line yAxisId="right" type="monotone" dataKey="custoAcumulado" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--accent))" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
