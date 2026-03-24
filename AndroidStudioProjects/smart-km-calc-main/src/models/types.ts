import type { FuelEntryRow, VehicleCostEntry } from "@/lib/apiClient";

export type { FuelEntryRow, VehicleCostEntry };

export interface Insight {
  id: string;
  type: "alert" | "trend" | "tip" | "forecast";
  severity: "positive" | "negative" | "neutral";
  icon: string;
  title: string;
  description: string;
}

export interface ConsumptionTrend {
  direction: "up" | "down" | "stable";
  changePercent: number;
  recentAvg: number;
  overallAvg: number;
}

export interface MonthlyForecast {
  fuelCost: number;
  tollCost: number;
  totalCost: number;
  estimatedKm: number;
  estimatedRefuels: number;
}

export interface FuelRecommendation {
  recommended: "gasolina" | "etanol";
  savingsPerLiter: number;
  savingsPer40L: number;
  gasolineEfficiency: number;
  ethanolEfficiency: number;
  breakEvenRatio: number;
}

export interface TotalCostSummary {
  fuelCost: number;
  tollCost: number;
  maintenanceCost: number;
  insuranceCost: number;
  ipvaCost: number;
  otherCost: number;
  totalCost: number;
  totalKm: number;
  costPerKm: number;
  monthlyAvg: number;
}
