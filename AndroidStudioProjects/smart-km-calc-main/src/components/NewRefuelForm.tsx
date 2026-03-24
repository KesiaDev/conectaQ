import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fuel, DollarSign, Gauge, Route } from "lucide-react";
import { calcLiters, calcEstimatedRange, formatNumber, formatCurrency } from "@/lib/calculations";
import { insertEntry } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

interface Props {
  suggestedConsumption: number;
  onSaved: () => void;
  hasOpenEntry: boolean;
}

export default function NewRefuelForm({ suggestedConsumption, onSaved, hasOpenEntry }: Props) {
  const { user } = useAuth();
  const [totalSpent, setTotalSpent] = useState("");
  const [pricePerLiter, setPricePerLiter] = useState("");
  const [estimatedConsumption, setEstimatedConsumption] = useState(
    suggestedConsumption > 0 ? formatNumber(suggestedConsumption) : ""
  );
  const [vehicleName, setVehicleName] = useState("");
  const [fuelType, setFuelType] = useState("gasolina");
  const [saving, setSaving] = useState(false);

  const ts = parseFloat(totalSpent.replace(",", "."));
  const pp = parseFloat(pricePerLiter.replace(",", "."));
  const ec = parseFloat(estimatedConsumption.replace(",", "."));

  const liters = ts > 0 && pp > 0 ? calcLiters(ts, pp) : 0;
  const estimatedRange = liters > 0 && ec > 0 ? calcEstimatedRange(liters, ec) : 0;

  const handleSave = async () => {
    if (!user) return;
    if (ts <= 0 || pp <= 0 || ec <= 0) {
      toast.error("Preencha todos os campos corretamente");
      return;
    }
    if (hasOpenEntry) {
      toast.error("Feche o ciclo anterior antes de registrar um novo abastecimento");
      return;
    }

    setSaving(true);
    try {
      await insertEntry({
        user_id: user.id,
        fuel_price: pp,
        liters,
        km: 0,
        fuel_type: fuelType,
        vehicle_name: vehicleName || "Meu veículo",
        usage_type: "misto",
        estimated_consumption: ec,
        estimated_range: estimatedRange,
        total_cost: ts,
        status: "open",
      });
      await Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
      toast.success("Abastecimento registrado!");
      setTotalSpent("");
      setPricePerLiter("");
      setVehicleName("");
      onSaved();
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Fuel className="h-5 w-5 text-primary" />
          Novo Abastecimento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasOpenEntry && (
          <div className="rounded-lg bg-warning/10 border border-warning/30 p-3 text-sm text-warning">
            ⚠️ Você tem um abastecimento em aberto. Feche o ciclo anterior primeiro.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Quanto abasteceu? (R$)
            </Label>
            <Input
              placeholder="100,00"
              value={totalSpent}
              onChange={(e) => setTotalSpent(e.target.value)}
              className="bg-muted/50 border-border/50 text-lg font-semibold h-12"
              inputMode="decimal"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Preço do litro (R$)
            </Label>
            <Input
              placeholder="6,36"
              value={pricePerLiter}
              onChange={(e) => setPricePerLiter(e.target.value)}
              className="bg-muted/50 border-border/50 text-lg font-semibold h-12"
              inputMode="decimal"
            />
          </div>
        </div>

        {liters > 0 && (
          <div className="rounded-lg bg-primary/10 border border-primary/30 p-3 text-center animate-fade-in">
            <p className="text-xs text-muted-foreground">Litros abastecidos</p>
            <p className="text-2xl font-bold text-primary">{formatNumber(liters)} L</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1">
              <Gauge className="h-3 w-3" /> Consumo estimado (km/l)
            </Label>
            <Input
              placeholder="12"
              value={estimatedConsumption}
              onChange={(e) => setEstimatedConsumption(e.target.value)}
              className="bg-muted/50 border-border/50 text-lg font-semibold h-12"
              inputMode="decimal"
            />
            {suggestedConsumption > 0 && (
              <p className="text-[10px] text-primary">Sugerido pelo histórico: {formatNumber(suggestedConsumption)} km/l</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Combustível</Label>
            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              className="w-full h-12 rounded-md bg-muted/50 border border-border/50 px-3 text-sm text-foreground"
            >
              <option value="gasolina">Gasolina</option>
              <option value="etanol">Etanol</option>
              <option value="diesel">Diesel</option>
              <option value="gnv">GNV</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Veículo (opcional)</Label>
          <Input
            placeholder="Meu carro"
            value={vehicleName}
            onChange={(e) => setVehicleName(e.target.value)}
            className="bg-muted/50 border-border/50"
          />
        </div>

        {estimatedRange > 0 && (
          <div className="rounded-lg bg-info/10 border border-info/30 p-4 text-center animate-fade-in">
            <Route className="h-6 w-6 mx-auto mb-1 text-info" />
            <p className="text-xs text-muted-foreground">Autonomia estimada</p>
            <p className="text-3xl font-extrabold text-info">{formatNumber(estimatedRange, 0)} km</p>
            <p className="text-xs text-muted-foreground mt-1">
              Com {formatNumber(liters)} L a {formatNumber(ec)} km/l
            </p>
          </div>
        )}

        <Button
          variant="hero"
          size="lg"
          className="w-full"
          onClick={handleSave}
          disabled={saving || hasOpenEntry || ts <= 0 || pp <= 0 || ec <= 0}
        >
          {saving ? "Salvando..." : "Salvar abastecimento"}
        </Button>
      </CardContent>
    </Card>
  );
}
