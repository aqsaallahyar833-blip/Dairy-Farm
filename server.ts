import express, { Request, Response } from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import {
  initialAnimals,
  initialMilkRecords,
  initialMilkAlerts,
  initialBreedingEvents,
  initialCalvingRecords,
  initialCalfGrowth,
  initialDiseases,
  initialMedicines,
  initialHealthRecords,
  initialVaccinations,
  initialFeeds,
  initialRationPlans,
  initialCustomers,
  initialSuppliers,
  initialTransactions,
  initialTasks,
  initialMultiFarms,
  initialUserRoles,
  initialSettings
} from "./src/data";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-Memory Database Store initialized with rich dairy records
let animalsDb = [...initialAnimals];
let milkRecordsDb = [...initialMilkRecords];
let milkAlertsDb = [...initialMilkAlerts];
let breedingDb = [...initialBreedingEvents];
let calvingDb = [...initialCalvingRecords];
let calfGrowthDb = [...initialCalfGrowth];
let diseasesDb = [...initialDiseases];
let medicinesDb = [...initialMedicines];
let healthDb = [...initialHealthRecords];
let vaccinationsDb = [...initialVaccinations];
let feedsDb = [...initialFeeds];
let rationPlansDb = [...initialRationPlans];
let customersDb = [...initialCustomers];
let suppliersDb = [...initialSuppliers];
let transactionsDb = [...initialTransactions];
let tasksDb = [...initialTasks];
let multiFarmsDb = [...initialMultiFarms];
let farmSettings = { ...initialSettings };
let activeFarmId = 1;
let currentRole = "Manager";

const sessions = new Map<string, any>();
const defaultUser = {
  userId: 1,
  companyId: 1,
  name: "Muhammad Ali",
  email: "admin@dairyfarm.local",
  phone: "+92 300 1234567",
  roles: ["Owner", "Manager"],
};

// --- AUTH & ROLES ---
app.post("/api/auth/login", (req: Request, res: Response) => {
  const token = "session_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
  sessions.set(token, defaultUser);
  res.json({
    success: true,
    message: "Login successful.",
    data: { token, expiresInHours: 12, user: defaultUser }
  });
});

app.post("/api/auth/logout", (req: Request, res: Response) => {
  const token = req.headers["x-session-token"] as string;
  if (token) sessions.delete(token);
  res.json({ success: true, message: "Logged out.", data: {} });
});

app.get("/api/auth/me", (req: Request, res: Response) => {
  res.json({ success: true, data: defaultUser, activeRole: currentRole, activeFarmId });
});

app.post("/api/auth/switch-role", (req: Request, res: Response) => {
  if (req.body.role) {
    currentRole = req.body.role;
  }
  res.json({ success: true, role: currentRole });
});

// --- MULTI-FARM ---
app.get("/api/farms", (req: Request, res: Response) => {
  res.json(multiFarmsDb);
});

app.post("/api/farms/switch", (req: Request, res: Response) => {
  if (req.body.farmId) {
    activeFarmId = Number(req.body.farmId);
  }
  res.json({ success: true, activeFarmId });
});

// --- DASHBOARD SUMMARY ---
app.get("/api/dashboard/summary", (req: Request, res: Response) => {
  const totalAnimals = animalsDb.length || initialAnimals.length;
  const lactatingCows = animalsDb.filter(a => a.status === "Lactating").length;
  const dryCows = animalsDb.filter(a => a.status === "Dry").length;
  const pregnantCows = animalsDb.filter(a => a.status === "Pregnant" || (a.status === "Lactating" && breedingDb.some(b => b.animalId === a.id && b.result === "Positive"))).length;
  const heifers = animalsDb.filter(a => a.status === "Heifer").length;
  const calves = animalsDb.filter(a => a.status === "Calf").length;
  const bulls = animalsDb.filter(a => a.status === "Bull").length;
  const sickAnimals = animalsDb.filter(a => a.status === "Sick" || healthDb.some(h => h.animalId === a.id && h.status === "In Treatment")).length;
  const quarantineAnimals = animalsDb.filter(a => a.status === "Quarantine").length;

  const todayMilkLitres = milkRecordsDb.filter(r => r.date === "2024-05-14").reduce((acc, r) => acc + (r.totalLitres || 0), 0) || 1980.5;
  const yesterdayMilkLitres = milkRecordsDb.filter(r => r.date === "2024-05-13").reduce((acc, r) => acc + (r.totalLitres || 0), 0) || 1915.0;
  const avgMilkPerCow = lactatingCows > 0 ? (todayMilkLitres / lactatingCows) : 24.3;
  const monthlyMilkLitres = 26540.0;
  const milkRevenue = monthlyMilkLitres * (farmSettings.milkPricePerLitre || 150);

  const totalIncome = transactionsDb.filter(t => t.type === "Income").reduce((a, b) => a + b.amount, 0) || 655500;
  const totalExpenses = transactionsDb.filter(t => t.type === "Expense").reduce((a, b) => a + b.amount, 0) || 249500;
  const estimatedProfit = totalIncome - totalExpenses;

  const openCases = healthDb.filter(h => h.status === "In Treatment").length || 1;
  const pendingTasksCount = tasksDb.filter(t => t.status !== "Completed").length || 2;

  res.json({
    success: true,
    data: {
      totalAnimals,
      activeAnimals: lactatingCows || 7,
      lactatingCows: lactatingCows || 7,
      dryCows,
      pregnantCows,
      activePregnancies: pregnantCows || 2,
      heifers,
      calves,
      bulls,
      sickAnimals,
      quarantineAnimals,
      todayMilkLitres,
      yesterdayMilkLitres,
      avgMilkPerCow: Number(avgMilkPerCow.toFixed(1)),
      monthlyMilkLitres,
      milkRevenue,
      monthRevenue: milkRevenue || 3981000,
      totalIncome,
      totalExpenses,
      monthExpenses: totalExpenses,
      estimatedProfit,
      openCases,
      openHealthCases: openCases,
      underTreatmentHealthCases: openCases,
      pregnancyPositiveThisMonth: 2,
      breedingEventsThisMonth: breedingDb.length || 4,
      calvingsThisMonth: calvingDb.length || 2,
      pendingTasksCount,
      activeAlertsCount: milkAlertsDb.length + (sickAnimals > 0 ? 1 : 0),
      recentActivities: [
        { action: "Mastitis treatment recorded for HF-027", entityType: "Health", timestamp: "2024-05-14 09:30" },
        { action: "Morning milk batch recorded (1,980.5 L)", entityType: "Milk", timestamp: "2024-05-14 07:15" },
        { action: "Pregnancy confirmed for HF-052 via ultrasound", entityType: "Breeding", timestamp: "2024-05-13 16:45" },
        { action: "High Producer TMR feed distributed to Shed 1", entityType: "Feed", timestamp: "2024-05-14 06:00" },
      ]
    }
  });
});

// --- MASTER DATA & BREEDS ---
const defaultBreeds = [
  { id: "1", name: "HF (Holstein Friesian)", species: "Cattle", origin: "Netherlands", avgYield: 28, description: "High volume dairy production breed" },
  { id: "2", name: "Jersey", species: "Cattle", origin: "Channel Islands", avgYield: 20, description: "High butterfat & protein composition" },
  { id: "3", name: "Sahiwal", species: "Cattle", origin: "Pakistan / Punjab", avgYield: 14, description: "Heat & tick resistant tropical dairy breed" },
  { id: "4", name: "Crossbred (HF x Sahiwal)", species: "Cattle", origin: "Pakistan", avgYield: 22, description: "Tropical acclimatized high yield cross" },
  { id: "5", name: "Cholistani", species: "Cattle", origin: "Pakistan", avgYield: 12, description: "Hardy desert milch breed" },
  { id: "6", name: "Red Sindhi", species: "Cattle", origin: "Pakistan", avgYield: 13, description: "Disease resistant dairy cattle" },
  { id: "7", name: "Nili-Ravi", species: "Buffalo", origin: "Pakistan", avgYield: 16, description: "Premier dairy buffalo, 6.5%+ fat" },
  { id: "8", name: "Kundi", species: "Buffalo", origin: "Pakistan", avgYield: 14, description: "Sindh dairy buffalo breed" },
  { id: "9", name: "Murrah", species: "Buffalo", origin: "South Asia", avgYield: 15, description: "High yielding dairy buffalo" }
];

app.get(["/api/breeds", "/api/master/breeds", "/api/master-data/breeds"], (req: Request, res: Response) => {
  res.json(defaultBreeds);
});

// --- ANIMALS CRUD & LIFECYCLE ---
app.get("/api/animals", (req: Request, res: Response) => {
  const { search, status, breed } = req.query as { search?: string; status?: string; breed?: string };
  let results = [...animalsDb];
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(a =>
      a.id.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.earTag.toLowerCase().includes(q) ||
      (a.rfid && a.rfid.toLowerCase().includes(q))
    );
  }
  if (status && status !== "ALL" && status !== "All") {
    results = results.filter(a => a.status.toLowerCase() === status.toLowerCase());
  }
  if (breed && breed !== "ALL" && breed !== "All") {
    results = results.filter(a => a.breed.toLowerCase().includes(breed.toLowerCase()));
  }
  res.json(results);
});

app.get("/api/animals/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  const animal = animalsDb.find(a => a.id === id || String(a.dbId) === id);
  if (!animal) return res.status(404).json({ error: "Animal not found" });
  res.json(animal);
});

app.post("/api/animals", (req: Request, res: Response) => {
  const body = req.body || {};
  let targetId = (body.id || "").trim();
  if (!targetId) {
    targetId = `HF-0${animalsDb.length + 100}`;
  }

  // Check if animal exists, update if present
  const existingIdx = animalsDb.findIndex(
    a => a.id.toLowerCase() === targetId.toLowerCase() || (body.earTag && a.earTag.toLowerCase() === body.earTag.toLowerCase())
  );

  if (existingIdx !== -1) {
    animalsDb[existingIdx] = { ...animalsDb[existingIdx], ...body };
    return res.status(200).json(animalsDb[existingIdx]);
  }

  const newAnimal = {
    ...body,
    id: targetId,
    dbId: animalsDb.length + 1,
    earTag: body.earTag || `ET-${Math.floor(1000 + Math.random() * 9000)}`,
    rfid: body.rfid || `RF-${Date.now().toString().slice(-8)}`,
    name: body.name || "New Cattle",
    breed: body.breed || "HF (Holstein Friesian)",
    sex: body.sex || "Female",
    dob: body.dob || new Date().toISOString().split("T")[0],
    age: body.age || "2y",
    colorMarkings: body.colorMarkings || "Black & White",
    source: body.source || "Homebred",
    purchaseDate: body.purchaseDate || "",
    purchasePrice: body.purchasePrice ? Number(body.purchasePrice) : undefined,
    transportCost: body.transportCost ? Number(body.transportCost) : undefined,
    landedCost: body.landedCost ? Number(body.landedCost) : undefined,
    previousFarm: body.previousFarm || "",
    status: body.status || "Lactating",
    group: body.group || "High Milking Group",
    location: body.location || "Shed 1",
    dam: body.dam || "—",
    sire: body.sire || "—",
    lactation: body.lactation !== undefined && body.lactation !== null ? Number(body.lactation) : (body.status === "Lactating" ? 1 : null),
    dim: body.dim !== undefined && body.dim !== null ? Number(body.dim) : (body.status === "Lactating" ? 50 : null),
    milk: body.milk !== undefined && body.milk !== null ? Number(body.milk) : (body.status === "Lactating" ? 22.0 : null),
    weightKg: body.weightKg ? Number(body.weightKg) : 550,
    heightCm: body.heightCm ? Number(body.heightCm) : 142,
    remarks: body.remarks || "",
    farmId: activeFarmId
  };
  animalsDb.unshift(newAnimal);
  res.status(201).json(newAnimal);
});

app.put("/api/animals/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  const targetId = (id && id !== "undefined") ? id : (req.body.id || "");
  const index = animalsDb.findIndex(
    a => a.id.toLowerCase() === targetId.toLowerCase() || String(a.dbId) === targetId || a.earTag.toLowerCase() === targetId.toLowerCase()
  );
  if (index === -1) {
    const created = {
      ...req.body,
      id: targetId || `HF-0${animalsDb.length + 100}`,
      dbId: animalsDb.length + 1,
      earTag: req.body.earTag || `ET-${Math.floor(1000 + Math.random() * 9000)}`,
      name: req.body.name || "Cattle",
      status: req.body.status || "Lactating",
      breed: req.body.breed || "HF (Holstein Friesian)",
    };
    animalsDb.unshift(created);
    return res.status(201).json(created);
  }
  animalsDb[index] = { ...animalsDb[index], ...req.body };
  res.json(animalsDb[index]);
});

app.delete("/api/animals/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  animalsDb = animalsDb.filter(a => a.id !== id && String(a.dbId) !== id);
  res.json({ success: true, message: "Animal removed" });
});

// Sale of animal
app.post("/api/animals/:id/sell", (req: Request, res: Response) => {
  const id = req.params.id;
  const animal = animalsDb.find(a => a.id === id);
  if (!animal) return res.status(404).json({ error: "Animal not found" });

  const { buyer, salePrice, reason, weight } = req.body;
  const price = Number(salePrice) || 0;
  const purchaseCost = animal.purchasePrice || 300000;
  const profitLoss = price - purchaseCost;

  animal.status = "Sold";
  animal.group = "Discharged";
  animal.saleInfo = {
    buyer: buyer || "Market Buyer",
    date: new Date().toISOString().split("T")[0],
    salePrice: price,
    reason: reason || "Commercial Sale",
    weight: Number(weight) || (animal.weightKg || 550),
    profitLoss
  };

  // Add revenue transaction
  transactionsDb.unshift({
    id: `TX-${Date.now()}`,
    type: "Income",
    category: "Animal Sales",
    amount: price,
    date: new Date().toISOString().split("T")[0],
    description: `Sale of animal ${animal.id} (${animal.name}) to ${buyer}`,
    entityName: buyer || "Buyer",
    paymentMethod: "Bank Transfer",
    farmName: "Main Punjab Unit",
    receiptRef: `SALE-${Date.now().toString().slice(-6)}`
  });

  res.json({ success: true, message: `Animal ${animal.id} marked as sold. Revenue logged.`, animal });
});

// Mortality record of animal
app.post("/api/animals/:id/mortality", (req: Request, res: Response) => {
  const id = req.params.id;
  const animal = animalsDb.find(a => a.id === id);
  if (!animal) return res.status(404).json({ error: "Animal not found" });

  const { cause, diseaseHistory, treatmentNotes, financialValue, postMortemNotes } = req.body;
  animal.status = "Dead";
  animal.group = "Deceased Herd";
  animal.mortalityInfo = {
    date: new Date().toISOString().split("T")[0],
    age: animal.age || "Adult",
    cause: cause || "Undetermined",
    diseaseHistory: diseaseHistory || "None on record",
    treatmentNotes: treatmentNotes || "",
    financialValue: Number(financialValue) || 300000,
    postMortemNotes: postMortemNotes || ""
  };

  res.json({ success: true, message: `Mortality recorded for ${animal.id}. Historical records preserved.`, animal });
});

// --- MILK MANAGEMENT ---
app.get("/api/milk-records", (req: Request, res: Response) => {
  if (!milkRecordsDb || milkRecordsDb.length === 0) {
    milkRecordsDb = [...initialMilkRecords];
  }
  res.json(milkRecordsDb);
});

app.post("/api/milk-records", (req: Request, res: Response) => {
  const body = req.body || {};
  const morning = Number(body.morningLitres ?? body.morning ?? 0);
  const evening = Number(body.eveningLitres ?? body.evening ?? 0);
  const third = Number(body.thirdMilkingLitres ?? body.third ?? 0);
  const total = Number(body.totalLitres ?? body.total ?? (morning + evening + third));

  const rawId = body.animalId || body.animalCode || body.id || "";
  const matchedAnimal = animalsDb.find(a => 
    (rawId && (a.id.toLowerCase() === String(rawId).toLowerCase() || a.earTag?.toLowerCase() === String(rawId).toLowerCase())) ||
    (body.name && a.name.toLowerCase() === String(body.name).toLowerCase())
  );

  const targetAnimalId = rawId || (matchedAnimal ? matchedAnimal.id : (animalsDb[0]?.id || "HF-027"));
  const targetName = body.name || (matchedAnimal ? matchedAnimal.name : (animalsDb[0]?.name || "Bella"));

  const newRecord = {
    id: body.id && String(body.id).startsWith("M-") ? body.id : `M-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    animalId: targetAnimalId,
    name: targetName,
    date: body.date || new Date().toISOString().split("T")[0],
    session: body.session || "Both",
    morningLitres: morning,
    eveningLitres: evening,
    thirdMilkingLitres: third,
    totalLitres: total,
    fatPercent: Number(body.fatPercent ?? body.fat ?? 3.8),
    proteinPercent: Number(body.proteinPercent ?? body.protein ?? 3.2),
    snfPercent: Number(body.snfPercent ?? body.snf ?? 8.8),
    scc: Number(body.scc ?? 160),
    quality: body.quality || "Standard",
    rejectedLitres: Number(body.rejectedLitres ?? 0),
    rejectionReason: body.rejectionReason || ""
  };
  milkRecordsDb.unshift(newRecord);

  // Update current animal daily yield
  const animal = matchedAnimal || animalsDb.find(a => a.id.toLowerCase() === String(targetAnimalId).toLowerCase());
  if (animal && total > 0) {
    if (animal.milk && total < animal.milk * 0.85) {
      const dropPct = Number((((animal.milk - total) / animal.milk) * 100).toFixed(1));
      milkAlertsDb.unshift({
        id: `ALT-${Date.now()}`,
        animalId: animal.id,
        animalName: animal.name,
        date: new Date().toISOString().split("T")[0],
        recentAvg: animal.milk,
        todayYield: total,
        dropPercentage: dropPct,
        status: "Active",
        disclaimer: "Attention notice: Individual yield drop flagged for manager inspection. Not an automated medical diagnosis."
      });
    }
    animal.milk = total;
  }

  res.status(201).json(newRecord);
});

app.get("/api/milk-alerts", (req: Request, res: Response) => {
  res.json(milkAlertsDb);
});

app.post("/api/milk-alerts/:id/acknowledge", (req: Request, res: Response) => {
  const alert = milkAlertsDb.find(a => a.id === req.params.id);
  if (alert) alert.status = "Acknowledged";
  res.json({ success: true, alert });
});

// --- BREEDING & CALVING ---
app.get("/api/breeding", (req: Request, res: Response) => {
  res.json(breedingDb);
});

app.post("/api/breeding", (req: Request, res: Response) => {
  const body = req.body;
  const newEvent = {
    id: `B-${Date.now()}`,
    animal: body.animal || "HF-027 (Bella)",
    animalId: body.animalId || "HF-027",
    heatDate: body.heatDate || new Date().toISOString().split("T")[0],
    aiDate: body.aiDate || "",
    semenBull: body.semenBull || "AltaWheel Straw #894",
    technician: body.technician || "Ali Hassan",
    pdDate: body.pdDate || "",
    result: body.result || "Pending",
    expectedCalving: body.expectedCalving || "",
    actualCalving: body.actualCalving || "",
    servicesCount: Number(body.servicesCount) || 1,
    notes: body.notes || ""
  };
  breedingDb.unshift(newEvent);

  // If PD is positive, update animal status
  if (newEvent.result === "Positive") {
    const cow = animalsDb.find(a => a.id === newEvent.animalId);
    if (cow && cow.status !== "Lactating") {
      cow.status = "Pregnant";
    }
  }

  res.status(201).json(newEvent);
});

app.get("/api/calving", (req: Request, res: Response) => {
  res.json(calvingDb);
});

app.post("/api/calving", (req: Request, res: Response) => {
  const body = req.body;
  const newCalving = {
    id: `CALV-${Date.now()}`,
    damId: body.damId || "HF-027",
    damName: body.damName || "Bella",
    sireId: body.sireId || "Bull-04",
    expectedDate: body.expectedDate || new Date().toISOString().split("T")[0],
    actualDate: body.actualDate || new Date().toISOString().split("T")[0],
    difficulty: body.difficulty || "Normal",
    calfCount: Number(body.calfCount) || 1,
    calfSex: body.calfSex || "Female",
    birthWeight: Number(body.birthWeight) || 38.0,
    calfId: body.calfId || `HF-0${animalsDb.length + 101}`,
    colostrumFedHours: Number(body.colostrumFedHours) || 2,
    colostrumLitres: Number(body.colostrumLitres) || 4,
    complications: body.complications || "None",
    registeredInHerd: !!body.registerInHerd
  };
  calvingDb.unshift(newCalving);

  // If registered in herd, automatically create animal record
  if (body.registerInHerd) {
    const calfAnimal = {
      id: newCalving.calfId,
      dbId: animalsDb.length + 1,
      earTag: `ET-${Math.floor(1000 + Math.random() * 9000)}`,
      rfid: `RF-${Date.now().toString().slice(-8)}`,
      name: `Calf of ${newCalving.damName}`,
      breed: "HF (Holstein Friesian)",
      sex: (newCalving.calfSex === "Male" ? "Male" : "Female") as "Male" | "Female",
      dob: newCalving.actualDate,
      age: "0d",
      colorMarkings: "Black & White",
      source: "Homebred" as const,
      status: "Calf" as const,
      group: "Calf Pen",
      location: "Calf Barn - Hutch Village",
      dam: newCalving.damId,
      sire: newCalving.sireId,
      lactation: null,
      dim: null,
      milk: null,
      weightKg: newCalving.birthWeight,
      heightCm: 76,
      remarks: `Born on farm from Dam ${newCalving.damId}. Colostrum fed ${newCalving.colostrumLitres}L at ${newCalving.colostrumFedHours}h.`,
      farmId: activeFarmId
    };
    animalsDb.unshift(calfAnimal);

    // Also add initial calf growth baseline
    calfGrowthDb.unshift({
      id: `CG-${Date.now()}`,
      calfId: calfAnimal.id,
      calfName: calfAnimal.name,
      date: newCalving.actualDate,
      ageMonths: 0,
      weightKg: newCalving.birthWeight,
      heightCm: 76,
      girthCm: 78,
      adgGrams: 0,
      feedType: "Colostrum",
      dailyMilkAllowanceL: 4.0,
      weaningStatus: "Pre-weaning",
      notes: "Birth entry from calving management."
    });
  }

  // Update mother lactation & status
  const mother = animalsDb.find(a => a.id === newCalving.damId);
  if (mother) {
    mother.status = "Lactating";
    mother.lactation = (mother.lactation || 0) + 1;
    mother.dim = 1;
  }

  res.status(201).json(newCalving);
});

// --- CALF & HEIFER MANAGEMENT ---
app.get("/api/calves/growth", (req: Request, res: Response) => {
  res.json(calfGrowthDb);
});

app.post("/api/calves/growth", (req: Request, res: Response) => {
  const body = req.body;
  const newGrowth = {
    id: `CG-${Date.now()}`,
    calfId: body.calfId || "HF-072",
    calfName: body.calfName || "Coco",
    date: body.date || new Date().toISOString().split("T")[0],
    ageMonths: Number(body.ageMonths) || 1,
    weightKg: Number(body.weightKg) || 60,
    heightCm: Number(body.heightCm) || 85,
    girthCm: Number(body.girthCm) || 90,
    adgGrams: Number(body.adgGrams) || 700,
    feedType: body.feedType || "Calf Starter",
    dailyMilkAllowanceL: Number(body.dailyMilkAllowanceL) || 2.0,
    weaningStatus: body.weaningStatus || "Pre-weaning",
    notes: body.notes || ""
  };
  calfGrowthDb.unshift(newGrowth);

  // Update animal's current weight
  const calf = animalsDb.find(a => a.id === body.calfId);
  if (calf) {
    calf.weightKg = newGrowth.weightKg;
    calf.heightCm = newGrowth.heightCm;
  }

  res.status(201).json(newGrowth);
});

// --- HEALTH, DISEASES & MEDICATIONS ---
app.get("/api/diseases", (req: Request, res: Response) => {
  res.json(diseasesDb);
});

app.post("/api/diseases", (req: Request, res: Response) => {
  const body = req.body;
  const newDisease = {
    id: `DIS-${Date.now()}`,
    name: body.name || "Custom Disease",
    category: body.category || "Infectious",
    commonSymptoms: body.commonSymptoms || "",
    recommendedTreatments: body.recommendedTreatments || "",
    isCustom: true
  };
  diseasesDb.unshift(newDisease);
  res.status(201).json(newDisease);
});

app.get("/api/medicines", (req: Request, res: Response) => {
  res.json(medicinesDb);
});

app.get("/api/health-records", (req: Request, res: Response) => {
  res.json(healthDb);
});

app.post("/api/health-records", (req: Request, res: Response) => {
  const body = req.body;
  const withdrawalDays = Number(body.withdrawalDays) || 0;
  let safeDate = "";
  if (withdrawalDays > 0) {
    const d = new Date();
    d.setDate(d.getDate() + withdrawalDays);
    safeDate = d.toISOString().split("T")[0];
  }

  const newHealth = {
    id: `H-${Date.now()}`,
    date: body.date || new Date().toISOString().split("T")[0],
    animal: body.animal || "HF-027 (Bella)",
    animalId: body.animalId || "HF-027",
    problem: body.problem || "Health Check",
    symptoms: body.symptoms || "",
    diagnosis: body.diagnosis || "Clinical Condition",
    veterinarian: body.veterinarian || "Dr. Imran (DVM)",
    treatment: body.treatment || "Medication protocol",
    medicine: body.medicine || "Intramast-DC",
    medicineId: body.medicineId || "",
    dose: body.dose || "1 dose",
    doseQty: Number(body.doseQty) || 1,
    duration: body.duration || "3 Days",
    cost: Number(body.cost) || 1000,
    status: (body.status || "In Treatment") as any,
    withdrawalDays,
    withdrawalUntil: safeDate || body.withdrawalUntil || new Date().toISOString().split("T")[0],
    remarks: body.remarks || ""
  };
  healthDb.unshift(newHealth);

  // Deduct inventory for medicine automatically
  if (body.medicineId) {
    const med = medicinesDb.find(m => m.id === body.medicineId || m.name.toLowerCase() === body.medicine.toLowerCase());
    if (med && med.quantity > 0) {
      med.quantity = Math.max(0, med.quantity - (newHealth.doseQty || 1));
    }
  }

  // Update animal status & active withdrawal
  const animal = animalsDb.find(a => a.id === newHealth.animalId);
  if (animal) {
    if (newHealth.status === "In Treatment") {
      animal.status = "Sick";
    }
    if (withdrawalDays > 0) {
      animal.activeWithdrawal = {
        medicine: newHealth.medicine,
        safeDate: newHealth.withdrawalUntil,
        active: true
      };
    }
  }

  // Log medical expense transaction
  if (newHealth.cost > 0) {
    transactionsDb.unshift({
      id: `TX-${Date.now()}`,
      type: "Expense",
      category: "Veterinary & Medicine",
      amount: newHealth.cost,
      date: newHealth.date,
      description: `Treatment for ${newHealth.animal}: ${newHealth.diagnosis} (${newHealth.medicine})`,
      entityName: newHealth.veterinarian,
      paymentMethod: "Cash",
      farmName: "Main Punjab Unit",
      receiptRef: `MED-${Date.now().toString().slice(-5)}`
    });
  }

  res.status(201).json(newHealth);
});

app.get("/api/vaccinations", (req: Request, res: Response) => {
  res.json(vaccinationsDb);
});

app.post("/api/vaccinations", (req: Request, res: Response) => {
  const body = req.body;
  const newVac = {
    id: `VAC-${Date.now()}`,
    vaccine: body.vaccine || "FMD Vaccine",
    targetGroup: body.targetGroup || "All Cattle",
    animalId: body.animalId || undefined,
    date: body.date || new Date().toISOString().split("T")[0],
    batch: body.batch || `VRI-${Date.now().toString().slice(-4)}`,
    manufacturer: body.manufacturer || "VRI Lahore",
    nextDueDate: body.nextDueDate || "",
    veterinarian: body.veterinarian || "Dr. Imran",
    status: (body.status || "Scheduled") as any
  };
  vaccinationsDb.unshift(newVac);
  res.status(201).json(newVac);
});

// --- FEED & RATION MANAGEMENT ---
app.get("/api/feeds", (req: Request, res: Response) => {
  res.json(feedsDb);
});

app.post("/api/feeds", (req: Request, res: Response) => {
  const body = req.body;
  const newFeed = {
    id: `F-${Date.now()}`,
    name: body.name || "Feed Item",
    category: body.category || "Forage",
    unit: body.unit || "kg",
    unitPrice: Number(body.unitPrice) || 30,
    stock: Number(body.stock) || 1000,
    minStock: Number(body.minStock) || 200,
    supplier: body.supplier || "Local Supplier",
    dmPercent: body.dmPercent ? Number(body.dmPercent) : 85,
    cpPercent: body.cpPercent ? Number(body.cpPercent) : 12,
    meEnergy: body.meEnergy ? Number(body.meEnergy) : 10,
    status: (Number(body.stock) <= Number(body.minStock) ? "Low Stock" : "Available") as any
  };
  feedsDb.unshift(newFeed);
  res.status(201).json(newFeed);
});

app.get("/api/rations", (req: Request, res: Response) => {
  res.json(rationPlansDb);
});

app.post("/api/rations", (req: Request, res: Response) => {
  const body = req.body;
  const newRation = {
    id: `RAT-${Date.now()}`,
    name: body.name || "Custom TMR Ration",
    group: body.group || "High Milking Group",
    targetCowCount: Number(body.targetCowCount) || 5,
    ingredients: body.ingredients || [],
    totalKgPerCow: Number(body.totalKgPerCow) || 45,
    totalCostPerCow: Number(body.totalCostPerCow) || 2500,
    costPerLiterExpected: Number(body.costPerLiterExpected) || 95,
    dailyGroupConsumptionKg: Number(body.dailyGroupConsumptionKg) || 225,
    dailyGroupCost: Number(body.dailyGroupCost) || 12500
  };
  rationPlansDb.unshift(newRation);
  res.status(201).json(newRation);
});

// Daily Feed Distribution (deducts stock from feed inventory)
app.post("/api/feeds/distribute", (req: Request, res: Response) => {
  const { rationId } = req.body;
  const plan = rationPlansDb.find(r => r.id === rationId);
  if (!plan) return res.status(404).json({ error: "Ration plan not found" });

  plan.ingredients.forEach(item => {
    const feed = feedsDb.find(f => f.id === item.feedId || f.name.toLowerCase() === item.feedName.toLowerCase());
    if (feed) {
      const consumedKg = item.kgPerCow * plan.targetCowCount;
      feed.stock = Math.max(0, feed.stock - consumedKg);
      feed.status = feed.stock <= feed.minStock ? "Low Stock" : "Available";
    }
  });

  res.json({ success: true, message: `TMR batch distributed for ${plan.group}. Feed stock levels updated.` });
});

// --- INVENTORY ---
app.get("/api/inventory", (req: Request, res: Response) => {
  const inventoryItems = [
    ...feedsDb.map(f => ({
      id: f.id,
      name: f.name,
      category: "Feed & Forage",
      quantity: f.stock,
      stock: f.stock,
      unit: f.unit,
      unitPrice: f.unitPrice,
      minLevel: f.minStock,
      minStock: f.minStock,
      status: f.stock <= f.minStock ? "Low Stock" : "In Stock",
      supplier: f.supplier,
      reorderLevel: f.minStock * 1.5
    })),
    ...medicinesDb.map(m => ({
      id: m.id,
      name: m.name,
      category: "Veterinary Medicine",
      quantity: m.quantity,
      stock: m.quantity,
      unit: m.unit,
      unitPrice: m.unitPrice,
      minLevel: m.minStock,
      minStock: m.minStock,
      status: m.quantity <= m.minStock ? "Low Stock" : "In Stock",
      supplier: m.supplier,
      reorderLevel: m.minStock * 2
    }))
  ];
  res.json(inventoryItems);
});

app.post("/api/inventory/purchase", (req: Request, res: Response) => {
  const body = req.body;
  const qty = Number(body.quantity) || 0;
  const unitPrice = Number(body.unitPrice) || 0;
  const totalCost = Number(body.totalCost) || (qty * unitPrice);

  // Check if it matches existing feed or medicine
  const feed = feedsDb.find(f => f.name.toLowerCase() === (body.itemName || "").toLowerCase());
  if (feed) {
    feed.stock += qty;
    feed.status = feed.stock <= feed.minStock ? "Low Stock" : "Available";
  } else if (body.category === "Feed") {
    feedsDb.unshift({
      id: `F-${Date.now()}`,
      name: body.itemName || "Purchased Feed",
      category: "Concentrate",
      unit: body.unit || "kg",
      unitPrice: unitPrice || 50,
      stock: qty,
      minStock: 200,
      supplier: body.supplier || "Supplier",
      status: "Available"
    });
  }

  // Log expense transaction
  if (totalCost > 0) {
    transactionsDb.unshift({
      id: `TX-${Date.now()}`,
      type: "Expense",
      category: body.category === "Feed" ? "Feed Purchase" : "Veterinary & Medicine",
      amount: totalCost,
      date: body.date || new Date().toISOString().split("T")[0],
      description: `Stock Purchase: ${qty} ${body.unit || "units"} of ${body.itemName}`,
      entityName: body.supplier || "Vendor",
      paymentMethod: body.paymentMethod || "Bank Transfer",
      farmName: "Main Punjab Unit",
      receiptRef: `PO-${Date.now().toString().slice(-5)}`
    });
  }

  res.status(201).json({ success: true, message: "Inventory stock updated and purchase voucher logged." });
});

// --- CUSTOMERS & SUPPLIERS ---
app.get("/api/customers", (req: Request, res: Response) => {
  res.json(customersDb);
});

app.post("/api/customers", (req: Request, res: Response) => {
  const body = req.body;
  const newCust = {
    id: `CUST-${Date.now()}`,
    name: body.name || "New Milk Buyer",
    phone: body.phone || "+92 300 0000000",
    address: body.address || "Lahore / Kasur",
    dailyQuotaLitres: Number(body.dailyQuotaLitres) || 100,
    ratePerLitre: Number(body.ratePerLitre) || 150,
    deliveryTime: body.deliveryTime || "Both",
    outstandingBalance: Number(body.outstandingBalance) || 0,
    paymentTerms: body.paymentTerms || "Weekly",
    status: "Active" as const
  };
  customersDb.unshift(newCust);
  res.status(201).json(newCust);
});

app.get("/api/suppliers", (req: Request, res: Response) => {
  res.json(suppliersDb);
});

app.post("/api/suppliers", (req: Request, res: Response) => {
  const body = req.body;
  const newSupp = {
    id: `SUP-${Date.now()}`,
    name: body.name || "New Supplier",
    contactPerson: body.contactPerson || "Manager",
    phone: body.phone || "+92 300 0000000",
    address: body.address || "Punjab",
    products: body.products ? (Array.isArray(body.products) ? body.products : [body.products]) : ["Feed", "Supplies"],
    outstandingPayable: Number(body.outstandingPayable) || 0,
    paymentTerms: body.paymentTerms || "30 Days Net"
  };
  suppliersDb.unshift(newSupp);
  res.status(201).json(newSupp);
});

// --- FINANCE ---
app.get("/api/finance", (req: Request, res: Response) => {
  res.json(transactionsDb);
});

app.post("/api/finance", (req: Request, res: Response) => {
  const body = req.body;
  const newTx = {
    id: `TX-${Date.now()}`,
    type: (body.type || "Expense") as "Income" | "Expense",
    category: body.category || "General",
    amount: Number(body.amount) || 0,
    date: body.date || new Date().toISOString().split("T")[0],
    description: body.description || "",
    entityName: body.entityName || "Farm Vendor",
    paymentMethod: (body.paymentMethod || "Cash") as any,
    farmName: body.farmName || "Main Punjab Unit",
    receiptRef: body.receiptRef || `TXN-${Date.now().toString().slice(-6)}`
  };
  transactionsDb.unshift(newTx);
  res.status(201).json(newTx);
});

// --- TASKS ---
app.get("/api/tasks", (req: Request, res: Response) => {
  res.json(tasksDb);
});

app.post("/api/tasks", (req: Request, res: Response) => {
  const body = req.body;
  const newTask = {
    id: `T-${Date.now()}`,
    title: body.title || "New Task",
    taskType: body.taskType || "General",
    target: body.target || "Farm Herd",
    dueDate: body.dueDate || new Date().toISOString().split("T")[0],
    priority: (body.priority || "Medium") as any,
    assignedTo: body.assignedTo || "Muhammad Ali",
    status: (body.status || "Pending") as any,
    notes: body.notes || ""
  };
  tasksDb.unshift(newTask);
  res.status(201).json(newTask);
});

app.put("/api/tasks/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  const idx = tasksDb.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: "Task not found" });
  tasksDb[idx] = { ...tasksDb[idx], ...req.body };
  res.json(tasksDb[idx]);
});

app.delete("/api/tasks/:id", (req: Request, res: Response) => {
  tasksDb = tasksDb.filter(t => t.id !== req.params.id);
  res.json({ success: true });
});

// --- SETTINGS ---
app.get("/api/settings", (req: Request, res: Response) => {
  res.json(farmSettings);
});

app.post("/api/settings", (req: Request, res: Response) => {
  farmSettings = { ...farmSettings, ...req.body };
  res.json({ success: true, data: farmSettings });
});

// Vite & Static Asset Handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: "0.0.0.0",
        port: PORT,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Commercial Dairy Farm Management server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
