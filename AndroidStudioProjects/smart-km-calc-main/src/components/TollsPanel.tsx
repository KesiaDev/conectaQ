import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Milestone, Plus, Trash2, DollarSign, Route } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/calculations";
import { fetchTolls, insertToll, deleteToll, type TollRow } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { FuelEntryRow } from "@/lib/apiClient";

interface Props {
  entries: FuelEntryRow[];
}

export default function TollsPanel({ entries }: Props) {
  const { user } = useAuth();
  const [selectedEntryId, setSelectedEntryId] = useState("");
  const [tolls, setTolls] = useState<TollRow[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  // Auto-select latest closed entry
  useEffect(() => {
    const closedEntries = entries.filter(e => e.status === "closed");
    if (closedEntries.length > 0 && !selectedEntryId) {
      setSelectedEntryId(closedEntries[0].id);
    }
  }, [entries, selectedEntryId]);

  const loadTolls = useCallback(async () => {
    if (!selectedEntryId) return;
    try {
      const data = await fetchTolls(selectedEntryId);
      setTolls(data);
    } catch {
      console.error("Error loading tolls");
    }
  }, [selectedEntryId]);

  useEffect(() => {
    loadTolls();
  }, [loadTolls]);

  const selectedEntry = entries.find(e => e.id === selectedEntryId);
  const totalTolls = tolls.reduce((s, t) => s + t.amount, 0);
  const fuelCost = selectedEntry ? (selectedEntry.total_cost || selectedEntry.liters * selectedEntry.fuel_price) : 0;
  const totalCostWithTolls = fuelCost + totalTolls;
  const actualKm = selectedEntry?.actual_km || 0;
  const costPerKmFuel = actualKm > 0 ? fuelCost / actualKm : 0;
  const costPerKmTotal = actualKm > 0 ? totalCostWithTolls / actualKm : 0;

  const handleAdd = async () => {
    if (!user || !selectedEntryId) return;
    const a = parseFloat(amount.replace(",", "."));
    if (a <= 0 || isNaN(a)) {
      toast.error("Informe um valor válido");
      return;
    }
    setSaving(true);
    try {
      await insertToll({
        user_id: user.id,
        fuel_entry_id: selectedEntryId,
        description: description || "Pedágio",
        amount: a,
      });
      setDescription("");
      setAmount("");
      loadTolls();
      toast.success("Pedágio adicionado!");
    } catch {
      toast.error("Erro ao adicionar pedágio");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteToll(id);
      loadTolls();
      toast.success("Pedágio removido!");
    } catch {
      toast.error("Erro ao remover");
    }
  };

  const closedEntries = entries.filter(e => e.status === "closed");

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Milestone className="h-5 w-5 text-warning" />
            Pedágios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {closedEntries.length === 0 ? (
            <div className="text-center py-8">
              <Milestone className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-muted-foreground text-sm">Feche um ciclo primeiro para registrar pedágios</p>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Abastecimento</Label>
                <select
                  value={selectedEntryId}
                  onChange={(e) => setSelectedEntryId(e.target.value)}
                  className="w-full h-10 rounded-md bg-muted/50 border border-border/50 px-3 text-sm text-foreground"
                >
                  {closedEntries.map((entry) => {
                    const cost = entry.total_cost || entry.liters * entry.fuel_price;
                    return (
                      <option key={entry.id} value={entry.id}>
                        {new Date(entry.date).toLocaleDateString("pt-BR")} — {formatCurrency(cost)} — {entry.vehicle_name}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Add toll form */}
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs text-muted-foreground">Descrição</Label>
                  <Input
                    placeholder="Ex: Pedágio BR-101"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="w-28 space-y-1">
                  <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
                  <Input
                    placeholder="12,50"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-muted/50 border-border/50"
                    inputMode="decimal"
                  />
                </div>
                <Button variant="hero" size="icon" className="h-10 w-10 shrink-0" onClick={handleAdd} disabled={saving}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Toll list */}
              {tolls.length > 0 && (
                <div className="space-y-1.5">
                  {tolls.map((toll) => (
                    <div key={toll.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/30">
                      <div className="flex items-center gap-2">
                        <Milestone className="h-3.5 w-3.5 text-warning shrink-0" />
                        <span className="text-sm">{toll.description || "Pedágio"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{formatCurrency(toll.amount)}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(toll.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary */}
              {selectedEntry && actualKm > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <Card className="glass-card">
                    <CardContent className="p-3 text-center">
                      <DollarSign className="h-5 w-5 mx-auto mb-1 text-warning" />
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Pedágios</p>
                      <p className="text-xl font-bold text-warning">{formatCurrency(totalTolls)}</p>
                      <p className="text-[10px] text-muted-foreground">{tolls.length} pedágio{tolls.length !== 1 ? "s" : ""}</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card">
                    <CardContent className="p-3 text-center">
                      <Route className="h-5 w-5 mx-auto mb-1 text-destructive" />
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Custo Total/km</p>
                      <p className="text-xl font-bold text-destructive">{formatCurrency(costPerKmTotal)}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Combustível: {formatCurrency(costPerKmFuel)}/km + Pedágio: {actualKm > 0 ? formatCurrency(totalTolls / actualKm) : "R$ 0,00"}/km
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card sm:col-span-2">
                    <CardContent className="p-3 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Custo Total do Percurso</p>
                      <p className="text-2xl font-extrabold gradient-text">{formatCurrency(totalCostWithTolls)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(fuelCost)} (combustível) + {formatCurrency(totalTolls)} (pedágios) em {formatNumber(actualKm, 0)} km
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
