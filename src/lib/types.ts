export interface EnergyData {
  potencia_atual_watts: number;
  consumo_hoje_kwh: number;
  consumo_total_kwh: number;
  ultima_atualizacao: number; // Unix timestamp
}

export interface HistoryData {
  [dateKey: string]: number; // "ddMMyyyy": kWh
}

export interface ChartDataPoint {
  date: string; // formatada para o gráfico
  consumo: number;
  custoAcumulado: number;
}
