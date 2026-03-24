import type { FuelEntryRow, VehicleCostEntry, TotalCostSummary } from "@/models/types";
import type { TollRow } from "@/lib/api";

/**
 * Calculates the total cost of vehicle ownership including
 * fuel, tolls, maintenance, insurance, IPVA, etc.
 */
export function calculateTotalCost(
  entries: FuelEntryRow[],
  tolls: TollRow[],
  vehicleCosts: VehicleCostEntry[]
): TotalCostSummary {
  const closed = entries.filter((e) => e.status === "closed");

  const fuelCost = entries.reduce(
    (s, e) => s + (e.total_cost || e.liters * e.fuel_price),
    0
  );
  const tollCost = tolls.reduce((s, t) => s + t.amount, 0);
  const totalKm = closed.reduce((s, e) => s + (e.actual_km || 0), 0);

  // Categorize vehicle costs
  const byCat = (cat: string) =>
    vehicleCosts
      .filter((c) => c.category === cat)
      .reduce((s, c) => s + c.amount, 0);

  const maintenanceCost = byCat("manutencao");
  const insuranceCost = byCat("seguro");
  const ipvaCost = byCat("ipva");
  const otherCost = byCat("outro");

  const totalCost =
    fuelCost + tollCost + maintenanceCost + insuranceCost + ipvaCost + otherCost;

  // Monthly avg
  const allDates = entries.map((e) => new Date(e.date).getTime());
  const spanDays =
    allDates.length >= 2
      ? (Math.max(...allDates) - Math.min(...allDates)) / (1000 * 60 * 60 * 24)
      : 30;
  const spanMonths = Math.max(spanDays / 30, 1);
  const monthlyAvg = totalCost / spanMonths;

  return {
    fuelCost,
    tollCost,
    maintenanceCost,
    insuranceCost,
    ipvaCost,
    otherCost,
    totalCost,
    totalKm,
    costPerKm: totalKm > 0 ? totalCost / totalKm : 0,
    monthlyAvg,
  };
}

/**
 * Split trip cost among passengers.
 */
export function splitTripCost(
  fuelCost: number,
  tollCost: number,
  passengers: number
): { total: number; perPerson: number } {
  const total = fuelCost + tollCost;
  return {
    total,
    perPerson: passengers > 0 ? total / passengers : total,
  };
}
