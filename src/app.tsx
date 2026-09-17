import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Dashboard from './Dashboard';

/* ─── Icons ─── */
function PigIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="36" rx="20" ry="17" fill="#f9a8d4" />
      <ellipse cx="22" cy="24" rx="8" ry="9" fill="#f9a8d4" />
      <ellipse cx="42" cy="24" rx="8" ry="9" fill="#f9a8d4" />
      <ellipse cx="22" cy="22" rx="5" ry="6" fill="#fbb6ce" />
      <ellipse cx="42" cy="22" rx="5" ry="6" fill="#fbb6ce" />
      <ellipse cx="32" cy="37" rx="14" ry="12" fill="#fbb6ce" />
      <ellipse cx="27" cy="38" rx="4" ry="3" fill="#f472b6" opacity="0.5" />
      <ellipse cx="30" cy="40" rx="3" ry="2" fill="#be185d" opacity="0.3" />
      <ellipse cx="34" cy="40" rx="3" ry="2" fill="#be185d" opacity="0.3" />
      <circle cx="28" cy="32" r="3" fill="#1a1a2e" />
      <circle cx="36" cy="32" r="3" fill="#1a1a2e" />
      <circle cx="29" cy="31" r="1" fill="white" />
      <circle cx="37" cy="31" r="1" fill="white" />
      <path d="M48 30 Q54 26 56 20 Q52 22 48 24" fill="#fbb6ce" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/* ─── Static Data ─── */
const gestationSteps = [
  { day: "Day 0", label: "Breeding", icon: "🐷", color: "#f9a8d4", desc: "Sow insemination & record entry" },
  { day: "Day 3", label: "Iron Shot", icon: "💉", color: "#93c5fd", desc: "Iron dextran injection for piglets" },
  { day: "Day 10", label: "Vitamins", icon: "💊", color: "#86efac", desc: "Vitamin E & selenium supplement" },
  { day: "Day 90", label: "Feed Switch", icon: "🌾", color: "#fcd34d", desc: "Switch to gestation ration feed" },
  { day: "Day 114", label: "Farrowing", icon: "🍼", color: "#c4b5fd", desc: "Move sow to farrowing crate" },
  { day: "Day 150", label: "Weaning", icon: "🐾", color: "#6ee7b7", desc: "Wean piglets; flush sow cycle" },
];

/* ─── Helper Functions ─── */
function checkIsOpen(hoursStr?: string): boolean {
  if (!hoursStr) return true;
  try {
    const parts = hoursStr.split("-").map((s) => s.trim());
    if (parts.length !== 2) return true;

    const parseTimeString = (timeStr: string) => {
      const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (!match) return null;
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const period = match[3].toUpperCase();

      if (period === "PM" && hours < 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const openMinutes = parseTimeString(parts[0]);
    const closeMinutes = parseTimeString(parts[1]);

    if (openMinutes === null || closeMinutes === null) return true;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  } catch {
    return true;
  }
}

/* ─── Components ─── */
function ThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="btn-neu flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all select-none"
      style={{ color: "var(--fg-strong)", fontFamily: "var(--font-display)" }}
      aria-label="Toggle theme"
    >
      <span style={{ color: dark ? "#94a3b8" : "#f59e0b" }}>
        {dark ? <MoonIcon /> : <SunIcon />}
      </span>
      <span>{dark ? "Dark" : "Light"}</span>
    </button>
  );
}

function Navbar({ dark, onToggle, onOpenAuth, user, onLogout }: { dark: boolean; onToggle: () => void; onOpenAuth: () => void; user: any; onLogout: () => void }) {
  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-8 py-4"
      style={{
        background: "var(--bg)",
        boxShadow: "0 4px 20px var(--shadow-dark), 0 -1px 0 var(--shadow-light)",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="neu-raised-sm flex items-center justify-center" style={{ width: 48, height: 48, borderRadius: 12 }}>
          <PigIcon size={32} />
        </div>
        <div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.3rem", color: "var(--fg-strong)", letterSpacing: "-0.02em" }}>
            Pig<span style={{ color: "var(--accent)" }}>Tracker</span>
          </span>
          <div style={{ fontSize: "0.65rem", color: "var(--fg-muted)", fontWeight: 500, letterSpacing: "0.08em" }}>
            SMART PIGGERY SYSTEM
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-1" style={{ fontFamily: "var(--font-display)" }}>
        {["Dashboard", "Sow Records", "Schedule", "Feed Store"].map((item) => (
          <a
            key={item}
            href="#"
            className="px-4 py-2 text-sm transition-all hover:neu-raised-sm"
            style={{ color: "var(--fg-muted)", fontWeight: 600, borderRadius: 10, textDecoration: "none" }}
          >
            {item}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle dark={dark} onToggle={onToggle} />
        {user ? (
          <button onClick={onLogout} className="btn-accent px-5 py-2 text-sm" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
            Log Out
          </button>
        ) : (
          <button onClick={onOpenAuth} className="btn-accent px-5 py-2 text-sm" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
            Log In / Sign Up
          </button>
        )}
      </div>
    </nav>
  );
}

function HeroSection() {
  const [searchVal, setSearchVal] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchVal.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("sows")
      .select("*")
      .eq("tag_id", searchVal.trim())
      .single();

    if (error || !data) {
      setSearchResult("NOT_FOUND");
    } else {
      setSearchResult(data);
    }
    setLoading(false);
  };

  return (
    <section className="px-8 pt-16 pb-20">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center", maxWidth: 1100, margin: "0 auto" }}>
        <div>
          <div className="neu-raised-sm inline-flex items-center gap-2 px-4 py-2 mb-6" style={{ borderRadius: 50 }}>
            <span style={{ fontSize: "1rem" }}>🐷</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.7rem", fontWeight: 800, color: "var(--accent)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Neumorphic Farm System
            </span>
          </div>

          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(2rem, 3.5vw, 3rem)", color: "var(--fg-strong)", lineHeight: 1.2, letterSpacing: "-0.03em", marginBottom: "1.25rem" }}>
            Make your Piggery <span style={{ color: "var(--accent)" }}>Smart</span> & Friendly
          </h1>

          <p style={{ fontFamily: "var(--font-body)", fontSize: "1rem", color: "var(--fg-muted)", lineHeight: 1.7, marginBottom: "2rem", maxWidth: 440 }}>
            Track gestation cycles, manage sow records, and connect with local feed stores — all from one clean, tactile interface built for modern pig farmers.
          </p>

          <div className="neu-inset flex items-center gap-3 px-4 py-1" style={{ borderRadius: 14 }}>
            <span style={{ color: "var(--fg-muted)" }}><SearchIcon /></span>
            <input
              type="text"
              placeholder="Search Sow Tag ID, eg. SOW-2024-077..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "var(--font-body)", fontSize: "0.9rem", fontWeight: 500, color: "var(--fg-strong)", padding: "12px 0" }}
            />
            <button onClick={handleSearch} disabled={loading} className="btn-accent px-5 py-2.5 text-sm">
              {loading ? "..." : "Search"}
            </button>
          </div>

          {searchResult === "NOT_FOUND" && (
            <div className="mt-4 p-3 rounded-lg bg-red-100 text-red-600 text-sm font-semibold">
              No sow record found matching "{searchVal}".
            </div>
          )}

          {searchResult && searchResult !== "NOT_FOUND" && (
            <div className="neu-raised mt-4 p-4 rounded-xl">
              <span className="text-xs font-bold text-pink-500 uppercase">Search Result</span>
              <h4 className="font-bold text-lg">{searchResult.tag_id}</h4>
              <p className="text-xs text-gray-500">Status: {searchResult.status}</p>
              <p className="text-xs text-gray-500">Breeding Date: {searchResult.breeding_date}</p>
              <p className="text-xs text-gray-500">Expected Farrowing: {searchResult.expected_farrowing}</p>
            </div>
          )}

          <div className="flex gap-6 mt-8">
            {[{ val: "2,400+", label: "Sows Tracked" }, { val: "98%", label: "Cycle Accuracy" }, { val: "140+", label: "Feed Stores" }].map(({ val, label }) => (
              <div key={label} className="flex flex-col">
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.5rem", color: "var(--fg-strong)" }}>{val}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--fg-muted)", fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <div className="neu-raised w-full" style={{ maxWidth: 420, padding: "2rem", borderRadius: 24 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.85rem", color: "var(--fg-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
              Live Overview
            </div>
            {[{ sow: "SOW-2024-012", status: "Day 77 Gestation", pct: 68, color: "#f9a8d4" }, { sow: "SOW-2024-031", status: "Day 114 — Farrow Today", pct: 100, color: "#10b981" }, { sow: "SOW-2024-058", status: "Day 3 — Iron Due", pct: 3, color: "#93c5fd" }].map(({ sow, status, pct, color }) => (
              <div key={sow} className="mb-4 last:mb-0">
                <div className="flex justify-between mb-1.5">
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.85rem", color: "var(--fg-strong)" }}>{sow}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--fg-muted)" }}>{status}</span>
                </div>
                <div className="neu-inset overflow-hidden" style={{ height: 10, borderRadius: 50 }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 50, transition: "width 0.6s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function GestationSchedule() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <section className="px-8 py-16" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div className="mb-10">
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.7rem", color: "var(--accent)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Gestation Timeline</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)", color: "var(--fg-strong)" }}>114-Day Gestation Schedule</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "1rem" }}>
        {gestationSteps.map((step, i) => (
          <button
            key={step.day}
            onClick={() => setActiveStep(activeStep === i ? null : i)}
            style={{ background: "var(--bg)", boxShadow: activeStep === i ? "var(--pressed-shadow)" : "var(--raised-shadow-sm)", borderRadius: 18, padding: "1.25rem 0.75rem", border: "none" }}
          >
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: step.color, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>{step.icon}</div>
            <div style={{ fontWeight: 800, fontSize: "0.7rem", color: "var(--accent)", marginTop: 8 }}>{step.day}</div>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--fg-strong)" }}>{step.label}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

function FeedStoreDirectory() {
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStores() {
      const { data } = await supabase.from("feed_stores").select("*");
      if (data && data.length > 0) setStores(data);
    }
    fetchStores();
  }, []);

  return (
    <section className="px-8 py-16" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)", color: "var(--fg-strong)" }}>Nearby Feed Stores</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.75rem", marginTop: "1rem" }}>
        {stores.map((store) => {
          const isOpen = checkIsOpen(store.hours);
          return (
            <div key={store.id || store.name} className="neu-raised relative" style={{ padding: "1.75rem", borderRadius: 22 }}>
              <div className="flex items-center justify-between mb-2">
                <h3 style={{ fontWeight: 800, fontSize: "1rem" }}>{store.name}</h3>
                <span className={`px-2 py-0.5 text-xs rounded-full font-extrabold ${isOpen ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"}`}>
                  {isOpen ? "• Open Now" : "• Closed"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{store.address}</p>
              <p className="text-xs text-gray-500">{store.phone}</p>
              <p className="text-xs text-pink-500 font-semibold mt-2">Hours: {store.hours || "8:00 AM - 5:00 PM"}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SellerDashboard({ user }: { user: any }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [hours, setHours] = useState("8:00 AM - 5:00 PM");

  const saveStore = async () => {
    const { error } = await supabase.from("feed_stores").insert([{
      owner_id: user.id,
      name,
      address,
      phone,
      hours
    }]);

    if (!error) {
      alert("Store listed successfully!");
      setName("");
      setAddress("");
      setPhone("");
    } else {
      alert(`Error saving store: ${error.message}`);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Store Seller Portal</h2>
      <div className="neu-raised p-6 rounded-2xl">
        <h3 className="font-bold mb-3">Register Feed Store Listing</h3>
        <input className="neu-inset p-2 rounded w-full mb-3" placeholder="Store Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="neu-inset p-2 rounded w-full mb-3" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
        <input className="neu-inset p-2 rounded w-full mb-3" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input className="neu-inset p-2 rounded w-full mb-3" placeholder="Store Hours (e.g. 8:00 AM - 5:00 PM)" value={hours} onChange={(e) => setHours(e.target.value)} />
        <button onClick={saveStore} className="btn-accent px-4 py-2 rounded w-full">Save Store</button>
      </div>
    </div>
  );
}

function AuthModal({ onClose }: { onClose: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAuth = async () => {
    setLoading(true);
    setErrorMsg("");

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { role } }
      });
      if (error) {
        setErrorMsg(error.message);
      } else if (data.user) {
        await supabase.from("profiles").upsert([{ id: data.user.id, email, role }]);
        onClose();
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message);
      } else if (data.user) {
        onClose();
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    localStorage.setItem("preferred_role", role);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
    if (error) setErrorMsg(error.message);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="neu-raised p-8 rounded-2xl w-96 relative bg-white" style={{ background: "var(--bg)", color: "var(--fg-strong)" }}>
        <button onClick={onClose} className="absolute top-3 right-3 font-bold text-gray-400 hover:text-gray-600">✕</button>
        
        <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
          {isSignUp ? "Create an Account" : "Welcome Back"}
        </h3>

        {errorMsg && (
          <div className="mb-3 p-2 text-xs rounded bg-red-100 text-red-600 font-semibold">
            {errorMsg}
          </div>
        )}

        {isSignUp && (
          <div className="mb-3">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Account Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="neu-inset p-2.5 rounded-xl w-full text-sm font-semibold outline-none">
              <option value="admin">Farm Admin</option>
            </select>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="btn-neu flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold mb-4 text-sm transition-all"
        >
          Continue with Google
        </button>

        <div className="flex items-center my-3">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-2 text-xs text-gray-400 uppercase font-semibold">Or Email</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <input
          className="neu-inset p-2.5 rounded-xl w-full mb-3 text-sm outline-none"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative flex items-center mb-4">
          <input
            className="neu-inset p-2.5 pr-10 rounded-xl w-full text-sm outline-none"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-sm text-gray-400 hover:text-gray-600 select-none"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <button onClick={handleAuth} disabled={loading} className="btn-accent w-full py-2.5 rounded-xl font-bold text-sm">
          {loading ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}
        </button>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(""); }}
            className="text-xs text-pink-500 font-semibold underline"
          >
            {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [dark, setDark] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  // --- Dashboard States ---
  const [activeTab, setActiveTab] = useState("sows");
  const [sows, setSows] = useState<any[]>([]);
  const [gestationEvents, setGestationEvents] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBreeding, setNewBreeding] = useState({ sow_id: "", breeding_date: "" });

  const fetchSows = async () => {
    const { data } = await supabase.from("sows").select("*");
    if (data) {
      const mappedSows = data.map((item) => ({
        id: item.id,
        tag_number: item.tag_id,
        name: item.breed || "Standard Breed",
        status: item.status || "HEALTHY",
        notes: `Expected Farrowing: ${item.expected_farrowing || "N/A"}`,
      }));
      setSows(mappedSows);
    }
  };

  const fetchUserProfile = async (sessionUser: any) => {
    let { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", sessionUser.id)
      .single();

    if (!profile) {
      const savedRole = localStorage.getItem("preferred_role") || "admin";
      await supabase.from("profiles").upsert([{ id: sessionUser.id, email: sessionUser.email, role: savedRole }]);
      localStorage.removeItem("preferred_role");
      setRole(savedRole);
    } else {
      setRole(profile.role);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserProfile(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && role === "admin") {
      fetchSows();
    }
  }, [user, role]);

  const handleLogBreeding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBreeding.sow_id || !newBreeding.breeding_date) return;

    const bDate = new Date(newBreeding.breeding_date);
    const fDate = new Date(bDate);
    fDate.setDate(bDate.getDate() + 114);

    const selectedSow = sows.find((s) => String(s.id) === String(newBreeding.sow_id));

    setGestationEvents((prev) => [
      ...prev,
      {
        id: Date.now(),
        sow_name: selectedSow ? `${selectedSow.name} (${selectedSow.tag_number})` : "Unknown Sow",
        breeding_date: newBreeding.breeding_date,
        expected_farrowing_date: fDate.toISOString().split("T")[0],
      },
    ]);

    setNewBreeding({ sow_id: "", breeding_date: "" });
  };

  const handleDeleteSow = async (id: string | number) => {
    await supabase.from("sows").delete().eq("id", id);
    setSows((prev) => prev.filter((sow) => sow.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  return (
    <div className={dark ? "dark" : ""} style={{ minHeight: "100vh", background: "var(--bg)", transition: "background 0.4s ease" }}>
      <Navbar dark={dark} onToggle={() => setDark(!dark)} onOpenAuth={() => setShowAuth(true)} user={user} onLogout={handleLogout} />

      <main>
        {!user && (
          <>
            <HeroSection />
            <GestationSchedule />
            <FeedStoreDirectory />
          </>
        )}

        {user && role === "admin" && (
          <div className="max-w-7xl mx-auto p-8">
            <div className="flex gap-4 mb-6">
              {["dashboard", "sows", "gestation"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl font-bold capitalize text-sm ${
                    activeTab === tab ? "btn-accent" : "btn-neu"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <Dashboard
              activeTab={activeTab}
              sows={sows}
              gestationEventqs={gestationEvents}
              newBreeding={newBreeding}
              setNewBreeding={setNewBreeding}
              handleLogBreeding={handleLogBreeding}
              handleDeleteSow={handleDeleteSow}
              setShowAddModal={setShowAddModal}
              containerClass="neu-raised"
              buttonClass="btn-accent"
            />
          </div>
        )}

        {user && role === "seller" && <SellerDashboard user={user} />}
      </main>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}