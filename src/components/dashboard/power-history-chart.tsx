"use client";

import { useState, useMemo, useEffect } from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceArea } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Activity, ZoomIn, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { PowerHistoryData } from '@/lib/types';

type PowerHistoryChartProps = {
  powerHistory: PowerHistoryData;
};

export function PowerHistoryChart({ powerHistory }: PowerHistoryChartProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  const [refAreaLeft, setRefAreaLeft] = useState<number | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<number | null>(null);
  
  const [left, setLeft] = useState<number | 'dataMin'>('dataMin');
  const [right, setRight] = useState<number | 'dataMax'>('dataMax');
  const [top, setTop] = useState<number | 'auto'>('auto');
  const [bottom, setBottom] = useState<number | 'auto'>('auto');

  const rawData = useMemo(() => {
    if (!selectedDate) return [];

    const dateKey = format(selectedDate, 'ddMMyyyy');
    const dayData = powerHistory[dateKey];

    if (!dayData) return [];

    return Object.entries(dayData)
      .map(([timeKey, watts]) => {
        const hours = parseInt(timeKey.substring(0, 2));
        const minutes = parseInt(timeKey.substring(2, 4));
        const totalMinutes = hours * 60 + minutes;
        
        return {
          minutes: totalMinutes,
          timeStr: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
          watts: Number(watts.toFixed(2))
        };
      })
      .sort((a, b) => a.minutes - b.minutes);
  }, [powerHistory, selectedDate]);

  const currentInterval = useMemo(() => {
    if (left === 'dataMin' || right === 'dataMax' || rawData.length === 0) {
      return null;
    }
    const duration = (right as number) - (left as number);
    const hours = Math.floor(duration / 60);
    const mins = Math.round(duration % 60);
    
    let text = "";
    if (hours > 0) text += `${hours}h `;
    if (mins > 0 || hours === 0) text += `${mins}min`;
    
    return {
      text,
      duration
    };
  }, [left, right, rawData]);

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

    const zoomData = rawData.filter(d => d.minutes >= start && d.minutes <= end);
    if (zoomData.length > 0) {
      const watts = zoomData.map(d => d.watts);
      const yMax = Math.max(...watts);
      const yMin = Math.min(...watts);
      setTop(yMax + (yMax * 0.1));
      setBottom(Math.max(0, yMin - (yMin * 0.1)));
    }

    setLeft(start);
    setRight(end);
    setRefAreaLeft(null);
    setRefAreaRight(null);
  };

  const zoomOut = () => {
    setLeft('dataMin');
    setRight('dataMax');
    setTop('auto');
    setBottom('auto');
  };

  const navigate = (direction: 'prev' | 'next') => {
    if (!currentInterval || left === 'dataMin' || right === 'dataMax') return;
    
    const delta = direction === 'next' ? currentInterval.duration : -currentInterval.duration;
    let newLeft = (left as number) + delta;
    let newRight = (right as number) + delta;

    if (newLeft < 0) {
      newRight -= newLeft;
      newLeft = 0;
    }
    if (newRight > 1439) {
      newLeft -= (newRight - 1439);
      newRight = 1439;
    }

    const zoomData = rawData.filter(d => d.minutes >= newLeft && d.minutes <= newRight);
    if (zoomData.length > 0) {
      const watts = zoomData.map(d => d.watts);
      setTop(Math.max(...watts) * 1.1);
      setBottom(Math.max(0, Math.min(...watts) * 0.9));
    }

    setLeft(newLeft);
    setRight(newRight);
  };

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = Math.floor(mins % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const hasZoom = left !== 'dataMin';

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-white/10 shadow-lg overflow-hidden">
      <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <CardTitle className="text-base font-bold text-foreground">
              Perfil de Carga
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                Potência Instantânea (W)
              </span>
              {hasZoom && (
                <Badge variant="secondary" className="h-4 text-[8px] bg-accent/20 text-accent border-accent/20">
                  Zoom Ativo
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-xs px-3 gap-2 bg-background/50 border-white/10">
                <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Data'}
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

          {hasZoom && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-9 text-xs gap-2 bg-accent/10 text-accent hover:bg-accent/20 border-accent/10" 
              onClick={zoomOut}
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Resetar
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-full">
            <ZoomIn className="h-3 w-3" />
            Arraste no gráfico para aproximar
          </p>
        </div>

        <div className={cn("h-[300px] w-full select-none cursor-crosshair", refAreaLeft !== null && "touch-none")}>
          {rawData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={rawData} 
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                onMouseDown={e => e && setRefAreaLeft(e.activeLabel as number)}
                onMouseMove={e => e && refAreaLeft !== null && setRefAreaRight(e.activeLabel as number)}
                onMouseUp={zoom}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" vertical={false} />
                <XAxis 
                  dataKey="minutes" 
                  type="number"
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={formatMinutes}
                  domain={[left, right]}
                  allowDataOverflow
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(v) => `${v}W`}
                  domain={[bottom, top]}
                  allowDataOverflow
                />
                <Tooltip
                  labelFormatter={(mins) => formatMinutes(mins as number)}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-card/95 backdrop-blur-md p-3 shadow-xl border-white/10">
                          <p className="text-[10px] font-bold text-muted-foreground border-b border-white/10 pb-1 mb-2">
                            {formatMinutes(label as number)}
                          </p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-primary">
                              {payload[0].value}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground">W</span>
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
                  strokeWidth={2.5} 
                  dot={false}
                  animationDuration={300}
                />
                {refAreaLeft !== null && refAreaRight !== null ? (
                  <ReferenceArea x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} fill="hsl(var(--accent))" fillOpacity={0.15} />
                ) : null}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3 bg-muted/10 rounded-xl border border-dashed border-white/5">
              <p className="text-sm font-medium">Sem dados para esta data</p>
            </div>
          )}
        </div>

        {currentInterval && (
          <div className="mt-6 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-4 bg-muted/50 p-1 rounded-full border border-white/10">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full" 
                onClick={() => navigate('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex flex-col items-center min-w-[80px]">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Janela</span>
                <span className="text-xs font-black text-foreground">{currentInterval.text}</span>
              </div>

              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full" 
                onClick={() => navigate('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-[9px] text-muted-foreground/60 uppercase font-medium">
              Use as setas para deslizar o período
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}