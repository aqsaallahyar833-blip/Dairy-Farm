import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity, AlertCircle, ArrowLeft, BarChart3, Bell, Boxes,
  CalendarDays, CheckCircle2, ChevronDown, CircleDollarSign,
  ClipboardList, CircleDot, CreditCard, Download, Droplets,
  Egg, FileText, Filter, Flame, HeartPulse, LayoutDashboard, ListChecks,
  Menu, Pencil, Plus, Printer, Search, Settings,
  Syringe, Trash2, Wallet, Wheat, X, Check, Clock
} from "lucide-react";
import { Animal, AnimalStatus, MilkRecord, BreedingEvent, HealthRecord, FeedItem, InventoryItem, FinancialTransaction, TaskItem, NotificationItem } from "./types";
import {
  getAnimals, createAnimal, updateAnimal, deleteAnimal,
  getMilkRecords, createMilkRecord,
  getBreedingEvents, createBreedingEvent,
  getHealthRecords, createHealthRecord,
  getFeeds, createFeed,
  getInventory, purchaseInventoryStock,
  getFinance, createTransaction,
  getTasks, createTask, updateTask, deleteTask,
  getSettings, saveSettings,
  getDashboard, isLoggedIn, login, logout
} from "./api";
import {
  AddAnimalModal, EditAnimalModal, AddEventModal, AddMilkModal,
  AddBreedingModal, AddHealthModal, PurchaseStockModal, AddTransactionModal,
  AddTaskModal, RationPlannerModal, SellAnimalModal, RecordMortalityModal
} from "./components/Modals";
import { ToastProvider, useToast } from "./components/Toast";
import {
  initialBreedingEvents,
  initialAnimals,
  initialMilkRecords,
  initialHealthRecords,
  initialFeeds,
  initialMedicines,
  initialTransactions,
  initialTasks,
  initialSettings
} from "./data";
import { exportToCsv } from "./utils/exportCsv";
import "./styles.css";

type Page =
  | "Dashboard" | "Animals" | "Animal Profile" | "Milk Management" | "Breeding"
  | "Health" | "Feed & Ration" | "Inventory" | "Finance" | "Reports"
  | "Tasks & Reminders" | "Settings";

const nav = [
  ["Dashboard", LayoutDashboard], ["Animals", CircleDot], ["Milk Management", Droplets],
  ["Breeding", Egg], ["Health", HeartPulse], ["Feed & Ration", Wheat],
  ["Inventory", Boxes], ["Finance", Wallet], ["Reports", BarChart3],
  ["Tasks & Reminders", ClipboardList], ["Settings", Settings]
] as const;

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("admin@dairyfarm.local");
  const [password, setPassword] = useState("Admin@12345");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      onLogin();
    } catch (err: any) {
      setError(err?.message || "Unable to connect to backend server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page" id="login-page">
      <div className="login-card" id="login-card">
        <div className="brand-mark login-mark"><CircleDot size={30}/></div>
        <h1>Dairy Farm</h1>
        <p>Live Management System</p>
        <form onSubmit={submit} id="login-form">
          <label>
            <span>Email</span>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" id="login-email" required />
          </label>
          <label>
            <span>Password</span>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" id="login-password" required />
          </label>
          {error && <div className="login-error" id="login-error">{error}</div>}
          <button className="primary login-submit" id="btn-login-submit" disabled={busy}>
            {busy ? "Signing in..." : "Sign In to Farm Portal"}
          </button>
        </form>
        <small>Demo Account: admin@dairyfarm.local / Admin@12345</small>
      </div>
    </div>
  );
}

function App() {
  const [authenticated, setAuthenticated] = useState(isLoggedIn());
  const [page, setPage] = useState<Page>("Dashboard");
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [animalsList, setAnimalsList] = useState<Animal[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: "1", title: "Pregnancy Diagnosis due", message: "Check HF-052 Zara 35 days post AI", date: "16 May 2024", tone: "orange", read: false, targetPage: "Breeding" },
    { id: "2", title: "Vaccination Booster scheduled", message: "Administer HS & BQ for HF-031 Daisy", date: "21 May 2024", tone: "blue", read: false, targetPage: "Health" },
    { id: "3", title: "Medicine withdrawal active", message: "HF-027 Bella on Intramast-DC (Hold milk until 21 May)", date: "17 May 2024", tone: "red", read: false, targetPage: "Health" },
    { id: "4", title: "Calving expected soon", message: "HF-027 Bella expected calving on 25 Sep", date: "24 May 2024", tone: "orange", read: false, targetPage: "Breeding" },
  ]);

  const [addAnimalOpen, setAddAnimalOpen] = useState(false);
  const { showToast } = useToast();

  const loadAnimals = async () => {
    try {
      const data = await getAnimals();
      const mapped: Animal[] = data.map((a: any) => ({
        ...a,
        id: a.animalCode || a.id,
        dbId: a.dbId || a.animalId || 1,
        earTag: a.earTag || `ET-${a.dbId || a.animalId || 1000}`,
        name: a.name || "Cattle",
        breed: a.breed?.name || a.breed || "HF (Holstein Friesian)",
        status: (a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1).toLowerCase() : "Lactating") as AnimalStatus,
        lactation: a.lactation !== undefined && a.lactation !== null ? Number(a.lactation) : 2,
        dim: a.dim !== undefined && a.dim !== null ? Number(a.dim) : 180,
        milk: a.milk !== undefined && a.milk !== null ? Number(a.milk) : 25.0,
        sex: a.sex || "Female",
        dob: a.dob || "2022-01-01",
        age: a.age || "2y",
        location: a.location || "Shed 1",
        dam: a.dam || (a.damId ? `HF-0${a.damId}` : "—"),
        sire: a.sire || (a.sireId ? `Bull-0${a.sireId}` : "—"),
        rfid: a.rfid || "RF-9206100027",
        group: a.group || "High Milking Group",
      }));
      setAnimalsList(mapped);
      if (!selectedAnimal && mapped.length > 0) {
        setSelectedAnimal(mapped[0]);
      } else if (selectedAnimal) {
        const found = mapped.find(a => a.id === selectedAnimal.id);
        if (found) setSelectedAnimal(found);
      }
    } catch (e: any) {
      console.warn(`Failed to load animals from API: ${e.message}`);
    }
  };

  useEffect(() => {
    if (authenticated) {
      loadAnimals();
    }
  }, [authenticated]);

  const handleAddAnimalSave = async (data: Partial<Animal>) => {
    try {
      const created = await createAnimal(data);
      showToast(`Animal ${created?.id || data.id || data.name} registered successfully!`, "success");
      await loadAnimals();
    } catch (e: any) {
      showToast(`Error saving animal: ${e.message}`, "error");
    }
  };

  const openAnimal = (animal: Animal) => {
    setSelectedAnimal(animal);
    setPage("Animal Profile");
    setMobileOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!authenticated) {
    return <LoginScreen onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <div className="app" id="app-root">
      <Sidebar
        page={page}
        setPage={(p) => { setPage(p); setMobileOpen(false); }}
        open={mobileOpen}
        close={() => setMobileOpen(false)}
      />

      <main className="main" id="main-view">
        <header className="topbar" id="topbar">
          <button className="menu-btn" id="btn-mobile-menu" onClick={() => setMobileOpen(true)}>
            <Menu size={20}/>
          </button>
          <div>
            <h1 id="page-heading">{page}</h1>
            <span className="breadcrumb">Farm / {page}</span>
          </div>

          <div className="top-actions">
            <div className="date-pill" id="today-pill">
              <CalendarDays size={14}/> {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </div>

            <button
              className="icon-btn"
              id="btn-bell-notif"
              onClick={() => setNotifOpen(!notifOpen)}
              title="Notifications"
            >
              <Bell size={17}/>
              {unreadCount > 0 && <i>{unreadCount}</i>}
            </button>

            {notifOpen && (
              <div className="notif-dropdown" id="notif-dropdown">
                <div className="notif-header">
                  <h4>Farm Notifications</h4>
                  <button
                    className="link"
                    id="btn-mark-all-read"
                    onClick={() => {
                      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                      showToast("All notifications marked as read", "info");
                    }}
                  >
                    Mark read
                  </button>
                </div>
                <div className="notif-body">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className="notif-item"
                      onClick={() => {
                        if (n.targetPage) setPage(n.targetPage as Page);
                        setNotifOpen(false);
                      }}
                    >
                      <span className={`dot ${n.tone}`}></span>
                      <div>
                        <b>{n.title}</b>
                        <p>{n.message}</p>
                        <small>{n.date}</small>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="notif-footer">
                  <button className="link" onClick={() => { setPage("Tasks & Reminders"); setNotifOpen(false); }}>
                    View All Reminders
                  </button>
                </div>
              </div>
            )}

            <div className="user-pill" id="user-profile-pill" onClick={() => setPage("Settings")}>
              <div className="avatar">MA</div>
              <span>Muhammad Ali</span>
              <ChevronDown size={14}/>
            </div>

            <button
              className="logout-btn"
              id="btn-logout"
              onClick={async () => {
                await logout();
                setAuthenticated(false);
                showToast("You have been signed out.", "info");
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {page === "Dashboard" && (
          <Dashboard
            onAnimal={openAnimal}
            onOpenAddAnimal={() => setAddAnimalOpen(true)}
            onNavigate={(p) => setPage(p)}
          />
        )}
        {page === "Animals" && (
          <Animals
            animals={animalsList}
            onAnimal={openAnimal}
            onRefresh={loadAnimals}
            onOpenAddAnimal={() => setAddAnimalOpen(true)}
          />
        )}
        {page === "Animal Profile" && (
          <AnimalProfile
            animal={selectedAnimal || animalsList[0]}
            onUpdateAnimal={(updated) => {
              setSelectedAnimal(updated);
              setAnimalsList(prev => prev.map(a => a.id === updated.id ? updated : a));
            }}
            onDeleteAnimal={(id) => {
              setAnimalsList(prev => prev.filter(a => a.id !== id));
              setPage("Animals");
            }}
            back={() => setPage("Animals")}
            allAnimals={animalsList}
            onAnimal={openAnimal}
          />
        )}
        {page === "Milk Management" && (
          <MilkManagement animals={animalsList} onOpenAddAnimal={() => setAddAnimalOpen(true)} onAnimal={openAnimal} />
        )}
        {page === "Breeding" && (
          <Breeding animals={animalsList} onAnimal={openAnimal} />
        )}
        {page === "Health" && (
          <Health animals={animalsList} onAnimal={openAnimal} />
        )}
        {page === "Feed & Ration" && (
          <Feed />
        )}
        {page === "Inventory" && (
          <Inventory />
        )}
        {page === "Finance" && (
          <Finance />
        )}
        {page === "Reports" && (
          <Reports />
        )}
        {page === "Tasks & Reminders" && (
          <Tasks />
        )}
        {page === "Settings" && (
          <SettingsPage />
        )}
      </main>

      <AddAnimalModal
        isOpen={addAnimalOpen}
        onClose={() => setAddAnimalOpen(false)}
        onSave={handleAddAnimalSave}
      />
    </div>
  );
}

function Sidebar({page, setPage, open, close}: {page: Page; setPage: (p: Page) => void; open: boolean; close: () => void}) {
  return (
    <aside className={`sidebar ${open ? "mobile-show" : ""}`} id="app-sidebar">
      <div className="brand">
        <div className="brand-mark"><CircleDot size={24}/></div>
        <div>
          <strong>DAIRY FARM</strong>
          <span>MANAGEMENT</span>
        </div>
        <button className="close-mobile" id="btn-close-sidebar" onClick={close}><X size={18}/></button>
      </div>

      <nav id="sidebar-nav">
        {nav.map(([label, Icon]) => (
          <button
            key={label}
            id={`nav-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
            className={page === label ? "active" : ""}
            onClick={() => { setPage(label); close(); }}
          >
            <Icon size={16}/>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="farm-card">
        <small>Farm: <b>Green Dairy Farm</b></small>
        <div className="profile-mini">
          <div className="avatar">MA</div>
          <div>
            <b>Muhammad Ali</b>
            <span>Farm Manager</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function PageTitle({title, subtitle, children}: {title: string; subtitle?: string; children?: React.ReactNode}) {
  return (
    <div className="page-title">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="actions">{children}</div>
    </div>
  );
}

function Card({children, className = "", id}: {children: React.ReactNode; className?: string; id?: string}) {
  return <section className={`card ${className}`} id={id}>{children}</section>;
}

function Stat({label, value, icon: Icon, tone = "blue", sub, onClick, id}: {label: string; value: string; icon: any; tone?: string; sub?: string; onClick?: () => void; id?: string}) {
  return (
    <div
      className={`stat ${tone}`}
      id={id}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className="stat-icon"><Icon size={17}/></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {sub && <small>{sub}</small>}
      </div>
    </div>
  );
}

function PanelHead({title, action, onAction}: {title: string; action?: string; onAction?: () => void}) {
  return (
    <div className="section-head">
      <h3>{title}</h3>
      {action && (
        <button className="link" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}

function MetricList({items}: {items: [string, string][]}) {
  return (
    <div className="metric-list">
      {items.map(([a, b]) => (
        <div key={a}>
          <span>{a}</span>
          <b>{b}</b>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({status}: {status: AnimalStatus | string}) {
  const norm = String(status).toLowerCase().replace(/ /g, "-");
  return <span className={`status ${norm}`}>{status}</span>;
}

// 1. DASHBOARD COMPONENT
function Dashboard({
  onAnimal,
  onOpenAddAnimal,
  onNavigate,
}: {
  onAnimal: (a: Animal) => void;
  onOpenAddAnimal: () => void;
  onNavigate: (p: Page) => void;
}) {
  const [summary, setSummary] = useState<any>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, animRes] = await Promise.allSettled([getDashboard(), getAnimals()]);
      if (sumRes.status === "fulfilled" && sumRes.value) {
        setSummary(sumRes.value);
      }
      if (animRes.status === "fulfilled" && Array.isArray(animRes.value) && animRes.value.length > 0) {
        setAnimals(animRes.value.map((a: any) => ({
          id: a.animalCode || a.id,
          name: a.name || "Cow",
          breed: a.breed?.name || a.breed || "HF",
          status: (a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1).toLowerCase() : "Lactating") as AnimalStatus,
          lactation: a.lactation || 2,
          dim: a.dim || 180,
          milk: a.milk || 26.0,
          sex: a.sex || "Female",
          dob: a.dob || "2022-01-01",
          age: a.age || "2y",
          location: a.location || "Shed 1",
          dam: a.dam || "HF-011",
          sire: a.sire || "Bull-04",
          earTag: a.earTag || "ET-1027",
        })));
      } else {
        setAnimals(initialAnimals);
      }
    } catch {
      setAnimals(initialAnimals);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="content" id="dashboard-content">
      <PageTitle title="Farm Dashboard" subtitle="Real-time herd production, health alerts, and financial KPIs">
        <button className="secondary" id="btn-refresh-dashboard" onClick={fetchDashboardData}>
          <Activity size={15}/> Refresh Live Data
        </button>
        <button className="primary" id="btn-dashboard-add-animal" onClick={onOpenAddAnimal}>
          <Plus size={16}/> Register Animal
        </button>
      </PageTitle>

      <div className="stats-grid">
        <Stat
          id="stat-total-animals"
          label="Total Herd Animals"
          value={summary ? String(summary.totalAnimals) : "10"}
          icon={CircleDot}
          onClick={() => onNavigate("Animals")}
        />
        <Stat
          id="stat-active-milking"
          label="Lactating Cattle"
          value={summary ? String(summary.activeAnimals) : "7"}
          icon={Droplets}
          tone="gold"
          onClick={() => onNavigate("Milk Management")}
        />
        <Stat
          id="stat-active-pregnancies"
          label="Confirmed Pregnant"
          value={summary ? String(summary.activePregnancies) : "2"}
          icon={Egg}
          tone="purple"
          onClick={() => onNavigate("Breeding")}
        />
        <Stat
          id="stat-open-health-cases"
          label="In Treatment / Sick"
          value={summary ? String(summary.openHealthCases) : "1"}
          icon={HeartPulse}
          tone="red"
          onClick={() => onNavigate("Health")}
        />
      </div>

      <Card id="live-db-summary">
        <div className="section-head">
          <h3>Production & Revenue Overview</h3>
          <span className="trend">Live REST API Connected</span>
        </div>
        <div className="milk-stats">
          <div>
            <span>Today's Total Milk</span>
            <b>{summary ? `${Number(summary.todayMilkLitres).toFixed(1)} L` : "1,980.5 L"}</b>
          </div>
          <div>
            <span>Month-to-Date Milk</span>
            <b>{summary ? `${Number(summary.monthlyMilkLitres).toLocaleString()} L` : "26,540 L"}</b>
          </div>
          <div>
            <span>Monthly Gross Revenue</span>
            <b>{summary ? `Rs ${Number(summary.monthRevenue).toLocaleString()}` : "Rs 394,500"}</b>
          </div>
        </div>
      </Card>

      <div className="three-grid">
        <Card id="panel-reproduction">
          <PanelHead title="Reproduction & AI" action="View Breeding" onAction={() => onNavigate("Breeding")}/>
          <MetricList items={[
            ["Pregnancies This Month", summary ? String(summary.pregnancyPositiveThisMonth) : "2"],
            ["Total Breeding Events", summary ? String(summary.breedingEventsThisMonth) : "3"],
            ["Calvings Anticipated", summary ? String(summary.calvingsThisMonth) : "1"],
          ]}/>
        </Card>
        <Card id="panel-health">
          <PanelHead title="Veterinary & Health" action="Health Logs" onAction={() => onNavigate("Health")}/>
          <MetricList items={[
            ["Open Medical Cases", summary ? String(summary.openHealthCases) : "1"],
            ["Under Active Treatment", summary ? String(summary.underTreatmentHealthCases) : "1"],
            ["Withdrawal Restrictons", "1 Active (Intramast)"],
          ]}/>
        </Card>
        <Card id="panel-finance">
          <PanelHead title="Financial Summary" action="Open Finance" onAction={() => onNavigate("Finance")}/>
          <MetricList items={[
            ["Total Revenue", summary ? `Rs ${Number(summary.monthRevenue).toLocaleString()}` : "Rs 394,500"],
            ["Total Operational Cost", summary ? `Rs ${Number(summary.monthExpenses).toLocaleString()}` : "Rs 185,000"],
          ]}/>
        </Card>
      </div>

      <div className="two-grid">
        <Card id="panel-top-producers">
          <PanelHead title="Top Milk Producers" action="View All" onAction={() => onNavigate("Animals")}/>
          <div className="rank-list">
            {animals.slice(0, 5).map((a, i) => (
              <div key={a.id} onClick={() => onAnimal(a)} title={`Open profile for ${a.id}`}>
                <span><b>#{i + 1}</b> {a.id} ({a.name})</span>
                <strong>{a.milk ? `${a.milk} L` : "26.5 L"}</strong>
              </div>
            ))}
          </div>
        </Card>
        <Card id="panel-recent-alerts">
          <PanelHead title="Actionable Farm Reminders" action="Task Board" onAction={() => onNavigate("Tasks & Reminders")}/>
          <div className="alert-list">
            <div onClick={() => onNavigate("Breeding")}>
              <span className="dot orange"></span>
              <div>
                <b>Pregnancy Diagnosis due for HF-052</b>
                <small>16 May 2024 · Ultrasound verification</small>
              </div>
            </div>
            <div onClick={() => onNavigate("Health")}>
              <span className="dot orange"></span>
              <div>
                <b>Vaccination Booster for HF-031</b>
                <small>21 May 2024 · HS & BQ vaccine scheduled</small>
              </div>
            </div>
            <div onClick={() => onNavigate("Health")}>
              <span className="dot red"></span>
              <div>
                <b>Medicine withdrawal active (HF-027)</b>
                <small>17 May 2024 · Hold milk until clear</small>
              </div>
            </div>
            <div onClick={() => onNavigate("Breeding")}>
              <span className="dot orange"></span>
              <div>
                <b>Calving due in maternity pen</b>
                <small>24 May 2024 · Prepare bedding</small>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// 2. ANIMALS COMPONENT (LIST VIEW)
function Animals({
  animals,
  onAnimal,
  onRefresh,
  onOpenAddAnimal,
}: {
  animals: Animal[];
  onAnimal: (a: Animal) => void;
  onRefresh: () => void;
  onOpenAddAnimal: () => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const { showToast } = useToast();

  const filtered = useMemo(() => {
    return animals.filter((a) => {
      const matchQuery =
        a.id.toLowerCase().includes(search.toLowerCase()) ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.breed.toLowerCase().includes(search.toLowerCase()) ||
        a.earTag.toLowerCase().includes(search.toLowerCase());
      const matchStatus = selectedStatus === "All" || a.status.toLowerCase() === selectedStatus.toLowerCase();
      return matchQuery && matchStatus;
    });
  }, [animals, search, selectedStatus]);

  const handleExportCsv = () => {
    const headers = ["Animal ID", "Ear Tag", "Name", "Breed", "Sex", "Status", "Lactation", "DIM", "Daily Milk (L)", "DOB", "Location", "Dam", "Sire"];
    const rows = filtered.map((a) => [
      a.id, a.earTag, a.name, a.breed, a.sex, a.status, a.lactation ?? "—", a.dim ?? "—", a.milk ?? "—", a.dob, a.location, a.dam, a.sire
    ]);
    exportToCsv("animals_master_list", headers, rows);
    showToast(`Exported ${filtered.length} animal records to CSV`, "success");
  };

  return (
    <div className="content" id="animals-page">
      <PageTitle title="Livestock Herd Master" subtitle="Complete cattle register with status, pedigree, and milk yield">
        <button className="secondary" id="btn-export-animals" onClick={handleExportCsv}>
          <Download size={15}/> Export CSV
        </button>
        <button className="secondary" id="btn-refresh-animals" onClick={onRefresh}>
          <Activity size={15}/> Refresh
        </button>
        <button className="primary" id="btn-add-animal-top" onClick={onOpenAddAnimal}>
          <Plus size={16}/> Add Animal
        </button>
      </PageTitle>

      <Card id="animals-card">
        <div className="toolbar">
          <div className="search" id="animals-search-bar">
            <Search size={16}/>
            <input
              id="input-animal-search"
              placeholder="Search by ID, name, breed, or ear tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ color: "#888" }}>
                <X size={14}/>
              </button>
            )}
          </div>
          <div className="filter-row" id="animals-status-filters">
            {["All", "Lactating", "Dry", "Pregnant", "Heifer", "Calf", "Sick", "Quarantine"].map((s) => (
              <button
                key={s}
                id={`filter-status-${s.toLowerCase()}`}
                className={selectedStatus === s ? "chip active" : "chip"}
                onClick={() => setSelectedStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrap">
          <table id="animals-table">
            <thead>
              <tr>
                <th>Animal ID</th>
                <th>Ear Tag</th>
                <th>Name</th>
                <th>Breed</th>
                <th>Sex</th>
                <th>Status</th>
                <th>Lactation</th>
                <th>DIM</th>
                <th>Milk (L/day)</th>
                <th>Location</th>
                <th>Dam / Sire</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ textAlign: "center", padding: "30px", color: "#888" }}>
                    No animal records match your search filter.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr
                    key={a.id}
                    id={`animal-row-${a.id}`}
                    className="clickable-row"
                    onClick={() => onAnimal(a)}
                    title={`Click to view single animal profile for ${a.id} (${a.name})`}
                  >
                    <td className="blue-text"><b>{a.id}</b></td>
                    <td>{a.earTag}</td>
                    <td><b>{a.name}</b></td>
                    <td>{a.breed}</td>
                    <td>{a.sex}</td>
                    <td><StatusBadge status={a.status}/></td>
                    <td>{a.lactation ?? "—"}</td>
                    <td>{a.dim ?? "—"}</td>
                    <td><b>{a.milk ? `${a.milk} L` : "—"}</b></td>
                    <td>{a.location}</td>
                    <td><small>{a.dam} / {a.sire}</small></td>
                    <td>
                      <button
                        className="table-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAnimal(a);
                        }}
                        title="View complete single animal profile & passport"
                      >
                        View Profile →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-foot">
          <span>Showing {filtered.length} of {animals.length} registered animals</span>
          <div>
            <button className="active">1</button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// 3. ANIMAL PROFILE COMPONENT (LIVE SINGLE ANIMAL DATA)
function AnimalProfile({
  animal,
  onUpdateAnimal,
  onDeleteAnimal,
  back,
  allAnimals,
  onAnimal,
}: {
  animal: Animal;
  onUpdateAnimal: (a: Animal) => void;
  onDeleteAnimal: (id: string) => void;
  back: () => void;
  allAnimals: Animal[];
  onAnimal?: (a: Animal) => void;
}) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [editOpen, setEditOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [milkModalOpen, setMilkModalOpen] = useState(false);
  const [breedingModalOpen, setBreedingModalOpen] = useState(false);
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);

  const [cowMilk, setCowMilk] = useState<MilkRecord[]>([]);
  const [cowBreeding, setCowBreeding] = useState<BreedingEvent[]>([]);
  const [cowHealth, setCowHealth] = useState<HealthRecord[]>([]);
  const [customEvents, setCustomEvents] = useState<Array<{ date: string; title: string; desc: string }>>([]);

  const { showToast } = useToast();

  const loadSingleAnimalData = async () => {
    try {
      const [allMilk, allBreeding, allHealth] = await Promise.all([
        getMilkRecords(),
        getBreedingEvents(),
        getHealthRecords(),
      ]);

      const matchedMilk = allMilk.filter(
        (m) => m.animalId === animal.id || m.name.toLowerCase() === animal.name.toLowerCase()
      );
      const matchedBreeding = allBreeding.filter(
        (b) => b.animalId === animal.id || b.animal.includes(animal.id) || b.animal.includes(animal.name)
      );
      const matchedHealth = allHealth.filter(
        (h) => h.animalId === animal.id || h.animal.includes(animal.id) || h.animal.includes(animal.name)
      );

      setCowMilk(matchedMilk);
      setCowBreeding(matchedBreeding);
      setCowHealth(matchedHealth);
    } catch (err: any) {
      console.error("Failed to load animal specific data", err);
    }
  };

  useEffect(() => {
    loadSingleAnimalData();
  }, [animal.id]);

  const handleSaveEdit = async (updated: Animal) => {
    try {
      await updateAnimal(updated.id, updated);
      onUpdateAnimal(updated);
      showToast(`Animal ${updated.id} updated successfully!`, "success");
    } catch (e: any) {
      showToast(`Failed to update animal: ${e.message}`, "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAnimal(id);
      onDeleteAnimal(id);
      showToast(`Animal ${id} removed from farm records.`, "info");
    } catch (e: any) {
      showToast(`Error deleting: ${e.message}`, "error");
    }
  };

  const handleAddEvent = (eventData: any) => {
    const newEntry = {
      date: eventData.date || new Date().toISOString().split("T")[0],
      title: `${eventData.eventType || "Event"} logged`,
      desc: `${eventData.metric1 || ""} ${eventData.metric2 || ""} ${eventData.notes || ""}`.trim(),
    };
    setCustomEvents([newEntry, ...customEvents]);
    showToast(`Event recorded for ${animal.id}!`, "success");
  };

  const handleSaveMilk = async (record: Partial<MilkRecord>) => {
    try {
      await createMilkRecord({ ...record, animalId: animal.id, name: animal.name });
      showToast(`Milk record of ${record.totalLitres} L saved for ${animal.id}!`, "success");
      loadSingleAnimalData();
    } catch (e: any) {
      showToast(`Error recording milk: ${e.message}`, "error");
    }
  };

  const handleSaveBreeding = async (record: Partial<BreedingEvent>) => {
    try {
      await createBreedingEvent({ ...record, animal: `${animal.id} ${animal.name}`, animalId: animal.id });
      showToast(`Breeding event saved for ${animal.id}!`, "success");
      loadSingleAnimalData();
    } catch (e: any) {
      showToast(`Error recording breeding: ${e.message}`, "error");
    }
  };

  const handleSaveHealth = async (record: Partial<HealthRecord>) => {
    try {
      await createHealthRecord({ ...record, animal: `${animal.id} ${animal.name}`, animalId: animal.id });
      showToast(`Health record saved for ${animal.id}!`, "success");
      loadSingleAnimalData();
    } catch (e: any) {
      showToast(`Error recording health: ${e.message}`, "error");
    }
  };

  const handleSellConfirm = async (soldAnimal: Animal, salePrice: number, buyerName: string, reason: string) => {
    try {
      await deleteAnimal(soldAnimal.id);
      onDeleteAnimal(soldAnimal.id);
      showToast(`Animal ${soldAnimal.id} sold for Rs ${salePrice.toLocaleString()} to ${buyerName}!`, "success");
    } catch (e: any) {
      showToast(`Failed to archive sale: ${e.message}`, "error");
    }
  };

  const printProfile = () => {
    window.print();
  };

  // Dynamic calculations
  const totalRecordedMilk = cowMilk.reduce((acc, m) => acc + (m.totalLitres || 0), 0);
  const avgRecordedMilk = cowMilk.length > 0 ? (totalRecordedMilk / cowMilk.length).toFixed(1) : (animal.milk ? String(animal.milk) : "28.5");
  const peakRecordedMilk = cowMilk.length > 0 ? Math.max(...cowMilk.map(m => m.totalLitres || 0)).toFixed(1) : (animal.milk ? (animal.milk * 1.1).toFixed(1) : "32.0");

  const dailyMilkRevenue = (Number(avgRecordedMilk) || 28) * 150;
  const dailyFeedCost = animal.status === "Lactating" ? 850 : 380;
  const dailyNetProfit = dailyMilkRevenue - dailyFeedCost;

  // Active Withdrawal detection
  const activeWithdrawalRecord = cowHealth.find(
    (h) => h.status === "In Treatment" || (h.withdrawalDays && h.withdrawalDays > 0)
  );

  // Generate 7-day trend values from cowMilk or realistic values based on daily yield
  const baseYield = Number(avgRecordedMilk) || 28;
  const yieldTrend = cowMilk.length >= 7
    ? cowMilk.slice(0, 7).reverse().map(m => m.totalLitres || baseYield)
    : [baseYield * 0.95, baseYield * 0.98, baseYield * 1.02, baseYield * 0.99, baseYield * 1.03, baseYield * 1.01, baseYield].map(v => +v.toFixed(1));

  // Combined timeline
  const combinedTimeline = [
    ...customEvents,
    ...cowMilk.slice(0, 3).map(m => ({
      date: m.date,
      title: `Milking Recorded (${m.totalLitres} L)`,
      desc: `Morning: ${m.morningLitres} L · Evening: ${m.eveningLitres} L · Fat: ${m.fatPercent}% · SNF: ${m.snfPercent}%`
    })),
    ...cowBreeding.map(b => ({
      date: b.aiDate || b.heatDate || "Recent",
      title: `Breeding: ${b.result || "AI Insemination"}`,
      desc: `Bull/Semen: ${b.semenBull} · Tech: ${b.technician} · Calving Due: ${b.calvingDate || "—"}`
    })),
    ...cowHealth.map(h => ({
      date: h.date,
      title: `Health: ${h.diagnosis} (${h.status})`,
      desc: `Medicine: ${h.medicine} (${h.dose}) · Vet: ${h.vet} · Withdrawal: ${h.withdrawalUntil || "None"}`
    })),
  ];

  return (
    <div className="content" id="animal-profile-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <button className="back-link" id="btn-back-animals" onClick={back} style={{ margin: 0 }}>
          <ArrowLeft size={15}/> Back to Herd List
        </button>

        {allAnimals.length > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--muted)" }}>Switch Animal:</span>
            <select
              className="animal-switcher-select"
              value={animal.id}
              onChange={(e) => {
                const found = allAnimals.find((a) => a.id === e.target.value);
                if (found && onAnimal) onAnimal(found);
              }}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--card-bg)",
                color: "var(--fg)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              {allAnimals.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} — {a.name} ({a.status} · {a.breed})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <PageTitle title={`Animal Profile: ${animal.id}`} subtitle={`${animal.name} · ${animal.breed === "HF" ? "Holstein Friesian" : animal.breed} · Ear Tag: ${animal.earTag}`}>
        <button className="secondary" id="btn-print-profile" onClick={printProfile}>
          <Printer size={15}/> Print Passport Card
        </button>
        <button className="secondary" id="btn-edit-animal" onClick={() => setEditOpen(true)}>
          <Pencil size={15}/> Edit Animal
        </button>
        <button className="secondary" id="btn-sell-animal" onClick={() => setSellModalOpen(true)}>
          <CircleDollarSign size={15}/> Record Sale
        </button>
        <button className="primary" id="btn-profile-add-event" onClick={() => setEventOpen(true)}>
          <Plus size={16}/> Log Custom Note
        </button>
      </PageTitle>

      {/* Hero Card */}
      <Card className="profile-card" id="profile-hero-card">
        <div className="animal-hero">
          <div className="animal-avatar" style={{ width: "80px", height: "80px", borderRadius: "12px", background: "var(--accent-light, #e3f2fd)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircleDot size={40} color="#1565c0" />
          </div>
          <div className="animal-main">
            <div>
              <h2>
                {animal.id} <span className="name">({animal.name})</span> <StatusBadge status={animal.status}/>
              </h2>
              <p>{animal.breed === "HF" ? "Purebred Holstein Friesian" : animal.breed} · {animal.sex} · Born {animal.dob} ({animal.age || "3y 2m"})</p>
            </div>
            <div className="detail-grid">
              <span>Ear Tag: <b>{animal.earTag}</b></span>
              <span>RFID / Microchip: <b>{animal.rfid || `RF-9206${animal.id.replace(/\D/g, "") || "10027"}`}</b></span>
              <span>Dam (Mother): <b>{animal.dam || "Unknown Dam"}</b></span>
              <span>Sire (Father): <b>{animal.sire || "Unknown Sire"}</b></span>
              <span>Current Group: <b>{animal.group || "High Milking Group"}</b></span>
              <span>Housing / Pen: <b>{animal.location || "Shed 1 - Row A"}</b></span>
              <span>Live Weight: <b>{animal.weightKg ? `${animal.weightKg} kg` : "580 kg"}</b></span>
              <span>Daily Milk Target: <b>{animal.milk ? `${animal.milk} L` : "28.0 L"}</b></span>
            </div>
          </div>
          <div className="hero-kpis">
            <span>Lactation No.<b>{animal.lactation ?? (animal.status === "Lactating" ? 3 : "—")}</b></span>
            <span>Days in Milk (DIM)<b>{animal.dim ?? (animal.status === "Lactating" ? 180 : "—")}</b></span>
            <span>7-Day Daily Avg<b>{avgRecordedMilk} L</b></span>
            <span>Peak Daily Milk<b>{peakRecordedMilk} L</b></span>
          </div>
        </div>

        {/* Quick Action Bar */}
        <div style={{ display: "flex", gap: "10px", padding: "12px 16px", background: "var(--card-subtle-bg, #f8fafc)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
          <button className="secondary sm" onClick={() => setMilkModalOpen(true)}>
            <Droplets size={14}/> + Record Milking
          </button>
          <button className="secondary sm" onClick={() => setBreedingModalOpen(true)}>
            <Egg size={14}/> + Log Insemination / AI
          </button>
          <button className="secondary sm" onClick={() => setHealthModalOpen(true)}>
            <HeartPulse size={14}/> + Veterinary Treatment
          </button>
          <button className="secondary sm" onClick={() => setEventOpen(true)}>
            <Plus size={14}/> + Timeline Event
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs" id="profile-tabs">
          {[
            { id: "Overview", label: "Overview & Identity" },
            { id: "Milk Record", label: `Milk Production (${cowMilk.length})` },
            { id: "Breeding", label: `Breeding & Calving (${cowBreeding.length})` },
            { id: "Health", label: `Veterinary & Health (${cowHealth.length})` },
            { id: "Pedigree Lineage", label: "Pedigree Lineage" },
            { id: "Feed & Nutrition", label: "Feed & Ration Allocation" },
            { id: "Timeline History", label: "Lifecycle Audit Log" },
          ].map((t) => (
            <button
              key={t.id}
              className={activeTab === t.id ? "active" : ""}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Active Milk Withdrawal Alert */}
      {activeWithdrawalRecord && (
        <Card id="profile-active-withdrawal" style={{ borderLeft: "4px solid #ef4444", background: "#fef2f2" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <AlertCircle size={24} color="#ef4444" />
            <div>
              <b style={{ color: "#991b1b", fontSize: "15px" }}>Active Milk Withdrawal Safety Restriction</b>
              <p style={{ margin: "4px 0 0 0", color: "#7f1d1d", fontSize: "13px" }}>
                Animal {animal.id} was treated with <b>{activeWithdrawalRecord.medicine}</b> for <b>{activeWithdrawalRecord.diagnosis}</b>.
                Milk must remain segregated and discarded until <b>{activeWithdrawalRecord.withdrawalUntil || "Treatment Completion"}</b>.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === "Overview" && (
        <>
          <div className="three-grid">
            <Card id="profile-status-summary">
              <PanelHead title="Reproduction & Life Stage" action="Log AI" onAction={() => setBreedingModalOpen(true)}/>
              <MetricList items={[
                ["Current State", animal.status],
                ["Reproductive Stage", animal.status === "Pregnant" ? "Confirmed Pregnant (Gestation Active)" : (animal.status === "Lactating" ? "Lactating & Milking" : "Dry Period")],
                ["Lactation Cycle", animal.lactation ? `Lactation #${animal.lactation}` : "Heifer / Uncalved"],
                ["Days in Milk (DIM)", animal.dim ? `${animal.dim} Days` : "—"],
              ]}/>
            </Card>
            <Card id="profile-milk-summary">
              <PanelHead title="Milk Production Summary" action="Record Milk" onAction={() => setMilkModalOpen(true)}/>
              <MetricList items={[
                ["Current Daily Yield", `${animal.milk || avgRecordedMilk} Litres`],
                ["7-Day Average", `${avgRecordedMilk} L / day`],
                ["Peak Recorded Yield", `${peakRecordedMilk} L / day`],
                ["Lifetime Recorded Total", `${totalRecordedMilk > 0 ? totalRecordedMilk.toFixed(1) : (Number(avgRecordedMilk) * 180).toFixed(0)} L`],
              ]}/>
              <button className="link" onClick={() => setActiveTab("Milk Record")} style={{ marginTop: "10px" }}>
                View Full Milk Ledger →
              </button>
            </Card>
            <Card id="profile-financial-summary">
              <PanelHead title="Daily Economics & Profit" />
              <MetricList items={[
                ["Estimated Milk Revenue", `Rs ${dailyMilkRevenue.toLocaleString()} / day`],
                ["Estimated Feed Expense", `Rs ${dailyFeedCost.toLocaleString()} / day`],
                ["Net Margin / Animal", `Rs ${dailyNetProfit.toLocaleString()} / day`],
                ["Milk Price Benchmark", "Rs 150 / Litre (Farm-Gate)"],
              ]}/>
            </Card>
          </div>

          <div className="two-grid">
            <Card id="profile-milk-chart-card">
              <PanelHead title="7-Day Yield Trend (Litres)" action="Milking Table" onAction={() => setActiveTab("Milk Record")}/>
              <div className="bar-chart" style={{ height: "150px" }}>
                {yieldTrend.map((v, i) => (
                  <div className="bar-col" key={i}>
                    <div className="bar" style={{ height: `${Math.min(100, (v / 40) * 120)}px` }} title={`${v} Litres`}></div>
                    <small>{["Day -6", "Day -5", "Day -4", "Day -3", "Day -2", "Yesterday", "Today"][i]}</small>
                  </div>
                ))}
              </div>
            </Card>
            <Card id="profile-timeline-card">
              <PanelHead title="Recent Event Timeline" action="Add Note" onAction={() => setEventOpen(true)}/>
              <div className="timeline">
                {combinedTimeline.slice(0, 5).map((item, idx) => (
                  <div key={idx}>
                    <b>{item.date} · {item.title}</b>
                    <span>{item.desc}</span>
                  </div>
                ))}
                {combinedTimeline.length === 0 && (
                  <p className="muted" style={{ padding: "20px 0" }}>No recent events recorded for this cattle.</p>
                )}
              </div>
            </Card>
          </div>
        </>
      )}

      {/* TAB 2: MILK RECORD */}
      {activeTab === "Milk Record" && (
        <Card id="profile-milk-tab">
          <div className="section-head">
            <div>
              <h3>Individual Milk Production Ledger for {animal.id} ({animal.name})</h3>
              <span className="muted">Detailed morning and evening yield records</span>
            </div>
            <button className="primary sm" onClick={() => setMilkModalOpen(true)}>
              <Plus size={14}/> Add Milking Record
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Morning (L)</th>
                  <th>Evening (L)</th>
                  <th>Total (L)</th>
                  <th>Fat %</th>
                  <th>SNF %</th>
                  <th>Quality Status</th>
                </tr>
              </thead>
              <tbody>
                {cowMilk.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#888" }}>
                      No direct daily milk logs entered yet for this cattle. Click <b>"Add Milking Record"</b> above to record one.
                    </td>
                  </tr>
                ) : (
                  cowMilk.map((m) => (
                    <tr key={m.id}>
                      <td><b>{m.date}</b></td>
                      <td>{m.morningLitres} L</td>
                      <td>{m.eveningLitres} L</td>
                      <td><b>{m.totalLitres} L</b></td>
                      <td>{m.fatPercent}%</td>
                      <td>{m.snfPercent}%</td>
                      <td><StatusBadge status={m.quality || "Positive"}/></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: BREEDING */}
      {activeTab === "Breeding" && (
        <Card id="profile-breeding-tab">
          <div className="section-head">
            <div>
              <h3>Breeding & Reproductive History for {animal.id} ({animal.name})</h3>
              <span className="muted">Estrus observations, AI straws, pregnancy diagnosis, and expected calving dates</span>
            </div>
            <button className="primary sm" onClick={() => setBreedingModalOpen(true)}>
              <Plus size={14}/> Add Breeding Event
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Heat Date</th>
                  <th>AI Date</th>
                  <th>Bull / Semen Straw</th>
                  <th>Inseminator / Tech</th>
                  <th>Pregnancy Check (PD)</th>
                  <th>PD Result</th>
                  <th>Expected Calving</th>
                </tr>
              </thead>
              <tbody>
                {cowBreeding.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#888" }}>
                      No breeding history recorded yet. Click <b>"Add Breeding Event"</b> above to record an AI or heat observation.
                    </td>
                  </tr>
                ) : (
                  cowBreeding.map((b) => (
                    <tr key={b.id}>
                      <td>{b.heatDate || "—"}</td>
                      <td><b>{b.aiDate || "—"}</b></td>
                      <td>{b.semenBull}</td>
                      <td>{b.technician}</td>
                      <td>{b.pdDate || "Scheduled"}</td>
                      <td><StatusBadge status={b.result}/></td>
                      <td><b>{b.calvingDate || "Calculating"}</b></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 4: HEALTH */}
      {activeTab === "Health" && (
        <Card id="profile-health-tab">
          <div className="section-head">
            <div>
              <h3>Veterinary & Medical Treatment History for {animal.id} ({animal.name})</h3>
              <span className="muted">Clinical diagnosis, prescribed formulations, dosage, and milk withdrawal holding</span>
            </div>
            <button className="primary sm" onClick={() => setHealthModalOpen(true)}>
              <Plus size={14}/> Log Medical Treatment
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Treatment Date</th>
                  <th>Diagnosis / Symptom</th>
                  <th>Medicine / Formulation</th>
                  <th>Dose</th>
                  <th>Duration</th>
                  <th>Veterinarian</th>
                  <th>Withdrawal Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {cowHealth.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "#888" }}>
                      No veterinary medical treatments on file. Click <b>"Log Medical Treatment"</b> above to record a vaccination or prescription.
                    </td>
                  </tr>
                ) : (
                  cowHealth.map((h) => (
                    <tr key={h.id}>
                      <td><b>{h.date}</b></td>
                      <td><b>{h.diagnosis}</b></td>
                      <td>{h.medicine}</td>
                      <td>{h.dose}</td>
                      <td>{h.duration}</td>
                      <td>{h.vet}</td>
                      <td>{h.withdrawalUntil || "None"}</td>
                      <td><StatusBadge status={h.status}/></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 5: PEDIGREE LINEAGE */}
      {activeTab === "Pedigree Lineage" && (
        <Card id="profile-pedigree-tab">
          <PanelHead title="3-Generation Pedigree Lineage Tree" subtitle="Genetic ancestry and bloodline verification"/>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", padding: "20px 0" }}>
            {/* Self */}
            <div style={{ padding: "16px", borderRadius: "10px", background: "var(--card-subtle-bg, #f1f5f9)", border: "2px solid #3b82f6" }}>
              <span style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "#2563eb" }}>Subject Animal</span>
              <h4 style={{ margin: "6px 0 2px 0", fontSize: "16px" }}>{animal.id} ({animal.name})</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)" }}>Breed: {animal.breed} · Sex: {animal.sex}</p>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px" }}>Ear Tag: {animal.earTag}</p>
            </div>

            {/* Parents */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ padding: "14px", borderRadius: "8px", background: "var(--card-subtle-bg, #f8fafc)", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#16a34a" }}>Sire (Father)</span>
                <h5 style={{ margin: "4px 0 0 0", fontSize: "14px" }}>{animal.sire || "Sire ID: HF-Bull-Alpha"}</h5>
                <small className="muted">Holstein Friesian Semen Line</small>
              </div>
              <div style={{ padding: "14px", borderRadius: "8px", background: "var(--card-subtle-bg, #f8fafc)", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#db2777" }}>Dam (Mother)</span>
                <h5 style={{ margin: "4px 0 0 0", fontSize: "14px" }}>{animal.dam || "Dam ID: HF-Cow-Beta"}</h5>
                <small className="muted">Dam Yield: 34 L / day peak</small>
              </div>
            </div>

            {/* Grandparents */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ padding: "8px 12px", borderRadius: "6px", background: "var(--card-subtle-bg, #f8fafc)", border: "1px dashed var(--border)", fontSize: "12px" }}>
                <b>Paternal Grandsire:</b> ABS SuperBull 001
              </div>
              <div style={{ padding: "8px 12px", borderRadius: "6px", background: "var(--card-subtle-bg, #f8fafc)", border: "1px dashed var(--border)", fontSize: "12px" }}>
                <b>Paternal Granddam:</b> HF Matriarch 88
              </div>
              <div style={{ padding: "8px 12px", borderRadius: "6px", background: "var(--card-subtle-bg, #f8fafc)", border: "1px dashed var(--border)", fontSize: "12px" }}>
                <b>Maternal Grandsire:</b> Semex GoldBull 99
              </div>
              <div style={{ padding: "8px 12px", borderRadius: "6px", background: "var(--card-subtle-bg, #f8fafc)", border: "1px dashed var(--border)", fontSize: "12px" }}>
                <b>Maternal Granddam:</b> High Yield Dam 412
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 6: FEED & NUTRITION */}
      {activeTab === "Feed & Nutrition" && (
        <Card id="profile-feed-tab">
          <PanelHead title={`Daily Individual Nutrition Allocation for ${animal.id}`} subtitle={`Formulated for ${animal.status} cattle (${animal.group || "Milking Group"})`}/>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Feed / Ration Ingredient</th>
                  <th>Daily Allocation</th>
                  <th>Dry Matter (DM %)</th>
                  <th>Crude Protein (CP %)</th>
                  <th>Estimated Cost / Day</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Corn / Maize Silage</b></td>
                  <td>25.0 kg</td>
                  <td>32 %</td>
                  <td>8.5 %</td>
                  <td>Rs 800</td>
                </tr>
                <tr>
                  <td><b>Dairy Concentrate (Wanda 18%)</b></td>
                  <td>{animal.status === "Lactating" ? "7.0 kg" : "3.0 kg"}</td>
                  <td>88 %</td>
                  <td>18.0 %</td>
                  <td>{animal.status === "Lactating" ? "Rs 1,015" : "Rs 435"}</td>
                </tr>
                <tr>
                  <td><b>Rhodes / Alfalfa Dry Hay</b></td>
                  <td>3.5 kg</td>
                  <td>86 %</td>
                  <td>14.0 %</td>
                  <td>Rs 140</td>
                </tr>
                <tr>
                  <td><b>Mineral Premix + Toxin Binder + Salt</b></td>
                  <td>0.25 kg</td>
                  <td>98 %</td>
                  <td>—</td>
                  <td>Rs 55</td>
                </tr>
              </tbody>
              <tfoot>
                <tr style={{ fontWeight: "bold", background: "var(--card-subtle-bg, #f8fafc)" }}>
                  <td>Total Daily Feeding Plan</td>
                  <td>{animal.status === "Lactating" ? "35.75 kg" : "31.75 kg"}</td>
                  <td>~14.5 kg DM</td>
                  <td>16.2 % Avg CP</td>
                  <td>Rs {dailyFeedCost.toLocaleString()} / day</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 7: TIMELINE AUDIT LOG */}
      {activeTab === "Timeline History" && (
        <Card id="profile-full-timeline">
          <PanelHead title="Full Lifetime Activity Log" action="Add Note" onAction={() => setEventOpen(true)}/>
          <div className="timeline">
            {combinedTimeline.map((item, idx) => (
              <div key={idx}>
                <b>{item.date} — {item.title}</b>
                <span>{item.desc}</span>
              </div>
            ))}
            {combinedTimeline.length === 0 && (
              <p className="muted" style={{ padding: "20px 0" }}>No audit log entries recorded yet.</p>
            )}
          </div>
        </Card>
      )}

      {/* MODALS */}
      <EditAnimalModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        animal={animal}
        onSave={handleSaveEdit}
        onDelete={handleDelete}
      />

      <AddEventModal
        isOpen={eventOpen}
        onClose={() => setEventOpen(false)}
        animalId={animal.id}
        animalName={animal.name}
        onSave={handleAddEvent}
      />

      <AddMilkModal
        isOpen={milkModalOpen}
        onClose={() => setMilkModalOpen(false)}
        animals={[animal, ...allAnimals.filter(a => a.id !== animal.id)]}
        onSave={handleSaveMilk}
      />

      <AddBreedingModal
        isOpen={breedingModalOpen}
        onClose={() => setBreedingModalOpen(false)}
        animals={[animal, ...allAnimals.filter(a => a.id !== animal.id)]}
        onSave={handleSaveBreeding}
      />

      <AddHealthModal
        isOpen={healthModalOpen}
        onClose={() => setHealthModalOpen(false)}
        animals={[animal, ...allAnimals.filter(a => a.id !== animal.id)]}
        onSave={handleSaveHealth}
      />

      <SellAnimalModal
        isOpen={sellModalOpen}
        onClose={() => setSellModalOpen(false)}
        animal={animal}
        onConfirm={handleSellConfirm}
      />
    </div>
  );
}
// 4. MILK MANAGEMENT COMPONENT
function MilkManagement({
  animals,
  onOpenAddAnimal,
  onAnimal,
}: {
  animals: Animal[];
  onOpenAddAnimal: () => void;
  onAnimal?: (a: Animal) => void;
}) {
  const [records, setRecords] = useState<MilkRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [session, setSession] = useState("Morning & Evening");
  const [editValues, setEditValues] = useState<Record<string, { morning: string; evening: string; fat: string; snf: string }>>({});
  const { showToast } = useToast();

  const fetchMilkData = async () => {
    try {
      const data = await getMilkRecords();
      let activeRecords = data;
      if (!activeRecords || activeRecords.length === 0) {
        const lactatingAnimals = animals.filter(a => a.status === "Lactating");
        const baseHerd = lactatingAnimals.length > 0 ? lactatingAnimals : animals;
        activeRecords = baseHerd.map(a => ({
          id: `M-${a.id}`,
          animalId: a.id,
          name: a.name,
          date: date,
          session: "Both",
          morningLitres: Number(((a.milk || 25) * 0.52).toFixed(1)),
          eveningLitres: Number(((a.milk || 25) * 0.48).toFixed(1)),
          totalLitres: a.milk || 25,
          fatPercent: 3.8,
          proteinPercent: 3.2,
          snfPercent: 8.8,
          scc: 150,
          quality: "Standard",
        }));
      }
      setRecords(activeRecords);
      const initial: Record<string, { morning: string; evening: string; fat: string; snf: string }> = {};
      activeRecords.forEach((r) => {
        initial[r.id] = {
          morning: String(r.morningLitres),
          evening: String(r.eveningLitres),
          fat: String(r.fatPercent),
          snf: String(r.snfPercent),
        };
      });
      setEditValues(initial);
    } catch (e: any) {
      console.warn("Could not fetch milk from API, generating local matrix:", e);
      const lactatingAnimals = animals.filter(a => a.status === "Lactating");
      const baseHerd = lactatingAnimals.length > 0 ? lactatingAnimals : animals;
      const fallbackRecords: MilkRecord[] = baseHerd.map(a => ({
        id: `M-${a.id}`,
        animalId: a.id,
        name: a.name,
        date: date,
        session: "Both",
        morningLitres: Number(((a.milk || 25) * 0.52).toFixed(1)),
        eveningLitres: Number(((a.milk || 25) * 0.48).toFixed(1)),
        totalLitres: a.milk || 25,
        fatPercent: 3.8,
        proteinPercent: 3.2,
        snfPercent: 8.8,
        scc: 150,
        quality: "Standard",
      }));
      setRecords(fallbackRecords);
    }
  };

  useEffect(() => {
    fetchMilkData();
  }, []);

  const handleSaveAll = async () => {
    let totalUpdated = 0;
    try {
      for (const r of records) {
        const edits = editValues[r.id];
        if (edits) {
          const m = Number(edits.morning) || 0;
          const ev = Number(edits.evening) || 0;
          await createMilkRecord({
            animalId: r.animalId,
            name: r.name,
            date,
            session: "Both",
            morningLitres: m,
            eveningLitres: ev,
            totalLitres: +(m + ev).toFixed(2),
            fatPercent: Number(edits.fat) || 3.8,
            snfPercent: Number(edits.snf) || 8.8,
          });
          totalUpdated++;
        }
      }
      showToast(`Saved and synchronized ${totalUpdated} milk production rows!`, "success");
      fetchMilkData();
    } catch (e: any) {
      showToast(`Failed to save milk records: ${e.message}`, "error");
    }
  };

  const handleAddMilkSave = async (record: Partial<MilkRecord>) => {
    try {
      await createMilkRecord(record);
      showToast(`Recorded ${record.totalLitres} L for ${record.animalId}!`, "success");
      fetchMilkData();
    } catch (e: any) {
      showToast(`Error saving milk record: ${e.message}`, "error");
    }
  };

  const handleExportCsv = () => {
    const headers = ["Record ID", "Animal ID", "Name", "Date", "Morning (L)", "Evening (L)", "Total (L)", "Fat %", "SNF %", "Quality"];
    const rows = records.map((r) => [
      r.id, r.animalId, r.name, r.date, r.morningLitres, r.eveningLitres, r.totalLitres, r.fatPercent, r.snfPercent, r.quality || "Standard"
    ]);
    exportToCsv("milk_records", headers, rows);
    showToast("Milk records exported to CSV", "success");
  };

  const totalToday = records.reduce((acc, r) => acc + (r.totalLitres || 0), 0) || 1980.5;

  return (
    <div className="content" id="milk-management-page">
      <PageTitle title="Milk Yield & Quality Management" subtitle="Daily morning and evening herd production logs">
        <button className="secondary" id="btn-export-milk" onClick={handleExportCsv}>
          <Download size={15}/> Export CSV
        </button>
        <button className="secondary" id="btn-add-animal-from-milk" onClick={onOpenAddAnimal}>
          <Plus size={15}/> Register Animal
        </button>
        <button className="primary" id="btn-add-milk-record" onClick={() => setModalOpen(true)}>
          <Plus size={16}/> Record Milk Yield
        </button>
      </PageTitle>

      <Card id="milk-session-card">
        <div className="form-grid three">
          <label className="input-group">
            <span>Milking Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="input-group">
            <span>Milking Session</span>
            <select value={session} onChange={(e) => setSession(e.target.value)}>
              <option value="Morning & Evening">Morning & Evening (Both)</option>
              <option value="Morning">Morning Only</option>
              <option value="Evening">Evening Only</option>
            </select>
          </label>
          <label className="input-group">
            <span>Target Herd Group</span>
            <select>
              <option>All Lactating Herd</option>
              <option>High Milking Group (Shed 1)</option>
              <option>Medium Milking Group (Shed 2)</option>
            </select>
          </label>
        </div>
      </Card>

      <Card id="milk-table-card">
        <div className="section-head">
          <h3>Individual Animal Production Table</h3>
          <span className="trend">Editable Matrix · Click Animal to View Profile</span>
        </div>

        <div className="table-wrap">
          <table id="milk-matrix-table">
            <thead>
              <tr>
                <th>Animal ID</th>
                <th>Name</th>
                <th>Morning (L)</th>
                <th>Evening (L)</th>
                <th>Total (L)</th>
                <th>Fat %</th>
                <th>SNF %</th>
                <th>Quality Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const edits = editValues[r.id] || {
                  morning: String(r.morningLitres),
                  evening: String(r.eveningLitres),
                  fat: String(r.fatPercent),
                  snf: String(r.snfPercent),
                };
                const total = (Number(edits.morning) || 0) + (Number(edits.evening) || 0);

                const foundAnimal = animals.find(
                  (a) => a.id === r.animalId || a.name.toLowerCase() === r.name.toLowerCase()
                );

                return (
                  <tr key={r.id}>
                    <td
                      className="blue-text"
                      style={{ cursor: onAnimal && foundAnimal ? "pointer" : "default" }}
                      onClick={() => {
                        if (foundAnimal && onAnimal) onAnimal(foundAnimal);
                      }}
                      title={foundAnimal ? `Open Profile for ${foundAnimal.id}` : undefined}
                    >
                      <b>{r.animalId}</b>
                    </td>
                    <td
                      style={{ cursor: onAnimal && foundAnimal ? "pointer" : "default" }}
                      onClick={() => {
                        if (foundAnimal && onAnimal) onAnimal(foundAnimal);
                      }}
                      title={foundAnimal ? `Open Profile for ${foundAnimal.id}` : undefined}
                    >
                      <b>{r.name}</b>
                    </td>
                    <td>
                      <input
                        className="table-input"
                        type="number"
                        step="0.1"
                        value={edits.morning}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            [r.id]: { ...edits, morning: e.target.value },
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="table-input"
                        type="number"
                        step="0.1"
                        value={edits.evening}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            [r.id]: { ...edits, evening: e.target.value },
                          })
                        }
                      />
                    </td>
                    <td><b>{total.toFixed(1)} L</b></td>
                    <td>
                      <input
                        className="table-input"
                        type="number"
                        step="0.1"
                        value={edits.fat}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            [r.id]: { ...edits, fat: e.target.value },
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="table-input"
                        type="number"
                        step="0.1"
                        value={edits.snf}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            [r.id]: { ...edits, snf: e.target.value },
                          })
                        }
                      />
                    </td>
                    <td><StatusBadge status="Positive"/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="form-actions">
          <button className="secondary" id="btn-cancel-milk" onClick={() => fetchMilkData()}>
            Reset
          </button>
          <button className="primary" id="btn-save-all-milk" onClick={handleSaveAll}>
            <CheckCircle2 size={15}/> Save All Records
          </button>
        </div>
      </Card>

      <div className="two-grid">
        <Card id="milk-kpi-summary">
          <PanelHead title="Daily Production Summary"/>
          <div className="big-number">
            {totalToday.toFixed(1)} <small>L</small>
          </div>
          <p className="muted">+8.4% compared with previous week average</p>
        </Card>
        <Card id="milk-quality-summary">
          <PanelHead title="Quality & Composition Analysis"/>
          <MetricList items={[
            ["Average Fat Content", "3.78 %"],
            ["Average Protein", "3.25 %"],
            ["Average SNF", "8.82 %"],
            ["Isolated / Rejected Milk", "10.0 L (Held in withdrawal)"],
          ]}/>
        </Card>
      </div>

      <AddMilkModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        animals={animals}
        onSave={handleAddMilkSave}
      />
    </div>
  );
}

// 5. BREEDING COMPONENT
function Breeding({
  animals,
  onAnimal,
}: {
  animals: Animal[];
  onAnimal?: (a: Animal) => void;
}) {
  const [events, setEvents] = useState<BreedingEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const { showToast } = useToast();

  const fetchBreeding = async () => {
    try {
      const data = await getBreedingEvents();
      if (Array.isArray(data) && data.length > 0) {
        setEvents(data);
      } else {
        setEvents(initialBreedingEvents);
      }
    } catch (e: any) {
      setEvents(initialBreedingEvents);
      showToast(`Notice: Loaded local breeding records. (${e.message})`, "info");
    }
  };

  useEffect(() => {
    fetchBreeding();
  }, []);

  const handleSaveBreeding = async (data: Partial<BreedingEvent>) => {
    try {
      await createBreedingEvent(data);
      showToast(`Breeding record for ${data.animal} saved!`, "success");
      fetchBreeding();
    } catch (e: any) {
      // Local fallback in case of connection glitch
      const newLocalEvent: BreedingEvent = {
        id: `B-${Date.now()}`,
        animal: data.animal || "Cattle",
        animalId: data.animalId || "HF-027",
        heatDate: data.heatDate || new Date().toISOString().split("T")[0],
        aiDate: data.aiDate,
        semenBull: data.semenBull || "AltaWheel USA Straw #894",
        technician: data.technician || "Ali Hassan",
        pdDate: data.pdDate,
        result: data.result || "Pending",
        expectedCalving: data.expectedCalving || "",
        servicesCount: data.servicesCount || 1,
        notes: data.notes || ""
      };
      setEvents(prev => [newLocalEvent, ...prev]);
      showToast(`Breeding record saved locally!`, "success");
    }
  };

  const handleExportCsv = () => {
    const headers = ["Event ID", "Animal", "Heat Date", "AI Date", "PD Date", "Expected Calving", "Result", "Semen / Bull", "Technician"];
    const rows = events.map((ev) => [
      ev.id, ev.animal, ev.heatDate, ev.aiDate || "—", ev.pdDate || "—", ev.expectedCalving || ev.calvingDate || "—", ev.result, ev.semenBull, ev.technician
    ]);
    exportToCsv("breeding_events", headers, rows);
    showToast("Breeding events exported to CSV", "success");
  };

  return (
    <div className="content" id="breeding-page">
      <PageTitle title="Breeding, Heat & AI Lifecycle" subtitle="Monitor estrus cycles, artificial inseminations, pregnancy diagnosis, and calving">
        <button
          className="secondary"
          id="btn-toggle-breeding-calendar"
          onClick={() => {
            setShowCalendar(!showCalendar);
            showToast(showCalendar ? "Standard view enabled" : "Calendar view enabled", "info");
          }}
        >
          <CalendarDays size={15}/> {showCalendar ? "List View" : "View Timeline"}
        </button>
        <button className="secondary" id="btn-export-breeding" onClick={handleExportCsv}>
          <Download size={15}/> Export CSV
        </button>
        <button className="primary" id="btn-add-breeding-event" onClick={() => setModalOpen(true)}>
          <Plus size={16}/> New Breeding Record
        </button>
      </PageTitle>

      <Card id="breeding-stepper-card">
        <div className="stepper">
          <div className="done">
            <span><Check size={14}/></span>
            <b>Heat Observed</b>
            <small>Day 0 (Standing Heat)</small>
          </div>
          <div className="done">
            <span><Check size={14}/></span>
            <b>AI Performed</b>
            <small>12h Post Estrus</small>
          </div>
          <div className="done">
            <span>3</span>
            <b>Pregnancy Diagnosis</b>
            <small>Day 35 (Ultrasound)</small>
          </div>
          <div>
            <span>4</span>
            <b>Expected Calving</b>
            <small>~280 Days Gestation</small>
          </div>
        </div>
      </Card>

      <Card id="breeding-events-table-card">
        <div className="section-head">
          <h3>Active Reproduction Events</h3>
          <span className="trend">{events.length} Records · Click Animal to View Profile</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Animal Code & Name</th>
                <th>Heat Observed</th>
                <th>AI Date</th>
                <th>Pregnancy Check (PD)</th>
                <th>Expected Calving</th>
                <th>Bull / Semen</th>
                <th>Technician</th>
                <th>PD Status</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => {
                const foundAnimal = animals.find(
                  (a) => ev.animal.includes(a.id) || (ev.animalId && a.id === ev.animalId) || ev.animal.includes(a.name)
                );

                return (
                  <tr key={ev.id}>
                    <td
                      className="blue-text"
                      style={{ cursor: onAnimal && foundAnimal ? "pointer" : "default" }}
                      onClick={() => {
                        if (foundAnimal && onAnimal) onAnimal(foundAnimal);
                      }}
                      title={foundAnimal ? `Open Profile for ${foundAnimal.id}` : undefined}
                    >
                      <b>{ev.animal}</b>
                    </td>
                    <td>{ev.heatDate}</td>
                    <td>{ev.aiDate || "—"}</td>
                    <td>{ev.pdDate || "Scheduled"}</td>
                    <td><b>{ev.expectedCalving || ev.calvingDate || "Calculating"}</b></td>
                    <td>{ev.semenBull}</td>
                    <td>{ev.technician}</td>
                    <td><StatusBadge status={ev.result}/></td>
                  </tr>
                );
              })}
              {events.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "28px", color: "var(--muted)" }}>
                    No reproduction events recorded. Click "New Breeding Record" above to schedule heat or insemination.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AddBreedingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        animals={animals}
        onSave={handleSaveBreeding}
      />
    </div>
  );
}

// 6. HEALTH COMPONENT
function Health({
  animals,
  onAnimal,
}: {
  animals: Animal[];
  onAnimal?: (a: Animal) => void;
}) {
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("All");
  const { showToast } = useToast();

  const fetchHealth = async () => {
    try {
      const data = await getHealthRecords();
      if (Array.isArray(data) && data.length > 0) {
        setHealthRecords(data);
      } else {
        setHealthRecords(initialHealthRecords);
      }
    } catch {
      setHealthRecords(initialHealthRecords);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleSaveHealth = async (data: Partial<HealthRecord>) => {
    try {
      await createHealthRecord(data);
      showToast(`Medical record for ${data.animal} logged!`, "success");
      fetchHealth();
    } catch {
      const newRec: HealthRecord = {
        id: `H-${Date.now()}`,
        date: data.date || new Date().toISOString().split("T")[0],
        animal: data.animal || "HF-027 (Bella)",
        animalId: data.animalId || "HF-027",
        problem: data.problem || "Clinical Observation",
        symptoms: data.symptoms || "",
        diagnosis: data.diagnosis || "Health Treatment",
        veterinarian: data.veterinarian || "Dr. Imran (DVM)",
        treatment: data.treatment || "Antibiotic & supportive therapy",
        medicine: data.medicine || "Intramast-DC",
        medicineId: data.medicineId || "",
        dose: data.dose || "1 tube",
        doseQty: data.doseQty || 1,
        duration: data.duration || "3 Days",
        cost: data.cost || 1200,
        status: data.status || "In Treatment",
        withdrawalDays: data.withdrawalDays || 0,
        withdrawalUntil: data.withdrawalUntil || "",
        remarks: data.remarks || ""
      };
      setHealthRecords(prev => [newRec, ...prev]);
      showToast(`Medical record saved!`, "success");
    }
  };

  const handleExportCsv = () => {
    const headers = ["Date", "Animal", "Diagnosis", "Medicine", "Dose", "Duration", "Veterinarian", "Status", "Withdrawal Days", "Withdrawal Until"];
    const rows = healthRecords.map((h) => [
      h.date, h.animal, h.diagnosis, h.medicine, h.dose, h.duration, h.veterinarian || (h as any).vet || "Dr. Imran", h.status, h.withdrawalDays, h.withdrawalUntil
    ]);
    exportToCsv("health_treatment_history", headers, rows);
    showToast("Health records exported to CSV", "success");
  };

  const filtered = useMemo(() => {
    if (filterType === "Vaccination") return healthRecords.filter(h => h.status === "Vaccination");
    if (filterType === "Treatment") return healthRecords.filter(h => h.status === "In Treatment");
    return healthRecords;
  }, [healthRecords, filterType]);

  return (
    <div className="content" id="health-page">
      <PageTitle title="Veterinary & Herd Health Records" subtitle="Track diagnosis, prescriptions, vaccination programs, and milk withdrawal compliance">
        <button
          className={filterType === "Vaccination" ? "secondary active" : "secondary"}
          id="btn-filter-vaccines"
          onClick={() => {
            const next = filterType === "Vaccination" ? "All" : "Vaccination";
            setFilterType(next);
            showToast(next === "Vaccination" ? "Showing vaccinations only" : "Showing all records", "info");
          }}
        >
          <Syringe size={15}/> {filterType === "Vaccination" ? "Show All Records" : "Vaccinations Only"}
        </button>
        <button className="secondary" id="btn-export-health" onClick={handleExportCsv}>
          <Download size={15}/> Export CSV
        </button>
        <button className="primary" id="btn-add-health-record" onClick={() => setModalOpen(true)}>
          <Plus size={16}/> Record Medical Treatment
        </button>
      </PageTitle>

      <Card id="health-withdrawal-warning-card">
        <PanelHead title="Active Milk Withdrawal Safety Restriction"/>
        <div className="withdrawal">
          <b>Intramast-DC (Intramammary)</b>
          <span>Animal: HF-027 Bella</span>
          <span>Prescribed: 14 May 2024</span>
          <span>Milk Safe to Sell From: <b>21 May 2024</b></span>
          <StatusBadge status="Sick"/>
        </div>
        <p className="warning-text">
          Critical Safety Rule: Milk from HF-027 must remain isolated and discarded until withdrawal completion on 21 May 2024.
        </p>
      </Card>

      <Card id="health-treatment-history-card">
        <div className="section-head">
          <h3>Medical Log & Treatment History</h3>
          <span className="trend">{filtered.length} Entries · Click Animal to View Profile</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Animal</th>
                <th>Diagnosis / Problem</th>
                <th>Medicine / Formulation</th>
                <th>Dosage</th>
                <th>Duration</th>
                <th>Veterinarian</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h) => {
                const foundAnimal = animals.find(
                  (a) => h.animal.includes(a.id) || h.animal.includes(a.name)
                );

                return (
                  <tr key={h.id}>
                    <td>{h.date}</td>
                    <td
                      className="blue-text"
                      style={{ cursor: onAnimal && foundAnimal ? "pointer" : "default" }}
                      onClick={() => {
                        if (foundAnimal && onAnimal) onAnimal(foundAnimal);
                      }}
                      title={foundAnimal ? `Open Profile for ${foundAnimal.id}` : undefined}
                    >
                      <b>{h.animal}</b>
                    </td>
                    <td>{h.diagnosis}</td>
                    <td>{h.medicine}</td>
                    <td>{h.dose}</td>
                    <td>{h.duration}</td>
                    <td>{h.veterinarian || (h as any).vet || "Dr. Imran (DVM)"}</td>
                    <td><StatusBadge status={h.status}/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <AddHealthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        animals={animals}
        onSave={handleSaveHealth}
      />
    </div>
  );
}

// 7. FEED & RATION COMPONENT
function Feed() {
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [rationModalOpen, setRationModalOpen] = useState(false);
  const [addFeedOpen, setAddFeedOpen] = useState(false);
  const [newFeedName, setNewFeedName] = useState("");
  const [newFeedCat, setNewFeedCat] = useState("Concentrate");
  const [newFeedPrice, setNewFeedPrice] = useState("120");
  const [newFeedStock, setNewFeedStock] = useState("1000");
  const { showToast } = useToast();

  const fetchFeeds = async () => {
    try {
      const data = await getFeeds();
      setFeeds(data);
    } catch (e: any) {
      showToast(`Error fetching feeds: ${e.message}`, "error");
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createFeed({
        name: newFeedName,
        category: newFeedCat,
        unit: "kg",
        unitPrice: Number(newFeedPrice) || 50,
        stock: Number(newFeedStock) || 500,
        minStock: 200,
        supplier: "Green Feed Suppliers",
      });
      showToast(`Feed item ${newFeedName} added!`, "success");
      setAddFeedOpen(false);
      setNewFeedName("");
      fetchFeeds();
    } catch (err: any) {
      showToast(`Error: ${err.message}`, "error");
    }
  };

  const handleExportCsv = () => {
    const headers = ["Feed ID", "Name", "Category", "Unit", "Unit Price (Rs)", "Current Stock", "Status", "Supplier"];
    const rows = feeds.map((f) => [
      f.id, f.name, f.category, f.unit, f.unitPrice, f.stock, f.status, f.supplier
    ]);
    exportToCsv("feed_inventory", headers, rows);
    showToast("Feed data exported to CSV", "success");
  };

  return (
    <div className="content" id="feed-page">
      <PageTitle title="Feed Master & Ration Formulation" subtitle="Manage ingredients, forage stock, nutritional group allocations, and feed cost/litre">
        <button className="secondary" id="btn-export-feeds" onClick={handleExportCsv}>
          <Download size={15}/> Export CSV
        </button>
        <button className="secondary" id="btn-open-ration-planner" onClick={() => setRationModalOpen(true)}>
          <Wheat size={15}/> Ration Planner & Costing
        </button>
        <button className="primary" id="btn-add-feed" onClick={() => setAddFeedOpen(true)}>
          <Plus size={16}/> Add Feed Item
        </button>
      </PageTitle>

      <div className="stats-grid">
        <Stat label="Feed Cost / Cow / Day" value="Rs 412" icon={Wheat} tone="green"/>
        <Stat label="Feed Cost / Litre Milk" value="Rs 17.1" icon={CircleDollarSign} tone="gold"/>
        <Stat label="Today's Total Consumption" value="1,842 kg" icon={Activity} tone="blue"/>
        <Stat label="Low Stock Warnings" value="1 Item" icon={AlertCircle} tone="red"/>
      </div>

      <Card id="feed-master-card">
        <PanelHead title="Feed Inventory Master"/>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Feed Ingredient</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Price / Unit</th>
                <th>Available Stock</th>
                <th>Supplier</th>
                <th>Stock Status</th>
              </tr>
            </thead>
            <tbody>
              {feeds.map((f) => (
                <tr key={f.id}>
                  <td className="blue-text"><b>{f.name}</b></td>
                  <td>{f.category}</td>
                  <td>{f.unit}</td>
                  <td>Rs {f.unitPrice} / {f.unit}</td>
                  <td><b>{f.stock.toLocaleString()} {f.unit}</b></td>
                  <td>{f.supplier}</td>
                  <td><StatusBadge status={f.status}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card id="group-rations-card">
        <PanelHead title="Standardized Herd Group Rations" action="Formulate Custom Ration" onAction={() => setRationModalOpen(true)}/>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Herd Group</th>
                <th>Animals</th>
                <th>Daily Formulation Ration</th>
                <th>Feed Cost / Head / Day</th>
                <th>Last Adjusted</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>High Producing Group</td><td>42</td><td>25kg Silage + 6kg Wanda + 0.25kg Minerals</td><td><b>Rs 486</b></td><td>14 May 2024</td></tr>
              <tr><td>Medium Producing Group</td><td>40</td><td>20kg Silage + 4.5kg Wanda + 3kg Hay</td><td><b>Rs 412</b></td><td>14 May 2024</td></tr>
              <tr><td>Dry Cows</td><td>18</td><td>15kg Hay + 10kg Silage + Minerals</td><td><b>Rs 278</b></td><td>13 May 2024</td></tr>
              <tr><td>Heifers</td><td>26</td><td>12kg Hay + 2.5kg Concentrate</td><td><b>Rs 235</b></td><td>13 May 2024</td></tr>
              <tr><td>Calves</td><td>24</td><td>4L Whole Milk + Starter Pellets + Hay</td><td><b>Rs 198</b></td><td>12 May 2024</td></tr>
            </tbody>
          </table>
        </div>
      </Card>

      <RationPlannerModal
        isOpen={rationModalOpen}
        onClose={() => setRationModalOpen(false)}
      />

      {addFeedOpen && (
        <div className="modal-backdrop" onClick={() => setAddFeedOpen(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Add Feed Item</h3>
                <p>Register new concentrate, forage, or mineral supplement</p>
              </div>
              <button className="modal-close" onClick={() => setAddFeedOpen(false)}>
                <X size={18}/>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddFeed}>
                <div className="form-grid">
                  <label className="input-group">
                    <span>Feed Name *</span>
                    <input value={newFeedName} onChange={(e) => setNewFeedName(e.target.value)} placeholder="e.g. Cottonseed Cake" required />
                  </label>
                  <label className="input-group">
                    <span>Category *</span>
                    <select value={newFeedCat} onChange={(e) => setNewFeedCat(e.target.value)}>
                      <option value="Concentrate">Concentrate</option>
                      <option value="Forage">Forage / Silage</option>
                      <option value="Supplements">Supplements & Minerals</option>
                      <option value="Additives">Additives / Probiotics</option>
                    </select>
                  </label>
                  <label className="input-group">
                    <span>Price per Unit (Rs) *</span>
                    <input type="number" value={newFeedPrice} onChange={(e) => setNewFeedPrice(e.target.value)} required />
                  </label>
                  <label className="input-group">
                    <span>Initial Stock (kg) *</span>
                    <input type="number" value={newFeedStock} onChange={(e) => setNewFeedStock(e.target.value)} required />
                  </label>
                </div>
                <div className="form-actions">
                  <button type="button" className="secondary" onClick={() => setAddFeedOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="primary">
                    <Plus size={16}/> Save Feed Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 8. INVENTORY COMPONENT
function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { showToast } = useToast();

  const fetchInventory = async () => {
    try {
      const data = await getInventory();
      setItems(data);
    } catch (e: any) {
      showToast(`Error fetching inventory: ${e.message}`, "error");
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handlePurchase = async (data: any) => {
    try {
      await purchaseInventoryStock(data);
      showToast(`Purchased ${data.quantity} ${data.unit} of ${data.name}!`, "success");
      fetchInventory();
    } catch (e: any) {
      showToast(`Error: ${e.message}`, "error");
    }
  };

  const handleExportCsv = () => {
    const headers = ["Item ID", "Item Name", "Category", "Stock", "Unit", "Minimum Stock", "Unit Price (Rs)", "Supplier", "Status"];
    const rows = items.map((i) => [
      i.id, i.name, i.category, i.stock, i.unit, i.minStock, i.unitPrice, i.supplier, i.status
    ]);
    exportToCsv("inventory_stock", headers, rows);
    showToast("Inventory exported to CSV", "success");
  };

  const filtered = useMemo(() => {
    return items.filter((i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase()) ||
      i.supplier.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  return (
    <div className="content" id="inventory-page">
      <PageTitle title="Stock & Consumables Inventory" subtitle="Medicines, vaccines, veterinary consumables, forage reserves, and farm supplies">
        <button className="secondary" id="btn-export-inventory" onClick={handleExportCsv}>
          <Download size={15}/> Export CSV
        </button>
        <button className="primary" id="btn-purchase-stock" onClick={() => setPurchaseOpen(true)}>
          <Plus size={16}/> Purchase Stock
        </button>
      </PageTitle>

      <div className="stats-grid">
        <Stat label="Total Stock Valuation" value="Rs 4.82M" icon={Boxes}/>
        <Stat label="Unique Inventory Lines" value={String(items.length)} icon={Boxes} tone="purple"/>
        <Stat label="Low Stock Items" value="1 Item" icon={AlertCircle} tone="red"/>
        <Stat label="Expiring Soon (< 6 Mo)" value="2 Items" icon={CalendarDays} tone="gold"/>
      </div>

      <Card id="inventory-table-card">
        <div className="toolbar">
          <div className="search">
            <Search size={16}/>
            <input
              placeholder="Search medicines, vaccines, or feeds..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Min Threshold</th>
                <th>Unit Price (Rs)</th>
                <th>Supplier / Vendor</th>
                <th>Stock Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td className="blue-text"><b>{item.name}</b></td>
                  <td>{item.category}</td>
                  <td><b>{item.stock} {item.unit}</b></td>
                  <td>{item.minStock} {item.unit}</td>
                  <td>Rs {item.unitPrice}</td>
                  <td>{item.supplier}</td>
                  <td><StatusBadge status={item.status}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <PurchaseStockModal
        isOpen={purchaseOpen}
        onClose={() => setPurchaseOpen(false)}
        onSave={handlePurchase}
      />
    </div>
  );
}

// 9. FINANCE COMPONENT
function Finance() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const { showToast } = useToast();

  const fetchFinance = async () => {
    try {
      const data = await getFinance();
      setTransactions(data);
    } catch (e: any) {
      showToast(`Error loading finance: ${e.message}`, "error");
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const handleAddTx = async (tx: Partial<FinancialTransaction>) => {
    try {
      await createTransaction(tx);
      showToast(`Transaction of Rs ${tx.amount?.toLocaleString()} saved!`, "success");
      fetchFinance();
    } catch (e: any) {
      showToast(`Error: ${e.message}`, "error");
    }
  };

  const handleExportCsv = () => {
    const headers = ["TX ID", "Type", "Category", "Amount (Rs)", "Date", "Description", "Entity / Vendor", "Payment Method"];
    const rows = transactions.map((t) => [
      t.id, t.type, t.category, t.amount, t.date, t.description, t.entityName, t.paymentMethod
    ]);
    exportToCsv("farm_financial_ledger", headers, rows);
    showToast("Financial ledger exported to CSV", "success");
  };

  const totalIncome = transactions.filter(t => t.type === "Income").reduce((a, b) => a + b.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "Expense").reduce((a, b) => a + b.amount, 0);
  const profit = totalIncome - totalExpense;

  return (
    <div className="content" id="finance-page">
      <PageTitle title="Farm Financial Accounts & Cash Flow" subtitle="Milk sales revenue, livestock transactions, feed & vet expenses, and profit margins">
        <button className="secondary" id="btn-export-finance" onClick={handleExportCsv}>
          <Download size={15}/> Export CSV
        </button>
        <button className="primary" id="btn-add-transaction" onClick={() => setModalOpen(true)}>
          <Plus size={16}/> Record Transaction
        </button>
      </PageTitle>

      <div className="stats-grid">
        <Stat label="Total Gross Income" value={`Rs ${totalIncome.toLocaleString()}`} icon={Wallet} tone="green"/>
        <Stat label="Total Expenses" value={`Rs ${totalExpense.toLocaleString()}`} icon={CreditCard} tone="red"/>
        <Stat label="Net Farm Profit" value={`Rs ${profit.toLocaleString()}`} icon={CircleDollarSign} tone="blue"/>
        <Stat label="Estimated Milk Sales / Mo" value="Rs 3.98M" icon={BarChart3} tone="purple"/>
      </div>

      <div className="two-grid">
        <Card id="income-ledger-card">
          <PanelHead title="Income Vouchers"/>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Customer / Description</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {transactions.filter(t => t.type === "Income").map(t => (
                  <tr key={t.id}>
                    <td><b>{t.category}</b></td>
                    <td style={{ color: "#167a4b", fontWeight: 800 }}>+Rs {t.amount.toLocaleString()}</td>
                    <td><small>{t.description || t.entityName}</small></td>
                    <td>{t.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card id="expense-ledger-card">
          <PanelHead title="Expense Vouchers"/>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Payee / Description</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {transactions.filter(t => t.type === "Expense").map(t => (
                  <tr key={t.id}>
                    <td><b>{t.category}</b></td>
                    <td style={{ color: "#c84545", fontWeight: 800 }}>-Rs {t.amount.toLocaleString()}</td>
                    <td><small>{t.description || t.entityName}</small></td>
                    <td>{t.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card id="profitability-kpi-card">
        <PanelHead title="Unit Economics & Farm Cost Breakdown"/>
        <div className="profit-grid">
          <div>
            <span>Gross Revenue</span>
            <b>Rs {totalIncome.toLocaleString()}</b>
          </div>
          <div>
            <span>Operating Cost</span>
            <b>Rs {totalExpense.toLocaleString()}</b>
          </div>
          <div>
            <span>Net Operating Margin</span>
            <b>{totalIncome > 0 ? `${((profit / totalIncome) * 100).toFixed(1)}%` : "0%"}</b>
          </div>
          <div>
            <span>Total Cost / Litre</span>
            <b>Rs 93.3 / L</b>
          </div>
          <div>
            <span>Feed Cost / Litre</span>
            <b>Rs 17.1 / L</b>
          </div>
          <div>
            <span>Net Profit / Cow / Day</span>
            <b>Rs 458</b>
          </div>
        </div>
      </Card>

      <AddTransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddTx}
      />
    </div>
  );
}

// 10. REPORTS COMPONENT
function Reports() {
  const [selectedReport, setSelectedReport] = useState("Milk Report");
  const [startDate, setStartDate] = useState("2024-05-01");
  const [endDate, setEndDate] = useState("2024-05-14");
  const { showToast } = useToast();

  const reportList = [
    "Milk Report", "Daily Production Report", "Weekly Report", "Monthly Farm Summary",
    "Animal Herd Register", "Breeding & AI Report", "Health & Treatment Report",
    "Feed Consumption Report", "Financial P&L Report", "Pregnancy & Calving Report"
  ];

  const handleGenerate = () => {
    showToast(`Generated updated analytics for ${selectedReport}!`, "success");
  };

  const handleExportCsv = () => {
    const headers = ["Date", "Total Milk (L)", "Avg / Cow (L)", "Fat %", "SNF %", "Revenue (Rs)"];
    const rows = [
      ["14 May 2024", "1,980.5", "24.1", "3.80", "8.90", "297,075"],
      ["13 May 2024", "1,915.0", "23.4", "3.75", "8.85", "287,250"],
      ["12 May 2024", "1,900.0", "23.0", "3.92", "8.90", "285,500"],
      ["11 May 2024", "1,875.0", "22.9", "3.77", "8.80", "281,250"],
    ];
    exportToCsv(`${selectedReport.toLowerCase().replace(/ /g, "_")}`, headers, rows);
    showToast(`Exported ${selectedReport} to CSV!`, "success");
  };

  return (
    <div className="content" id="reports-page">
      <PageTitle title="Farm Analytical Reports & Intelligence" subtitle="Generate production, reproduction, health, and financial audits">
        <button className="secondary" id="btn-export-reports" onClick={handleExportCsv}>
          <Download size={15}/> Export CSV
        </button>
        <button className="primary" id="btn-generate-report-top" onClick={handleGenerate}>
          <FileText size={16}/> Generate Report
        </button>
      </PageTitle>

      <Card id="report-controls-card">
        <div className="report-controls">
          <label className="input-group">
            <span>Report Category</span>
            <select value={selectedReport} onChange={(e) => setSelectedReport(e.target.value)}>
              {reportList.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
          <label className="input-group">
            <span>Date Range Filter</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </label>
          <button className="primary" onClick={handleGenerate}>
            Apply Parameters
          </button>
        </div>
      </Card>

      <div className="report-layout">
        <Card id="report-menu-card">
          <div className="report-menu">
            {reportList.map((r) => (
              <button
                key={r}
                className={selectedReport === r ? "active" : ""}
                onClick={() => {
                  setSelectedReport(r);
                  showToast(`Switched report view to ${r}`, "info");
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </Card>

        <Card id="report-dataset-card">
          <PanelHead title={`${selectedReport} (${startDate} → ${endDate})`}/>
          <div className="stats-grid report-stats">
            <Stat label="Total Milk Produced" value="26,540 L" icon={Droplets}/>
            <Stat label="Average Yield / Cow" value="24.3 L" icon={CircleDot} tone="gold"/>
            <Stat label="Gross Milk Revenue" value="Rs 3,981,000" icon={Wallet} tone="green"/>
            <Stat label="Average Fat %" value="3.78 %" icon={Activity} tone="purple"/>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Total Milk (L)</th>
                  <th>Avg / Cow (L)</th>
                  <th>Fat %</th>
                  <th>SNF %</th>
                  <th>Gross Revenue (Rs)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>14 May 2024</td><td>1,980.5</td><td>24.1</td><td>3.80</td><td>8.90</td><td><b>Rs 297,075</b></td></tr>
                <tr><td>13 May 2024</td><td>1,915.0</td><td>23.4</td><td>3.75</td><td>8.85</td><td><b>Rs 287,250</b></td></tr>
                <tr><td>12 May 2024</td><td>1,900.0</td><td>23.0</td><td>3.92</td><td>8.90</td><td><b>Rs 285,500</b></td></tr>
                <tr><td>11 May 2024</td><td>1,875.0</td><td>22.9</td><td>3.77</td><td>8.80</td><td><b>Rs 281,250</b></td></tr>
                <tr><td>10 May 2024</td><td>1,890.0</td><td>23.1</td><td>3.82</td><td>8.88</td><td><b>Rs 283,500</b></td></tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

// 11. TASKS COMPONENT
function Tasks() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const { showToast } = useToast();

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (e: any) {
      showToast(`Error loading tasks: ${e.message}`, "error");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (task: Partial<TaskItem>) => {
    try {
      await createTask(task);
      showToast(`Task "${task.title}" scheduled!`, "success");
      fetchTasks();
    } catch (e: any) {
      showToast(`Error creating task: ${e.message}`, "error");
    }
  };

  const handleToggleTaskStatus = async (task: TaskItem) => {
    const nextStatus = task.status === "Completed" ? "Pending" : "Completed";
    try {
      await updateTask(task.id, { status: nextStatus });
      showToast(`Task marked as ${nextStatus}!`, "success");
      fetchTasks();
    } catch (e: any) {
      showToast(`Error updating task: ${e.message}`, "error");
    }
  };

  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteTask(id);
      showToast("Task removed.", "info");
      fetchTasks();
    } catch (e: any) {
      showToast(`Error: ${e.message}`, "error");
    }
  };

  const filtered = useMemo(() => {
    if (filter === "High") return tasks.filter(t => t.priority === "High");
    if (filter === "Completed") return tasks.filter(t => t.status === "Completed");
    if (filter === "Pending") return tasks.filter(t => t.status !== "Completed");
    return tasks;
  }, [tasks, filter]);

  return (
    <div className="content" id="tasks-page">
      <PageTitle title="Farm Tasks, Reminders & Veterinary Schedule" subtitle="Organize daily activities, treatments, pregnancy checks, and staff duties">
        <button className="primary" id="btn-add-task" onClick={() => setModalOpen(true)}>
          <Plus size={16}/> Schedule Task
        </button>
      </PageTitle>

      <div className="stats-grid">
        <Stat label="Total Scheduled Duties" value={String(tasks.length)} icon={ClipboardList}/>
        <Stat label="Pending Execution" value={String(tasks.filter(t => t.status !== "Completed").length)} icon={ListChecks} tone="gold"/>
        <Stat label="Completed Tasks" value={String(tasks.filter(t => t.status === "Completed").length)} icon={CheckCircle2} tone="green"/>
        <Stat label="High Priority Attention" value={String(tasks.filter(t => t.priority === "High" && t.status !== "Completed").length)} icon={Flame} tone="red"/>
      </div>

      <Card id="tasks-table-card">
        <div className="toolbar">
          <div className="filter-row">
            {["All", "Pending", "High", "Completed"].map((f) => (
              <button
                key={f}
                className={filter === f ? "chip active" : "chip"}
                onClick={() => setFilter(f)}
              >
                {f} ({
                  f === "All" ? tasks.length :
                  f === "Pending" ? tasks.filter(t => t.status !== "Completed").length :
                  f === "High" ? tasks.filter(t => t.priority === "High").length :
                  tasks.filter(t => t.status === "Completed").length
                })
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: "40px" }}>Done</th>
                <th>Task Title</th>
                <th>Target Animal / Shed</th>
                <th>Due Date</th>
                <th>Priority</th>
                <th>Assigned Staff</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} onClick={() => handleToggleTaskStatus(t)} style={{ cursor: "pointer" }}>
                  <td>
                    <input
                      type="checkbox"
                      checked={t.status === "Completed"}
                      onChange={() => {}}
                      style={{ cursor: "pointer" }}
                    />
                  </td>
                  <td className="blue-text" style={{ textDecoration: t.status === "Completed" ? "line-through" : "none" }}>
                    <b>{t.title}</b>
                  </td>
                  <td>{t.target}</td>
                  <td>{t.dueDate}</td>
                  <td>
                    <span className={`status ${t.priority === "High" ? "sick" : t.priority === "Medium" ? "pending" : "available"}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td>{t.assignedTo}</td>
                  <td><StatusBadge status={t.status}/></td>
                  <td>
                    <button className="icon-action-btn" onClick={(e) => handleDeleteTask(t.id, e)} title="Delete Task">
                      <Trash2 size={13}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AddTaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreateTask}
      />
    </div>
  );
}

// 12. SETTINGS COMPONENT
function SettingsPage() {
  const [farmName, setFarmName] = useState("Green Dairy Farm");
  const [companyName, setCompanyName] = useState("Green Dairy Pvt. Ltd.");
  const [currency, setCurrency] = useState("PKR");
  const [currencySymbol, setCurrencySymbol] = useState("Rs");
  const [timezone, setTimezone] = useState("Asia/Karachi");
  const [defaultMilkUnit, setDefaultMilkUnit] = useState("Liter (L)");
  const [milkPrice, setMilkPrice] = useState("150");
  const [managerName, setManagerName] = useState("Muhammad Ali");
  const [email, setEmail] = useState("admin@dairyfarm.local");

  const [toggles, setToggles] = useState([
    { name: "Role-Based Access Control", enabled: true },
    { name: "Automatic REST API Synchronization", enabled: true },
    { name: "Milk Withdrawal Safety Flagging", enabled: true },
    { name: "Pregnancy Ultrasound Reminders", enabled: true },
    { name: "Automated Daily Database Backups", enabled: true },
    { name: "Duplicate Ear Tag Validation", enabled: true },
  ]);

  const { showToast } = useToast();

  useEffect(() => {
    getSettings().then((s) => {
      if (s) {
        if (s.farmName) setFarmName(s.farmName);
        if (s.companyName) setCompanyName(s.companyName);
        if (s.currency) setCurrency(s.currency);
        if (s.currencySymbol) setCurrencySymbol(s.currencySymbol);
        if (s.timezone) setTimezone(s.timezone);
        if (s.defaultMilkUnit) setDefaultMilkUnit(s.defaultMilkUnit);
        if (s.milkPricePerLitre) setMilkPrice(String(s.milkPricePerLitre));
        if (s.managerName) setManagerName(s.managerName);
        if (s.email) setEmail(s.email);
      }
    }).catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveSettings({
        farmName,
        companyName,
        currency,
        currencySymbol,
        timezone,
        defaultMilkUnit,
        milkPricePerLitre: Number(milkPrice) || 150,
        managerName,
        email,
      });
      showToast("Farm configuration saved successfully!", "success");
    } catch (err: any) {
      showToast(`Failed to save settings: ${err.message}`, "error");
    }
  };

  const toggleSwitch = (idx: number) => {
    const updated = [...toggles];
    updated[idx].enabled = !updated[idx].enabled;
    setToggles(updated);
    showToast(`${updated[idx].name} set to ${updated[idx].enabled ? "Enabled" : "Disabled"}`, "info");
  };

  return (
    <div className="content" id="settings-page">
      <PageTitle title="System Configuration & Farm Master Settings" subtitle="Configure organization parameters, pricing, access roles, and data security">
        <button className="primary" id="btn-save-settings" onClick={handleSave}>
          <CheckCircle2 size={16}/> Save Settings
        </button>
      </PageTitle>

      <div className="two-grid">
        <Card id="settings-general-card">
          <PanelHead title="Farm Profile"/>
          <form onSubmit={handleSave}>
            <div className="form-grid">
              <label className="input-group">
                <span>Farm Name</span>
                <input value={farmName} onChange={(e) => setFarmName(e.target.value)} required />
              </label>
              <label className="input-group">
                <span>Registered Enterprise</span>
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </label>
              <label className="input-group">
                <span>Currency Code</span>
                <input value={currency} onChange={(e) => setCurrency(e.target.value)} />
              </label>
              <label className="input-group">
                <span>Currency Symbol</span>
                <input value={currencySymbol} onChange={(e) => setCurrencySymbol(e.target.value)} />
              </label>
              <label className="input-group">
                <span>Default Base Milk Price / L</span>
                <input type="number" value={milkPrice} onChange={(e) => setMilkPrice(e.target.value)} />
              </label>
              <label className="input-group">
                <span>Farm Manager</span>
                <input value={managerName} onChange={(e) => setManagerName(e.target.value)} />
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="primary">
                Save Profile
              </button>
            </div>
          </form>
        </Card>

        <Card id="settings-rbac-card">
          <PanelHead title="User Roles & Access Permissions Matrix"/>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Staff</th>
                  <th>View</th>
                  <th>Create</th>
                  <th>Edit</th>
                  <th>Delete</th>
                  <th>Export</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><b>Owner</b></td><td>1</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr>
                <tr><td><b>Farm Manager</b></td><td>2</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr>
                <tr><td><b>Veterinarian</b></td><td>1</td><td>✓</td><td>✓</td><td>✓</td><td>—</td><td>✓</td></tr>
                <tr><td><b>Feed Manager</b></td><td>1</td><td>✓</td><td>✓</td><td>✓</td><td>—</td><td>✓</td></tr>
                <tr><td><b>Herdsman / Worker</b></td><td>4</td><td>✓</td><td>✓</td><td>—</td><td>—</td><td>—</td></tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card id="settings-security-card">
        <PanelHead title="System Flags & Data Compliance Toggles"/>
        <div className="settings-list">
          {toggles.map((item, i) => (
            <div key={item.name} onClick={() => toggleSwitch(i)} title="Click to toggle feature">
              <CheckCircle2 size={17} style={{ color: item.enabled ? "#178a55" : "#888" }}/>
              <span>{item.name}</span>
              <StatusBadge status={item.enabled ? "Active" : "Dry"}/>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <App/>
    </ToastProvider>
  </React.StrictMode>
);
