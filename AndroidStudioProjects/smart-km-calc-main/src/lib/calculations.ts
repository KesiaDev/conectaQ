import type { Database } from "@/integrations/supabase/types";

type FuelEntryRow = Database["public"]["Tables"]["fuel_entries"]["Row"];

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals).replace('.', ',');
}

export function calcLiters(totalSpent: number, pricePerLiter: number): number {
  if (pricePerLiter <= 0) return 0;
  return totalSpent / pricePerLiter;
}

export function calcEstimatedRange(liters: number, estimatedConsumption: number): number {
  return liters * estimatedConsumption;
}

export function calcActualConsumption(actualKm: number, liters: number): number {
  return actualKm / liters;
}

export function calcCostPerKm(totalSpent: number, actualKm: number): number {
  if (actualKm <= 0) return 0;
  return totalSpent / actualKm;
}

/** Weighted average consumption: total km / total liters across closed entries */
export function calcWeightedAvgConsumption(closedEntries: FuelEntryRow[]): number {
  const totalKm = closedEntries.reduce((s, e) => s + (e.actual_km || 0), 0);
  const totalLiters = closedEntries.reduce((s, e) => s + e.liters, 0);
  if (totalLiters === 0) return 0;
  return totalKm / totalLiters;
}

export function calcAvgCostPerKm(closedEntries: FuelEntryRow[]): number {
  const totalCost = closedEntries.reduce((s, e) => s + (e.total_cost || e.liters * e.fuel_price), 0);
  const totalKm = closedEntries.reduce((s, e) => s + (e.actual_km || 0), 0);
  if (totalKm === 0) return 0;
  return totalCost / totalKm;
}

export function shouldUseEthanol(gasolinePrice: number, ethanolPrice: number): boolean {
  return ethanolPrice / gasolinePrice <= 0.7;
}
