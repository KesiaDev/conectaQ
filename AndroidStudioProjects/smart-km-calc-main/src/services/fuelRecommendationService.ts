import type { FuelEntryRow, FuelRecommendation } from "@/models/types";

/**
 * Smart fuel recommendation based on REAL user consumption data
 * instead of the generic 70% rule.
 */
export function getSmartFuelRecommendation(
  entries: FuelEntryRow[],
  gasolinePrice: number,
  ethanolPrice: number
): FuelRecommendation | null {
  if (gasolinePrice <= 0 || ethanolPrice <= 0) return null;

  const closed = entries.filter((e) => e.status === "closed");

  // Get real consumption per fuel type
  const gasEntries = closed.filter(
    (e) => e.fuel_type === "gasolina" && e.actual_consumption && e.actual_consumption > 0
  );
  const ethEntries = closed.filter(
    (e) => e.fuel_type === "etanol" && e.actual_consumption && e.actual_consumption > 0
  );

  let gasolineEfficiency: number;
  let ethanolEfficiency: number;

  if (gasEntries.length >= 1 && ethEntries.length >= 1) {
    // Use REAL data from both fuel types
    gasolineEfficiency =
      gasEntries.reduce((s, e) => s + e.actual_consumption!, 0) / gasEntries.length;
    ethanolEfficiency =
      ethEntries.reduce((s, e) => s + e.actual_consumption!, 0) / ethEntries.length;
  } else if (gasEntries.length >= 1) {
    // Only gasoline data — estimate ethanol at 70% of gasoline
    gasolineEfficiency =
      gasEntries.reduce((s, e) => s + e.actual_consumption!, 0) / gasEntries.length;
    ethanolEfficiency = gasolineEfficiency * 0.7;
  } else if (ethEntries.length >= 1) {
    // Only ethanol data — estimate gasoline
    ethanolEfficiency =
      ethEntries.reduce((s, e) => s + e.actual_consumption!, 0) / ethEntries.length;
    gasolineEfficiency = ethanolEfficiency / 0.7;
  } else {
    // No data — fallback to generic rule
    gasolineEfficiency = 12;
    ethanolEfficiency = 8.4;
  }

  // Cost per km for each fuel
  const gasCostPerKm = gasolinePrice / gasolineEfficiency;
  const ethCostPerKm = ethanolPrice / ethanolEfficiency;

  const recommended: "gasolina" | "etanol" =
    gasCostPerKm <= ethCostPerKm ? "gasolina" : "etanol";

  const savingsPerLiter = Math.abs(gasCostPerKm - ethCostPerKm);
  // Savings for a 40L tank equivalent distance
  const distanceWith40L =
    recommended === "gasolina"
      ? 40 * gasolineEfficiency
      : 40 * ethanolEfficiency;
  const costGas = distanceWith40L / gasolineEfficiency * gasolinePrice;
  const costEth = distanceWith40L / ethanolEfficiency * ethanolPrice;
  const savingsPer40L = Math.abs(costGas - costEth);

  const breakEvenRatio = ethanolEfficiency / gasolineEfficiency;

  return {
    recommended,
    savingsPerLiter,
    savingsPer40L,
    gasolineEfficiency,
    ethanolEfficiency,
    breakEvenRatio,
  };
}
