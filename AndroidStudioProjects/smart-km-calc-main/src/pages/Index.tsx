import { useState, useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Fuel, PlusCircle, ArrowRightLeft, History, LogOut, CheckCircle2, Milestone, Car, Users } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import DashboardSummary from "@/components/DashboardSummary";
import InsightsCard from "@/components/InsightsCard";
import NewRefuelForm from "@/components/NewRefuelForm";
import CloseCycleForm from "@/components/CloseCycleForm";
import SmartFuelComparison from "@/components/SmartFuelComparison";
import TollsPanel from "@/components/TollsPanel";
import TripSplitter from "@/components/TripSplitter";
import VehicleCostsPanel from "@/components/VehicleCostsPanel";
import HistoryPanel from "@/components/HistoryPanel";
import { useAuth } from "@/hooks/useAuth";
import { fetchEntries, getOpenEntry } from "@/lib/api";
import { calcWeightedAvgConsumption } from "@/lib/calculations";
import type { FuelEntryRow } from "@/types";

export default function Index() {
  const { user, signOut } = useAuth();
  const [entries, setEntries] = useState<FuelEntryRow[]>([]);
  const [openEntry, setOpenEntry] = useState<FuelEntryRow | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [data, open] = await Promise.all([
        fetchEntries(user.id),
        getOpenEntry(user.id),
      ]);
      setEntries(data);
      setOpenEntry(open);
    } catch (err) {
      console.error("Error fetching entries:", err);
      toast.error("Não foi possível carregar os dados. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const closedEntries = useMemo(() => entries.filter(e => e.status === "closed"), [entries]);
  const suggestedConsumption = useMemo(() => calcWeightedAvgConsumption(closedEntries), [closedEntries]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-lg sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <img src="/icon-512.png" alt="Km por Litro" className="h-8 w-8 rounded-lg" />
            <div>
              <h1 className="text-base font-bold leading-tight">Km por Litro</h1>
              <p className="text-[10px] text-muted-foreground leading-none">Consumo e Custo de Combustível</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={signOut} title="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-4 pb-24 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full bg-muted/50 p-1 h-auto grid grid-cols-4 sm:grid-cols-8">
            <TabsTrigger value="home" className="flex flex-col items-center gap-0.5 py-2 text-[10px] data-[state=active]:bg-card data-[state=active]:shadow">
              <Fuel className="h-4 w-4" />
              <span>Início</span>
            </TabsTrigger>
            <TabsTrigger value="refuel" className="flex flex-col items-center gap-0.5 py-2 text-[10px] data-[state=active]:bg-card data-[state=active]:shadow">
              <PlusCircle className="h-4 w-4" />
              <span>Abastecer</span>
            </TabsTrigger>
            <TabsTrigger value="close" className="flex flex-col items-center gap-0.5 py-2 text-[10px] data-[state=active]:bg-card data-[state=active]:shadow relative">
              <CheckCircle2 className="h-4 w-4" />
              <span>Fechar</span>
              {openEntry && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-warning animate-pulse" />
              )}
            </TabsTrigger>
            <TabsTrigger value="tolls" className="flex flex-col items-center gap-0.5 py-2 text-[10px] data-[state=active]:bg-card data-[state=active]:shadow">
              <Milestone className="h-4 w-4" />
              <span>Pedágios</span>
            </TabsTrigger>
            <TabsTrigger value="costs" className="flex flex-col items-center gap-0.5 py-2 text-[10px] data-[state=active]:bg-card data-[state=active]:shadow">
              <Car className="h-4 w-4" />
              <span>Custos</span>
            </TabsTrigger>
            <TabsTrigger value="split" className="flex flex-col items-center gap-0.5 py-2 text-[10px] data-[state=active]:bg-card data-[state=active]:shadow">
              <Users className="h-4 w-4" />
              <span>Dividir</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex flex-col items-center gap-0.5 py-2 text-[10px] data-[state=active]:bg-card data-[state=active]:shadow">
              <ArrowRightLeft className="h-4 w-4" />
              <span>Combustível</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex flex-col items-center gap-0.5 py-2 text-[10px] data-[state=active]:bg-card data-[state=active]:shadow">
              <History className="h-4 w-4" />
              <span>Histórico</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : (
              <>
                <DashboardSummary entries={entries} />
                <InsightsCard entries={entries} />
              </>
            )}
          </TabsContent>

          <TabsContent value="refuel">
            <NewRefuelForm
              suggestedConsumption={suggestedConsumption}
              onSaved={() => { refresh(); setActiveTab("home"); }}
              hasOpenEntry={!!openEntry}
            />
          </TabsContent>

          <TabsContent value="close">
            {openEntry ? (
              <CloseCycleForm
                openEntry={openEntry}
                onClosed={() => { refresh(); setActiveTab("home"); }}
              />
            ) : (
              <div className="text-center py-12 space-y-2">
                <CheckCircle2 className="h-10 w-10 mx-auto text-primary/40" />
                <p className="text-muted-foreground">Nenhum ciclo em aberto</p>
                <p className="text-sm text-muted-foreground/60">Registre um abastecimento para começar</p>
                <Button variant="outline" className="mt-3" onClick={() => setActiveTab("refuel")}>
                  <PlusCircle className="h-4 w-4 mr-1" /> Novo abastecimento
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tolls">
            <TollsPanel entries={entries} />
          </TabsContent>

          <TabsContent value="costs">
            <VehicleCostsPanel entries={entries} />
          </TabsContent>

          <TabsContent value="split">
            <TripSplitter entries={entries} />
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <SmartFuelComparison entries={entries} />
          </TabsContent>

          <TabsContent value="history">
            <HistoryPanel entries={entries} onClear={refresh} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
