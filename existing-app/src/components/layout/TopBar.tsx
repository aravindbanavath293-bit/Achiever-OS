import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Flame, Settings, User, LogOut, Zap, Trophy, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type ActiveDropdown = 'streak' | 'notifications' | 'profile' | null;

// Sample notification data
const INITIAL_NOTIFICATIONS = [
  { id: '1', text: 'Daily goal streak maintained — 7 days!', time: '2 min ago', read: false },
  { id: '2', text: '"Launch SaaS Product" is 57% complete', time: '1 hour ago', read: false },
  { id: '3', text: 'New milestone added to "Learn React"', time: '3 hours ago', read: false },
  { id: '4', text: 'Weekly review reminder', time: 'Yesterday', read: true },
  { id: '5', text: 'You completed 12 tasks this week!', time: '2 days ago', read: true },
];

// Streak data
const STREAK_DATA = {
  current: 7,
  longest: 14,
  thisWeek: [true, true, true, true, true, false, false] as boolean[], // Mon–Sun
};

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState<ActiveDropdown>(null);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [hasUnread, setHasUnread] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  const toggleDropdown = (dropdown: ActiveDropdown) => {
    if (activeDropdown === dropdown) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(dropdown);
      // Mark notifications as read when opening bell
      if (dropdown === 'notifications' && hasUnread) {
        setHasUnread(false);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    }
  };

  const handleLogout = async () => {
    setActiveDropdown(null);
    await logout();
  };

  return (
    <header className="bg-background dark:bg-surface sticky top-0 z-30 flex justify-between items-center h-16 px-8 border-b border-surface-container-highest md:border-none shadow-sm md:shadow-none">
      {/* Mobile brand */}
      <div className="md:hidden flex items-center gap-2">
        <img src="/logo.png" alt="AchieverOS" className="w-8 h-8 rounded-lg object-contain" />
        <span className="font-bold text-[20px] leading-[28px] text-primary">AchieverOS</span>
      </div>

      {/* Desktop search bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md bg-surface-container rounded-full px-4 py-2 focus-within:ring-2 ring-primary transition-all">
        <Search size={18} className="text-on-surface-variant mr-2" />
        <input
          type="text"
          placeholder="Search tasks, goals, documents..."
          className="bg-transparent border-none outline-none w-full text-[14px] leading-[22px] text-on-surface placeholder:text-outline"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-6" ref={dropdownRef}>

        {/* ── Streak Icon ── */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('streak')}
            className={`relative rounded-full p-1.5 transition-colors cursor-pointer ${
              activeDropdown === 'streak'
                ? 'text-primary bg-primary/10'
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
            }`}
          >
            <Flame size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
          </button>

          {activeDropdown === 'streak' && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              {/* Header */}
              <div className="bg-primary px-5 py-4">
                <div className="flex items-center gap-2 text-on-primary mb-1">
                  <Flame size={18} />
                  <span className="font-bold text-sm uppercase tracking-wider">Daily Streak</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-on-primary">{STREAK_DATA.current}</span>
                  <span className="text-on-primary/70 text-sm font-medium">days</span>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-container rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-on-surface-variant mb-1">
                      <Zap size={14} />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Current</span>
                    </div>
                    <span className="text-xl font-extrabold text-on-surface">{STREAK_DATA.current}</span>
                  </div>
                  <div className="bg-surface-container rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-on-surface-variant mb-1">
                      <Trophy size={14} />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Longest</span>
                    </div>
                    <span className="text-xl font-extrabold text-on-surface">{STREAK_DATA.longest}</span>
                  </div>
                </div>

                {/* Weekly heatmap */}
                <div>
                  <div className="flex items-center gap-1.5 text-on-surface-variant mb-3">
                    <Calendar size={13} />
                    <span className="text-[11px] font-bold uppercase tracking-wider">This Week</span>
                  </div>
                  <div className="flex gap-2 justify-between">
                    {WEEK_LABELS.map((label, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                            STREAK_DATA.thisWeek[i]
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {STREAK_DATA.thisWeek[i] ? '🔥' : ''}
                        </div>
                        <span className="text-[10px] font-bold text-on-surface-variant">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant text-center pt-1">
                  Complete at least 1 task daily to keep your streak!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Notification Bell ── */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('notifications')}
            className={`relative rounded-full p-1.5 transition-colors cursor-pointer ${
              activeDropdown === 'notifications'
                ? 'text-primary bg-primary/10'
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
            }`}
          >
            <Bell size={20} />
            {hasUnread && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            )}
          </button>

          {activeDropdown === 'notifications' && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="px-5 py-3 border-b border-outline-variant flex items-center justify-between">
                <h3 className="font-bold text-sm text-on-surface">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-on-surface-variant text-sm">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-5 py-3 border-b border-outline-variant/30 last:border-b-0 hover:bg-surface-container transition-colors ${
                        !n.read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {!n.read && (
                          <span className="shrink-0 mt-1.5 w-2 h-2 bg-primary rounded-full"></span>
                        )}
                        <div className={!n.read ? '' : 'ml-5'}>
                          <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}>
                            {n.text}
                          </p>
                          <span className="text-[11px] text-outline mt-1 block">{n.time}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-5 py-2.5 border-t border-outline-variant">
                <button className="w-full text-center text-xs font-bold text-primary hover:underline">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Profile Avatar ── */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('profile')}
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border transition-all cursor-pointer ${
              activeDropdown === 'profile'
                ? 'bg-primary text-on-primary border-primary ring-2 ring-primary/30'
                : 'bg-primary-fixed-dim text-on-primary-fixed border-outline-variant hover:ring-2 hover:ring-primary/20'
            }`}
          >
            {user?.name?.charAt(0) || 'A'}
          </button>

          {activeDropdown === 'profile' && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              {/* User info header */}
              <div className="px-5 py-4 border-b border-outline-variant bg-surface-container/50">
                <p className="font-bold text-sm text-on-surface truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-on-surface-variant truncate mt-0.5">{user?.email || 'user@example.com'}</p>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                <button
                  onClick={() => { setActiveDropdown(null); navigate('/settings'); }}
                  className="w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
                >
                  <User size={16} className="text-on-surface-variant" />
                  Profile
                </button>
                <button
                  onClick={() => { setActiveDropdown(null); navigate('/settings'); }}
                  className="w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
                >
                  <Settings size={16} className="text-on-surface-variant" />
                  Settings
                </button>
              </div>

              <div className="border-t border-outline-variant py-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-error hover:bg-error/5 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
