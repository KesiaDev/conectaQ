import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/calculations";
import { getSmartFuelRecommendation } from "@/services/fuelRecommendationService";
import type { FuelEntryRow } from "@/models/types";

interface Props {
  entries: FuelEntryRow[];
}

export default function SmartFuelComparison({ entries }: Props) {
  const [gasolinePrice, setGasolinePrice] = useState("");
  const [ethanolPrice, setEthanolPrice] = useState("");

  const gp = parseFloat(gasolinePrice.replace(",", "."));
  const ep = parseFloat(ethanolPrice.replace(",", "."));
  const hasValues = gp > 0 && ep > 0;

  const recommendation = hasValues
    ? getSmartFuelRecommendation(entries, gp, ep)
    : null;

  const closedEntries = entries.filter((e) => e.status === "closed");
  const hasRealData =
    closedEntries.filter(
      (e) => e.actual_consumption && e.actual_consumption > 0
    ).length >= 1;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ArrowRightLeft className="h-5 w-5 text-accent" />
          Recomendação Inteligente de Combustível
        </CardTitle>
        {hasRealData && (
          <p className="text-xs text-primary flex items-center gap-1 mt-1">
            <Lightbulb className="h-3 w-3" />
            Usando seus dados reais de consumo
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              Gasolina (R$/L)
            </Label>
            <Input
              placeholder="5,79"
              value={gasolinePrice}
              onChange={(e) => setGasolinePrice(e.target.value)}
              className="bg-muted/50 border-border/50 text-lg font-semibold h-12"
              inputMode="decimal"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              Etanol (R$/L)
            </Label>
            <Input
              placeholder="3,89"
              value={ethanolPrice}
              onChange={(e) => setEthanolPrice(e.target.value)}
              className="bg-muted/50 border-border/50 text-lg font-semibold h-12"
              inputMode="decimal"
            />
          </div>
        </div>

        {recommendation && (
          <div className="space-y-3 animate-scale-in">
            <div
              className={`rounded-lg p-4 text-center ${
                recommendation.recommended === "etanol"
                  ? "bg-primary/10 border border-primary/30"
                  : "bg-accent/10 border border-accent/30"
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                {recommendation.recommended === "etanol" ? (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                ) : (
                  <CheckCircle2 className="h-6 w-6 text-accent" />
                )}
                <span className="text-lg font-bold">
                  Abasteça com{" "}
                  {recommendation.recommended === "etanol"
                    ? "Etanol"
                    : "Gasolina"}
                  !
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Economia estimada:{" "}
                <span className="font-bold text-primary">
                  {formatCurrency(recommendation.savingsPer40L)}
                </span>{" "}
                a cada tanque (40L equivalente)
              </p>
            </div>

            {/* Efficiency details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/30 border border-border/30 p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">
                  Gasolina
                </p>
                <p className="text-lg font-bold">
                  {formatNumber(recommendation.gasolineEfficiency)} km/l
                </p>
                <p className="text-xs text-muted-foreground">
                  R$ {formatNumber(gp / recommendation.gasolineEfficiency)}/km
                </p>
              </div>
              <div className="rounded-lg bg-muted/30 border border-border/30 p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">
                  Etanol
                </p>
                <p className="text-lg font-bold">
                  {formatNumber(recommendation.ethanolEfficiency)} km/l
                </p>
                <p className="text-xs text-muted-foreground">
                  R$ {formatNumber(ep / recommendation.ethanolEfficiency)}/km
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Rendimento etanol/gasolina:{" "}
              {formatNumber(recommendation.breakEvenRatio * 100, 0)}% —{" "}
              {hasRealData
                ? "baseado no seu consumo real"
                : "baseado em estimativa padrão (70%)"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
