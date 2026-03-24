import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Share2, DollarSign, Route, Milestone } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/calculations";
import { fetchAllTolls, type TollRow } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { FuelEntryRow } from "@/models/types";

interface Props {
  entries: FuelEntryRow[];
}

export default function TripSplitter({ entries }: Props) {
  const { user } = useAuth();
  const [fuelCost, setFuelCost] = useState("");
  const [tollCost, setTollCost] = useState("");
  const [passengers, setPassengers] = useState("2");
  const [selectedEntryId, setSelectedEntryId] = useState("");
  const [tolls, setTolls] = useState<TollRow[]>([]);

  const closedEntries = entries.filter((e) => e.status === "closed");

  // Load tolls for selected entry
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

  // Auto-fill from selected entry
  useEffect(() => {
    if (!selectedEntryId) return;
    const entry = entries.find((e) => e.id === selectedEntryId);
    if (entry) {
      const cost = entry.total_cost || entry.liters * entry.fuel_price;
      setFuelCost(cost.toFixed(2).replace(".", ","));
      const entryTolls = tolls.filter((t) => t.fuel_entry_id === selectedEntryId);
      const totalToll = entryTolls.reduce((s, t) => s + t.amount, 0);
      setTollCost(totalToll.toFixed(2).replace(".", ","));
    }
  }, [selectedEntryId, entries, tolls]);

  const fc = parseFloat(fuelCost.replace(",", ".")) || 0;
  const tc = parseFloat(tollCost.replace(",", ".")) || 0;
  const p = parseInt(passengers) || 0;
  const total = fc + tc;
  const perPerson = p > 0 ? total / p : 0;

  const handleShare = () => {
    const text = `🚗 Divisão de viagem\n💰 Combustível: ${formatCurrency(fc)}\n🛣️ Pedágios: ${formatCurrency(tc)}\n📊 Total: ${formatCurrency(total)}\n👥 ${p} pessoas → ${formatCurrency(perPerson)} cada\n\n— Km por Litro`;
    if (navigator.share) {
      navigator.share({ title: "Divisão de Viagem", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Texto copiado!");
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-info" />
          Dividir Viagem
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Optional: pick from entry */}
        {closedEntries.length > 0 && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Preencher de um abastecimento (opcional)
            </Label>
            <select
              value={selectedEntryId}
              onChange={(e) => setSelectedEntryId(e.target.value)}
              className="w-full h-10 rounded-md bg-muted/50 border border-border/50 px-3 text-sm text-foreground"
            >
              <option value="">Inserir manualmente</option>
              {closedEntries.map((entry) => {
                const cost = entry.total_cost || entry.liters * entry.fuel_price;
                return (
                  <option key={entry.id} value={entry.id}>
                    {new Date(entry.date).toLocaleDateString("pt-BR")} —{" "}
                    {formatCurrency(cost)} — {entry.vehicle_name}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Combustível
            </Label>
            <Input
              placeholder="150,00"
              value={fuelCost}
              onChange={(e) => setFuelCost(e.target.value)}
              className="bg-muted/50 border-border/50 font-semibold"
              inputMode="decimal"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Milestone className="h-3 w-3" /> Pedágios
            </Label>
            <Input
              placeholder="25,00"
              value={tollCost}
              onChange={(e) => setTollCost(e.target.value)}
              className="bg-muted/50 border-border/50 font-semibold"
              inputMode="decimal"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Users className="h-3 w-3" /> Pessoas
            </Label>
            <Input
              placeholder="2"
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
              className="bg-muted/50 border-border/50 font-semibold"
              inputMode="numeric"
            />
          </div>
        </div>

        {total > 0 && p > 0 && (
          <div className="rounded-lg bg-info/10 border border-info/30 p-4 text-center animate-scale-in space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Valor por pessoa
            </p>
            <p className="text-3xl font-extrabold text-info">
              {formatCurrency(perPerson)}
            </p>
            <p className="text-xs text-muted-foreground">
              Total {formatCurrency(total)} ÷ {p} pessoas
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="mt-2"
            >
              <Share2 className="h-4 w-4 mr-1" /> Compartilhar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
