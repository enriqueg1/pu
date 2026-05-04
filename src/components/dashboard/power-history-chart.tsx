"use client";

import { useState, useMemo } from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Zap } from 'lucide-react';
import { format, startOfDay } from 'date-fns';
import type { PowerHistory, PowerDataPoint } from '@/lib/types';

type PowerHistoryChartProps = {
  powerHistory: PowerHistory;
};

export function PowerHistoryChart({ powerHistory }: PowerHistoryChartProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const chartData = useMemo(() => {
    if (!selectedDate) return [];
    
    const dateKey = format(selectedDate, 'ddMMyyyy');
    const dayData = powerHistory[dateKey];
    
    if (!dayData) return [];

    // Sort times and format for the chart
    return Object.entries(dayData)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([time, power]) => {
        // Format hhmm to hh:mm
        const hh = time.padStart(4, '0').substring(0, 2);
        const mm = time.padStart(4, '0').substring(2, 4);
        return {
          time: `${hh}:${mm}`,
          power: Number(power.toFixed(1))
        };
      });
  }, [powerHistory, selectedDate]);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-white/10 shadow-lg mt-8">
      <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 space-y-0 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base font-medium text-muted-foreground">
              Perfil de Carga (Potência)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Oscilação da potência em Watts ao longo do dia</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-xs gap-2 bg-background/50 border-white/10">
                <CalendarIcon className="h-3.5 w-3.5" />
                {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Selecionar dia'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar 
                mode="single" 
                selected={selectedDate} 
                onSelect={setSelectedDate} 
                initialFocus 
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={30}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(v) => `${v}W`} 
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-card/90 backdrop-blur-md p-3 shadow-xl space-y-1">
                          <p className="text-xs font-bold border-b border-white/10 pb-1 mb-1">Horário: {payload[0].payload.time}</p>
                          <div className="flex justify-between gap-4 text-xs">
                            <span className="text-primary font-medium">Potência:</span>
                            <span className="font-bold">{payload[0].value} Watts</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="power" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorPower)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Zap className="h-8 w-8 opacity-20" />
              <p className="text-sm">Nenhum dado de potência para este dia.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
