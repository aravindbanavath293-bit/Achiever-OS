import { useState } from 'react';
import { 
  User, Sun, Moon, Monitor, Bell, Shield, KeyRound, 
  Trash2, CheckCircle2, AlertTriangle, Save 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'notifications' | 'security'>('profile');

  // Profile form
  const [name, setName] = useState(user?.name || 'Aravind');
  const [email, setEmail] = useState(user?.email || 'aravind@achieveros.com');
  const [bio, setBio] = useState('Full-Stack Engineer & Productivity Architect');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');

  // Theme
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');

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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-xs">
        <h1 className="text-xl font-bold text-primary">System Settings</h1>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Manage your personal profile, workspace preferences, notification feeds, and account security
        </p>
      </div>

      {/* Main Settings Layout: Tabs + Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Navigation Sidebar (4 cols) */}
        <div className="md:col-span-4 bg-white p-3 rounded-xl border border-border shadow-xs space-y-1 h-fit">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
              activeTab === 'profile'
                ? 'bg-primary text-white shadow-2xs'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
            }`}
          >
            <User size={16} />
            <span>Profile Information</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
              activeTab === 'appearance'
                ? 'bg-primary text-white shadow-2xs'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
            }`}
          >
            <Sun size={16} />
            <span>Appearance & Themes</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
              activeTab === 'notifications'
                ? 'bg-primary text-white shadow-2xs'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
            }`}
          >
            <Bell size={16} />
            <span>Notification Feeds</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
              activeTab === 'security'
                ? 'bg-primary text-white shadow-2xs'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
            }`}
          >
            <Shield size={16} />
            <span>Security & Danger Zone</span>
          </button>
        </div>

        {/* Content Area (8 cols) */}
        <div className="md:col-span-8 bg-white p-6 rounded-xl border border-border shadow-xs">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <div className="w-16 h-16 rounded-full bg-primary text-white font-bold text-xl flex items-center justify-center border-2 border-gold shadow-xs">
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primary">{name || 'User'}</h3>
                  <p className="text-xs text-on-surface-variant">{email}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                    Achiever Pro Plan
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Headline / Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-border">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-xs"
                >
                  <Save size={14} />
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-primary mb-1">Color Theme</h3>
                <p className="text-xs text-on-surface-variant mb-4">
                  Select your visual workspace aesthetic.
                </p>

                <div className="grid grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-on-surface-variant hover:border-gray-300'
                    }`}
                  >
                    <Sun size={24} className="text-gold" />
                    <span className="text-xs font-bold">Light Theme</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTheme('dark');
                      toast('Dark mode styling activated');
                    }}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-on-surface-variant hover:border-gray-300'
                    }`}
                  >
                    <Moon size={24} className="text-primary" />
                    <span className="text-xs font-bold">Dark Theme</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('system')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      theme === 'system'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-on-surface-variant hover:border-gray-300'
                    }`}
                  >
                    <Monitor size={24} className="text-secondary-text" />
                    <span className="text-xs font-bold">System Default</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-primary mb-1">Notification Preferences</h3>
              <p className="text-xs text-on-surface-variant mb-4">
                Choose how and when AchieverOS notifies you about upcoming deadlines.
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                  <div>
                    <h4 className="text-xs font-bold text-primary">In-App Notification Feed</h4>
                    <p className="text-[11px] text-on-surface-variant">Badge alerts in top header for overdue tasks</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={inAppAlerts}
                    onChange={(e) => setInAppAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                  <div>
                    <h4 className="text-xs font-bold text-primary">Daily Morning Digest</h4>
                    <p className="text-[11px] text-on-surface-variant">Daily briefing with top priorities at 8:00 AM</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailDigests}
                    onChange={(e) => setEmailDigests(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                  <div>
                    <h4 className="text-xs font-bold text-primary">Push Alerts for Timetable Events</h4>
                    <p className="text-[11px] text-on-surface-variant">10-minute advance warning before scheduled blocks</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushNotifs}
                    onChange={(e) => setPushNotifs(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => toast.success('Notification preferences saved')}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Update Preferences
                </button>
              </div>
            </div>
          )}

          {/* Security & Danger Zone Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Password change */}
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <h3 className="text-sm font-bold text-primary mb-1">Update Security Credentials</h3>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  Change Password
                </button>
              </form>

              {/* Danger Zone */}
              <div className="pt-6 border-t border-red-200">
                <h3 className="text-sm font-bold text-red-600 mb-1 flex items-center gap-1.5">
                  <AlertTriangle size={16} /> Danger Zone
                </h3>
                <p className="text-xs text-on-surface-variant mb-4">
                  Irreversible actions regarding your account and associated productivity data.
                </p>

                <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-red-700">Delete Account & Data</h4>
                    <p className="text-[11px] text-red-600 mt-0.5">
                      Permanently delete your profile, tasks, goals, notes, and timetable records.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium cursor-pointer shrink-0 shadow-2xs"
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
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-red-300 shadow-xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle size={20} />
              <h3 className="text-sm font-bold">Confirm Permanent Deletion</h3>
            </div>
            <p className="text-xs text-on-surface-variant">
              This action cannot be undone. All your tasks, schedules, goals, and notes will be permanently wiped.
            </p>
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-on-surface-variant hover:bg-surface-container rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE'}
                className="px-4 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer disabled:opacity-40"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
