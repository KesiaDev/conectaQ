import { apiFuelEntries, apiTolls, type FuelEntryRow, type TollRow } from "@/lib/apiClient";

export type { FuelEntryRow, TollRow };

export async function fetchEntries(): Promise<FuelEntryRow[]> {
  return apiFuelEntries.list();
}

export async function getOpenEntry(): Promise<FuelEntryRow | null> {
  const entries = await apiFuelEntries.list("open");
  return entries[0] ?? null;
}

export async function insertEntry(entry: {
  fuel_price: number;
  liters?: number;
  fuel_type?: string;
  vehicle_name?: string;
  usage_type?: string;
  estimated_consumption?: number;
  estimated_range?: number;
  total_cost?: number;
  km?: number;
}): Promise<FuelEntryRow> {
  return apiFuelEntries.create({ ...entry, status: "open" });
}

export async function closeCycle(
  entryId: string,
  actualKm: number,
  liters: number,
  totalCost: number
): Promise<FuelEntryRow> {
  const actualConsumption = actualKm / liters;
  const costPerKm = totalCost / actualKm;
  return apiFuelEntries.update(entryId, {
    actual_km: actualKm,
    actual_consumption: actualConsumption,
    cost_per_km: costPerKm,
    status: "closed",
  });
}

export async function updateEntry(id: string, updates: Record<string, unknown>): Promise<FuelEntryRow> {
  return apiFuelEntries.update(id, updates);
}

export async function deleteEntry(id: string): Promise<void> {
  return apiFuelEntries.delete(id);
}

export async function deleteAllEntries(): Promise<void> {
  const entries = await apiFuelEntries.list();
  await Promise.all(entries.map((e) => apiFuelEntries.delete(e.id)));
}

export async function fetchTolls(fuelEntryId: string): Promise<TollRow[]> {
  return apiTolls.list(fuelEntryId);
}

export async function fetchAllTolls(): Promise<TollRow[]> {
  return apiTolls.list();
}

export async function insertToll(toll: {
  fuel_entry_id?: string;
  description?: string;
  amount: number;
  user_id?: string; // kept for compatibility, ignored by backend
}): Promise<TollRow> {
  return apiTolls.create({
    fuel_entry_id: toll.fuel_entry_id,
    description: toll.description,
    amount: toll.amount,
  });
}

export async function deleteToll(id: string): Promise<void> {
  return apiTolls.delete(id);
}
