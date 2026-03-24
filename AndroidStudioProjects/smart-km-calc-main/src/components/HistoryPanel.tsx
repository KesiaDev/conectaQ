import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { History, Trash2, Fuel, CheckCircle2, Clock, Pencil, X } from "lucide-react";
import { formatCurrency, formatNumber, calcLiters } from "@/lib/calculations";
import { deleteAllEntries, deleteEntry, updateEntry } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import type { FuelEntryRow } from "@/types";

interface Props {
  entries: FuelEntryRow[];
  onClear: () => void;
}

const fuelLabels: Record<string, string> = {
  gasolina: "Gasolina",
  etanol: "Etanol",
  diesel: "Diesel",
  gnv: "GNV",
};

export default function HistoryPanel({ entries, onClear }: Props) {
  const { user } = useAuth();
  const [editingEntry, setEditingEntry] = useState<FuelEntryRow | null>(null);
  const [editTotalCost, setEditTotalCost] = useState("");
  const [editFuelPrice, setEditFuelPrice] = useState("");
  const [editEstConsumption, setEditEstConsumption] = useState("");
  const [editActualKm, setEditActualKm] = useState("");
  const [editVehicle, setEditVehicle] = useState("");
  const [saving, setSaving] = useState(false);

  const openEdit = (entry: FuelEntryRow) => {
    const totalCost = entry.total_cost || entry.liters * entry.fuel_price;
    setEditingEntry(entry);
    setEditTotalCost(formatNumber(totalCost));
    setEditFuelPrice(formatNumber(entry.fuel_price));
    setEditEstConsumption(entry.estimated_consumption ? formatNumber(entry.estimated_consumption) : "");
    setEditActualKm(entry.actual_km ? formatNumber(entry.actual_km, 0) : "");
    setEditVehicle(entry.vehicle_name);
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;
    const tc = parseFloat(editTotalCost.replace(",", "."));
    const fp = parseFloat(editFuelPrice.replace(",", "."));
    const ec = parseFloat(editEstConsumption.replace(",", "."));
    const ak = parseFloat(editActualKm.replace(",", "."));

    if (tc <= 0 || fp <= 0) {
      toast.error("Valor e preço do litro são obrigatórios");
      return;
    }

    const liters = calcLiters(tc, fp);
    const estimatedRange = ec > 0 ? liters * ec : null;
    const isClosed = editingEntry.status === "closed";

    const updates: Database["public"]["Tables"]["fuel_entries"]["Update"] = {
      fuel_price: fp,
      liters,
      total_cost: tc,
      estimated_consumption: ec > 0 ? ec : null,
      estimated_range: estimatedRange,
      vehicle_name: editVehicle || "Meu veículo",
    };

    if (isClosed && ak > 0) {
      updates.actual_km = ak;
      updates.actual_consumption = ak / liters;
      updates.cost_per_km = tc / ak;
    }

    setSaving(true);
    try {
      await updateEntry(editingEntry.id, updates);
      await Haptics.notification({ type: NotificationType.Success }).catch(() => {});
      toast.success("Registro atualizado!");
      setEditingEntry(null);
      onClear();
    } catch {
      toast.error("Erro ao atualizar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEntry(id);
      await Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      toast.success("Registro excluído!");
      onClear();
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  const handleClearAll = async () => {
    if (!user) return;
    try {
      await deleteAllEntries(user.id);
      onClear();
      toast.success("Histórico limpo!");
    } catch {
      toast.error("Erro ao limpar histórico");
    }
  };

  if (entries.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <History className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-muted-foreground">Nenhum registro ainda.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass-card">
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-muted-foreground" />
            Histórico de Abastecimentos
          </CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-1" /> Limpar tudo
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Limpar todo o histórico?</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser desfeita. Todos os registros serão excluídos permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Limpar tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
          {entries.map((entry) => {
            const isClosed = entry.status === "closed";
            const totalCost = entry.total_cost || entry.liters * entry.fuel_price;
            return (
              <div
                key={entry.id}
                className={`p-3 rounded-lg border ${isClosed ? 'bg-muted/20 border-border/30' : 'bg-warning/5 border-warning/30'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm font-medium">{entry.vehicle_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {fuelLabels[entry.fuel_type] || entry.fuel_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(entry)} title="Editar">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" title="Excluir">
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            O registro de {new Date(entry.date).toLocaleDateString("pt-BR")} será excluído permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(entry.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <div className="flex items-center gap-1 ml-1">
                      {isClosed ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <Clock className="h-3.5 w-3.5 text-warning" />
                      )}
                      <span className={`text-[10px] uppercase font-medium ${isClosed ? 'text-primary' : 'text-warning'}`}>
                        {isClosed ? "Fechado" : "Aberto"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs">
                  <div>
                    <span className="text-muted-foreground">Data: </span>
                    <span className="font-medium">{new Date(entry.date).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valor: </span>
                    <span className="font-medium">{formatCurrency(totalCost)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Litros: </span>
                    <span className="font-medium">{formatNumber(entry.liters)} L</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">R$/L: </span>
                    <span className="font-medium">{formatCurrency(entry.fuel_price)}</span>
                  </div>
                  {entry.estimated_consumption && (
                    <div>
                      <span className="text-muted-foreground">Est.: </span>
                      <span className="font-medium">{formatNumber(entry.estimated_consumption)} km/l</span>
                    </div>
                  )}
                  {entry.estimated_range && (
                    <div>
                      <span className="text-muted-foreground">Autonomia est.: </span>
                      <span className="font-medium">{formatNumber(entry.estimated_range, 0)} km</span>
                    </div>
                  )}
                  {isClosed && entry.actual_km && (
                    <>
                      <div>
                        <span className="text-muted-foreground">KM real: </span>
                        <span className="font-medium text-info">{formatNumber(entry.actual_km, 0)} km</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Consumo real: </span>
                        <span className="font-medium text-primary">{formatNumber(entry.actual_consumption || 0)} km/l</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">R$/km: </span>
                        <span className="font-medium text-destructive">{formatCurrency(entry.cost_per_km || 0)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Registro</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Valor abastecido (R$)</Label>
                <Input value={editTotalCost} onChange={(e) => setEditTotalCost(e.target.value)} inputMode="decimal" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Preço/litro (R$)</Label>
                <Input value={editFuelPrice} onChange={(e) => setEditFuelPrice(e.target.value)} inputMode="decimal" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Consumo estimado (km/l)</Label>
                <Input value={editEstConsumption} onChange={(e) => setEditEstConsumption(e.target.value)} inputMode="decimal" />
              </div>
              {editingEntry?.status === "closed" && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">KM real percorrido</Label>
                  <Input value={editActualKm} onChange={(e) => setEditActualKm(e.target.value)} inputMode="decimal" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Veículo</Label>
              <Input value={editVehicle} onChange={(e) => setEditVehicle(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEntry(null)}>Cancelar</Button>
            <Button variant="hero" onClick={handleSaveEdit} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
