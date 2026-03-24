import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRightLeft, CheckCircle2, XCircle } from "lucide-react";
import { shouldUseEthanol, formatCurrency } from "@/lib/calculations";

export default function FuelComparison() {
  const [gasolinePrice, setGasolinePrice] = useState("");
  const [ethanolPrice, setEthanolPrice] = useState("");

  const gp = parseFloat(gasolinePrice.replace(",", "."));
  const ep = parseFloat(ethanolPrice.replace(",", "."));
  const hasValues = gp > 0 && ep > 0;
  const ratio = hasValues ? ep / gp : 0;
  const useEthanol = hasValues && shouldUseEthanol(gp, ep);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ArrowRightLeft className="h-5 w-5 text-accent" />
          Gasolina vs Etanol
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Gasolina (R$/L)</Label>
            <Input
              placeholder="5,79"
              value={gasolinePrice}
              onChange={(e) => setGasolinePrice(e.target.value)}
              className="bg-muted/50 border-border/50 text-lg font-semibold h-12"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Etanol (R$/L)</Label>
            <Input
              placeholder="3,89"
              value={ethanolPrice}
              onChange={(e) => setEthanolPrice(e.target.value)}
              className="bg-muted/50 border-border/50 text-lg font-semibold h-12"
            />
          </div>
        </div>

        {hasValues && (
          <div className={`rounded-lg p-4 text-center animate-scale-in ${useEthanol ? 'bg-primary/10 border border-primary/30' : 'bg-destructive/10 border border-destructive/30'}`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              {useEthanol ? (
                <CheckCircle2 className="h-6 w-6 text-primary" />
              ) : (
                <XCircle className="h-6 w-6 text-destructive" />
              )}
              <span className="text-lg font-bold">
                {useEthanol ? "Use Etanol!" : "Use Gasolina!"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Relação: {(ratio * 100).toFixed(1)}% — {ratio <= 0.7 ? "Etanol compensa" : "Gasolina compensa"}
            </p>
            {useEthanol && (
              <p className="text-xs text-primary mt-1">
                Economia de ~{formatCurrency((gp - ep / 0.7) * 40)} a cada 40L
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
