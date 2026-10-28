import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Bell, Bot, Menu, Sparkles, Sun, Moon, Flame, AlertTriangle, Target, CalendarCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useAppData } from '../../context/AppDataContext';
import { useNavigate } from 'react-router-dom';
import { isTaskToday, isOverdue } from '../../utils/dateUtils';
import logoImg from '../../assets/logo.png';

interface TopBarProps {
  onMenuClick?: () => void;
  onSearch?: (query: string) => void;
}

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  icon: typeof Bell;
  tone: string;
  to: string;
}

export default function TopBar({ onMenuClick, onSearch }: TopBarProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { tasks, goals, streak } = useAppData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  // Notifications derived from the user's real data
  const notifications = useMemo<NotificationItem[]>(() => {
    const items: NotificationItem[] = [];
    const open = tasks.filter(t => t.status !== 'completed');
    const overdue = open.filter(t => isOverdue(t.due_date)).length;
    const dueToday = open.filter(t => isTaskToday(t.due_date)).length;

    if (overdue > 0) {
      items.push({ id: 'overdue', title: `${overdue} overdue task${overdue === 1 ? '' : 's'}`, body: 'Reschedule or complete them to stay on track.', icon: AlertTriangle, tone: 'bg-rose-50 text-rose-600', to: '/tasks' });
    }
    if (dueToday > 0) {
      items.push({ id: 'today', title: `${dueToday} task${dueToday === 1 ? '' : 's'} due today`, body: 'Review your focus list on the dashboard.', icon: CalendarCheck, tone: 'bg-indigo-50 text-indigo-600', to: '/dashboard' });
    }
    if (streak.current_streak > 0) {
      items.push({ id: 'streak', title: `${streak.current_streak}-day streak`, body: 'Complete a task today to keep it going.', icon: Flame, tone: 'bg-amber-50 text-amber-600', to: '/analytics' });
    }
    goals
      .filter(g => g.status === 'in-progress' && g.milestones.length > 0)
      .map(g => ({ g, pct: Math.round((g.milestones.filter(m => m.completed).length / g.milestones.length) * 100) }))
      .filter(({ pct }) => pct >= 75 && pct < 100)
      .slice(0, 2)
      .forEach(({ g, pct }) => {
        items.push({ id: `goal-${g.id}`, title: g.title, body: `${pct}% of milestones complete.`, icon: Target, tone: 'bg-violet-50 text-violet-600', to: '/goals' });
      });
    return items;
  }, [tasks, goals, streak]);

  // Close the popover on outside click / Escape
  useEffect(() => {
    if (!showNotifications) return;
    const onClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowNotifications(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [showNotifications]);

  return (
    <header className="glass-header sticky top-0 z-30 flex justify-between items-center gap-3 h-16 px-4 md:px-7 border-b border-slate-200/80 dark:border-slate-800">
      {/* Mobile menu + brand */}
      <div className="md:hidden flex items-center gap-2">
        <button 
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Menu size={22} aria-hidden />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden shadow-2xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
            <img src={logoImg} alt="AchieverOS" className="w-full h-full object-cover rounded-full" />
          </div>
          <span className="font-black text-[17px] text-slate-900 dark:text-white tracking-tight">AchieverOS</span>
        </div>
      </div>

      {/* Search bar (desktop) */}
      <form 
        onSubmit={handleSearch} 
        role="search"
        className="hidden md:flex items-center flex-1 max-w-md bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 focus-within:border-indigo-500 focus-within:ring-3 focus-within:ring-indigo-100 transition-[border-color,box-shadow]"
      >
        <Search size={16} className="text-slate-400 mr-2.5 shrink-0" aria-hidden />
        <label htmlFor="global-search" className="sr-only">Search tasks</label>
        <input
          id="global-search"
          type="search"
          className="bg-transparent border-none outline-none w-full text-sm text-slate-800 placeholder:text-slate-400"
          placeholder="Search tasks, goals, timetable, notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery ? (
          <button 
            type="button" 
            onClick={() => setSearchQuery('')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 ml-1 px-1.5 rounded cursor-pointer"
          >
            Clear
          </button>
        ) : (
          <kbd className="hidden lg:inline text-[10px] font-semibold text-slate-400 border border-slate-200 rounded-md px-1.5 py-0.5">Enter</kbd>
        )}
      </form>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Quick AI Agent launcher */}
        <button
          type="button"
          onClick={() => navigate('/ai-assistant')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200/70 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Sparkles size={14} className="text-violet-600" aria-hidden />
          <span>Ask AI</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/ai-assistant')}
          className="sm:hidden text-slate-600 hover:text-indigo-600 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Open AI Assistant"
        >
          <Bot size={20} aria-hidden />
        </button>

        {/* Theme Mode Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="text-slate-600 hover:text-indigo-600 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun size={19} className="text-amber-400" aria-hidden />
          ) : (
            <Moon size={19} aria-hidden />
          )}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-slate-600 hover:text-indigo-600 p-2 rounded-xl hover:bg-slate-100 transition-colors relative cursor-pointer"
            aria-label={notifications.length > 0 ? `Notifications, ${notifications.length} items` : 'Notifications'}
            aria-expanded={showNotifications}
            aria-haspopup="true"
          >
            <Bell size={19} aria-hidden />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" aria-hidden />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-scale-in" role="region" aria-label="Notifications">
              <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                <span className="text-xs font-bold text-slate-800">Notifications</span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">{notifications.length}</span>
              </div>
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">You're all caught up.</p>
              ) : (
                <ul className="space-y-1">
                  {notifications.map(n => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => { setShowNotifications(false); navigate(n.to); }}
                        className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.tone}`}>
                          <n.icon size={15} aria-hidden />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs font-bold text-slate-800 truncate">{n.title}</span>
                          <span className="block text-[11px] text-slate-500 mt-0.5">{n.body}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 p-1 lg:pr-2.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Profile and settings"
        >
          <span className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-[13px] font-bold" aria-hidden>
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </span>
          <span className="hidden lg:inline text-xs font-semibold text-slate-700">
            {user?.name?.split(' ')[0] || 'Account'}
          </span>
        </button>
      </div>
    </header>
  );
}
