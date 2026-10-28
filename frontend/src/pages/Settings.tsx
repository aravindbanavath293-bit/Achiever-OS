import { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  User, Sun, Moon, Bell, Shield, KeyRound, 
  Trash2, CheckCircle2, AlertTriangle, Save, Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { BentoCard } from '../components/bento/Bento';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'notifications' | 'security'>('profile');

  // Profile form
  const [name, setName] = useState(user?.name || 'Aravind');
  const [email, setEmail] = useState(user?.email || 'aravind@achieveros.com');
  const [bio, setBio] = useState('Full-Stack Engineer & Productivity Architect');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');

  // Notifications
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [emailDigests, setEmailDigests] = useState(false);
  const [pushNotifs, setPushNotifs] = useState(true);

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be blank');
      return;
    }
    updateUser({ name, email, avatar: avatarUrl });
    toast.success('Profile updated successfully');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    toast.success('Password changed successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    toast.success('Account deletion initiated');
    setShowDeleteModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Feature Card */}
      <BentoCard span="full" variant="feature" className="p-5 md:p-6">
        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Manage your personal profile, workspace preferences, appearance theme, notification feeds, and security
        </p>
      </BentoCard>

      {/* Main Settings Layout: Tabs + Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Navigation Sidebar (4 cols) */}
        <div className="md:col-span-4 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm space-y-1.5 h-fit">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
              activeTab === 'profile'
                ? 'gradient-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <User size={16} />
            <span>Profile Information</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
              activeTab === 'appearance'
                ? 'gradient-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Sun size={16} />
            <span>Appearance & Themes</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
              activeTab === 'notifications'
                ? 'gradient-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Bell size={16} />
            <span>Notification Feeds</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
              activeTab === 'security'
                ? 'gradient-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Shield size={16} />
            <span>Security & Danger Zone</span>
          </button>
        </div>

        {/* Content Area (8 cols) */}
        <div className="md:col-span-8 bg-white p-6 md:p-7 rounded-2xl border border-slate-200/90 shadow-sm">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                <div className="w-16 h-16 rounded-2xl gradient-primary text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-indigo-500/25">
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{name || 'User'}</h3>
                  <p className="text-xs text-slate-500">{email}</p>
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    <Sparkles size={10} className="text-indigo-600" />
                    Achiever Pro Workspace
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Headline / Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none transition-all"
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 gradient-primary hover:gradient-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Save size={14} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Visual Workspace Theme</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Select your personal aesthetic workspace palette.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                  {/* Light Mode Card */}
                  <button
                    type="button"
                    onClick={() => {
                      setTheme('light');
                      toast.success('Light Mode activated');
                    }}
                    className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all cursor-pointer text-left relative ${
                      theme === 'light'
                        ? 'border-indigo-600 bg-indigo-50/60 shadow-sm ring-1 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 border border-amber-200/50 shadow-xs">
                      <Sun size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">Light Mode</span>
                        {theme === 'light' && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-600 text-white">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Clean, bright and crisp daytime workspace</p>
                    </div>
                  </button>

                  {/* Dark Mode Card */}
                  <button
                    type="button"
                    onClick={() => {
                      setTheme('dark');
                      toast.success('Dark Mode activated');
                    }}
                    className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all cursor-pointer text-left relative ${
                      theme === 'dark'
                        ? 'border-indigo-600 bg-indigo-950/20 shadow-sm ring-1 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-indigo-900/10 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-200/50 shadow-xs">
                      <Moon size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">Dark Mode</span>
                        {theme === 'dark' && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-600 text-white">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Sleek, eye-friendly midnight workspace</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Notification Feeds</h3>
              <p className="text-xs text-slate-500 mb-4">
                Choose how and when AchieverOS notifies you about milestones and upcoming deadlines.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">In-App Notification Feed</h4>
                    <p className="text-[11px] text-slate-500">Real-time alerts in top header for focus blocks and tasks</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={inAppAlerts}
                    onChange={(e) => setInAppAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Daily Morning Briefing</h4>
                    <p className="text-[11px] text-slate-500">Daily breakdown with top 3 focus priorities at 8:00 AM</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailDigests}
                    onChange={(e) => setEmailDigests(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Time Block Proximity Alerts</h4>
                    <p className="text-[11px] text-slate-500">10-minute heads up prior to scheduled focus sessions</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushNotifs}
                    onChange={(e) => setPushNotifs(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => toast.success('Notification preferences updated')}
                  className="px-4 py-2 gradient-primary hover:gradient-primary-hover text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* Security & Danger Zone Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Password change */}
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Update Security Credentials</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 gradient-primary hover:gradient-primary-hover text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Update Password
                </button>
              </form>

              {/* Danger Zone */}
              <div className="pt-6 border-t border-rose-200">
                <h3 className="text-sm font-bold text-rose-600 mb-1 flex items-center gap-1.5">
                  <AlertTriangle size={16} /> Danger Zone
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Permanent actions regarding your account and productivity history.
                </p>

                <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-rose-700">Delete Account & Stored Data</h4>
                    <p className="text-[11px] text-rose-600 mt-0.5">
                      Permanently wipe profile, tasks, goals, sticky notes, and timetable records.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0 shadow-xs"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-rose-300 shadow-2xl w-full max-w-md p-6 space-y-4 animate-scale-in">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle size={22} />
              <h3 className="text-sm font-bold">Confirm Permanent Deletion</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This action cannot be undone. All your tasks, schedules, goals, and notes will be permanently erased.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Type <span className="font-bold text-rose-600">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE'}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl cursor-pointer disabled:opacity-40"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
