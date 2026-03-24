import { describe, it, expect } from "vitest";
import { getSmartFuelRecommendation } from "@/services/fuelRecommendationService";
import { makeClosedEntry } from "./helpers";

describe("getSmartFuelRecommendation", () => {
  it("retorna null se preços forem inválidos", () => {
    expect(getSmartFuelRecommendation([], 0, 4)).toBeNull();
    expect(getSmartFuelRecommendation([], 6, 0)).toBeNull();
    expect(getSmartFuelRecommendation([], -1, 4)).toBeNull();
  });

  it("fallback para regra genérica sem dados — gasolina mais barata quando etanol > 70%", () => {
    // sem entradas → usa gasolineEfficiency=12, ethanolEfficiency=8.4
    // gasolina: 6/12 = 0.50/km | etanol: 5/8.4 = 0.595/km → gasolina
    const result = getSmartFuelRecommendation([], 6.0, 5.0);
    expect(result?.recommended).toBe("gasolina");
  });

  it("fallback para regra genérica — etanol recomendado quando ratio < 70%", () => {
    // gasolina: 6/12 = 0.50/km | etanol: 4/8.4 = 0.476/km → etanol
    const result = getSmartFuelRecommendation([], 6.0, 4.0);
    expect(result?.recommended).toBe("etanol");
  });

  it("usa dados reais de ambos os combustíveis quando disponíveis", () => {
    const entries = [
      makeClosedEntry({ fuel_type: "gasolina", actual_consumption: 12 }),
      makeClosedEntry({ fuel_type: "gasolina", actual_consumption: 11 }),
      makeClosedEntry({ fuel_type: "etanol", actual_consumption: 9 }),
      makeClosedEntry({ fuel_type: "etanol", actual_consumption: 8 }),
    ];
    // gasEfficiency = 11.5, ethEfficiency = 8.5
    // gás: 6/11.5 = 0.522/km | eth: 4/8.5 = 0.471/km → etanol
    const result = getSmartFuelRecommendation(entries, 6.0, 4.0);
    expect(result?.gasolineEfficiency).toBeCloseTo(11.5);
    expect(result?.ethanolEfficiency).toBeCloseTo(8.5);
    expect(result?.recommended).toBe("etanol");
  });

  it("usa apenas dados de gasolina e estima etanol em 70%", () => {
    const entries = [
      makeClosedEntry({ fuel_type: "gasolina", actual_consumption: 14 }),
    ];
    // ethEfficiency = 14 * 0.7 = 9.8
    const result = getSmartFuelRecommendation(entries, 6.0, 5.0);
    expect(result?.ethanolEfficiency).toBeCloseTo(9.8);
  });

  it("usa apenas dados de etanol e estima gasolina", () => {
    const entries = [
      makeClosedEntry({ fuel_type: "etanol", actual_consumption: 9.8 }),
    ];
    // gasEfficiency = 9.8 / 0.7 = 14
    const result = getSmartFuelRecommendation(entries, 6.0, 4.0);
    expect(result?.gasolineEfficiency).toBeCloseTo(14);
  });

  it("retorna breakEvenRatio correto", () => {
    const result = getSmartFuelRecommendation([], 6.0, 4.0);
    // ethanolEfficiency = 8.4, gasEfficiency = 12 → ratio = 8.4/12 = 0.7
    expect(result?.breakEvenRatio).toBeCloseTo(0.7);
  });

  it("savingsPer40L é positivo", () => {
    const result = getSmartFuelRecommendation([], 6.0, 4.0);
    expect(result?.savingsPer40L).toBeGreaterThan(0);
  });
});
