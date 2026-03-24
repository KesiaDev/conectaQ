import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Calendar } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/calculations";

export default function TripSimulator() {
  const [kmTrip, setKmTrip] = useState("");
  const [consumption, setConsumption] = useState("");
  const [fuelPrice, setFuelPrice] = useState("");
  const [monthlyKm, setMonthlyKm] = useState("");

  const k = parseFloat(kmTrip.replace(",", "."));
  const c = parseFloat(consumption.replace(",", "."));
  const p = parseFloat(fuelPrice.replace(",", "."));
  const mk = parseFloat(monthlyKm.replace(",", "."));

  const hasTrip = k > 0 && c > 0 && p > 0;
  const tripLiters = hasTrip ? k / c : 0;
  const tripCost = hasTrip ? tripLiters * p : 0;

  const hasMonthly = mk > 0 && c > 0 && p > 0;
  const monthlyCost = hasMonthly ? (mk / c) * p : 0;
  const annualCost = monthlyCost * 12;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-warning" />
          Simulador de Viagem & Projeções
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Consumo (km/l)</Label>
            <Input
              placeholder="12"
              value={consumption}
              onChange={(e) => setConsumption(e.target.value)}
              className="bg-muted/50 border-border/50 h-12 text-lg font-semibold"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Preço/Litro (R$)</Label>
            <Input
              placeholder="5,79"
              value={fuelPrice}
              onChange={(e) => setFuelPrice(e.target.value)}
              className="bg-muted/50 border-border/50 h-12 text-lg font-semibold"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">KM da viagem</Label>
            <Input
              placeholder="350"
              value={kmTrip}
              onChange={(e) => setKmTrip(e.target.value)}
              className="bg-muted/50 border-border/50 h-12 text-lg font-semibold"
            />
          </div>
        </div>

        {hasTrip && (
          <div className="rounded-lg bg-warning/10 border border-warning/30 p-4 animate-scale-in">
            <p className="text-sm text-muted-foreground mb-1">Custo estimado da viagem</p>
            <p className="text-2xl font-extrabold text-warning">{formatCurrency(tripCost)}</p>
            <p className="text-xs text-muted-foreground mt-1">{formatNumber(tripLiters)} litros necessários</p>
          </div>
        )}

        <div className="border-t border-border/50 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-info" />
            <span className="text-sm font-medium text-muted-foreground">Projeção Mensal/Anual</span>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">KM rodados por mês</Label>
            <Input
              placeholder="2000"
              value={monthlyKm}
              onChange={(e) => setMonthlyKm(e.target.value)}
              className="bg-muted/50 border-border/50"
            />
          </div>
          {hasMonthly && (
            <div className="grid grid-cols-2 gap-3 mt-3 animate-scale-in">
              <div className="rounded-lg bg-info/10 border border-info/30 p-3 text-center">
                <p className="text-xs text-muted-foreground">Mensal</p>
                <p className="text-xl font-bold text-info">{formatCurrency(monthlyCost)}</p>
              </div>
              <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-center">
                <p className="text-xs text-muted-foreground">Anual</p>
                <p className="text-xl font-bold text-destructive">{formatCurrency(annualCost)}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
