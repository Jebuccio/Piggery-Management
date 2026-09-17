import React, { useState, FormEvent, useEffect } from 'react';

interface AdminSettingsPanelProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  fontSize: number;
  setFontSize: (val: number) => void;
}

export default function AdminSettingsPanel({
  darkMode,
  setDarkMode,
  fontSize,
  setFontSize,
}: AdminSettingsPanelProps) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'appearance' | 'notifications' | 'system'>('profile');
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  // Profile State (Initializes from localStorage or falls back to defaults)
  const [fullName, setFullName] = useState(() => localStorage.getItem('user_fullName') || 'J. Caretaker');
  const [email, setEmail] = useState(() => localStorage.getItem('user_email') || 'caretaker@piggeryos.com');
  const [phone, setPhone] = useState(() => localStorage.getItem('user_phone') || '+63 912 345 6789');
  const [role, setRole] = useState(() => localStorage.getItem('user_role') || 'Farm Caretaker / Admin');

  // Security / Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // System Configurations State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [lowFeedThreshold, setLowFeedThreshold] = useState(15);
  const [autoBackup, setAutoBackup] = useState(true);

  // Helper for notification feedback
  const showFeedback = (msg: string) => {
    setSavedStatus(msg);
    setTimeout(() => setSavedStatus(null), 3000);
  };

  // Save Profile Changes Handler (Persists to localStorage)
  const handleUpdateProfile = (e: FormEvent) => {
    e.preventDefault();

    localStorage.setItem('user_fullName', fullName);
    localStorage.setItem('user_email', email);
    localStorage.setItem('user_phone', phone);
    localStorage.setItem('user_role', role);

    showFeedback('Profile & contact information updated successfully!');
  };

  // Password Change Handler
  const handleChangePassword = (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match!');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showFeedback('Password changed successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-300/20 pb-4">
        <div>
          <h2 className="text-2xl font-bold">⚙️ Admin Settings & Security</h2>
          <p className="text-xs text-gray-400 mt-1">
            Manage profile details, account security credentials, display options, and system alerts.
          </p>
        </div>
      </div>

      {/* Dynamic Feedback Banner */}
      {savedStatus && (
        <div className="neu-pressed p-3 rounded-2xl text-xs font-bold text-emerald-500 flex items-center justify-between">
          <span>✅ {savedStatus}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 neu-pressed rounded-2xl w-fit text-xs font-bold">
        {[
          { id: 'profile', label: '👤 Profile & Contact' },
          { id: 'security', label: '🔒 Security & Password' },
          { id: 'appearance', label: '🎨 Appearance' },
          { id: 'notifications', label: '🔔 Alerts' },
          { id: 'system', label: '🖥️ System' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === tab.id ? 'neu-flat text-blue-500 font-extrabold' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* TAB 1: PROFILE & CONTACT INFO                                      */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'profile' && (
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="neu-pressed p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">User Information</h3>
            
            <div className="flex items-center gap-4 mb-4">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="User Avatar"
                className="w-16 h-16 rounded-2xl object-cover neu-flat ring-2 ring-blue-500/30"
              />
              <div>
                <button type="button" className="neu-button px-3 py-1.5 rounded-xl text-xs font-bold text-blue-500">
                  Change Photo
                </button>
                <p className="text-[10px] text-gray-400 mt-1">JPG, PNG up to 2MB</p>
              </div>
            </div>
a
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-gray-400 font-bold block mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  className="neu-flat w-full p-3 rounded-xl outline-none font-bold focus:ring-2 focus:ring-blue-500/30"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 font-bold block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="neu-flat w-full p-3 rounded-xl outline-none font-bold focus:ring-2 focus:ring-blue-500/30"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 font-bold block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="neu-flat w-full p-3 rounded-xl outline-none font-bold focus:ring-2 focus:ring-blue-500/30"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 font-bold block mb-1">Role / Designation</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Enter role or job title"
                  className="neu-flat w-full p-3 rounded-xl outline-none font-bold focus:ring-2 focus:ring-blue-500/30"
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button type="submit" className="neu-button px-5 py-2.5 rounded-xl font-bold text-xs text-blue-500">
                Save Profile Changes
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 2: SECURITY & PASSWORD CHANGE                                 */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'security' && (
        <form onSubmit={handleChangePassword} className="space-y-6">
          <div className="neu-pressed p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Change Password</h3>

            {passwordError && (
              <div className="neu-pressed p-3 rounded-xl text-xs font-bold text-red-500">
                ⚠️ {passwordError}
              </div>
            )}

            <div className="space-y-3 text-xs max-w-md">
              <div>
                <label className="text-gray-400 font-bold block mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="neu-flat w-full p-3 rounded-xl outline-none font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 font-bold block mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="neu-flat w-full p-3 rounded-xl outline-none font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 font-bold block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="neu-flat w-full p-3 rounded-xl outline-none font-bold"
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex justify-start">
              <button type="submit" className="neu-button px-5 py-2.5 rounded-xl font-bold text-xs text-blue-500">
                Update Password
              </button>
            </div>
          </div>

          <div className="neu-pressed p-6 rounded-3xl space-y-3">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Two-Factor Authentication (2FA)</h3>
            <p className="text-xs text-gray-400">Add an extra layer of security to your admin account using authenticator apps.</p>
            <button type="button" className="neu-button px-4 py-2 rounded-xl text-xs font-bold text-emerald-500">
              Enable 2FA Protection
            </button>
          </div>
        </form>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 3: APPEARANCE                                                  */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          <div className="neu-pressed p-5 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Interface Theme</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Dark Theme Mode</p>
                <p className="text-xs text-gray-400">Switch between light and high-contrast dark neumorphic styling.</p>
              </div>
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className={`w-14 h-7 rounded-full p-1 transition-colors ${
                  darkMode ? 'neu-pressed bg-blue-600' : 'neu-pressed'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="neu-pressed p-5 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Typography Settings</h3>
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-bold">Base UI Font Size</p>
                <span className="text-xs font-extrabold text-blue-500 neu-flat px-3 py-1 rounded-xl">
                  {fontSize}px
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold">Small (12px)</span>
                <input
                  type="range"
                  min="12"
                  max="18"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-blue-500 h-2 neu-pressed rounded-lg cursor-pointer"
                />
                <span className="text-xs font-bold">Large (18px)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 4: ALERTS & NOTIFICATIONS                                      */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="neu-pressed p-5 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Communication Channels</h3>
            
            <div className="flex items-center justify-between border-b border-gray-300/10 pb-3">
              <div>
                <p className="text-sm font-bold">Email Notifications</p>
                <p className="text-xs text-gray-400">Receive daily summaries and critical farrowing alerts.</p>
              </div>
              <button
                type="button"
                onClick={() => setEmailAlerts(!emailAlerts)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  emailAlerts ? 'neu-pressed bg-emerald-500' : 'neu-pressed'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${emailAlerts ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">SMS Urgent Dispatch</p>
                <p className="text-xs text-gray-400">Send direct SMS text alerts to care workers during critical medical events.</p>
              </div>
              <button
                type="button"
                onClick={() => setSmsAlerts(!smsAlerts)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  smsAlerts ? 'neu-pressed bg-emerald-500' : 'neu-pressed'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${smsAlerts ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <div className="neu-pressed p-5 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Inventory Thresholds</h3>
            <div className="space-y-2">
              <label className="text-sm font-bold block">Feed Stock Warning Level (Bags)</label>
              <div className="flex gap-4 items-center">
                <input
                  type="number"
                  value={lowFeedThreshold}
                  onChange={(e) => setLowFeedThreshold(Number(e.target.value))}
                  className="neu-flat p-2.5 rounded-xl text-xs w-32 outline-none font-bold text-center"
                />
                <span className="text-xs text-gray-400">Triggers 'Low Stock Feed' widget alerts when inventory drops below this quantity.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 5: SYSTEM                                                      */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="neu-pressed p-5 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Database Maintenance</h3>
            
            <div className="flex items-center justify-between border-b border-gray-300/10 pb-3">
              <div>
                <p className="text-sm font-bold">Automated Daily Backups</p>
                <p className="text-xs text-gray-400">Backup all sow logs and medical records at midnight PST.</p>
              </div>
              <button
                type="button"
                onClick={() => setAutoBackup(!autoBackup)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  autoBackup ? 'neu-pressed bg-blue-600' : 'neu-pressed'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoBackup ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <button type="button" className="neu-button px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                📥 Export Sow Records (CSV)
              </button>
              <button type="button" className="neu-button px-4 py-2 rounded-xl text-xs font-bold text-red-500 flex items-center gap-2">
                🗑️ Clear Cache & Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}