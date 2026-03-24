import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Fuel, Milestone, Lightbulb, Calendar } from "lucide-react";
import { generateInsights } from "@/services/insightService";
import { calculateMonthlyForecast } from "@/services/forecastService";
import { formatCurrency, formatNumber } from "@/lib/calculations";
import { fetchAllTolls, type TollRow } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { FuelEntryRow } from "@/models/types";

const iconMap: Record<string, React.ElementType> = {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Fuel,
  Milestone,
  Lightbulb,
};

const severityStyles = {
  positive: "bg-primary/10 border-primary/30 text-primary",
  negative: "bg-destructive/10 border-destructive/30 text-destructive",
  neutral: "bg-accent/10 border-accent/30 text-accent",
};

interface Props {
  entries: FuelEntryRow[];
}

export default function InsightsCard({ entries }: Props) {
  const { user } = useAuth();
  const [tolls, setTolls] = useState<TollRow[]>([]);

  const loadTolls = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchAllTolls(user.id);
      setTolls(data);
    } catch {
      // silent
    }
  }, [user]);

  useEffect(() => {
    loadTolls();
  }, [loadTolls]);

  const insights = generateInsights(entries, tolls);
  const forecast = calculateMonthlyForecast(entries, tolls);

  if (insights.length === 0 && !forecast) return null;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-warning" />
          Insights do seu veículo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Monthly forecast */}
        {forecast && (
          <div className="rounded-lg bg-accent/10 border border-accent/30 p-3 space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-accent">Previsão Mensal</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Combustível: </span>
                <span className="font-semibold">{formatCurrency(forecast.fuelCost)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Pedágios: </span>
                <span className="font-semibold">{formatCurrency(forecast.tollCost)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">KM estimados: </span>
                <span className="font-semibold">{formatNumber(forecast.estimatedKm, 0)} km</span>
              </div>
              <div>
                <span className="text-muted-foreground">Abastecimentos: </span>
                <span className="font-semibold">{formatNumber(forecast.estimatedRefuels, 1)}</span>
              </div>
            </div>
            <div className="pt-1 border-t border-accent/20 mt-1">
              <span className="text-muted-foreground text-xs">Total estimado: </span>
              <span className="text-lg font-bold text-accent">{formatCurrency(forecast.totalCost)}</span>
              <span className="text-xs text-muted-foreground">/mês</span>
            </div>
          </div>
        )}

        {/* Insights list */}
        {insights.map((insight) => {
          const Icon = iconMap[insight.icon] || Lightbulb;
          return (
            <div
              key={insight.id}
              className={`rounded-lg border p-3 ${severityStyles[insight.severity]}`}
            >
              <div className="flex items-start gap-2">
                <Icon className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">{insight.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
