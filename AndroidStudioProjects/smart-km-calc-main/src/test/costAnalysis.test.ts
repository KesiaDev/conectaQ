import { describe, it, expect } from "vitest";
import { calculateTotalCost, splitTripCost } from "@/services/costAnalysisService";
import { makeClosedEntry, makeTollRow } from "./helpers";
import type { VehicleCostEntry } from "@/models/types";

function makeVehicleCost(category: string, amount: number): VehicleCostEntry {
  return {
    id: "vc-1",
    user_id: "user-1",
    category,
    description: "Teste",
    amount,
    date: "2026-01-01",
    created_at: "2026-01-01T00:00:00Z",
  };
}

describe("calculateTotalCost", () => {
  it("soma combustível, pedágios e custos do veículo corretamente", () => {
    const entries = [makeClosedEntry({ total_cost: 120, actual_km: 240 })];
    const tolls = [makeTollRow({ amount: 15 })];
    const vehicleCosts = [makeVehicleCost("manutencao", 200)];

    const result = calculateTotalCost(entries, tolls, vehicleCosts);
    expect(result.fuelCost).toBe(120);
    expect(result.tollCost).toBe(15);
    expect(result.maintenanceCost).toBe(200);
    expect(result.totalCost).toBe(335);
    expect(result.totalKm).toBe(240);
  });

  it("custo por km zero quando não há km rodados", () => {
    const entries = [makeClosedEntry({ total_cost: 120, actual_km: null })];
    const result = calculateTotalCost(entries, [], []);
    expect(result.costPerKm).toBe(0);
  });

  it("calcula custo por km corretamente", () => {
    const entries = [makeClosedEntry({ total_cost: 120, actual_km: 240 })];
    const result = calculateTotalCost(entries, [], []);
    // fuelCost=120, totalKm=240, costPerKm = 120/240 = 0.5
    expect(result.costPerKm).toBeCloseTo(0.5);
  });

  it("seguro e IPVA são categorizados corretamente", () => {
    const vehicleCosts = [
      makeVehicleCost("seguro", 300),
      makeVehicleCost("ipva", 500),
      makeVehicleCost("outro", 50),
    ];
    const result = calculateTotalCost([], [], vehicleCosts);
    expect(result.insuranceCost).toBe(300);
    expect(result.ipvaCost).toBe(500);
    expect(result.otherCost).toBe(50);
  });

  it("múltiplas entradas somam corretamente", () => {
    const entries = [
      makeClosedEntry({ total_cost: 100, actual_km: 200 }),
      makeClosedEntry({ total_cost: 150, actual_km: 300 }),
    ];
    const result = calculateTotalCost(entries, [], []);
    expect(result.fuelCost).toBe(250);
    expect(result.totalKm).toBe(500);
  });
});

describe("splitTripCost", () => {
  it("divide custo corretamente entre passageiros", () => {
    const result = splitTripCost(120, 30, 3);
    expect(result.total).toBe(150);
    expect(result.perPerson).toBe(50);
  });

  it("zero passageiros retorna total sem divisão", () => {
    const result = splitTripCost(120, 0, 0);
    expect(result.perPerson).toBe(120);
  });

  it("apenas combustível sem pedágio", () => {
    const result = splitTripCost(100, 0, 4);
    expect(result.total).toBe(100);
    expect(result.perPerson).toBe(25);
  });

  it("passageiro único paga tudo", () => {
    const result = splitTripCost(80, 20, 1);
    expect(result.perPerson).toBe(100);
  });
});
