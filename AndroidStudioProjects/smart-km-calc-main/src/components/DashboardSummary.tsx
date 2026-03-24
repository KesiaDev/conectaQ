import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Gauge, DollarSign, Route, Fuel, TrendingUp } from "lucide-react";
import { formatCurrency, formatNumber, calcWeightedAvgConsumption, calcAvgCostPerKm } from "@/lib/calculations";
import type { FuelEntryRow } from "@/types";

interface Props {
  entries: FuelEntryRow[];
}

export default function DashboardSummary({ entries }: Props) {
  const closedEntries = useMemo(() => entries.filter(e => e.status === "closed"), [entries]);

  if (entries.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <Fuel className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">Nenhum abastecimento registrado</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Registre seu primeiro abastecimento para começar!</p>
        </CardContent>
      </Card>
    );
  }

  const avgConsumption = useMemo(() => calcWeightedAvgConsumption(closedEntries), [closedEntries]);
  const avgCostPerKm = useMemo(() => calcAvgCostPerKm(closedEntries), [closedEntries]);
  const totalSpent = useMemo(() => entries.reduce((s, e) => s + (e.total_cost || e.liters * e.fuel_price), 0), [entries]);
  const totalKm = useMemo(() => closedEntries.reduce((s, e) => s + (e.actual_km || 0), 0), [closedEntries]);
  const totalLiters = useMemo(() => entries.reduce((s, e) => s + e.liters, 0), [entries]);

  const stats = [
    { label: "Consumo Médio", value: avgConsumption > 0 ? `${formatNumber(avgConsumption)} km/l` : "—", icon: Gauge, color: "text-primary" },
    { label: "Custo Médio/km", value: avgCostPerKm > 0 ? formatCurrency(avgCostPerKm) : "—", icon: TrendingUp, color: "text-destructive" },
    { label: "Total Gasto", value: formatCurrency(totalSpent), icon: DollarSign, color: "text-warning" },
    { label: "KM Rodados", value: `${formatNumber(totalKm, 0)} km`, icon: Route, color: "text-info" },
    { label: "Total Litros", value: `${formatNumber(totalLiters, 1)} L`, icon: Fuel, color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {stats.map((s) => (
        <Card key={s.label} className="glass-card">
          <CardContent className="p-3 text-center">
            <s.icon className={`h-5 w-5 mx-auto mb-1 ${s.color}`} />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
