import { describe, it, expect } from "vitest";
import { calculateMonthlyForecast } from "@/services/forecastService";
import { makeClosedEntry, makeTollRow } from "./helpers";

function entryOnDate(date: string, totalCost = 120, actualKm = 300): ReturnType<typeof makeClosedEntry> {
  return makeClosedEntry({ date, total_cost: totalCost, actual_km: actualKm });
}

describe("calculateMonthlyForecast", () => {
  it("retorna null com menos de 2 entradas fechadas", () => {
    expect(calculateMonthlyForecast([], [])).toBeNull();
    expect(calculateMonthlyForecast([makeClosedEntry()], [])).toBeNull();
  });

  it("retorna null com apenas entradas abertas", () => {
    const open = [makeClosedEntry({ status: "open" }), makeClosedEntry({ status: "open" })];
    expect(calculateMonthlyForecast(open, [])).toBeNull();
  });

  it("calcula previsão corretamente com 2 entradas separadas por ~30 dias", () => {
    const entries = [
      entryOnDate("2026-01-01T00:00:00Z", 120, 300),
      entryOnDate("2026-02-01T00:00:00Z", 140, 350),
    ];
    const result = calculateMonthlyForecast(entries, []);
    expect(result).not.toBeNull();
    expect(result!.fuelCost).toBeGreaterThan(0);
    expect(result!.totalCost).toBeGreaterThan(0);
    expect(result!.estimatedKm).toBeGreaterThan(0);
  });

  it("inclui pedágios no totalCost", () => {
    const entries = [
      entryOnDate("2026-01-01T00:00:00Z", 120, 300),
      entryOnDate("2026-02-01T00:00:00Z", 120, 300),
    ];
    const tolls = [makeTollRow({ amount: 60 })];
    const result = calculateMonthlyForecast(entries, tolls);
    expect(result!.tollCost).toBeGreaterThan(0);
    expect(result!.totalCost).toBeGreaterThan(result!.fuelCost);
  });

  it("estimatedRefuels é maior que zero com múltiplas entradas", () => {
    const entries = [
      entryOnDate("2026-01-01T00:00:00Z"),
      entryOnDate("2026-01-15T00:00:00Z"),
      entryOnDate("2026-02-01T00:00:00Z"),
    ];
    const result = calculateMonthlyForecast(entries, []);
    expect(result!.estimatedRefuels).toBeGreaterThan(0);
  });
});
