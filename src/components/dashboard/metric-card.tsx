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
    <Card className="bg-card/50 backdrop-blur-sm border-white/10 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pb-2">
        <div className={cn("text-5xl font-black font-headline", valueClassName)}>
          {value}
          <span className="text-2xl font-bold text-muted-foreground/80 ml-2">{unit}</span>
        </div>
      </CardContent>
      {footerText && (
        <CardFooter className="pt-0">
          <p className="text-xs text-muted-foreground">{footerText}</p>
        </CardFooter>
      )}
    </Card>
  );
}
