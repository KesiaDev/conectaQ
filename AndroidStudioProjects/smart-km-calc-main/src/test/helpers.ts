import type { FuelEntryRow } from "@/models/types";

let idCounter = 1;

export function makeFuelEntry(overrides: Partial<FuelEntryRow> = {}): FuelEntryRow {
  const id = String(idCounter++);
  return {
    id,
    user_id: "user-1",
    date: "2026-01-01T00:00:00Z",
    fuel_price: 6.0,
    liters: 20,
    fuel_type: "gasolina",
    vehicle_name: "Meu carro",
    usage_type: "misto",
    estimated_consumption: 12,
    estimated_range: 240,
    total_cost: 120,
    km: 0,
    actual_km: null,
    actual_consumption: null,
    cost_per_km: null,
    status: "open",
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  } as FuelEntryRow;
}

export function makeClosedEntry(overrides: Partial<FuelEntryRow> = {}): FuelEntryRow {
  return makeFuelEntry({
    status: "closed",
    actual_km: 240,
    actual_consumption: 12,
    cost_per_km: 0.5,
    ...overrides,
  });
}

export function makeTollRow(overrides: Partial<{ id: string; amount: number; description: string; fuel_entry_id: string }> = {}) {
  return {
    id: String(idCounter++),
    user_id: "user-1",
    fuel_entry_id: "entry-1",
    description: "Pedágio",
    amount: 10,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}
