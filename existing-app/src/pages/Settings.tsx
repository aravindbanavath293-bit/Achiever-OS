import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Bell, Shield, Moon, Monitor, Sun, LogOut, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState('Productivity enthusiast.');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8 h-full">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-display font-bold text-on-surface">Settings</h1>
        <p className="text-body-md text-on-surface-variant mt-1">Manage your account and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'profile' 
                ? 'bg-primary-container text-primary font-bold' 
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <User size={18} /> Profile Details
          </button>
          
          <button 
            onClick={() => setActiveTab('preferences')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'preferences' 
                ? 'bg-primary-container text-primary font-bold' 
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <Shield size={18} /> Preferences & Theme
          </button>
          
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'notifications' 
                ? 'bg-primary-container text-primary font-bold' 
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <Bell size={18} /> Notifications
          </button>
          
          <div className="h-px w-full bg-outline-variant my-4" />
          
          <button 
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-error hover:bg-error-container hover:text-on-error-container transition-colors"
          >
            <LogOut size={18} /> Log out
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 shadow-sm">
          
          {showSuccess && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle2 size={20} />
              <p className="text-sm font-bold">Settings saved successfully!</p>
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-6">
              <h2 className="text-headline-md font-bold text-on-surface mb-6">Profile Details</h2>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-on-primary shadow-md">
                  {name.charAt(0).toUpperCase()}
                </div>
                <button type="button" className="px-4 py-2 border border-outline hover:border-primary text-sm font-bold rounded-lg transition-colors text-on-surface">
                  Change Avatar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container rounded-xl border-none outline-none focus:ring-2 focus:ring-primary text-on-surface transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container rounded-xl border-none outline-none focus:ring-2 focus:ring-primary text-on-surface transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-on-surface">Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-surface-container rounded-xl border-none outline-none focus:ring-2 focus:ring-primary text-on-surface transition-all resize-none"
                />
              </div>

              <div className="pt-4 border-t border-outline-variant flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:bg-surface-tint transition-colors shadow-sm disabled:opacity-50 min-w-[120px]"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-8">
              <h2 className="text-headline-md font-bold text-on-surface mb-6">Preferences & Theme</h2>
              
              <div>
                <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">Appearance</h3>
                <div className="grid grid-cols-3 gap-4">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                      theme === 'light' ? 'border-primary bg-primary-container/20 text-primary' : 'border-outline-variant text-on-surface-variant hover:border-outline'
                    }`}
                  >
                    <Sun size={24} />
                    <span className="font-bold text-sm">Light Mode</span>
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                      theme === 'dark' ? 'border-primary bg-primary-container/20 text-primary' : 'border-outline-variant text-on-surface-variant hover:border-outline'
                    }`}
                  >
                    <Moon size={24} />
                    <span className="font-bold text-sm">Dark Mode</span>
                  </button>
                  <button 
                    onClick={() => setTheme('system')}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                      theme === 'system' ? 'border-primary bg-primary-container/20 text-primary' : 'border-outline-variant text-on-surface-variant hover:border-outline'
                    }`}
                  >
                    <Monitor size={24} />
                    <span className="font-bold text-sm">System</span>
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-outline-variant">
                <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">Start of Week</h3>
                <select className="w-full md:w-64 px-4 py-3 bg-surface-container rounded-xl border-none outline-none focus:ring-2 focus:ring-primary text-on-surface transition-all cursor-pointer">
                  <option value="monday">Monday</option>
                  <option value="tuesday">Tuesday</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="thursday">Thursday</option>
                  <option value="friday">Friday</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8">
              <h2 className="text-headline-md font-bold text-on-surface mb-6">Notification Settings</h2>
              
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-on-surface">Daily Summary</h3>
                    <p className="text-sm text-on-surface-variant mt-1">Get an email each morning with your agenda for the day.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="h-px w-full bg-outline-variant/50" />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-on-surface">Deadline Reminders</h3>
                    <p className="text-sm text-on-surface-variant mt-1">Receive push notifications when a task is due soon.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="h-px w-full bg-outline-variant/50" />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-on-surface">Weekly Insights</h3>
                    <p className="text-sm text-on-surface-variant mt-1">Receive a weekly digest of your productivity analytics.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
