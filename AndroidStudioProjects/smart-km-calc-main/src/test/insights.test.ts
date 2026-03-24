import { describe, it, expect } from "vitest";
import { generateInsights, getConsumptionTrend } from "@/services/insightService";
import { makeClosedEntry, makeTollRow } from "./helpers";

describe("getConsumptionTrend", () => {
  it("retorna null com menos de 3 entradas com consumo", () => {
    expect(getConsumptionTrend([])).toBeNull();
    expect(getConsumptionTrend([makeClosedEntry({ actual_consumption: 12 })])).toBeNull();
    expect(getConsumptionTrend([
      makeClosedEntry({ actual_consumption: 12 }),
      makeClosedEntry({ actual_consumption: 11 }),
    ])).toBeNull();
  });

  it("detecta tendência de queda (down)", () => {
    // últimas entradas são as primeiras no array (order by date desc)
    // recent = [8, 8, 8], overall inclui os 12 antigos → média geral alta
    const entries = [
      makeClosedEntry({ actual_consumption: 8 }),
      makeClosedEntry({ actual_consumption: 8 }),
      makeClosedEntry({ actual_consumption: 8 }),
      makeClosedEntry({ actual_consumption: 12 }),
      makeClosedEntry({ actual_consumption: 12 }),
      makeClosedEntry({ actual_consumption: 12 }),
    ];
    const trend = getConsumptionTrend(entries);
    expect(trend?.direction).toBe("down");
    expect(trend?.changePercent).toBeLessThan(-3);
  });

  it("detecta tendência de melhora (up)", () => {
    const entries = [
      makeClosedEntry({ actual_consumption: 15 }),
      makeClosedEntry({ actual_consumption: 15 }),
      makeClosedEntry({ actual_consumption: 15 }),
      makeClosedEntry({ actual_consumption: 10 }),
      makeClosedEntry({ actual_consumption: 10 }),
      makeClosedEntry({ actual_consumption: 10 }),
    ];
    const trend = getConsumptionTrend(entries);
    expect(trend?.direction).toBe("up");
    expect(trend?.changePercent).toBeGreaterThan(3);
  });

  it("detecta tendência estável (variação < 3%)", () => {
    const entries = [
      makeClosedEntry({ actual_consumption: 12.1 }),
      makeClosedEntry({ actual_consumption: 11.9 }),
      makeClosedEntry({ actual_consumption: 12.0 }),
      makeClosedEntry({ actual_consumption: 12.1 }),
      makeClosedEntry({ actual_consumption: 11.9 }),
      makeClosedEntry({ actual_consumption: 12.0 }),
    ];
    const trend = getConsumptionTrend(entries);
    expect(trend?.direction).toBe("stable");
  });
});

describe("generateInsights", () => {
  it("retorna array vazio com menos de 2 entradas fechadas", () => {
    expect(generateInsights([], [])).toHaveLength(0);
    expect(generateInsights([makeClosedEntry()], [])).toHaveLength(0);
  });

  it("detecta combustível caro acima de 10% da média", () => {
    const entries = [
      // entradas mais antigas com preço normal
      makeClosedEntry({ fuel_price: 6.0, date: "2026-01-01T00:00:00Z", actual_consumption: 12 }),
      makeClosedEntry({ fuel_price: 6.0, date: "2026-01-15T00:00:00Z", actual_consumption: 12 }),
      // último abastecimento com preço 20% acima — vem primeiro (order desc)
      makeClosedEntry({ fuel_price: 7.5, date: "2026-02-01T00:00:00Z", actual_consumption: 12 }),
    ];
    // array já está em ordem desc (mais recente primeiro), como a API retorna
    const entriesDesc = [entries[2], entries[1], entries[0]];
    const insights = generateInsights(entriesDesc, []);
    const expensiveFuel = insights.find(i => i.id === "expensive-fuel");
    expect(expensiveFuel).toBeDefined();
    expect(expensiveFuel?.severity).toBe("negative");
  });

  it("detecta impacto de pedágios acima de 10%", () => {
    const entries = [
      makeClosedEntry({ total_cost: 100, date: "2026-01-01T00:00:00Z", actual_consumption: 12 }),
      makeClosedEntry({ total_cost: 100, date: "2026-01-15T00:00:00Z", actual_consumption: 12 }),
    ];
    // pedágios = 30 de 230 total = ~13% → deve gerar insight
    const tolls = [makeTollRow({ amount: 30 })];
    const insights = generateInsights(entries, tolls);
    const tollInsight = insights.find(i => i.id === "toll-impact");
    expect(tollInsight).toBeDefined();
  });

  it("não gera insights de pedágio abaixo de 10%", () => {
    const entries = [
      makeClosedEntry({ total_cost: 500, date: "2026-01-01T00:00:00Z", actual_consumption: 12 }),
      makeClosedEntry({ total_cost: 500, date: "2026-01-15T00:00:00Z", actual_consumption: 12 }),
    ];
    const tolls = [makeTollRow({ amount: 10 })]; // 10/1010 ≈ 1%
    const insights = generateInsights(entries, tolls);
    const tollInsight = insights.find(i => i.id === "toll-impact");
    expect(tollInsight).toBeUndefined();
  });

  it("gera insight comparativo quando há dados de ambos os combustíveis", () => {
    const entries = [
      makeClosedEntry({ fuel_type: "gasolina", actual_consumption: 12, date: "2026-01-01T00:00:00Z" }),
      makeClosedEntry({ fuel_type: "gasolina", actual_consumption: 11, date: "2026-01-08T00:00:00Z" }),
      makeClosedEntry({ fuel_type: "etanol", actual_consumption: 9, date: "2026-01-15T00:00:00Z" }),
      makeClosedEntry({ fuel_type: "etanol", actual_consumption: 8, date: "2026-01-22T00:00:00Z" }),
    ];
    const insights = generateInsights(entries, []);
    const fuelInsight = insights.find(i => i.id === "fuel-efficiency");
    expect(fuelInsight).toBeDefined();
  });
});
