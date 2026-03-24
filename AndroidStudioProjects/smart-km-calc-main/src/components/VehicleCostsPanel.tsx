import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, Plus, Trash2, DollarSign, Wrench, Shield, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/calculations";
import { useAuth } from "@/hooks/useAuth";
import { apiVehicleCosts } from "@/lib/apiClient";
import { toast } from "sonner";
import { calculateTotalCost } from "@/services/costAnalysisService";
import { fetchAllTolls, type TollRow } from "@/lib/api";
import type { FuelEntryRow, VehicleCostEntry } from "@/models/types";

const categories = [
  { value: "manutencao", label: "Manutenção", icon: Wrench },
  { value: "seguro", label: "Seguro", icon: Shield },
  { value: "ipva", label: "IPVA", icon: FileText },
  { value: "outro", label: "Outro", icon: DollarSign },
];

interface Props {
  entries: FuelEntryRow[];
}

export default function VehicleCostsPanel({ entries }: Props) {
  const { user } = useAuth();
  const [costs, setCosts] = useState<VehicleCostEntry[]>([]);
  const [tolls, setTolls] = useState<TollRow[]>([]);
  const [category, setCategory] = useState("manutencao");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [costData, tollData] = await Promise.all([
        apiVehicleCosts.list(),
        fetchAllTolls(),
      ]);
      setCosts(costData);
      setTolls(tollData);
    } catch {
      console.error("Error loading costs");
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdd = async () => {
    if (!user) return;
    const a = parseFloat(amount.replace(",", "."));
    if (isNaN(a) || a <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    setSaving(true);
    try {
      await apiVehicleCosts.create({
        category,
        description: description || categories.find((c) => c.value === category)?.label || "Custo",
        amount: a,
      });
      setDescription("");
      setAmount("");
      loadData();
      toast.success("Custo registrado!");
    } catch {
      toast.error("Erro ao registrar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiVehicleCosts.delete(id);
      loadData();
      toast.success("Custo removido!");
    } catch {
      toast.error("Erro ao remover");
    }
  };

  const summary = calculateTotalCost(entries, tolls, costs);

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Car className="h-5 w-5 text-primary" />
            Custo do Veículo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add cost form */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Categoria</Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 rounded-md bg-muted/50 border border-border/50 px-3 text-sm text-foreground"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
                <Input
                  placeholder="500,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-muted/50 border-border/50"
                  inputMode="decimal"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground">Descrição</Label>
                <Input
                  placeholder="Ex: Troca de óleo"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-muted/50 border-border/50"
                />
              </div>
              <Button
                variant="hero"
                size="icon"
                className="h-10 w-10 shrink-0 self-end"
                onClick={handleAdd}
                disabled={saving}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Cost list */}
          {costs.length > 0 && (
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
              {costs.map((cost) => {
                const cat = categories.find((c) => c.value === cost.category);
                const Icon = cat?.icon || DollarSign;
                return (
                  <div
                    key={cost.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/30"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div>
                        <span className="text-sm">{cost.description}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {new Date(cost.date).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {formatCurrency(cost.amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(cost.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {(entries.length > 0 || costs.length > 0) && (
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Resumo de Custos Totais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Combustível</span>
              <span className="font-semibold">{formatCurrency(summary.fuelCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pedágios</span>
              <span className="font-semibold">{formatCurrency(summary.tollCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Manutenção</span>
              <span className="font-semibold">{formatCurrency(summary.maintenanceCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Seguro</span>
              <span className="font-semibold">{formatCurrency(summary.insuranceCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IPVA</span>
              <span className="font-semibold">{formatCurrency(summary.ipvaCost)}</span>
            </div>
            {summary.otherCost > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Outros</span>
                <span className="font-semibold">{formatCurrency(summary.otherCost)}</span>
              </div>
            )}
            <div className="border-t border-border/50 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-semibold">Total Geral</span>
                <span className="text-lg font-bold gradient-text">{formatCurrency(summary.totalCost)}</span>
              </div>
              {summary.costPerKm > 0 && (
                <div className="flex justify-between mt-1">
                  <span className="text-muted-foreground">Custo total/km</span>
                  <span className="font-bold text-destructive">{formatCurrency(summary.costPerKm)}</span>
                </div>
              )}
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">Média mensal</span>
                <span className="font-bold text-accent">{formatCurrency(summary.monthlyAvg)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
