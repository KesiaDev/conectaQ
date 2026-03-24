import { describe, it, expect } from "vitest";
import {
  calcLiters,
  calcEstimatedRange,
  calcActualConsumption,
  calcCostPerKm,
  calcWeightedAvgConsumption,
  shouldUseEthanol,
} from "@/lib/calculations";

describe("calcLiters", () => {
  it("retorna litros corretos", () => {
    expect(calcLiters(100, 5)).toBeCloseTo(20);
  });
  it("retorna 0 se pricePerLiter for 0 (evita Infinity)", () => {
    expect(calcLiters(100, 0)).toBe(0);
  });
  it("retorna 0 se pricePerLiter for negativo", () => {
    expect(calcLiters(100, -5)).toBe(0);
  });
});

describe("calcCostPerKm", () => {
  it("retorna custo por km correto", () => {
    expect(calcCostPerKm(100, 200)).toBeCloseTo(0.5);
  });
  it("retorna 0 se actualKm for 0 (evita Infinity)", () => {
    expect(calcCostPerKm(100, 0)).toBe(0);
  });
});

describe("calcEstimatedRange", () => {
  it("calcula autonomia estimada corretamente", () => {
    expect(calcEstimatedRange(20, 12)).toBe(240);
  });
});

describe("calcActualConsumption", () => {
  it("calcula consumo real corretamente", () => {
    expect(calcActualConsumption(240, 20)).toBe(12);
  });
});

describe("calcWeightedAvgConsumption", () => {
  it("retorna 0 para array vazio", () => {
    expect(calcWeightedAvgConsumption([])).toBe(0);
  });
  it("calcula média ponderada corretamente", () => {
    const entries = [
      { actual_km: 240, liters: 20 },
      { actual_km: 300, liters: 25 },
    ] as any;
    expect(calcWeightedAvgConsumption(entries)).toBe(12); // 540km / 45L
  });
});

describe("shouldUseEthanol", () => {
  it("recomenda etanol se relação < 70%", () => {
    expect(shouldUseEthanol(6.0, 4.1)).toBe(true);  // 4.1/6.0 ≈ 0.683
    expect(shouldUseEthanol(6.0, 4.0)).toBe(true);  // 4.0/6.0 ≈ 0.667
  });
  it("não recomenda etanol se relação > 70%", () => {
    expect(shouldUseEthanol(6.0, 4.3)).toBe(false);
    expect(shouldUseEthanol(6.0, 5.0)).toBe(false);
  });
});
