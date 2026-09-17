import React, { useState, useEffect, useRef, FormEvent } from 'react';
import AdminSettingsPanel from './AdminSettingsPanel';
import { supabase } from './supabaseClient';

/* ==========================================================================
   1. TYPES & INTERFACES
   ========================================================================== */
export type AdminTabState = 'dashboard' | 'sows' | 'gestation' | 'finder' | 'settings';

export interface Sow {
  id: number;
  sow_id: string;
  name: string;
  tag_number: string;
  status: 'Healthy' | 'Breeding' | 'Gestating' | 'Isolated';
  notes: string;
}

interface AdminPortalProps {
  adminTab: AdminTabState;
  setAdminTab: (tab: AdminTabState) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  fontSize: number;
  setFontSize: (val: number) => void;
  user?: any;
  profileName?: string;
}

interface CaretakerProfileDropdownProps {
  user?: any;
  profileName?: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

/* ==========================================================================
   2. CARETAKER DROPDOWN MENU COMPONENT
   ========================================================================== */
function CaretakerProfileDropdown({ user, profileName }: CaretakerProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    console.log('User signed out');
  };

  // Close dropdown menu when clicking outside component bounds
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { label: 'Profile', icon: '👤', description: 'User account & role settings', action: () => {} },
    { label: 'Notifications', icon: '🔔', description: 'Alert preferences & logs', action: () => {} },
    { label: 'Language', icon: '🌐', description: 'Localization & regional settings', action: () => {} },
    { label: 'About', icon: 'ℹ️', description: 'Platform overview & version details', action: () => {} },
    { label: 'Logout', icon: '➜]', description: 'Log out from dashboard', action: handleLogout },
  ];

  const userEmail = user?.email || 'Not Signed In';
  const displayAvatarLetter = profileName
    ? profileName.charAt(0).toUpperCase()
    : userEmail.charAt(0).toUpperCase();

  return (
    <div className="relative z-50 inline-block" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-2xl cursor-pointer transition-all duration-200 select-none ${
          isOpen ? 'neu-pressed' : 'neu-flat'
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-black flex items-center justify-center text-xs neu-flat shrink-0">
          {displayAvatarLetter}
        </div>
        <div className="text-left text-xs">
          <p className="font-bold leading-tight text-gray-800 dark:text-gray-100">
            {profileName || 'Caretaker'}
          </p>
          <p className="text-[10px] text-gray-400 leading-tight truncate max-w-[120px]">
            {userEmail}
          </p>
        </div>
        <span
          className={`text-xs text-blue-500 font-bold transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          ▾
        </span>
      </button>

      {/* Dropdown Menu Overlay */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 neu-flat p-4 rounded-3xl space-y-3 transition-all duration-300 shadow-2xl border border-white/20 dark:border-gray-800/20">
          <div className="neu-pressed p-2.5 rounded-2xl text-[11px] text-gray-500 dark:text-gray-400 italic text-center">
            Isolated Portal • Full Account Control
          </div>

          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-2xl neu-pressed hover:neu-button group transition-all duration-200 text-left"
              >
                <div className="w-8 h-8 rounded-xl neu-flat flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-200 group-hover:text-blue-500 transition-colors">
                    {item.label}
                  </p>
                  <p className="text-[10px] text-gray-400 leading-tight">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   3. MAIN APPLICATION CONTAINER (WITH DYNAMIC AUTH)
   ========================================================================== */
export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<AdminTabState>('dashboard');
  const [fontSize, setFontSize] = useState<number>(14);

  // Dynamic user & profile state derived from Supabase Auth
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileName, setProfileName] = useState<string>('');

  useEffect(() => {
    // 1. Fetch initial authenticated user session
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setCurrentUser(session.user);
          const fullName =
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split('@')[0];
          setProfileName(fullName || 'Caretaker');
        }
      });

      // 2. Listen dynamically for auth state changes (login, logout, session refresh)
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setCurrentUser(session.user);
          const fullName =
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split('@')[0];
          setProfileName(fullName || 'Caretaker');
        } else {
          setCurrentUser(null);
          setProfileName('');
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  return (
    <>
      <style>{`
        .light {
          --neu-bg: #E0E5EC;
          --neu-flat-shadow: 9px 9px 16px #a3b1c6, -9px -9px 16px #ffffff;
          --neu-button-shadow: 6px 6px 12px #b8c6d9, -6px -6px 12px #ffffff;
          --neu-button-active: inset 4px 4px 8px #b8c6d9, inset -4px -4px 8px #ffffff;
          --neu-pressed-shadow: inset 6px 6px 10px #a3b1c6, inset -6px -6px 10px #ffffff;
        }
        .dark {
          --neu-bg: #121212;
          --neu-flat-shadow: 6px 6px 14px #0a0a0a, -6px -6px 14px #1a1a1a;
          --neu-button-shadow: 4px 4px 10px #080808, -4px -4px 10px #1c1c1c;
          --neu-button-active: inset 3px 3px 6px #080808, inset -3px -3px 6px #1c1c1c;
          --neu-pressed-shadow: inset 5px 5px 8px #080808, inset -5px -5px 8px #1c1c1c;
        }
        .neu-flat { box-shadow: var(--neu-flat-shadow); background-color: var(--neu-bg); }
        .neu-button { box-shadow: var(--neu-button-shadow); background-color: var(--neu-bg); transition: all 0.2s ease; }
        .neu-button:active { box-shadow: var(--neu-button-active); }
        .neu-pressed { box-shadow: var(--neu-pressed-shadow); background-color: var(--neu-bg); }
      `}</style>

      <div
        style={{ fontSize: `${fontSize}px` }}
        className={`min-h-screen ${darkMode ? 'dark bg-[#121212] text-gray-100' : 'light bg-[#E0E5EC] text-gray-800'}`}
      >
        <header className="p-4 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏠</span>
              <h1 className="font-extrabold text-xl tracking-wide">PiggeryOS Admin</h1>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold neu-pressed text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Active quick indicator
            </span>
          </div>

          <div className="flex-1 max-w-md w-full">
            <div className="neu-pressed px-4 py-2 rounded-2xl flex items-center gap-2">
              <span className="text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Look up sow IDs, feed brands, or medical logs"
                className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="neu-button p-2.5 rounded-2xl relative" type="button">
              <span className="text-lg">🔔</span>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Dynamic Caretaker Profile Dropdown */}
            <CaretakerProfileDropdown user={currentUser} profileName={profileName} />
          </div>
        </header>

        <AdminPortalLayout
          adminTab={adminTab}
          setAdminTab={setAdminTab}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          fontSize={fontSize}
          setFontSize={setFontSize}
          user={currentUser}
          profileName={profileName}
        />
      </div>
    </>
  );
}

/* ==========================================================================
   4. AUTHENTICATED FARM ADMIN LAYOUT & MODULES
   ========================================================================== */
function AdminPortalLayout({
  adminTab,
  setAdminTab,
  darkMode,
  setDarkMode,
  fontSize,
  setFontSize,
}: AdminPortalProps) {
  return (
    <div className="flex max-w-7xl mx-auto min-h-[85vh] p-4 gap-6 flex-col md:flex-row">
      <aside className="w-full md:w-64 neu-flat p-6 rounded-3xl space-y-6 flex flex-col justify-between shrink-0">
        <div className="space-y-4">
          <nav className="flex flex-col gap-3">
            {[
              { id: 'dashboard', label: '📊 Dashboard' },
              { id: 'sows', label: '🐖 Sow Records' },
              { id: 'gestation', label: '📅 Gestation & Schedule' },
              { id: 'finder', label: '🛒 Store Finder' },
              { id: 'settings', label: '⚙️ Settings & Appearance' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setAdminTab(item.id as AdminTabState)}
                className={`w-full text-left px-4 py-3 rounded-2xl font-semibold transition text-sm ${
                  adminTab === item.id ? 'neu-pressed text-blue-500 font-bold' : 'neu-button'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-300/20">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1">☀️ Dark Mode</span>
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                darkMode ? 'neu-pressed bg-blue-600' : 'neu-pressed'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span>Font Size</span>
              <span>{fontSize}px</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">A-</span>
              <input
                type="range"
                min="12"
                max="18"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-blue-500 h-1 neu-pressed rounded-lg cursor-pointer"
              />
              <span className="text-sm font-bold">A+</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 neu-flat p-6 rounded-3xl">
        {adminTab === 'dashboard' && <AdminDashboardView />}
        {adminTab === 'sows' && <SowRecordsCRUDView />}
        {adminTab === 'gestation' && <GestationCalendarView />}
        {adminTab === 'finder' && <StoreFinderView />}
        {adminTab === 'settings' && (
          <AdminSettingsPanel
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            fontSize={fontSize}
            setFontSize={setFontSize}
          />
        )}
      </main>
    </div>
  );
}

/* ==========================================================================
   5. DASHBOARD SUB-VIEWS
   ========================================================================== */
function AdminDashboardView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="neu-flat p-5 rounded-2xl relative flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-500">Active Sows</p>
              <p className="text-3xl font-black mt-1">145</p>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Active Sows</p>
            </div>
            <span className="neu-button p-2 rounded-xl text-blue-500">📈</span>
          </div>
          <div className="mt-4">
            <span className="neu-pressed px-3 py-1 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 inline-block">
              28 Developing Gilts
            </span>
          </div>
        </div>

        <div className="neu-flat p-5 rounded-2xl relative flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-500">Pending Tasks</p>
              <p className="text-3xl font-black mt-1">17</p>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">High-Priority Tasks</p>
            </div>
            <span className="neu-button p-2 rounded-xl text-amber-500">📋</span>
          </div>
          <div className="mt-4 flex gap-2">
            <span className="neu-pressed px-2 py-1 rounded-xl text-[11px] font-bold text-gray-600 dark:text-gray-300">
              3 Iron Injections
            </span>
            <span className="neu-pressed px-2 py-1 rounded-xl text-[11px] font-bold text-gray-600 dark:text-gray-300">
              5 Vitamins
            </span>
          </div>
        </div>

        <div className="neu-flat p-5 rounded-2xl relative flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-500">Low Stock Feed</p>
              <p className="text-3xl font-black mt-1">
                3 <span className="text-sm font-bold">Feed Brands</span>
              </p>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Immediate Alerts</p>
            </div>
            <span className="neu-button p-2 rounded-xl text-red-500">📦</span>
          </div>
          <div className="mt-4 flex gap-2">
            <span className="neu-button px-2 py-1 rounded-lg text-xs">🌾 Inahin 1</span>
            <span className="neu-button px-2 py-1 rounded-lg text-xs">🌽 Grower</span>
          </div>
        </div>

        <div className="neu-flat p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500">Expected Farrowings</p>
            <p className="text-2xl font-black mt-1">7 Days</p>
            <p className="text-xs text-gray-400 font-semibold">Upcoming Litters</p>
            <span className="text-xs font-bold text-blue-500 mt-2 block">🐷 5</span>
          </div>
          <div className="w-16 h-16 rounded-full neu-pressed flex items-center justify-center relative">
            <div className="w-12 h-12 rounded-full neu-flat flex items-center justify-center">
              <span className="text-xs font-black text-blue-500">7d</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="neu-flat p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base">Gestation & Health Timeline</h3>
            <div className="flex gap-2 items-center text-xs">
              <button type="button" className="neu-button px-2 py-1 rounded-lg">
                ❮
              </button>
              <span className="font-bold text-gray-500">Months</span>
              <button type="button" className="neu-button px-2 py-1 rounded-lg">
                ❯
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="font-bold py-1 text-gray-400">
                {d}
              </div>
            ))}
            {Array.from({ length: 31 }).map((_, i) => {
              const day = i + 1;
              return (
                <div
                  key={i}
                  className="neu-pressed p-1.5 rounded-xl min-h-[50px] flex flex-col justify-between text-left text-[10px]"
                >
                  <span className="font-bold text-gray-400">{day}</span>
                  {day === 3 && (
                    <span className="bg-red-500/20 text-red-600 font-extrabold px-1 rounded">
                      D3: Iron
                    </span>
                  )}
                  {day === 10 && (
                    <span className="bg-blue-500/20 text-blue-600 font-extrabold px-1 rounded">
                      D10: Vit A
                    </span>
                  )}
                  {day === 14 && (
                    <span className="bg-purple-500/20 text-purple-600 font-extrabold px-1 rounded">
                      D14: Booster
                    </span>
                  )}
                  {day === 25 && (
                    <span className="bg-amber-500/20 text-amber-600 font-extrabold px-1 rounded">
                      D90: Shift
                    </span>
                  )}
                  {day === 27 && (
                    <span className="bg-emerald-500/20 text-emerald-600 font-extrabold px-1 rounded">
                      D45: Wean
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="neu-flat p-6 rounded-3xl space-y-4">
          <h3 className="font-bold text-base">Appetite & Health Tracker</h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-gray-400 font-bold block mb-1">Sow ID</label>
              <input placeholder="Sow ID" className="neu-pressed w-full p-2 rounded-xl outline-none" />
            </div>
            <div>
              <label className="text-gray-400 font-bold block mb-1">Time</label>
              <input
                type="text"
                defaultValue="08:00 AM"
                className="neu-pressed w-full p-2 rounded-xl outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-400 font-bold block mb-1 text-xs">
              Appetite Score (1-5 slider)
            </label>
            <input
              type="range"
              min="1"
              max="5"
              defaultValue="3"
              className="w-full neu-pressed h-2 rounded-lg accent-blue-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-gray-400 font-bold block mb-1 text-xs">Issues Log</label>
            <input
              placeholder="Issue description (text box)"
              className="neu-pressed w-full p-2 rounded-xl outline-none text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs font-bold text-gray-400 mb-2">Feed Refusal Frequency</p>
              <div className="flex items-end gap-1 h-20 neu-pressed p-2 rounded-xl">
                {[4, 2, 3, 2, 1, 4, 3, 3, 2].map((v, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-blue-500 rounded-t"
                    style={{ height: `${v * 20}%` }}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-400 mb-2">Sows with appetite issues</p>
              <div className="space-y-1.5 max-h-20 overflow-y-auto pr-1">
                {['D2. Weaning', 'D3. Weaning', 'B3. Weaning'].map((sow, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-[11px] neu-pressed p-1.5 rounded-lg"
                  >
                    <span>{sow}</span>
                    <button
                      type="button"
                      className="neu-button px-2 py-0.5 rounded text-[10px] text-blue-500 font-bold"
                    >
                      Treat
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="neu-flat p-6 rounded-3xl space-y-4 lg:col-span-2">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base">Feed Store Locator</h3>
            <span className="neu-pressed px-3 py-1 rounded-full text-xs font-bold text-emerald-600 flex items-center gap-1">
              🟢 Real-time Stock Levels
            </span>
          </div>

          <div className="flex gap-3 text-xs">
            <select className="neu-button px-3 py-1.5 rounded-xl font-bold outline-none">
              <option>Inahin 1</option>
            </select>
            <select className="neu-button px-3 py-1.5 rounded-xl font-bold outline-none">
              <option>Grower</option>
            </select>
            <input
              placeholder="Text a Search..."
              className="neu-pressed px-3 py-1.5 rounded-xl outline-none flex-1"
            />
          </div>

          <GoogleMapsComponent />
        </div>
      </div>
    </div>
  );
}

function SowRecordsCRUDView() {
  const [sows, setSows] = useState<Sow[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSow, setEditingSow] = useState<Sow | null>(null);

  const [sowIdInput, setSowIdInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchSows();
  }, []);

  const fetchSows = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/sows`);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      setSows(Array.isArray(data) ? data : []);
    } catch {
      setSows([
        { id: 1, sow_id: 'SOW-001', name: 'Bella', tag_number: 'TAG-9081', status: 'Gestating', notes: 'Needs extra feed' },
        { id: 2, sow_id: 'SOW-002', name: 'Daisy', tag_number: 'TAG-9082', status: 'Healthy', notes: 'Routine check complete' },
      ]);
    }
  };

  const handleAddSow = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      sow_id: sowIdInput,
      name: nameInput,
      tag_number: tagInput,
      status: 'Healthy' as const,
      notes: '',
    };
    try {
      await fetch(`${API_BASE_URL}/sows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await fetchSows();
    } catch {
      setSows((prev) => [...prev, { ...payload, id: Date.now() }]);
    }
    setSowIdInput('');
    setNameInput('');
    setTagInput('');
    setIsAddOpen(false);
  };

  const handleUpdateSow = async () => {
    if (!editingSow) return;
    try {
      await fetch(`${API_BASE_URL}/sows/${editingSow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingSow.name,
          status: editingSow.status,
          notes: editingSow.notes,
        }),
      });
      await fetchSows();
    } catch {
      setSows((prev) => prev.map((s) => (s.id === editingSow.id ? editingSow : s)));
    }
    setEditingSow(null);
  };

  const handleDeleteSow = async (id: number) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await fetch(`${API_BASE_URL}/sows/${id}`, { method: 'DELETE' });
      await fetchSows();
    } catch {
      setSows((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sow Records Management</h2>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="neu-button px-4 py-2 rounded-xl font-bold text-blue-500"
        >
          + Add New Sow
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-300/30 text-sm text-gray-400">
              <th className="py-3 px-2">Sow ID</th>
              <th className="py-3 px-2">Name</th>
              <th className="py-3 px-2">Tag No.</th>
              <th className="py-3 px-2">Status</th>
              <th className="py-3 px-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300/20 text-sm font-medium">
            {sows.map((sow) => (
              <tr key={sow.id}>
                <td className="py-4 px-2 font-bold">{sow.sow_id}</td>
                <td className="py-4 px-2">{sow.name}</td>
                <td className="py-4 px-2">{sow.tag_number}</td>
                <td className="py-4 px-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold neu-pressed">
                    {sow.status}
                  </span>
                </td>
                <td className="py-4 px-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSow(sow)}
                    className="neu-button px-3 py-1 rounded-lg text-xs font-bold"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSow(sow.id)}
                    className="neu-button px-3 py-1 rounded-lg text-xs font-bold text-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <form onSubmit={handleAddSow} className="neu-flat p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold">Register Sow Tag</h3>
            <input
              required
              placeholder="Sow ID (e.g., SOW-004)"
              value={sowIdInput}
              onChange={(e) => setSowIdInput(e.target.value)}
              className="neu-pressed w-full p-3 rounded-xl outline-none"
            />
            <input
              required
              placeholder="Sow Name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="neu-pressed w-full p-3 rounded-xl outline-none"
            />
            <input
              required
              placeholder="Tag Number"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="neu-pressed w-full p-3 rounded-xl outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="neu-button px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="neu-button px-4 py-2 rounded-xl text-blue-500 font-bold"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {editingSow && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="neu-flat p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold">Edit {editingSow.sow_id}</h3>
            <input
              value={editingSow.name}
              onChange={(e) => setEditingSow({ ...editingSow, name: e.target.value })}
              className="neu-pressed w-full p-3 rounded-xl outline-none"
            />
            <select
              value={editingSow.status}
              onChange={(e) =>
                setEditingSow({
                  ...editingSow,
                  status: e.target.value as Sow['status'],
                })
              }
              className="neu-pressed w-full p-3 rounded-xl outline-none"
            >
              <option value="Healthy">Healthy</option>
              <option value="Breeding">Breeding</option>
              <option value="Gestating">Gestating</option>
              <option value="Isolated">Isolated</option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingSow(null)}
                className="neu-button px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateSow}
                className="neu-button px-4 py-2 rounded-xl text-blue-500 font-bold"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GestationCalendarView() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">📅 Gestation Task Scheduling</h2>
      <p className="text-gray-500 text-sm">
        Interactive calendar logs and automated breeding cycle timeline alerts.
      </p>
      <div className="grid grid-cols-7 gap-2 text-center font-bold pt-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="p-2 neu-flat rounded-xl text-xs">
            {d}
          </div>
        ))}
        {Array.from({ length: 28 }).map((_, i) => (
          <div key={i} className="neu-pressed h-16 rounded-xl p-2 text-xs text-left relative">
            <span>{i + 1}</span>
            {i === 12 && (
              <span className="block mt-1 text-[10px] font-bold text-amber-500">
                Farrow SOW-001
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StoreFinderView() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">🛒 Integrated Feed Merchants</h2>
      <GoogleMapsComponent />
    </div>
  );
}

function GoogleMapsComponent() {
  const storeLat = 10.3157;
  const storeLng = 123.8854;

  return (
    <div className="space-y-4">
      <div className="w-full h-64 neu-pressed rounded-2xl overflow-hidden relative">
        <iframe
          title="Store Location Google Map"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          src={`https://maps.google.com/maps?q=${storeLat},${storeLng}&z=15&output=embed`}
        />
      </div>
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${storeLat},${storeLng}`}
        target="_blank"
        rel="noreferrer"
        className="inline-block neu-button px-6 py-3 rounded-xl font-bold text-blue-500 text-sm"
      >
        📍 Navigate via Google Maps
      </a>
    </div>
  );
}