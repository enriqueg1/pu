"use client";

import { useState, useMemo } from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceArea } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, FilterX, Activity, ZoomIn, Maximize2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
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

    if (zoomData.length > 0) {
      zoomData.forEach(d => {
        if (d.watts > yMax) yMax = d.watts;
        if (d.watts < yMin) yMin = d.watts;
      });

      setTop(yMax + (yMax * 0.1));
      setBottom(Math.max(0, yMin - (yMin * 0.1)));
    } else {
      setTop('auto');
      setBottom('auto');
    }

    setRefAreaLeft(null);
    setRefAreaRight(null);
    setLeft(start);
    setRight(end);
  };

  const zoomOut = () => {
    setLeft('dataMin');
    setRight('dataMax');
    setTop('auto');
    setBottom('auto');
    setRefAreaLeft(null);
    setRefAreaRight(null);
  };

  const resetFilter = () => {
    setSelectedDate(new Date());
    zoomOut();
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
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 text-xs px-3 gap-2 bg-background/50 border-white/10 hover:bg-background/80">
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

            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 text-muted-foreground hover:text-foreground" 
              onClick={resetFilter} 
              title="Voltar para Hoje"
            >
              <FilterX className="h-4 w-4" />
            </Button>
          </div>

          {hasZoom && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-9 text-xs gap-2 bg-accent/10 text-accent hover:bg-accent/20 border-accent/10 animate-in fade-in slide-in-from-right-2" 
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
            Arraste no gráfico para aproximar um horário específico
          </p>
        </div>

        <div 
          className={cn(
            "h-[300px] w-full select-none cursor-crosshair transition-all duration-300",
            refAreaLeft && "touch-none"
          )}
        >
          {rawData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={rawData} 
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                onMouseDown={e => e && setRefAreaLeft(e.activeLabel || null)}
                onMouseMove={e => e && refAreaLeft && setRefAreaRight(e.activeLabel || null)}
                onMouseUp={zoom}
                onTouchStart={e => {
                  // Prevenir scroll se já houver uma interação
                  if (refAreaLeft) e.preventDefault();
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  minTickGap={30}
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
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-card/95 backdrop-blur-md p-3 shadow-xl border-white/10 animate-in zoom-in-95 duration-200">
                          <p className="text-[10px] font-bold text-muted-foreground border-b border-white/10 pb-1 mb-2">
                            {payload[0].payload.time}
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
                  activeDot={{ r: 4, strokeWidth: 0, fill: "hsl(var(--primary))" }}
                  animationDuration={300}
                />
                {refAreaLeft && refAreaRight ? (
                  <ReferenceArea 
                    x1={refAreaLeft} 
                    x2={refAreaRight} 
                    strokeOpacity={0.3} 
                    fill="hsl(var(--accent))" 
                    fillOpacity={0.15} 
                  />
                ) : null}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3 bg-muted/10 rounded-xl border border-dashed border-white/5">
              <div className="p-4 bg-muted/20 rounded-full">
                <Activity className="h-8 w-8 opacity-20" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Sem dados para esta data</p>
                <p className="text-[10px] opacity-60">Tente selecionar outro dia no calendário</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Badge({ children, className, variant }: { children: React.ReactNode, className?: string, variant?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
      className
    )}>
      {children}
    </span>
  );
}
