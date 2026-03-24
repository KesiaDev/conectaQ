import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Route, Gauge, DollarSign, TrendingDown } from "lucide-react";
import { formatNumber, formatCurrency, calcActualConsumption, calcCostPerKm } from "@/lib/calculations";
import { closeCycle } from "@/lib/api";
import { toast } from "sonner";
import type { FuelEntryRow } from "@/lib/apiClient";

interface Props {
  openEntry: FuelEntryRow;
  onClosed: () => void;
}

export default function CloseCycleForm({ openEntry, onClosed }: Props) {
  const [actualKm, setActualKm] = useState("");
  const [saving, setSaving] = useState(false);

  const km = parseFloat(actualKm.replace(",", "."));
  const liters = openEntry.liters;
  const totalCost = openEntry.total_cost || openEntry.liters * openEntry.fuel_price;

  const hasResult = km > 0;
  const consumption = hasResult ? calcActualConsumption(km, liters) : 0;
  const costPerKm = hasResult ? calcCostPerKm(totalCost, km) : 0;
  const estimatedConsumption = openEntry.estimated_consumption || 0;
  const diff = hasResult && estimatedConsumption > 0 ? consumption - estimatedConsumption : 0;

  const handleClose = async () => {
    if (km <= 0) {
      toast.error("Informe a quilometragem percorrida");
      return;
    }
    setSaving(true);
    try {
      await closeCycle(openEntry.id, km, liters, totalCost);
      toast.success("Ciclo fechado! Consumo atualizado.");
      onClosed();
    } catch {
      toast.error("Erro ao fechar ciclo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="glass-card border-warning/40 glow-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle2 className="h-5 w-5 text-warning" />
          Fechar Ciclo — Abastecimento em Aberto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted/30 border border-border/30 p-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Data</span>
            <span className="font-medium">{new Date(openEntry.date).toLocaleDateString("pt-BR")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Valor abastecido</span>
            <span className="font-medium">{formatCurrency(totalCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Litros</span>
            <span className="font-medium">{formatNumber(liters)} L</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Preço/litro</span>
            <span className="font-medium">{formatCurrency(openEntry.fuel_price)}</span>
          </div>
          {openEntry.estimated_range && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Autonomia estimada</span>
              <span className="font-medium text-info">{formatNumber(openEntry.estimated_range, 0)} km</span>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1">
            <Route className="h-3 w-3" /> Quantos km você realmente percorreu?
          </Label>
          <Input
            placeholder="282"
            value={actualKm}
            onChange={(e) => setActualKm(e.target.value)}
            className="bg-muted/50 border-border/50 text-lg font-semibold h-12"
            inputMode="decimal"
            autoFocus
          />
        </div>

        {hasResult && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
            <div className="rounded-lg bg-primary/10 border border-primary/30 p-3 text-center">
              <Gauge className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-[10px] text-muted-foreground uppercase">Consumo Real</p>
              <p className="text-2xl font-bold text-primary">{formatNumber(consumption)}</p>
              <p className="text-xs text-muted-foreground">km/l</p>
            </div>
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-center">
              <DollarSign className="h-5 w-5 mx-auto mb-1 text-destructive" />
              <p className="text-[10px] text-muted-foreground uppercase">Custo por km</p>
              <p className="text-2xl font-bold text-destructive">{formatCurrency(costPerKm)}</p>
              <p className="text-xs text-muted-foreground">R$/km</p>
            </div>
            {estimatedConsumption > 0 && (
              <div className={`rounded-lg p-3 text-center ${diff >= 0 ? 'bg-primary/10 border border-primary/30' : 'bg-warning/10 border border-warning/30'}`}>
                <TrendingDown className={`h-5 w-5 mx-auto mb-1 ${diff >= 0 ? 'text-primary' : 'text-warning'}`} />
                <p className="text-[10px] text-muted-foreground uppercase">vs Estimativa</p>
                <p className={`text-2xl font-bold ${diff >= 0 ? 'text-primary' : 'text-warning'}`}>
                  {diff >= 0 ? "+" : ""}{formatNumber(diff)}
                </p>
                <p className="text-xs text-muted-foreground">km/l {diff >= 0 ? "melhor" : "pior"}</p>
              </div>
            )}
          </div>
        )}

        <Button
          variant="hero"
          size="lg"
          className="w-full"
          onClick={handleClose}
          disabled={saving || km <= 0}
        >
          {saving ? "Salvando..." : "Fechar ciclo e atualizar consumo"}
        </Button>
      </CardContent>
    </Card>
  );
}
