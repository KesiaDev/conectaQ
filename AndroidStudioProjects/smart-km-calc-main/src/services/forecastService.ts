import type { FuelEntryRow, MonthlyForecast } from "@/models/types";
import type { TollRow } from "@/lib/api";

/**
 * Projects monthly costs based on user's historical data.
 */
export function calculateMonthlyForecast(
  entries: FuelEntryRow[],
  tolls: TollRow[]
): MonthlyForecast | null {
  const closed = entries.filter((e) => e.status === "closed");
  if (closed.length < 2) return null;

  // Calculate time span in months
  const dates = closed.map((e) => new Date(e.date).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const spanDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);
  const spanMonths = Math.max(spanDays / 30, 1);

  // Total fuel cost
  const totalFuel = closed.reduce(
    (s, e) => s + (e.total_cost || e.liters * e.fuel_price),
    0
  );
  const monthlyFuel = totalFuel / spanMonths;

  // Total tolls in same period
  const totalTollAmount = tolls.reduce((s, t) => s + t.amount, 0);
  const monthlyTolls = totalTollAmount / spanMonths;

  // Total km
  const totalKm = closed.reduce((s, e) => s + (e.actual_km || 0), 0);
  const monthlyKm = totalKm / spanMonths;

  // Refuel count
  const monthlyRefuels = closed.length / spanMonths;

  return {
    fuelCost: monthlyFuel,
    tollCost: monthlyTolls,
    totalCost: monthlyFuel + monthlyTolls,
    estimatedKm: monthlyKm,
    estimatedRefuels: monthlyRefuels,
  };
}
