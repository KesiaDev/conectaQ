const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getToken(): string | null {
  return localStorage.getItem("km_token");
}

export function saveToken(token: string) {
  localStorage.setItem("km_token", token);
}

export function clearToken() {
  localStorage.removeItem("km_token");
  localStorage.removeItem("km_user");
}

export function saveUser(user: ApiUser) {
  localStorage.setItem("km_user", JSON.stringify(user));
}

export function getStoredUser(): ApiUser | null {
  const raw = localStorage.getItem("km_user");
  return raw ? JSON.parse(raw) : null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface ApiUser {
  id: string;
  email: string;
  name?: string | null;
  createdAt: string;
}

// snake_case matching Supabase types (for compatibility with existing components)
export interface FuelEntryRow {
  id: string;
  user_id: string;
  date: string;
  fuel_price: number;
  liters: number;
  fuel_type: string;
  vehicle_name?: string | null;
  usage_type?: string | null;
  estimated_consumption?: number | null;
  estimated_range?: number | null;
  total_cost?: number | null;
  km?: number | null;
  actual_km?: number | null;
  actual_consumption?: number | null;
  cost_per_km?: number | null;
  status: string;
  created_at: string;
  tolls?: TollRow[];
}

export interface TollRow {
  id: string;
  user_id: string;
  fuel_entry_id?: string | null;
  description?: string | null;
  amount: number;
  created_at: string;
}

export const apiAuth = {
  register: (email: string, password: string, name?: string) =>
    request<{ token: string; user: ApiUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),
  login: (email: string, password: string) =>
    request<{ token: string; user: ApiUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ user: ApiUser }>("/auth/me"),
};

export const apiFuelEntries = {
  list: (status?: string) =>
    request<FuelEntryRow[]>(`/fuel-entries${status ? `?status=${status}` : ""}`),
  create: (data: Record<string, unknown>) =>
    request<FuelEntryRow>("/fuel-entries", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    request<FuelEntryRow>(`/fuel-entries/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/fuel-entries/${id}`, { method: "DELETE" }),
};

export const apiTolls = {
  list: (fuelEntryId?: string) =>
    request<TollRow[]>(`/tolls${fuelEntryId ? `?fuelEntryId=${fuelEntryId}` : ""}`),
  create: (data: Record<string, unknown>) =>
    request<TollRow>("/tolls", { method: "POST", body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/tolls/${id}`, { method: "DELETE" }),
};

export const apiVehicleCosts = {
  list: () => request<VehicleCostEntry[]>("/vehicle-costs"),
  create: (data: Record<string, unknown>) =>
    request<VehicleCostEntry>("/vehicle-costs", { method: "POST", body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/vehicle-costs/${id}`, { method: "DELETE" }),
};

export interface VehicleCostEntry {
  id: string;
  user_id: string;
  category: string;
  description?: string | null;
  amount: number;
  date: string;
  created_at: string;
}
