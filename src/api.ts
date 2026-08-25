import {
  Animal,
  MilkRecord,
  MilkAlert,
  BreedingEvent,
  CalvingRecord,
  CalfGrowthRecord,
  Disease,
  MedicineItem,
  HealthRecord,
  VaccinationSchedule,
  FeedItem,
  RationPlan,
  Customer,
  Supplier,
  FinancialTransaction,
  TaskItem,
  MultiFarm,
  FarmSettings,
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const TOKEN_KEY = "dairy_farm_session_token";
const OFFLINE_QUEUE_KEY = "dairy_farm_offline_queue";

export function getSessionToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setSessionToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearSessionToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return !!getSessionToken();
}

// --- OFFLINE QUEUE UTILS ---
export function getOfflineQueue(): Array<{ id: string; url: string; method: string; body: any; timestamp: string; label: string }> {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToOfflineQueue(url: string, method: string, body: any, label: string) {
  const queue = getOfflineQueue();
  queue.push({
    id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    url,
    method,
    body,
    timestamp: new Date().toISOString(),
    label,
  });
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export function clearOfflineQueue() {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
}

export async function flushOfflineQueue(): Promise<number> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return 0;
  let successCount = 0;
  const remaining = [];

  for (const item of queue) {
    try {
      await request(item.url, {
        method: item.method,
        body: JSON.stringify(item.body),
      });
      successCount++;
    } catch {
      remaining.push(item);
    }
  }

  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
  return successCount;
}

// --- CORE FETCH HELPER ---
async function request(path: string, options: RequestInit = {}) {
  const token = getSessionToken();
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) headers.set("x-session-token", token);

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorText = "Request failed";
    try {
      const err = await res.json();
      errorText = err.message || err.error || JSON.stringify(err);
    } catch {
      errorText = `Error ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorText);
  }

  return res.json();
}

// --- AUTH & ROLES ---
export async function login(email: string, password: string) {
  const result = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (result?.data?.token) {
    setSessionToken(result.data.token);
  }
  return result;
}

export async function logout() {
  try {
    await request("/auth/logout", { method: "POST" });
  } catch {
    // Ignore error on logout
  }
  clearSessionToken();
}

export async function getAuthMe() {
  return request("/auth/me");
}

export async function switchUserRole(role: string) {
  return request("/auth/switch-role", {
    method: "POST",
    body: JSON.stringify({ role }),
  });
}

// --- MULTI-FARM ---
export async function getMultiFarms(): Promise<MultiFarm[]> {
  return request("/farms");
}

export async function switchFarm(farmId: number) {
  return request("/farms/switch", {
    method: "POST",
    body: JSON.stringify({ farmId }),
  });
}

// --- DASHBOARD ---
export async function getDashboard() {
  const res = await request("/dashboard/summary");
  return res.data || res;
}

// --- ANIMALS ---
export async function getAnimals(params?: { search?: string; status?: string; breed?: string }): Promise<Animal[]> {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.status && params.status !== "All" && params.status !== "ALL") q.set("status", params.status);
  if (params?.breed && params.breed !== "All" && params.breed !== "ALL") q.set("breed", params.breed);
  const path = `/animals${q.toString() ? `?${q.toString()}` : ""}`;
  return request(path);
}

export async function getAnimalById(id: string): Promise<Animal> {
  return request(`/animals/${id}`);
}

export async function getBreeds(): Promise<any[]> {
  try {
    return await request("/breeds");
  } catch {
    return [
      { id: "1", name: "HF (Holstein Friesian)", species: "Cattle" },
      { id: "2", name: "Jersey", species: "Cattle" },
      { id: "3", name: "Sahiwal", species: "Cattle" },
      { id: "4", name: "Crossbred (HF x Sahiwal)", species: "Cattle" },
      { id: "5", name: "Cholistani", species: "Cattle" },
      { id: "6", name: "Red Sindhi", species: "Cattle" },
      { id: "7", name: "Nili-Ravi", species: "Buffalo" },
      { id: "8", name: "Kundi", species: "Buffalo" },
      { id: "9", name: "Murrah", species: "Buffalo" },
    ];
  }
}

export async function createAnimal(data: Partial<Animal>): Promise<Animal> {
  return request("/animals", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAnimal(id: string, data: Partial<Animal>): Promise<Animal> {
  const targetId = (id && id !== "undefined") ? id : (data.id || "HF-027");
  return request(`/animals/${targetId}`, {
    method: "PUT",
    body: JSON.stringify({ ...data, id: targetId }),
  });
}

export async function deleteAnimal(id: string): Promise<any> {
  return request(`/animals/${id}`, {
    method: "DELETE",
  });
}

export async function sellAnimal(id: string, data: { buyer: string; salePrice: number; reason: string; weight: number }): Promise<any> {
  return request(`/animals/${id}/sell`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function recordMortality(id: string, data: { cause: string; diseaseHistory: string; treatmentNotes: string; financialValue: number; postMortemNotes: string }): Promise<any> {
  return request(`/animals/${id}/mortality`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// --- MILK RECORDS & ALERTS ---
export async function getMilkRecords(): Promise<MilkRecord[]> {
  return request("/milk-records");
}

export async function createMilkRecord(data: Partial<MilkRecord>): Promise<MilkRecord> {
  return request("/milk-records", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMilkAlerts(): Promise<MilkAlert[]> {
  return request("/milk-alerts");
}

export async function acknowledgeMilkAlert(id: string): Promise<any> {
  return request(`/milk-alerts/${id}/acknowledge`, { method: "POST" });
}

// --- BREEDING & CALVING ---
export async function getBreedingEvents(): Promise<BreedingEvent[]> {
  return request("/breeding");
}

export async function createBreedingEvent(data: Partial<BreedingEvent>): Promise<BreedingEvent> {
  return request("/breeding", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getCalvingRecords(): Promise<CalvingRecord[]> {
  return request("/calving");
}

export async function createCalvingRecord(data: Partial<CalvingRecord> & { registerInHerd?: boolean }): Promise<CalvingRecord> {
  return request("/calving", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// --- CALVES & GROWTH ---
export async function getCalfGrowth(): Promise<CalfGrowthRecord[]> {
  return request("/calves/growth");
}

export async function createCalfGrowth(data: Partial<CalfGrowthRecord>): Promise<CalfGrowthRecord> {
  return request("/calves/growth", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// --- DISEASES & MEDICINES ---
export async function getDiseases(): Promise<Disease[]> {
  return request("/diseases");
}

export async function createDisease(data: Partial<Disease>): Promise<Disease> {
  return request("/diseases", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMedicines(): Promise<MedicineItem[]> {
  return request("/medicines");
}

// --- HEALTH RECORDS & VACCINATIONS ---
export async function getHealthRecords(): Promise<HealthRecord[]> {
  return request("/health-records");
}

export async function createHealthRecord(data: Partial<HealthRecord>): Promise<HealthRecord> {
  return request("/health-records", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getVaccinations(): Promise<VaccinationSchedule[]> {
  return request("/vaccinations");
}

export async function createVaccination(data: Partial<VaccinationSchedule>): Promise<VaccinationSchedule> {
  return request("/vaccinations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// --- FEEDS & RATIONS ---
export async function getFeeds(): Promise<FeedItem[]> {
  return request("/feeds");
}

export async function createFeed(data: Partial<FeedItem>): Promise<FeedItem> {
  return request("/feeds", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getRations(): Promise<RationPlan[]> {
  return request("/rations");
}

export async function createRation(data: Partial<RationPlan>): Promise<RationPlan> {
  return request("/rations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function distributeRationFeed(rationId: string): Promise<any> {
  return request("/feeds/distribute", {
    method: "POST",
    body: JSON.stringify({ rationId }),
  });
}

// --- INVENTORY ---
export async function getInventory(): Promise<any[]> {
  return request("/inventory");
}

export async function purchaseInventoryStock(data: any): Promise<any> {
  return request("/inventory/purchase", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// --- CUSTOMERS & SUPPLIERS ---
export async function getCustomers(): Promise<Customer[]> {
  return request("/customers");
}

export async function createCustomer(data: Partial<Customer>): Promise<Customer> {
  return request("/customers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getSuppliers(): Promise<Supplier[]> {
  return request("/suppliers");
}

export async function createSupplier(data: Partial<Supplier>): Promise<Supplier> {
  return request("/suppliers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// --- FINANCE ---
export async function getFinance(): Promise<FinancialTransaction[]> {
  return request("/finance");
}

export async function createTransaction(data: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
  return request("/finance", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// --- TASKS ---
export async function getTasks(): Promise<TaskItem[]> {
  return request("/tasks");
}

export async function createTask(data: Partial<TaskItem>): Promise<TaskItem> {
  return request("/tasks", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTask(id: string, data: Partial<TaskItem>): Promise<TaskItem> {
  return request(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTask(id: string): Promise<any> {
  return request(`/tasks/${id}`, {
    method: "DELETE",
  });
}

// --- SETTINGS ---
export async function getSettings(): Promise<FarmSettings> {
  return request("/settings");
}

export async function saveSettings(data: Partial<FarmSettings>): Promise<any> {
  return request("/settings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
