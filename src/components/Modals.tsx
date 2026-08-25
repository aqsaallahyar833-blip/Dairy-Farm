import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Save,
  Trash2,
  CheckCircle2,
  QrCode,
  Printer,
  DollarSign,
  AlertTriangle,
  Heart,
  Droplets,
  Activity,
  Calendar,
  Layers,
  Scale,
  ShieldCheck,
  Truck,
  TrendingUp,
  UserCheck
} from "lucide-react";
import {
  Animal,
  AnimalStatus,
  MilkRecord,
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
  TaskItem
} from "../types";
import { initialAnimals, initialDiseases, initialMedicines } from "../data";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function BaseModal({ isOpen, onClose, title, subtitle, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="modal-close" onClick={onClose} type="button" title="Close modal">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// 1. ADD ANIMAL MODAL
export function AddAnimalModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (animal: Partial<Animal>) => void;
}) {
  const [id, setId] = useState(`HF-0${Math.floor(100 + Math.random() * 900)}`);
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("HF (Holstein Friesian)");
  const [sex, setSex] = useState<"Female" | "Male">("Female");
  const [status, setStatus] = useState<AnimalStatus>("Lactating");
  const [dob, setDob] = useState("2022-06-15");
  const [age, setAge] = useState("2y");
  const [earTag, setEarTag] = useState(`ET-${Math.floor(1000 + Math.random() * 9000)}`);
  const [rfid, setRfid] = useState(`RF-${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [colorMarkings, setColorMarkings] = useState("Black & White");
  const [source, setSource] = useState<"Homebred" | "Purchased" | "Imported">("Homebred");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [group, setGroup] = useState("High Milking Group");
  const [location, setLocation] = useState("Shed 1 - Row A");
  const [dam, setDam] = useState("HF-011");
  const [sire, setSire] = useState("Bull-04");
  const [lactation, setLactation] = useState("2");
  const [dim, setDim] = useState("120");
  const [milk, setMilk] = useState("26.5");
  const [weightKg, setWeightKg] = useState("560");
  const [heightCm, setHeightCm] = useState("142");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (isOpen) {
      const rand = Math.floor(100 + Math.random() * 900);
      setId(`HF-0${rand}`);
      setEarTag(`ET-${Math.floor(1000 + Math.random() * 9000)}`);
      setRfid(`RF-${Math.floor(10000000 + Math.random() * 90000000)}`);
      setName("");
      setStatus("Lactating");
      setRemarks("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: id || `HF-0${Math.floor(100 + Math.random() * 900)}`,
      name: name || "Unnamed Cattle",
      breed,
      sex,
      status,
      dob,
      age: age || "2y",
      earTag: earTag || `ET-${Math.floor(1000 + Math.random() * 9000)}`,
      rfid,
      colorMarkings,
      source,
      purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
      group,
      location,
      dam,
      sire,
      lactation: status === "Lactating" ? Number(lactation) || 1 : null,
      dim: status === "Lactating" ? Number(dim) || 0 : null,
      milk: status === "Lactating" ? Number(milk) || 0 : null,
      weightKg: Number(weightKg) || 550,
      heightCm: Number(heightCm) || 142,
      remarks,
    });
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Register New Livestock Animal" subtitle="Complete permanent digital passport for herd record">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="input-group">
            <span>Animal ID / Code *</span>
            <input value={id} onChange={(e) => setId(e.target.value)} required />
          </label>
          <label className="input-group">
            <span>Animal Name *</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bella" required />
          </label>
          <label className="input-group">
            <span>Ear Tag Number *</span>
            <input value={earTag} onChange={(e) => setEarTag(e.target.value)} required />
          </label>
          <label className="input-group">
            <span>RFID Electronic Tag</span>
            <input value={rfid} onChange={(e) => setRfid(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Breed</span>
            <select value={breed} onChange={(e) => setBreed(e.target.value)}>
              <option value="HF (Holstein Friesian)">Holstein Friesian (HF)</option>
              <option value="Jersey">Jersey</option>
              <option value="Sahiwal">Sahiwal Purebred</option>
              <option value="Crossbred (HF x Sahiwal)">Crossbred (HF x Sahiwal)</option>
              <option value="Nili Ravi">Nili Ravi (Buffalo)</option>
            </select>
          </label>
          <label className="input-group">
            <span>Sex</span>
            <select value={sex} onChange={(e) => setSex(e.target.value as any)}>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </label>
          <label className="input-group">
            <span>Current Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as AnimalStatus)}>
              <option value="Lactating">Lactating</option>
              <option value="Dry">Dry</option>
              <option value="Pregnant">Pregnant</option>
              <option value="Heifer">Heifer</option>
              <option value="Calf">Calf</option>
              <option value="Open">Open</option>
              <option value="Sick">Sick</option>
              <option value="Quarantine">Quarantine</option>
              <option value="Bull">Bull</option>
            </select>
          </label>
          <label className="input-group">
            <span>Source Origin</span>
            <select value={source} onChange={(e) => setSource(e.target.value as any)}>
              <option value="Homebred">Homebred on Farm</option>
              <option value="Purchased">Purchased Domestically</option>
              <option value="Imported">Imported (Exotic Stock)</option>
            </select>
          </label>
          {source !== "Homebred" && (
            <label className="input-group">
              <span>Purchase Price (Rs)</span>
              <input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="e.g. 450000" />
            </label>
          )}
          <label className="input-group">
            <span>Date of Birth</span>
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Age (Display)</span>
            <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 2y 4m" />
          </label>
          <label className="input-group">
            <span>Housing Location</span>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Shed 1 - Row A" />
          </label>
          <label className="input-group">
            <span>Management Group</span>
            <select value={group} onChange={(e) => setGroup(e.target.value)}>
              <option value="High Milking Group">High Milking Group</option>
              <option value="Medium Milking Group">Medium Milking Group</option>
              <option value="Dry Group">Dry Group</option>
              <option value="Pregnant Group">Pregnant Group</option>
              <option value="Heifer Pen">Heifer Pen</option>
              <option value="Calf Pen">Calf Pen</option>
              <option value="Bull Pen">Bull Pen</option>
              <option value="Quarantine Shed">Quarantine Shed</option>
            </select>
          </label>
          <label className="input-group">
            <span>Dam (Mother ID)</span>
            <input value={dam} onChange={(e) => setDam(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Sire (Father ID)</span>
            <input value={sire} onChange={(e) => setSire(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Body Weight (kg)</span>
            <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Height at Withers (cm)</span>
            <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
          </label>
        </div>

        {status === "Lactating" && (
          <div className="form-sub-section">
            <h4>Lactation Baseline Data</h4>
            <div className="form-grid three">
              <label className="input-group">
                <span>Lactation No.</span>
                <input type="number" value={lactation} onChange={(e) => setLactation(e.target.value)} min="1" max="12" />
              </label>
              <label className="input-group">
                <span>Days in Milk (DIM)</span>
                <input type="number" value={dim} onChange={(e) => setDim(e.target.value)} />
              </label>
              <label className="input-group">
                <span>Current Milk (L/day)</span>
                <input type="number" step="0.1" value={milk} onChange={(e) => setMilk(e.target.value)} />
              </label>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary">
            <Save size={16} /> Save Animal to Herd
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

// 2. ANIMAL PROFILE MODAL (with tabs: Overview, Milk, Health, Breeding, Pedigree, Growth, Profitability, QR Card)
export function AnimalProfileModal({
  isOpen,
  onClose,
  animal,
  onEdit,
  onDelete,
  onSell,
  onMortality,
  milkRecords,
  healthRecords,
  breedingEvents,
  calfGrowth,
}: {
  isOpen: boolean;
  onClose: () => void;
  animal: Animal | null;
  onEdit: (animal: Animal) => void;
  onDelete: (id: string) => void;
  onSell: (animal: Animal) => void;
  onMortality: (animal: Animal) => void;
  milkRecords: MilkRecord[];
  healthRecords: HealthRecord[];
  breedingEvents: BreedingEvent[];
  calfGrowth: CalfGrowthRecord[];
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "milk" | "health" | "breeding" | "growth" | "pedigree" | "profitability" | "qrcode">("overview");

  if (!isOpen || !animal) return null;

  const cowMilk = milkRecords.filter((m) => m.animalId === animal.id);
  const cowHealth = healthRecords.filter((h) => h.animalId === animal.id);
  const cowBreeding = breedingEvents.filter((b) => b.animalId === animal.id);
  const cowGrowth = calfGrowth.filter((g) => g.calfId === animal.id);

  // Profitability calculations (milk revenue vs feed vs health)
  const totalMilkLitres = cowMilk.reduce((acc, m) => acc + (m.totalLitres || 0), 0) || (animal.milk ? animal.milk * 30 : 750);
  const milkRevenueRs = totalMilkLitres * 150;
  const feedCostPerDay = animal.status === "Lactating" ? 890 : 380;
  const totalFeedCostRs = feedCostPerDay * 30;
  const vetCostRs = cowHealth.reduce((acc, h) => acc + (h.cost || 0), 0);
  const netProfitRs = milkRevenueRs - totalFeedCostRs - vetCostRs;

  const printPassport = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window wide" onClick={(e) => e.stopPropagation()} id="animal-profile-modal">
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="animal-avatar">
              <Scale size={24} color="#1565c0" />
            </div>
            <div>
              <h3>
                {animal.name} ({animal.id})
              </h3>
              <p>
                Ear Tag: <b>{animal.earTag}</b> · RFID: {animal.rfid || "—"} · Breed: {animal.breed}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button className="secondary sm" onClick={printPassport} title="Print Passport">
              <Printer size={15} /> Print Card
            </button>
            <button className="modal-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div className="profile-banner">
          <div className="banner-item">
            <span>Status</span>
            <span className={`status ${animal.status.toLowerCase()}`}>{animal.status}</span>
          </div>
          <div className="banner-item">
            <span>Daily Milk Yield</span>
            <b>{animal.milk ? `${animal.milk} Litres` : "—"}</b>
          </div>
          <div className="banner-item">
            <span>Lactation / DIM</span>
            <b>{animal.lactation ? `Lact ${animal.lactation} · ${animal.dim} DIM` : "—"}</b>
          </div>
          <div className="banner-item">
            <span>Location</span>
            <b>{animal.location}</b>
          </div>
          <div className="banner-item">
            <span>Live Weight</span>
            <b>{animal.weightKg ? `${animal.weightKg} kg` : "550 kg"}</b>
          </div>
        </div>

        {animal.activeWithdrawal?.active && (
          <div className="withdrawal-alert-box">
            <AlertTriangle size={18} color="#c84545" />
            <div>
              <b>Active Milk Withdrawal Restriction</b>
              <p>
                Treated with <b>{animal.activeWithdrawal.medicine}</b>. Milk must remain segregated until <b>{animal.activeWithdrawal.safeDate}</b>.
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="profile-tabs">
          {[
            { id: "overview", label: "Overview & Profile" },
            { id: "milk", label: `Milk History (${cowMilk.length})` },
            { id: "health", label: `Health & Vet (${cowHealth.length})` },
            { id: "breeding", label: `Reproduction (${cowBreeding.length})` },
            { id: "growth", label: `Growth & Weight (${cowGrowth.length})` },
            { id: "pedigree", label: "Pedigree Lineage" },
            { id: "profitability", label: "Animal P&L" },
            { id: "qrcode", label: "QR Passport" },
          ].map((t) => (
            <button key={t.id} className={activeTab === t.id ? "active" : ""} onClick={() => setActiveTab(t.id as any)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="modal-body" style={{ maxHeight: "65vh", overflowY: "auto" }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="profile-grid">
              <div className="info-card">
                <h4>Identity & Biological Specifications</h4>
                <table className="meta-table">
                  <tbody>
                    <tr>
                      <td>Permanent ID</td>
                      <td>
                        <b>{animal.id}</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Official Ear Tag</td>
                      <td>{animal.earTag}</td>
                    </tr>
                    <tr>
                      <td>RFID Transponder</td>
                      <td>{animal.rfid || "Not assigned"}</td>
                    </tr>
                    <tr>
                      <td>Breed</td>
                      <td>{animal.breed}</td>
                    </tr>
                    <tr>
                      <td>Sex</td>
                      <td>{animal.sex}</td>
                    </tr>
                    <tr>
                      <td>Date of Birth / Age</td>
                      <td>
                        {animal.dob} ({animal.age})
                      </td>
                    </tr>
                    <tr>
                      <td>Coat Markings</td>
                      <td>{animal.colorMarkings || "Black & White"}</td>
                    </tr>
                    <tr>
                      <td>Source Origin</td>
                      <td>{animal.source || "Homebred"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="info-card">
                <h4>Management & Facility Location</h4>
                <table className="meta-table">
                  <tbody>
                    <tr>
                      <td>Current Pen / Shed</td>
                      <td>
                        <b>{animal.location}</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Assigned Group</td>
                      <td>{animal.group}</td>
                    </tr>
                    <tr>
                      <td>Dam (Mother)</td>
                      <td className="blue-text">{animal.dam}</td>
                    </tr>
                    <tr>
                      <td>Sire (Father)</td>
                      <td className="blue-text">{animal.sire}</td>
                    </tr>
                    <tr>
                      <td>Withers Height</td>
                      <td>{animal.heightCm ? `${animal.heightCm} cm` : "142 cm"}</td>
                    </tr>
                    <tr>
                      <td>Body Weight</td>
                      <td>{animal.weightKg ? `${animal.weightKg} kg` : "560 kg"}</td>
                    </tr>
                    <tr>
                      <td>Remarks</td>
                      <td>{animal.remarks || "Healthy herd member."}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: MILK */}
          {activeTab === "milk" && (
            <div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Session</th>
                      <th>Morning (L)</th>
                      <th>Evening (L)</th>
                      <th>Total (L)</th>
                      <th>Fat %</th>
                      <th>SNF %</th>
                      <th>Quality</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cowMilk.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                          No milk records logged for this animal yet.
                        </td>
                      </tr>
                    ) : (
                      cowMilk.map((m) => (
                        <tr key={m.id}>
                          <td>{m.date}</td>
                          <td>{m.session}</td>
                          <td>{m.morningLitres}</td>
                          <td>{m.eveningLitres}</td>
                          <td>
                            <b>{m.totalLitres} L</b>
                          </td>
                          <td>{m.fatPercent}%</td>
                          <td>{m.snfPercent}%</td>
                          <td>
                            <span className="status available">{m.quality}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: HEALTH */}
          {activeTab === "health" && (
            <div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Diagnosis</th>
                      <th>Medicine & Dose</th>
                      <th>Veterinarian</th>
                      <th>Status</th>
                      <th>Withdrawal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cowHealth.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                          No medical conditions recorded.
                        </td>
                      </tr>
                    ) : (
                      cowHealth.map((h) => (
                        <tr key={h.id}>
                          <td>{h.date}</td>
                          <td>
                            <b>{h.diagnosis}</b>
                          </td>
                          <td>
                            {h.medicine} ({h.dose})
                          </td>
                          <td>{h.veterinarian}</td>
                          <td>
                            <span className={`status ${h.status === "In Treatment" ? "sick" : "available"}`}>{h.status}</span>
                          </td>
                          <td>{h.withdrawalDays > 0 ? `Hold till ${h.withdrawalUntil}` : "None"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: BREEDING */}
          {activeTab === "breeding" && (
            <div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Heat Date</th>
                      <th>AI Date</th>
                      <th>Semen Straw / Bull</th>
                      <th>Technician</th>
                      <th>PD Result</th>
                      <th>Expected Calving</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cowBreeding.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                          No breeding events on record.
                        </td>
                      </tr>
                    ) : (
                      cowBreeding.map((b) => (
                        <tr key={b.id}>
                          <td>{b.heatDate}</td>
                          <td>{b.aiDate || "—"}</td>
                          <td>{b.semenBull}</td>
                          <td>{b.technician}</td>
                          <td>
                            <span className={`status ${b.result === "Positive" ? "available" : "pending"}`}>{b.result}</span>
                          </td>
                          <td>
                            <b>{b.expectedCalving || "Pending PD"}</b>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: GROWTH & WEIGHT */}
          {activeTab === "growth" && (
            <div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Age (Months)</th>
                      <th>Weight (kg)</th>
                      <th>Height (cm)</th>
                      <th>Heart Girth (cm)</th>
                      <th>ADG (g/day)</th>
                      <th>Weaning Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cowGrowth.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                          No growth logs for this adult or unrecorded animal.
                        </td>
                      </tr>
                    ) : (
                      cowGrowth.map((g) => (
                        <tr key={g.id}>
                          <td>{g.date}</td>
                          <td>{g.ageMonths}m</td>
                          <td>
                            <b>{g.weightKg} kg</b>
                          </td>
                          <td>{g.heightCm} cm</td>
                          <td>{g.girthCm} cm</td>
                          <td>+{g.adgGrams} g/d</td>
                          <td>
                            <span className="status available">{g.weaningStatus}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: PEDIGREE */}
          {activeTab === "pedigree" && (
            <div className="pedigree-tree">
              <div className="pedigree-level">
                <div className="pedigree-node active">
                  <b>{animal.name}</b>
                  <span>
                    ID: {animal.id} ({animal.breed})
                  </span>
                  <small>Status: {animal.status}</small>
                </div>
              </div>
              <div className="pedigree-branches">
                <div className="pedigree-node">
                  <small>Dam (Mother)</small>
                  <b>{animal.dam}</b>
                  <span>HF Purebred Dairy Cow</span>
                </div>
                <div className="pedigree-node">
                  <small>Sire (Father)</small>
                  <b>{animal.sire}</b>
                  <span>Proven Alta Sire Straw</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PROFITABILITY */}
          {activeTab === "profitability" && (
            <div className="profit-analysis">
              <h4>Individual Cow Financial Performance (30-Day Analysis)</h4>
              <div className="profit-grid">
                <div>
                  <span>Est. Milk Revenue</span>
                  <b style={{ color: "#167a4b" }}>+Rs {milkRevenueRs.toLocaleString()}</b>
                  <small>{totalMilkLitres.toFixed(1)} L @ Rs 150/L</small>
                </div>
                <div>
                  <span>Feed & TMR Cost</span>
                  <b style={{ color: "#c84545" }}>-Rs {totalFeedCostRs.toLocaleString()}</b>
                  <small>Rs {feedCostPerDay}/day for 30d</small>
                </div>
                <div>
                  <span>Vet & Medicine Cost</span>
                  <b style={{ color: "#c84545" }}>-Rs {vetCostRs.toLocaleString()}</b>
                  <small>Treatments on record</small>
                </div>
                <div>
                  <span>Net Estimated Profit</span>
                  <b style={{ color: netProfitRs >= 0 ? "#167a4b" : "#c84545", fontSize: "1.2rem" }}>
                    Rs {netProfitRs.toLocaleString()}
                  </b>
                  <small>Rs {(netProfitRs / 30).toFixed(0)} / day</small>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: QR CODE PASSPORT */}
          {activeTab === "qrcode" && (
            <div className="qr-passport-card" id="qr-passport-printable">
              <div className="qr-box">
                <QrCode size={120} color="#1565c0" />
                <span>SCAN FOR INSTANT MOBILE LOOKUP</span>
              </div>
              <div className="qr-details">
                <h3>{animal.name}</h3>
                <p>
                  Livestock Passport ID: <b>{animal.id}</b>
                </p>
                <p>
                  Ear Tag: <b>{animal.earTag}</b>
                </p>
                <p>RFID: {animal.rfid || "Not assigned"}</p>
                <p>Breed: {animal.breed}</p>
                <p>
                  DOB: {animal.dob} (Age: {animal.age})
                </p>
                <p>Dam / Sire: {animal.dam} / {animal.sire}</p>
                <p>Farm: Punjab Commercial Dairy - Unit 1</p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <div style={{ display: "flex", gap: "8px" }}>
            {animal.status !== "Sold" && animal.status !== "Dead" && (
              <>
                <button
                  className="secondary danger sm"
                  onClick={() => {
                    onClose();
                    onSell(animal);
                  }}
                >
                  <DollarSign size={14} /> Sell Animal
                </button>
                <button
                  className="secondary danger sm"
                  onClick={() => {
                    onClose();
                    onMortality(animal);
                  }}
                >
                  <AlertTriangle size={14} /> Record Mortality
                </button>
              </>
            )}
            <button
              className="secondary danger sm"
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${animal.id}?`)) {
                  onDelete(animal.id);
                  onClose();
                }
              }}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
          <button className="primary sm" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// 3. ADD MILK MODAL
export function AddMilkModal({
  isOpen,
  onClose,
  animals,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  animals: Animal[];
  onSave: (record: Partial<MilkRecord>) => void;
}) {
  const lactating = animals.filter((a) => a.status === "Lactating");
  const availableAnimals = lactating.length > 0 ? lactating : animals;
  const [selectedAnimal, setSelectedAnimal] = useState(availableAnimals[0]?.id || "HF-027");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [session, setSession] = useState<"Morning" | "Evening" | "Both" | "Third">("Both");
  const [morning, setMorning] = useState("14.5");
  const [evening, setEvening] = useState("14.0");
  const [third, setThird] = useState("0");
  const [fat, setFat] = useState("3.8");
  const [protein, setProtein] = useState("3.2");
  const [snf, setSnf] = useState("8.8");
  const [scc, setScc] = useState("150");
  const [quality, setQuality] = useState<"Standard" | "Premium" | "Rejected">("Standard");
  const [rejectedLitres, setRejectedLitres] = useState("0");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      const activeList = animals.filter((a) => a.status === "Lactating");
      const pool = activeList.length > 0 ? activeList : animals;
      if (pool.length > 0 && !pool.some((a) => a.id === selectedAnimal)) {
        setSelectedAnimal(pool[0].id);
      }
    }
  }, [isOpen, animals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cow = animals.find((a) => a.id === selectedAnimal);
    const targetId = selectedAnimal || (animals[0]?.id || "HF-027");
    const targetName = cow ? cow.name : (animals.find((a) => a.id === targetId)?.name || "Bella");
    onSave({
      animalId: targetId,
      name: targetName,
      date,
      session,
      morningLitres: Number(morning) || 0,
      eveningLitres: Number(evening) || 0,
      thirdMilkingLitres: Number(third) || 0,
      fatPercent: Number(fat) || 3.8,
      proteinPercent: Number(protein) || 3.2,
      snfPercent: Number(snf) || 8.8,
      scc: Number(scc) || 150,
      quality,
      rejectedLitres: Number(rejectedLitres) || 0,
      rejectionReason,
    });
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Record Milk Yield & Quality" subtitle="Log daily liters and laboratory milk composition">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="input-group">
            <span>Select Animal *</span>
            <select value={selectedAnimal} onChange={(e) => setSelectedAnimal(e.target.value)} required>
              {availableAnimals.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} - {a.name} ({a.status} · Ear Tag: {a.earTag})
                </option>
              ))}
              {availableAnimals.length === 0 && (
                <option value="HF-027">HF-027 - Bella (Default Cow)</option>
              )}
            </select>
          </label>
          <label className="input-group">
            <span>Milking Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label className="input-group">
            <span>Milking Session</span>
            <select value={session} onChange={(e) => setSession(e.target.value as any)}>
              <option value="Both">Morning & Evening (Both)</option>
              <option value="Morning">Morning Only</option>
              <option value="Evening">Evening Only</option>
              <option value="Third">3rd Milking (Special)</option>
            </select>
          </label>
          <label className="input-group">
            <span>Morning Yield (L)</span>
            <input type="number" step="0.1" value={morning} onChange={(e) => setMorning(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Evening Yield (L)</span>
            <input type="number" step="0.1" value={evening} onChange={(e) => setEvening(e.target.value)} />
          </label>
          <label className="input-group">
            <span>3rd Milking (L, Optional)</span>
            <input type="number" step="0.1" value={third} onChange={(e) => setThird(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Fat Content (%)</span>
            <input type="number" step="0.01" value={fat} onChange={(e) => setFat(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Protein (%)</span>
            <input type="number" step="0.01" value={protein} onChange={(e) => setProtein(e.target.value)} />
          </label>
          <label className="input-group">
            <span>SNF (%)</span>
            <input type="number" step="0.01" value={snf} onChange={(e) => setSnf(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Somatic Cell Count (x10³ SCC/ml)</span>
            <input type="number" value={scc} onChange={(e) => setScc(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Grade Quality</span>
            <select value={quality} onChange={(e) => setQuality(e.target.value as any)}>
              <option value="Standard">Standard Commercial Grade</option>
              <option value="Premium">Premium High Butterfat</option>
              <option value="Rejected">Rejected / Withheld</option>
            </select>
          </label>
        </div>

        {quality === "Rejected" && (
          <div className="form-sub-section">
            <h4>Rejection / Withholding Details</h4>
            <div className="form-grid">
              <label className="input-group">
                <span>Rejected Volume (L)</span>
                <input type="number" step="0.1" value={rejectedLitres} onChange={(e) => setRejectedLitres(e.target.value)} />
              </label>
              <label className="input-group">
                <span>Reason</span>
                <input value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="e.g. Antibiotic withdrawal period" />
              </label>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary">
            <Save size={16} /> Save Milk Record
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

// 4. ADD BREEDING MODAL
export function AddBreedingModal({
  isOpen,
  onClose,
  animals,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  animals: Animal[];
  onSave: (event: Partial<BreedingEvent>) => void;
}) {
  const eligibleAnimals = animals.filter(
    (a) =>
      a.status !== "Calf" &&
      a.status !== "Bull" &&
      a.status !== "Sold" &&
      a.status !== "Dead" &&
      a.status?.toLowerCase() !== "calf" &&
      a.status?.toLowerCase() !== "bull" &&
      a.status?.toLowerCase() !== "sold" &&
      a.status?.toLowerCase() !== "dead"
  );
  const availableAnimals =
    eligibleAnimals.length > 0
      ? eligibleAnimals
      : animals.length > 0
      ? animals
      : initialAnimals.filter((a) => a.status !== "Dead" && a.status !== "Sold");

  const [selectedAnimal, setSelectedAnimal] = useState(availableAnimals[0]?.id || "HF-027");
  const [heatDate, setHeatDate] = useState(new Date().toISOString().split("T")[0]);
  const [aiDate, setAiDate] = useState(new Date().toISOString().split("T")[0]);
  const [semenBull, setSemenBull] = useState("AltaWheel USA Straw #894");
  const [technician, setTechnician] = useState("Ali Hassan (AI Tech)");
  const [pdDate, setPdDate] = useState("");
  const [result, setResult] = useState<"Positive" | "Pending" | "Negative" | "Suspicious">("Pending");
  const [servicesCount, setServicesCount] = useState("1");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      const activeEligible = animals.filter(
        (a) =>
          a.status !== "Calf" &&
          a.status !== "Bull" &&
          a.status !== "Sold" &&
          a.status !== "Dead" &&
          a.status?.toLowerCase() !== "calf" &&
          a.status?.toLowerCase() !== "bull" &&
          a.status?.toLowerCase() !== "sold" &&
          a.status?.toLowerCase() !== "dead"
      );
      const pool =
        activeEligible.length > 0
          ? activeEligible
          : animals.length > 0
          ? animals
          : initialAnimals.filter((a) => a.status !== "Dead" && a.status !== "Sold");

      if (pool.length > 0 && !pool.some((a) => a.id === selectedAnimal)) {
        setSelectedAnimal(pool[0].id);
      }
    }
  }, [isOpen, animals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cow = animals.find((a) => a.id === selectedAnimal) || initialAnimals.find((a) => a.id === selectedAnimal);
    // calculate expected calving (+280 days from AI date)
    let expectedCalving = "";
    if (aiDate) {
      const d = new Date(aiDate);
      d.setDate(d.getDate() + 280);
      expectedCalving = d.toISOString().split("T")[0];
    }

    onSave({
      animal: `${cow?.id || selectedAnimal} (${cow?.name || "Cow"})`,
      animalId: selectedAnimal || "HF-027",
      heatDate,
      aiDate,
      semenBull,
      technician,
      pdDate: pdDate || undefined,
      result,
      expectedCalving,
      servicesCount: Number(servicesCount) || 1,
      notes,
    });
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Record Heat & Insemination (AI)" subtitle="Log artificial insemination, bull straw, and PD schedule">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="input-group">
            <span>Target Animal *</span>
            <select value={selectedAnimal} onChange={(e) => setSelectedAnimal(e.target.value)} required>
              {availableAnimals.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} - {a.name} ({a.breed} · {a.status} · Tag: {a.earTag || a.rfid || a.id})
                </option>
              ))}
              {availableAnimals.length === 0 && (
                <option value="HF-027">HF-027 - Bella (HF · Lactating)</option>
              )}
            </select>
          </label>
          <label className="input-group">
            <span>Heat Observed Date *</span>
            <input type="date" value={heatDate} onChange={(e) => setHeatDate(e.target.value)} required />
          </label>
          <label className="input-group">
            <span>Insemination (AI) Date</span>
            <input type="date" value={aiDate} onChange={(e) => setAiDate(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Semen Straw / Stud Bull</span>
            <input value={semenBull} onChange={(e) => setSemenBull(e.target.value)} placeholder="e.g. Semex Star #102" />
          </label>
          <label className="input-group">
            <span>Technician / Vet</span>
            <input value={technician} onChange={(e) => setTechnician(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Service Number</span>
            <input type="number" min="1" max="10" value={servicesCount} onChange={(e) => setServicesCount(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Pregnancy Diagnosis (PD) Date</span>
            <input type="date" value={pdDate} onChange={(e) => setPdDate(e.target.value)} />
          </label>
          <label className="input-group">
            <span>PD Result</span>
            <select value={result} onChange={(e) => setResult(e.target.value as any)}>
              <option value="Pending">Pending (Scheduled)</option>
              <option value="Positive">Positive (Confirmed Pregnant)</option>
              <option value="Negative">Negative (Open / Repeat)</option>
              <option value="Suspicious">Suspicious / Recheck Needed</option>
            </select>
          </label>
        </div>
        <label className="input-group" style={{ marginTop: "12px" }}>
          <span>Notes & Observations</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Standing heat, clear mucous discharge." rows={2} />
        </label>
        <div className="form-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary">
            <Save size={16} /> Save Breeding Record
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

// 5. ADD CALVING MODAL
export function AddCalvingModal({
  isOpen,
  onClose,
  animals = [],
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  animals?: Animal[];
  onSave: (record: Partial<CalvingRecord> & { registerInHerd: boolean }) => void;
}) {
  const availableAnimals = animals.length > 0 ? animals : initialAnimals.filter((a) => a.status !== "Dead");
  const [damId, setDamId] = useState(availableAnimals[0]?.id || "HF-052");
  const [sireId, setSireId] = useState("Bull-04");
  const [actualDate, setActualDate] = useState(new Date().toISOString().split("T")[0]);
  const [difficulty, setDifficulty] = useState<"Normal" | "Assisted" | "Difficult" | "C-Section">("Normal");
  const [calfCount, setCalfCount] = useState("1");
  const [calfSex, setCalfSex] = useState<"Female" | "Male" | "Mixed">("Female");
  const [birthWeight, setBirthWeight] = useState("38.5");
  const [calfId, setCalfId] = useState(`HF-0${Math.floor(100 + Math.random() * 900)}`);
  const [colostrumFedHours, setColostrumFedHours] = useState("1.5");
  const [colostrumLitres, setColostrumLitres] = useState("4.0");
  const [complications, setComplications] = useState("");
  const [registerInHerd, setRegisterInHerd] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const pool = animals.length > 0 ? animals : initialAnimals.filter((a) => a.status !== "Dead");
      if (pool.length > 0 && !pool.some((a) => a.id === damId)) {
        setDamId(pool[0].id);
      }
    }
  }, [isOpen, animals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dam = animals.find((a) => a.id === damId) || initialAnimals.find((a) => a.id === damId);
    onSave({
      damId: damId || "HF-052",
      damName: dam?.name || "Dam",
      sireId,
      actualDate,
      difficulty,
      calfCount: Number(calfCount) || 1,
      calfSex,
      birthWeight: Number(birthWeight) || 38.0,
      calfId,
      colostrumFedHours: Number(colostrumFedHours) || 2,
      colostrumLitres: Number(colostrumLitres) || 4,
      complications,
      registerInHerd,
    });
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Record Calving & Birth" subtitle="Document newborn calf delivery and automatically register to herd">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="input-group">
            <span>Mother (Dam) *</span>
            <select value={damId} onChange={(e) => setDamId(e.target.value)} required>
              {availableAnimals.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} - {a.name} ({a.breed} · {a.status})
                </option>
              ))}
            </select>
          </label>
          <label className="input-group">
            <span>Father (Sire ID)</span>
            <input value={sireId} onChange={(e) => setSireId(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Calving Date *</span>
            <input type="date" value={actualDate} onChange={(e) => setActualDate(e.target.value)} required />
          </label>
          <label className="input-group">
            <span>Calving Difficulty</span>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)}>
              <option value="Normal">Normal (Unassisted)</option>
              <option value="Assisted">Assisted (Slight Pull)</option>
              <option value="Difficult">Difficult (Dystocia)</option>
              <option value="C-Section">Caesarean Section</option>
            </select>
          </label>
          <label className="input-group">
            <span>Calf Sex</span>
            <select value={calfSex} onChange={(e) => setCalfSex(e.target.value as any)}>
              <option value="Female">Female (Heifer Calf)</option>
              <option value="Male">Male (Bull Calf)</option>
              <option value="Mixed">Twins (Mixed)</option>
            </select>
          </label>
          <label className="input-group">
            <span>Birth Weight (kg)</span>
            <input type="number" step="0.1" value={birthWeight} onChange={(e) => setBirthWeight(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Newborn Calf ID</span>
            <input value={calfId} onChange={(e) => setCalfId(e.target.value)} required />
          </label>
          <label className="input-group">
            <span>Colostrum Fed Within (Hours)</span>
            <input type="number" step="0.5" value={colostrumFedHours} onChange={(e) => setColostrumFedHours(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Colostrum Amount (L)</span>
            <input type="number" step="0.5" value={colostrumLitres} onChange={(e) => setColostrumLitres(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Complications / Notes</span>
            <input value={complications} onChange={(e) => setComplications(e.target.value)} placeholder="e.g. Placenta expelled cleanly" />
          </label>
        </div>

        <div className="checkbox-row" style={{ marginTop: "12px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input type="checkbox" checked={registerInHerd} onChange={(e) => setRegisterInHerd(e.target.checked)} />
            <b>Automatically register newborn calf into Herd Master records</b>
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary">
            <Save size={16} /> Save Calving & Create Record
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

// 6. ADD CALF GROWTH MODAL
export function AddCalfGrowthModal({
  isOpen,
  onClose,
  calves = [],
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  calves?: Animal[];
  onSave: (growth: Partial<CalfGrowthRecord>) => void;
}) {
  const availableCalves =
    calves && calves.length > 0
      ? calves
      : initialAnimals.filter((a) => a.status === "Calf" || a.status === "Heifer" || a.age.includes("m") || a.age.includes("1y"));

  const [calfId, setCalfId] = useState(availableCalves[0]?.id || "HF-072");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [ageMonths, setAgeMonths] = useState("3");
  const [weightKg, setWeightKg] = useState("98.0");
  const [heightCm, setHeightCm] = useState("92");
  const [girthCm, setGirthCm] = useState("108");
  const [adgGrams, setAdgGrams] = useState("750");
  const [feedType, setFeedType] = useState<any>("Calf Starter");
  const [dailyMilkAllowanceL, setDailyMilkAllowanceL] = useState("2.0");
  const [weaningStatus, setWeaningStatus] = useState<any>("Weaned");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      const pool =
        calves && calves.length > 0
          ? calves
          : initialAnimals.filter((a) => a.status === "Calf" || a.status === "Heifer" || a.age.includes("m") || a.age.includes("1y"));
      if (pool.length > 0 && !pool.some((c) => c.id === calfId)) {
        setCalfId(pool[0].id);
      }
    }
  }, [isOpen, calves]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = availableCalves.find((a) => a.id === calfId);
    onSave({
      calfId: calfId || "HF-072",
      calfName: c?.name || "Calf",
      date,
      ageMonths: Number(ageMonths) || 1,
      weightKg: Number(weightKg) || 50,
      heightCm: Number(heightCm) || 80,
      girthCm: Number(girthCm) || 85,
      adgGrams: Number(adgGrams) || 700,
      feedType,
      dailyMilkAllowanceL: Number(dailyMilkAllowanceL) || 0,
      weaningStatus,
      notes,
    });
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Log Calf Growth & Body Metrics" subtitle="Record monthly heart-girth scale and Average Daily Gain (ADG)">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="input-group">
            <span>Select Calf / Heifer *</span>
            <select value={calfId} onChange={(e) => setCalfId(e.target.value)} required>
              {availableCalves.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} - {c.name} ({c.breed} · {c.age})
                </option>
              ))}
            </select>
          </label>
          <label className="input-group">
            <span>Measurement Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label className="input-group">
            <span>Age (Months)</span>
            <input type="number" step="0.5" value={ageMonths} onChange={(e) => setAgeMonths(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Live Weight (kg) *</span>
            <input type="number" step="0.5" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} required />
          </label>
          <label className="input-group">
            <span>Withers Height (cm)</span>
            <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Heart Girth (cm)</span>
            <input type="number" value={girthCm} onChange={(e) => setGirthCm(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Average Daily Gain (g/day)</span>
            <input type="number" value={adgGrams} onChange={(e) => setAdgGrams(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Current Diet Feed</span>
            <select value={feedType} onChange={(e) => setFeedType(e.target.value)}>
              <option value="Colostrum">Colostrum</option>
              <option value="Whole Milk">Whole Milk (Warm)</option>
              <option value="Milk Replacer">Milk Replacer</option>
              <option value="Calf Starter">Calf Starter (20% CP Pellets)</option>
              <option value="Weaned Hay/TMR">Weaned Hay / Forage TMR</option>
            </select>
          </label>
          <label className="input-group">
            <span>Daily Milk Allowance (L)</span>
            <input type="number" step="0.5" value={dailyMilkAllowanceL} onChange={(e) => setDailyMilkAllowanceL(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Weaning Status</span>
            <select value={weaningStatus} onChange={(e) => setWeaningStatus(e.target.value)}>
              <option value="Pre-weaning">Pre-weaning (Liquid Diet)</option>
              <option value="Weaning in Progress">Weaning in Progress (Transition)</option>
              <option value="Weaned">Weaned (100% Solid Feed)</option>
            </select>
          </label>
        </div>
        <div className="form-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary">
            <Save size={16} /> Save Growth Metric
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

// 7. ADD HEALTH & MEDICAL MODAL
export function AddHealthModal({
  isOpen,
  onClose,
  animals = [],
  diseases = [],
  medicines = [],
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  animals?: Animal[];
  diseases?: Disease[];
  medicines?: MedicineItem[];
  onSave: (record: Partial<HealthRecord>) => void;
}) {
  const availableAnimals = animals && animals.length > 0 ? animals : initialAnimals;
  const availableDiseases = diseases && diseases.length > 0 ? diseases : initialDiseases;
  const availableMedicines = medicines && medicines.length > 0 ? medicines : initialMedicines;

  const [animalId, setAnimalId] = useState(availableAnimals[0]?.id || "HF-027");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState(availableDiseases[0]?.id || "");
  const [problem, setProblem] = useState("Mastitis clinical symptoms");
  const [diagnosis, setDiagnosis] = useState("Mastitis (Clinical / Subclinical)");
  const [selectedMedId, setSelectedMedId] = useState(availableMedicines[0]?.id || "");
  const [medicine, setMedicine] = useState("Intramast-DC");
  const [dose, setDose] = useState("1 tube (10ml)");
  const [duration, setDuration] = useState("3 Days");
  const [cost, setCost] = useState("1350");
  const [vet, setVet] = useState("Dr. Imran (DVM)");
  const [status, setStatus] = useState<any>("In Treatment");
  const [withdrawalDays, setWithdrawalDays] = useState("5");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (isOpen) {
      const animalPool = animals && animals.length > 0 ? animals : initialAnimals;
      if (animalPool.length > 0 && !animalPool.some((a) => a.id === animalId)) {
        setAnimalId(animalPool[0].id);
      }
      const diseasePool = diseases && diseases.length > 0 ? diseases : initialDiseases;
      if (diseasePool.length > 0 && !selectedDiseaseId) {
        setSelectedDiseaseId(diseasePool[0].id);
        setDiagnosis(diseasePool[0].name);
        setProblem(diseasePool[0].commonSymptoms);
      }
      const medPool = medicines && medicines.length > 0 ? medicines : initialMedicines;
      if (medPool.length > 0 && !selectedMedId) {
        setSelectedMedId(medPool[0].id);
        setMedicine(medPool[0].name);
        setWithdrawalDays(String(medPool[0].withdrawalDays));
        setCost(String(medPool[0].unitPrice));
      }
    }
  }, [isOpen, animals, diseases, medicines]);

  const handleDiseaseChange = (dId: string) => {
    setSelectedDiseaseId(dId);
    const d = availableDiseases.find((x) => x.id === dId);
    if (d) {
      setDiagnosis(d.name);
      setProblem(d.commonSymptoms);
    }
  };

  const handleMedChange = (mId: string) => {
    setSelectedMedId(mId);
    const m = availableMedicines.find((x) => x.id === mId);
    if (m) {
      setMedicine(m.name);
      setWithdrawalDays(String(m.withdrawalDays));
      setCost(String(m.unitPrice));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cow = availableAnimals.find((a) => a.id === animalId);
    onSave({
      animal: `${cow?.id || animalId} (${cow?.name || "Cow"})`,
      animalId,
      date,
      problem,
      symptoms: problem,
      diagnosis,
      veterinarian: vet,
      treatment: `${medicine} (${dose}) for ${duration}`,
      medicine,
      medicineId: selectedMedId,
      dose,
      doseQty: 1,
      duration,
      cost: Number(cost) || 0,
      status,
      withdrawalDays: Number(withdrawalDays) || 0,
      remarks,
    });
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Record Medical Treatment & Prescription" subtitle="Deducts medication stock and flags milk withdrawal safety">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="input-group">
            <span>Target Animal *</span>
            <select value={animalId} onChange={(e) => setAnimalId(e.target.value)} required>
              {availableAnimals.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} - {a.name} ({a.status})
                </option>
              ))}
            </select>
          </label>
          <label className="input-group">
            <span>Treatment Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label className="input-group">
            <span>Disease Category Database</span>
            <select value={selectedDiseaseId} onChange={(e) => handleDiseaseChange(e.target.value)}>
              {availableDiseases.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.category})
                </option>
              ))}
            </select>
          </label>
          <label className="input-group">
            <span>Diagnosis / Condition</span>
            <input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} required />
          </label>
          <label className="input-group">
            <span>Medicine Inventory</span>
            <select value={selectedMedId} onChange={(e) => handleMedChange(e.target.value)}>
              {availableMedicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} (Stock: {m.quantity} {m.unit}) - Withdrawal: {m.withdrawalDays}d
                </option>
              ))}
            </select>
          </label>
          <label className="input-group">
            <span>Prescribed Dosage</span>
            <input value={dose} onChange={(e) => setDose(e.target.value)} placeholder="e.g. 15 ml IV" />
          </label>
          <label className="input-group">
            <span>Course Duration</span>
            <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 3 Days" />
          </label>
          <label className="input-group">
            <span>Attending Veterinarian</span>
            <input value={vet} onChange={(e) => setVet(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Milk Withdrawal Hold (Days)</span>
            <input type="number" min="0" value={withdrawalDays} onChange={(e) => setWithdrawalDays(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Treatment Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="In Treatment">In Treatment (Active)</option>
              <option value="Recovered">Recovered / Discharged</option>
              <option value="Observation">Under Observation</option>
              <option value="Vaccination">Vaccination Program</option>
            </select>
          </label>
          <label className="input-group">
            <span>Medicine / Vet Cost (Rs)</span>
            <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
          </label>
        </div>

        <label className="input-group" style={{ marginTop: "12px" }}>
          <span>Clinical Symptoms & Notes</span>
          <textarea value={problem} onChange={(e) => setProblem(e.target.value)} rows={2} />
        </label>

        <div className="form-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary">
            <Save size={16} /> Save Health Record
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

// 8. ADD TRANSACTION MODAL
export function AddTransactionModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Partial<FinancialTransaction>) => void;
}) {
  const [type, setType] = useState<"Income" | "Expense">("Expense");
  const [category, setCategory] = useState("Feed Purchase");
  const [amount, setAmount] = useState("92000");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [entityName, setEntityName] = useState("AgriSilage Punjab Ltd");
  const [description, setDescription] = useState("Bulk silage & concentrate delivery");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Bank Transfer" | "Cheque">("Bank Transfer");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type,
      category,
      amount: Number(amount) || 0,
      date,
      entityName,
      description,
      paymentMethod,
    });
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Record Financial Voucher" subtitle="Add farm operational income or expense entry">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="input-group">
            <span>Transaction Type</span>
            <select value={type} onChange={(e) => setType(e.target.value as any)}>
              <option value="Expense">Expense (Operational Cost)</option>
              <option value="Income">Income (Revenue Receipt)</option>
            </select>
          </label>
          <label className="input-group">
            <span>Category</span>
            {type === "Expense" ? (
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Feed Purchase">Feed & Silage Purchase</option>
                <option value="Veterinary & Medicine">Veterinary & Medicine</option>
                <option value="Labor / Wages">Labor / Wages & Payroll</option>
                <option value="Electricity & Utilities">Electricity & Utilities (LESCO)</option>
                <option value="Diesel & Generator Fuel">Diesel & Generator Fuel</option>
                <option value="Equipment Maintenance">Equipment Maintenance & Repairs</option>
                <option value="Animal Purchase">Livestock Animal Purchase</option>
                <option value="Transport & Logistics">Transport & Logistics</option>
                <option value="Miscellaneous Expense">Miscellaneous Expense</option>
              </select>
            ) : (
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Milk Sales">Milk Sales (Bulk / Direct)</option>
                <option value="Animal Sales">Live Cattle / Calf Sales</option>
                <option value="Manure Sales">Organic Manure & Fertilizer</option>
                <option value="Other Farm Income">Other Farm Income</option>
              </select>
            )}
          </label>
          <label className="input-group">
            <span>Total Amount (Rs) *</span>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </label>
          <label className="input-group">
            <span>Transaction Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label className="input-group">
            <span>Counterparty (Vendor / Customer)</span>
            <input value={entityName} onChange={(e) => setEntityName(e.target.value)} placeholder="e.g. Nestlé Pakistan" required />
          </label>
          <label className="input-group">
            <span>Payment Method</span>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)}>
              <option value="Bank Transfer">Bank Transfer (Online/IBFT)</option>
              <option value="Cash">Cash on Hand</option>
              <option value="Cheque">Bank Cheque</option>
            </select>
          </label>
        </div>
        <label className="input-group" style={{ marginTop: "12px" }}>
          <span>Description / Reference</span>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Payment for 1,980L milk delivery" />
        </label>
        <div className="form-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary">
            <Save size={16} /> Record Transaction
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

// 9. ADD TASK MODAL
export function AddTaskModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<TaskItem>) => void;
}) {
  const [title, setTitle] = useState("");
  const [taskType, setTaskType] = useState<any>("Vaccination");
  const [target, setTarget] = useState("Entire Herd");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [assignedTo, setAssignedTo] = useState("Dr. Imran (Vet)");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: title || "Scheduled Farm Duty",
      taskType,
      target,
      dueDate,
      priority,
      assignedTo,
      status: "Pending",
      notes,
    });
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Schedule Farm Task or Reminder" subtitle="Assign reproductive checks, vaccinations, or routine management duties">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="input-group">
            <span>Task Title *</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Pregnancy Diagnosis 35d Post AI" required />
          </label>
          <label className="input-group">
            <span>Task Category</span>
            <select value={taskType} onChange={(e) => setTaskType(e.target.value)}>
              <option value="Pregnancy Diagnosis">Pregnancy Diagnosis (PD)</option>
              <option value="Vaccination">Vaccination Booster</option>
              <option value="AI">Artificial Insemination (AI)</option>
              <option value="Dry-off">Dry-Off Protocol</option>
              <option value="Expected Calving">Expected Calving / Maternity</option>
              <option value="Medicine">Medicine & Withdrawal Check</option>
              <option value="Deworming">Deworming Routine</option>
              <option value="Hoof Trimming">Hoof Trimming</option>
              <option value="Weight Measurement">Weight & Girth Scale</option>
              <option value="Health Check">General Health Check</option>
            </select>
          </label>
          <label className="input-group">
            <span>Target Animal / Shed *</span>
            <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="e.g. HF-052 (Zara) or Shed 1" required />
          </label>
          <label className="input-group">
            <span>Due Date *</span>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          </label>
          <label className="input-group">
            <span>Priority Level</span>
            <select value={priority} onChange={(e) => setPriority(e.target.value as any)}>
              <option value="High">High (Immediate Action)</option>
              <option value="Medium">Medium (Scheduled Routine)</option>
              <option value="Low">Low (General Maintenance)</option>
            </select>
          </label>
          <label className="input-group">
            <span>Assigned Staff / Vet</span>
            <input value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
          </label>
        </div>
        <label className="input-group" style={{ marginTop: "12px" }}>
          <span>Instructions & Protocol Details</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </label>
        <div className="form-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary">
            <Save size={16} /> Schedule Duty
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

// 10. SELL ANIMAL MODAL
export function SellAnimalModal({
  isOpen,
  onClose,
  animal,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  animal: Animal | null;
  onSave: (data: { buyer: string; salePrice: number; reason: string; weight: number }) => void;
}) {
  const [buyer, setBuyer] = useState("Malik Dairy Farm Okara");
  const [salePrice, setSalePrice] = useState("340000");
  const [reason, setReason] = useState<any>("Surplus Herd");
  const [weight, setWeight] = useState(String(animal?.weightKg || 550));

  if (!isOpen || !animal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      buyer,
      salePrice: Number(salePrice) || 0,
      reason,
      weight: Number(weight) || 550,
    });
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={`Record Sale of Animal ${animal.id}`} subtitle="Archives animal from active herd and credits sale revenue">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="input-group">
            <span>Buyer Name / Farm *</span>
            <input value={buyer} onChange={(e) => setBuyer(e.target.value)} required />
          </label>
          <label className="input-group">
            <span>Sale Price (Rs) *</span>
            <input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} required />
          </label>
          <label className="input-group">
            <span>Sale Reason</span>
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="Surplus Herd">Surplus Herd / Commercial Sale</option>
              <option value="Low Production">Low Milk Production (Cull)</option>
              <option value="Reproductive Problem">Reproductive Infertility</option>
              <option value="Old Age">Old Age Replacement</option>
              <option value="Disease">Chronic Mastitis / Lameness</option>
            </select>
          </label>
          <label className="input-group">
            <span>Live Sale Weight (kg)</span>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </label>
        </div>
        <div className="form-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary">
            <DollarSign size={16} /> Confirm Sale & Archive
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

// 11. RECORD MORTALITY MODAL
export function RecordMortalityModal({
  isOpen,
  onClose,
  animal,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  animal: Animal | null;
  onSave: (data: { cause: string; diseaseHistory: string; treatmentNotes: string; financialValue: number; postMortemNotes: string }) => void;
}) {
  const [cause, setCause] = useState("Acute Ruminal Tympany (Bloat)");
  const [diseaseHistory, setDiseaseHistory] = useState("Previous mild indigestion");
  const [treatmentNotes, setTreatmentNotes] = useState("Emergency trocarization attempted");
  const [financialValue, setFinancialValue] = useState("320000");
  const [postMortemNotes, setPostMortemNotes] = useState("Severe ruminal distension verified by vet.");

  if (!isOpen || !animal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      cause,
      diseaseHistory,
      treatmentNotes,
      financialValue: Number(financialValue) || 300000,
      postMortemNotes,
    });
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={`Record Mortality for Animal ${animal.id}`} subtitle="Archives deceased animal while retaining complete lifetime data">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="input-group">
            <span>Cause of Death *</span>
            <input value={cause} onChange={(e) => setCause(e.target.value)} required />
          </label>
          <label className="input-group">
            <span>Estimated Financial Value Loss (Rs)</span>
            <input type="number" value={financialValue} onChange={(e) => setFinancialValue(e.target.value)} />
          </label>
        </div>
        <label className="input-group" style={{ marginTop: "12px" }}>
          <span>Clinical Disease History</span>
          <input value={diseaseHistory} onChange={(e) => setDiseaseHistory(e.target.value)} />
        </label>
        <label className="input-group" style={{ marginTop: "12px" }}>
          <span>Emergency Treatment Notes</span>
          <input value={treatmentNotes} onChange={(e) => setTreatmentNotes(e.target.value)} />
        </label>
        <label className="input-group" style={{ marginTop: "12px" }}>
          <span>Post-Mortem Findings</span>
          <textarea value={postMortemNotes} onChange={(e) => setPostMortemNotes(e.target.value)} rows={2} />
        </label>
        <div className="form-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary" style={{ backgroundColor: "#c84545" }}>
            <AlertTriangle size={16} /> Record Deceased & Archive
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

// 12. QUICK 2-TAP MOBILE DATA ENTRY MODAL
export function QuickDataEntryModal({
  isOpen,
  onClose,
  animals,
  onLogMilk,
  onLogHealth,
}: {
  isOpen: boolean;
  onClose: () => void;
  animals: Animal[];
  onLogMilk: (record: Partial<MilkRecord>) => void;
  onLogHealth: (record: Partial<HealthRecord>) => void;
}) {
  const [selectedAnimalId, setSelectedAnimalId] = useState(animals[0]?.id || "HF-027");
  const [mode, setMode] = useState<"milk" | "heat" | "sickness">("milk");
  const [morningL, setMorningL] = useState("14.0");
  const [eveningL, setEveningL] = useState("13.5");
  const [symptom, setSymptom] = useState("Mastitis / Udder swelling");

  if (!isOpen) return null;

  const handleQuickSubmit = () => {
    const cow = animals.find((a) => a.id === selectedAnimalId);
    if (mode === "milk") {
      onLogMilk({
        animalId: selectedAnimalId,
        name: cow?.name || "Cow",
        date: new Date().toISOString().split("T")[0],
        session: "Both",
        morningLitres: Number(morningL) || 0,
        eveningLitres: Number(eveningL) || 0,
        totalLitres: (Number(morningL) || 0) + (Number(eveningL) || 0),
        fatPercent: 3.8,
        snfPercent: 8.8,
        quality: "Standard",
      });
    } else if (mode === "sickness") {
      onLogHealth({
        animal: `${cow?.id || selectedAnimalId} (${cow?.name || "Cow"})`,
        animalId: selectedAnimalId,
        date: new Date().toISOString().split("T")[0],
        problem: symptom,
        diagnosis: symptom,
        veterinarian: "Field Worker",
        treatment: "Flagged for Veterinary Inspection",
        medicine: "Pending Vet Visit",
        dose: "—",
        duration: "1 Day",
        cost: 0,
        status: "In Treatment",
        withdrawalDays: 0,
        withdrawalUntil: new Date().toISOString().split("T")[0],
      });
    }
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="⚡ Quick 2-Tap Mobile Entry" subtitle="Rapid field logger designed for parlor operators and herdsmen">
      <div className="quick-entry-container">
        <label className="input-group">
          <span>1. Select Animal (or Scan Tag)</span>
          <select value={selectedAnimalId} onChange={(e) => setSelectedAnimalId(e.target.value)}>
            {animals.map((a) => (
              <option key={a.id} value={a.id}>
                {a.id} - {a.name} ({a.earTag})
              </option>
            ))}
          </select>
        </label>

        <div className="quick-action-tabs">
          <button className={mode === "milk" ? "active" : ""} onClick={() => setMode("milk")}>
            <Droplets size={16} /> Milk Yield
          </button>
          <button className={mode === "sickness" ? "active" : ""} onClick={() => setMode("sickness")}>
            <Activity size={16} /> Flag Sick
          </button>
        </div>

        {mode === "milk" && (
          <div className="form-grid">
            <label className="input-group">
              <span>Morning (Litres)</span>
              <input type="number" step="0.5" value={morningL} onChange={(e) => setMorningL(e.target.value)} style={{ fontSize: "1.3rem", fontWeight: "bold" }} />
            </label>
            <label className="input-group">
              <span>Evening (Litres)</span>
              <input type="number" step="0.5" value={eveningL} onChange={(e) => setEveningL(e.target.value)} style={{ fontSize: "1.3rem", fontWeight: "bold" }} />
            </label>
          </div>
        )}

        {mode === "sickness" && (
          <label className="input-group">
            <span>Observed Symptoms</span>
            <select value={symptom} onChange={(e) => setSymptom(e.target.value)}>
              <option value="Mastitis / Swollen Quarter">Mastitis / Swollen Quarter</option>
              <option value="Lameness / Foot Injury">Lameness / Foot Injury</option>
              <option value="Fever / Loss of Appetite">Fever / Loss of Appetite</option>
              <option value="Bloat / Indigestion">Bloat / Indigestion</option>
              <option value="Respiratory Cough / Nasal">Respiratory Cough / Nasal</option>
            </select>
          </label>
        )}

        <div className="form-actions" style={{ marginTop: "20px" }}>
          <button className="primary" style={{ width: "100%", padding: "14px" }} onClick={handleQuickSubmit}>
            <CheckCircle2 size={18} /> Tap to Save Log Instantly
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

// 14. EDIT ANIMAL MODAL
export function EditAnimalModal({
  isOpen,
  onClose,
  animal,
  onSave,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  animal: Animal | null;
  onSave: (animal: Animal) => void;
  onDelete?: (id: string) => void;
}) {
  const [name, setName] = useState(animal?.name || "");
  const [breed, setBreed] = useState(animal?.breed || "HF (Holstein Friesian)");
  const [status, setStatus] = useState<AnimalStatus>(animal?.status || "Lactating");
  const [location, setLocation] = useState(animal?.location || "Shed 1");
  const [group, setGroup] = useState(animal?.group || "High Milking Group");
  const [lactation, setLactation] = useState(String(animal?.lactation || 1));
  const [dim, setDim] = useState(String(animal?.dim || 0));
  const [milk, setMilk] = useState(String(animal?.milk || 0));
  const [weightKg, setWeightKg] = useState(String(animal?.weightKg || 550));
  const [remarks, setRemarks] = useState(animal?.remarks || "");

  useEffect(() => {
    if (isOpen && animal) {
      setName(animal.name || "");
      setBreed(animal.breed || "HF (Holstein Friesian)");
      setStatus(animal.status || "Lactating");
      setLocation(animal.location || "Shed 1");
      setGroup(animal.group || "High Milking Group");
      setLactation(animal.lactation !== null && animal.lactation !== undefined ? String(animal.lactation) : "1");
      setDim(animal.dim !== null && animal.dim !== undefined ? String(animal.dim) : "0");
      setMilk(animal.milk !== null && animal.milk !== undefined ? String(animal.milk) : "0");
      setWeightKg(String(animal.weightKg || 550));
      setRemarks(animal.remarks || "");
    }
  }, [isOpen, animal]);

  if (!isOpen || !animal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedAnimal: Animal = {
      ...animal,
      id: animal.id,
      name: name || animal.name,
      breed,
      status,
      location,
      group,
      lactation: status === "Lactating" ? Number(lactation) : null,
      dim: status === "Lactating" ? Number(dim) : null,
      milk: status === "Lactating" ? Number(milk) : null,
      weightKg: Number(weightKg) || 550,
      remarks,
    };
    onSave(updatedAnimal);
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={`Edit Animal ${animal.id}`} subtitle="Update livestock profile and status details">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="input-group">
            <span>Animal Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="input-group">
            <span>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as AnimalStatus)}>
              <option value="Lactating">Lactating</option>
              <option value="Dry">Dry</option>
              <option value="Pregnant">Pregnant</option>
              <option value="Heifer">Heifer</option>
              <option value="Calf">Calf</option>
              <option value="Open">Open</option>
              <option value="Sick">Sick</option>
              <option value="Quarantine">Quarantine</option>
              <option value="Bull">Bull</option>
            </select>
          </label>
          <label className="input-group">
            <span>Housing Location</span>
            <input value={location} onChange={(e) => setLocation(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Group</span>
            <select value={group} onChange={(e) => setGroup(e.target.value)}>
              <option value="High Milking Group">High Milking Group</option>
              <option value="Medium Milking Group">Medium Milking Group</option>
              <option value="Dry Group">Dry Group</option>
              <option value="Pregnant Group">Pregnant Group</option>
              <option value="Heifer Pen">Heifer Pen</option>
              <option value="Calf Pen">Calf Pen</option>
            </select>
          </label>
          {status === "Lactating" && (
            <>
              <label className="input-group">
                <span>Lactation No.</span>
                <input type="number" value={lactation} onChange={(e) => setLactation(e.target.value)} />
              </label>
              <label className="input-group">
                <span>Days in Milk (DIM)</span>
                <input type="number" value={dim} onChange={(e) => setDim(e.target.value)} />
              </label>
              <label className="input-group">
                <span>Current Milk (L/day)</span>
                <input type="number" step="0.1" value={milk} onChange={(e) => setMilk(e.target.value)} />
              </label>
            </>
          )}
          <label className="input-group">
            <span>Weight (kg)</span>
            <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
          </label>
        </div>
        <label className="input-group" style={{ marginTop: "12px" }}>
          <span>Remarks</span>
          <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} />
        </label>
        <div className="form-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary">
            <Save size={16} /> Save Changes
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

// 15. ADD EVENT MODAL (Legacy alias for general farm event logger)
export function AddEventModal({
  isOpen,
  onClose,
  animals,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  animals: Animal[];
  onSave: (event: any) => void;
}) {
  const [animalId, setAnimalId] = useState(animals[0]?.id || "");
  const [eventType, setEventType] = useState("Heat");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ animalId, eventType, date, notes });
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Log Farm Event" subtitle="Quick multi-purpose herd event logger">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="input-group">
            <span>Select Animal</span>
            <select value={animalId} onChange={(e) => setAnimalId(e.target.value)}>
              {animals.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} - {a.name}
                </option>
              ))}
            </select>
          </label>
          <label className="input-group">
            <span>Event Category</span>
            <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
              <option value="Heat">Heat Observed</option>
              <option value="Hoof Trimming">Hoof Trimming</option>
              <option value="Deworming">Deworming</option>
              <option value="Body Condition Score">Body Condition Scoring</option>
              <option value="Group Move">Pen / Group Transfer</option>
            </select>
          </label>
          <label className="input-group">
            <span>Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
        </div>
        <label className="input-group" style={{ marginTop: "12px" }}>
          <span>Notes</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </label>
        <div className="form-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary">
            <Save size={16} /> Save Event
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

// 16. PURCHASE STOCK MODAL
export function PurchaseStockModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stock: any) => void;
}) {
  const [itemName, setItemName] = useState("Corn Silage (Premium)");
  const [category, setCategory] = useState("Feed");
  const [quantity, setQuantity] = useState("5000");
  const [unit, setUnit] = useState("kg");
  const [unitPrice, setUnitPrice] = useState("18.5");
  const [supplier, setSupplier] = useState("Punjab Agri Silage Ltd");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      itemName,
      category,
      quantity: Number(quantity) || 0,
      unit,
      unitPrice: Number(unitPrice) || 0,
      totalCost: (Number(quantity) || 0) * (Number(unitPrice) || 0),
      supplier,
      paymentMethod,
      date: new Date().toISOString().split("T")[0],
    });
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Purchase Feed / Medicine Stock" subtitle="Replenish farm inventory and automatically log purchase voucher">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="input-group">
            <span>Item Name *</span>
            <input value={itemName} onChange={(e) => setItemName(e.target.value)} required />
          </label>
          <label className="input-group">
            <span>Inventory Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Feed">Feed & Silage</option>
              <option value="Medicine">Veterinary Medicine</option>
              <option value="Semen">Breeding Semen Straws</option>
              <option value="Equipment">Farm Supplies & Spare Parts</option>
            </select>
          </label>
          <label className="input-group">
            <span>Quantity Purchased *</span>
            <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </label>
          <label className="input-group">
            <span>Unit of Measurement</span>
            <select value={unit} onChange={(e) => setUnit(e.target.value)}>
              <option value="kg">kg</option>
              <option value="L">Litres (L)</option>
              <option value="vial">Vials / Bottles</option>
              <option value="straw">Straws</option>
              <option value="bag">50kg Bags</option>
            </select>
          </label>
          <label className="input-group">
            <span>Unit Price (Rs) *</span>
            <input type="number" step="0.1" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} required />
          </label>
          <label className="input-group">
            <span>Supplier / Vendor</span>
            <input value={supplier} onChange={(e) => setSupplier(e.target.value)} required />
          </label>
        </div>
        <div className="form-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary">
            <Save size={16} /> Confirm Stock Purchase
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

// 17. RATION PLANNER MODAL
export function RationPlannerModal({
  isOpen,
  onClose,
  feeds = [],
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  feeds?: FeedItem[];
  onSave: (ration: any) => void;
}) {
  const [rationName, setRationName] = useState("High Milking Lactation TMR");
  const [targetGroup, setTargetGroup] = useState("High Milking Group");
  const [cowCount, setCowCount] = useState("8");
  const [silageKg, setSilageKg] = useState("28");
  const [concentrateKg, setConcentrateKg] = useState("8");
  const [hayKg, setHayKg] = useState("3");
  const [mineralGrams, setMineralGrams] = useState("250");
  const [expectedYieldL, setExpectedYieldL] = useState("28.0");

  if (!isOpen) return null;

  const costPerCow = Number(silageKg) * 18.5 + Number(concentrateKg) * 98.0 + Number(hayKg) * 35.0 + 120;
  const costPerLiter = expectedYieldL ? costPerCow / Number(expectedYieldL) : 95;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: rationName,
      group: targetGroup,
      targetCowCount: Number(cowCount) || 5,
      totalKgPerCow: Number(silageKg) + Number(concentrateKg) + Number(hayKg) + 0.25,
      totalCostPerCow: Number(costPerCow.toFixed(0)),
      costPerLiterExpected: Number(costPerLiter.toFixed(1)),
      dailyGroupConsumptionKg: (Number(silageKg) + Number(concentrateKg) + Number(hayKg)) * Number(cowCount),
      dailyGroupCost: Number((costPerCow * Number(cowCount)).toFixed(0)),
      ingredients: [
        { feedId: "F-01", feedName: "Corn Silage", kgPerCow: Number(silageKg), costPerCow: Number(silageKg) * 18.5 },
        { feedId: "F-02", feedName: "Lactation WMC", kgPerCow: Number(concentrateKg), costPerCow: Number(concentrateKg) * 98.0 },
        { feedId: "F-03", feedName: "Rhodes Grass Hay", kgPerCow: Number(hayKg), costPerCow: Number(hayKg) * 35.0 },
      ],
    });
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Formulate TMR Diet & Ration Plan" subtitle="Optimize Dry Matter (DM), Crude Protein (CP), and Feed Cost per Liter">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="input-group">
            <span>Ration Plan Name *</span>
            <input value={rationName} onChange={(e) => setRationName(e.target.value)} required />
          </label>
          <label className="input-group">
            <span>Target Animal Group</span>
            <select value={targetGroup} onChange={(e) => setTargetGroup(e.target.value)}>
              <option value="High Milking Group">High Milking Cows (&gt;25 L/day)</option>
              <option value="Medium Milking Group">Medium Milking Cows (15-25 L/day)</option>
              <option value="Dry Group">Dry Cows (Far-off / Close-up)</option>
              <option value="Heifer Pen">Growing Heifers (12-24m)</option>
              <option value="Calf Pen">Calf Weaning Group</option>
            </select>
          </label>
          <label className="input-group">
            <span>Herd Head Count in Group</span>
            <input type="number" value={cowCount} onChange={(e) => setCowCount(e.target.value)} required />
          </label>
          <label className="input-group">
            <span>Target Daily Milk (L/cow)</span>
            <input type="number" step="0.5" value={expectedYieldL} onChange={(e) => setExpectedYieldL(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Corn Silage (kg/cow/day)</span>
            <input type="number" step="0.5" value={silageKg} onChange={(e) => setSilageKg(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Dairy WMC Concentrate (kg/cow/day)</span>
            <input type="number" step="0.5" value={concentrateKg} onChange={(e) => setConcentrateKg(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Rhodes / Lucerne Hay (kg/cow/day)</span>
            <input type="number" step="0.5" value={hayKg} onChange={(e) => setHayKg(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Mineral Premix & Buffer (g/cow/day)</span>
            <input type="number" value={mineralGrams} onChange={(e) => setMineralGrams(e.target.value)} />
          </label>
        </div>

        <div className="profit-grid" style={{ marginTop: "16px" }}>
          <div>
            <span>Est. Feed Cost / Cow</span>
            <b>Rs {costPerCow.toFixed(0)} / day</b>
          </div>
          <div>
            <span>Feed Cost / Litre Milk</span>
            <b style={{ color: "#167a4b" }}>Rs {costPerLiter.toFixed(1)} / L</b>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary">
            <Save size={16} /> Save TMR Ration Formula
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

export function QrScannerModal({
  isOpen,
  onClose,
  animals,
  onSelectAnimal,
}: {
  isOpen: boolean;
  onClose: () => void;
  animals: Animal[];
  onSelectAnimal: (animal: Animal) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const handleSelect = (a: Animal) => {
    onSelectAnimal(a);
    onClose();
  };

  const filtered = animals.filter(
    (a) =>
      a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.earTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.rfid && a.rfid.toLowerCase().includes(searchTerm.toLowerCase())) ||
      a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="🔍 QR Code & RFID Tag Scanner" subtitle="Scan cow ear tag barcode or look up digital passport instantly">
      <div className="qr-scanner-sim">
        <div className="scanner-camera-box">
          <QrCode size={64} color="#1565c0" />
          <span>Point device camera at cattle Ear Tag or RFID collar</span>
          <div className="scanner-laser-line"></div>
        </div>

        <div className="scanner-manual-input">
          <label className="input-group">
            <span>Or Enter Tag / ID Manually</span>
            <input placeholder="Search Ear Tag (ET-1027), RFID, or Code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus />
          </label>
        </div>

        <div className="scanner-results-list">
          {filtered.slice(0, 5).map((a) => (
            <div key={a.id} className="scanner-item" onClick={() => handleSelect(a)}>
              <div>
                <b>
                  {a.name} ({a.id})
                </b>
                <p>
                  Ear Tag: {a.earTag} · RFID: {a.rfid || "—"} · Location: {a.location}
                </p>
              </div>
              <span className={`status ${a.status.toLowerCase()}`}>{a.status}</span>
            </div>
          ))}
        </div>
      </div>
    </BaseModal>
  );
}
