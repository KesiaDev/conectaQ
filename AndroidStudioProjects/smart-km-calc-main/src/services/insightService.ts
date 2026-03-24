import type { FuelEntryRow, Insight, ConsumptionTrend } from "@/models/types";
import type { TollRow } from "@/lib/api";

/**
 * Generates smart insights from fuel entries and tolls data.
 */
export function generateInsights(
  entries: FuelEntryRow[],
  tolls: TollRow[]
): Insight[] {
  const closed = entries.filter((e) => e.status === "closed");
  if (closed.length < 2) return [];

  const insights: Insight[] = [];

  // 1. Consumption trend
  const trend = getConsumptionTrend(closed);
  if (trend && trend.changePercent !== 0) {
    if (trend.direction === "down") {
      insights.push({
        id: "consumption-drop",
        type: "alert",
        severity: "negative",
        icon: "TrendingDown",
        title: `Consumo caiu ${Math.abs(trend.changePercent).toFixed(0)}%`,
        description: `Seu consumo recente (${trend.recentAvg.toFixed(1)} km/l) está abaixo da média geral (${trend.overallAvg.toFixed(1)} km/l). Verifique pneus, filtros e hábitos de direção.`,
      });
    } else if (trend.direction === "up") {
      insights.push({
        id: "consumption-up",
        type: "trend",
        severity: "positive",
        icon: "TrendingUp",
        title: `Consumo melhorou ${trend.changePercent.toFixed(0)}%`,
        description: `Seu consumo recente (${trend.recentAvg.toFixed(1)} km/l) está acima da média (${trend.overallAvg.toFixed(1)} km/l). Continue assim!`,
      });
    }
  }

  // 2. Expensive refuel detection
  const avgPrice = closed.reduce((s, e) => s + e.fuel_price, 0) / closed.length;
  const lastEntry = closed[0];
  if (lastEntry && lastEntry.fuel_price > avgPrice * 1.1) {
    const pctAbove = ((lastEntry.fuel_price / avgPrice - 1) * 100).toFixed(0);
    insights.push({
      id: "expensive-fuel",
      type: "alert",
      severity: "negative",
      icon: "DollarSign",
      title: `Combustível ${pctAbove}% acima da média`,
      description: `Você pagou R$ ${lastEntry.fuel_price.toFixed(2).replace(".", ",")} no último abastecimento. Sua média é R$ ${avgPrice.toFixed(2).replace(".", ",")}.`,
    });
  }

  // 3. Cost per km increase
  const costsPerKm = closed
    .filter((e) => e.cost_per_km && e.cost_per_km > 0)
    .map((e) => e.cost_per_km!);
  if (costsPerKm.length >= 3) {
    const recentCost = costsPerKm.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
    const overallCost = costsPerKm.reduce((a, b) => a + b, 0) / costsPerKm.length;
    if (recentCost > overallCost * 1.15) {
      insights.push({
        id: "cost-increase",
        type: "alert",
        severity: "negative",
        icon: "AlertTriangle",
        title: "Custo por km subindo",
        description: `Seu custo recente (R$ ${recentCost.toFixed(2).replace(".", ",")}/km) está acima da média (R$ ${overallCost.toFixed(2).replace(".", ",")}/km).`,
      });
    }
  }

  // 4. Savings tip based on fuel type usage
  const gasolineEntries = closed.filter((e) => e.fuel_type === "gasolina");
  const ethanolEntries = closed.filter((e) => e.fuel_type === "etanol");
  if (gasolineEntries.length >= 2 && ethanolEntries.length >= 2) {
    const gasConsumption = gasolineEntries.reduce((s, e) => s + (e.actual_consumption || 0), 0) / gasolineEntries.length;
    const ethConsumption = ethanolEntries.reduce((s, e) => s + (e.actual_consumption || 0), 0) / ethanolEntries.length;
    if (gasConsumption > 0 && ethConsumption > 0) {
      const ratio = ethConsumption / gasConsumption;
      insights.push({
        id: "fuel-efficiency",
        type: "tip",
        severity: "neutral",
        icon: "Fuel",
        title: "Rendimento comparativo",
        description: `Com gasolina você faz ${gasConsumption.toFixed(1)} km/l e com etanol ${ethConsumption.toFixed(1)} km/l (${(ratio * 100).toFixed(0)}% do rendimento da gasolina).`,
      });
    }
  }

  // 5. Toll spending insight
  if (tolls.length > 0) {
    const totalTolls = tolls.reduce((s, t) => s + t.amount, 0);
    const totalFuel = closed.reduce((s, e) => s + (e.total_cost || e.liters * e.fuel_price), 0);
    if (totalFuel > 0) {
      const tollPct = (totalTolls / (totalFuel + totalTolls)) * 100;
      if (tollPct > 10) {
        insights.push({
          id: "toll-impact",
          type: "alert",
          severity: "neutral",
          icon: "Milestone",
          title: `Pedágios = ${tollPct.toFixed(0)}% do custo total`,
          description: `Pedágios somam R$ ${totalTolls.toFixed(2).replace(".", ",")} — representam ${tollPct.toFixed(0)}% do seu gasto total com o veículo.`,
        });
      }
    }
  }

  return insights;
}

export function getConsumptionTrend(
  closedEntries: FuelEntryRow[]
): ConsumptionTrend | null {
  const withConsumption = closedEntries.filter(
    (e) => e.actual_consumption && e.actual_consumption > 0
  );
  if (withConsumption.length < 3) return null;

  const recentCount = Math.min(3, Math.floor(withConsumption.length / 2));
  const recent = withConsumption.slice(0, recentCount);
  const recentAvg =
    recent.reduce((s, e) => s + e.actual_consumption!, 0) / recent.length;
  const overallAvg =
    withConsumption.reduce((s, e) => s + e.actual_consumption!, 0) /
    withConsumption.length;

  const changePercent = ((recentAvg - overallAvg) / overallAvg) * 100;
  const direction: ConsumptionTrend["direction"] =
    changePercent > 3 ? "up" : changePercent < -3 ? "down" : "stable";

  return { direction, changePercent, recentAvg, overallAvg };
}
