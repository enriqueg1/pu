"use client";

import type { ElementType } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type MetricCardProps = {
  icon: ElementType;
  title: string;
  value: string | number;
  unit: string;
  footerText?: string;
  valueClassName?: string;
};

export function MetricCard({ icon: Icon, title, value, unit, footerText, valueClassName }: MetricCardProps) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-white/10 shadow-lg overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-6 pb-1 md:pb-2">
        <CardTitle className="text-[10px] md:text-base font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <Icon className="h-3 w-3 md:h-5 md:w-5 text-muted-foreground/60" />
      </CardHeader>
      <CardContent className="p-3 md:p-6 pt-0 md:pt-0 pb-1 md:pb-2">
        <div className={cn("text-xl md:text-5xl font-black font-headline flex items-baseline gap-1", valueClassName)}>
          {value}
          <span className="text-[10px] md:text-2xl font-bold text-muted-foreground/60">
            {unit}
          </span>
        </div>
      </CardContent>
      {footerText && (
        <CardFooter className="p-3 md:p-6 pt-0 md:pt-0 pb-2 md:pb-4">
          <p className="text-[9px] md:text-xs text-muted-foreground/80 truncate">
            {footerText}
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
