"use client";

import { useState, useMemo } from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceArea } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, FilterX, Activity, ZoomIn, Maximize2 } from 'lucide-react';
import { format } from 'date-fns';
import type { PowerHistoryData } from '@/lib/types';

type PowerHistoryChartProps = {
  powerHistory: PowerHistoryData;
};

export function PowerHistoryChart({ powerHistory }: PowerHistoryChartProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Estados para o Zoom
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
  const [left, setLeft] = useState<string | number>('dataMin');
  const [right, setRight] = useState<string | number>('dataMax');
  const [top, setTop] = useState<string | number>('auto');
  const [bottom, setBottom] = useState<string | number>('auto');

  const rawData = useMemo(() => {
    if (!selectedDate) return [];

    const dateKey = format(selectedDate, 'ddMMyyyy');
    const dayData = powerHistory[dateKey];

    if (!dayData) return [];

    return Object.entries(dayData)
      .map(([timeKey, watts]) => {
        const hours = timeKey.substring(0, 2);
        const minutes = timeKey.substring(2, 4);
        return {
          time: `${hours}:${minutes}`,
          sortKey: parseInt(timeKey),
          watts: Number(watts.toFixed(2))
        };
      })
      .sort((a, b) => a.sortKey - b.sortKey);
  }, [powerHistory, selectedDate]);

  const zoom = () => {
    if (refAreaLeft === refAreaRight || refAreaRight === null || refAreaLeft === null) {
      setRefAreaLeft(null);
      setRefAreaRight(null);
      return;
    }

    let start = refAreaLeft;
    let end = refAreaRight;

    if (refAreaLeft > refAreaRight) {
      [start, end] = [refAreaRight, refAreaLeft];
    }

    // Encontrar o Y min/max para o período selecionado para ajustar o zoom vertical também
    const zoomData = rawData.filter(d => d.time >= start && d.time <= end);
    let yMax = 0;
    let yMin = Infinity;

    zoomData.forEach(d => {
      if (d.watts > yMax) yMax = d.watts;
      if (d.watts < yMin) yMin = d.watts;
    });

    setRefAreaLeft(null);
    setRefAreaRight(null);
    setLeft(start);
    setRight(end);
    setTop(yMax + (yMax * 0.1));
    setBottom(Math.max(0, yMin - (yMin * 0.1)));
  };

  const zoomOut = () => {
    setLeft('dataMin');
    setRight('dataMax');
    setTop('auto');
    setBottom('auto');
  };

  const resetFilter = () => {
    setSelectedDate(new Date());
    zoomOut();
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-white/10 shadow-lg">
      <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 space-y-0 pb-6">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base font-medium text-muted-foreground">
              Perfil de Carga (Potência)
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-muted-foreground">Arraste no gráfico para dar zoom</p>
              {left !== 'dataMin' && (
                <Button 
                  variant="link" 
                  size="sm" 
                  className="h-auto p-0 text-xs text-accent animate-pulse" 
                  onClick={zoomOut}
                >
                  <Maximize2 className="h-3 w-3 mr-1" />
                  Resetar Zoom
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-xs px-3 gap-2 bg-background/50 border-white/10">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Selecionar Data'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar 
                mode="single" 
                selected={selectedDate} 
                onSelect={(date) => {
                  setSelectedDate(date);
                  zoomOut();
                }} 
                initialFocus 
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" onClick={resetFilter} title="Hoje">
            <FilterX className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full select-none cursor-crosshair">
          {rawData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={rawData} 
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                onMouseDown={e => e && setRefAreaLeft(e.activeLabel || null)}
                onMouseMove={e => e && refAreaLeft && setRefAreaRight(e.activeLabel || null)}
                onMouseUp={zoom}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  minTickGap={30}
                  domain={[left, right]}
                  allowDataOverflow
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(v) => `${v}W`}
                  domain={[bottom, top]}
                  allowDataOverflow
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-card/95 backdrop-blur-md p-3 shadow-xl border-white/10">
                          <p className="text-xs font-bold border-b border-white/10 pb-1 mb-1">{payload[0].payload.time}</p>
                          <div className="flex justify-between gap-4 text-xs">
                            <span className="text-primary font-medium">Potência:</span>
                            <span className="font-bold">{payload[0].value} W</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="watts" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  animationDuration={300}
                />
                {refAreaLeft && refAreaRight ? (
                  <ReferenceArea 
                    x1={refAreaLeft} 
                    x2={refAreaRight} 
                    strokeOpacity={0.3} 
                    fill="hsl(var(--accent))" 
                    fillOpacity={0.1} 
                  />
                ) : null}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Activity className="h-10 w-10 opacity-20" />
              <p className="text-sm">Nenhum dado de potência para esta data.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}