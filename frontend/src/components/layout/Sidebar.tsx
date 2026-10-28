import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Calendar, CalendarDays, ClipboardList,
  Trophy, StickyNote, BarChart3, Settings, Plus, HelpCircle, LogOut, Bot, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/logo.png';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/daily-planner', label: 'Daily Schedule', icon: Calendar },
  { to: '/weekly-timetable', label: 'Weekly Timetable', icon: CalendarDays },
  { to: '/weekly-todo', label: 'Weekly To-Do', icon: ClipboardList },
  { to: '/goals', label: 'Goals', icon: Trophy },
  { to: '/sticky-notes', label: 'Sticky Notes', icon: StickyNote },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];

interface SidebarProps {
  onCreateTask?: () => void;
}

export default function Sidebar({ onCreateTask }: SidebarProps) {
  const { logout } = useAuth();

  return (
    <aside className="hidden md:flex flex-col h-screen w-[210px] fixed left-0 top-0 py-5 px-3.5 bg-white dark:bg-[#13161F] border-r border-slate-200/90 dark:border-slate-800 z-40">
      {/* Brand Header */}
      <Link to="/dashboard" className="flex items-center gap-3 mb-5 px-1.5 group select-none cursor-pointer">
        <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm shadow-indigo-500/20 shrink-0 border border-amber-300/70 dark:border-amber-500/40 bg-white dark:bg-slate-800 flex items-center justify-center transition-transform group-hover:scale-105">
          <img 
            src={logoImg} 
            alt="AchieverOS Logo" 
            className="w-full h-full object-cover rounded-full" 
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
          />
        </div>
        <div className="flex flex-col min-w-max">
          <span className="font-black text-[18px] tracking-tight text-slate-900 dark:text-white leading-tight">
            AchieverOS
          </span>
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-widest uppercase">
            Workspace
          </span>
        </div>
      </Link>

      {/* Create Task CTA — Rose Gold / Copper primary interactive element */}
      <button
        type="button"
        onClick={onCreateTask}
        className="mb-4 w-full gradient-primary hover:gradient-primary-hover text-white py-2.5 px-3 rounded-xl font-bold text-[13px] leading-tight flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/25 hover:shadow-md hover:shadow-indigo-500/35 transition-all cursor-pointer group"
      >
        <Plus size={16} className="text-amber-100 group-hover:rotate-90 transition-transform duration-200" aria-hidden />
        <span>Create New Task</span>
      </button>

      {/* Navigation Links — Deep Purple / Plum & Soft Lilac active states */}
      <nav aria-label="Main" className="flex-1 flex flex-col gap-0.5 overflow-y-auto scrollbar-hide py-1">
        <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Workspace</p>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-colors duration-150 group cursor-pointer ${
                isActive
                  ? 'bg-violet-50 text-violet-700 font-bold border border-violet-200/70'
                  : 'text-slate-600 font-medium hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-gradient-to-b from-violet-700 to-indigo-500" aria-hidden />}
                <Icon 
                  size={18} 
                  className={`transition-colors shrink-0 ${
                    isActive ? 'text-violet-700' : 'text-slate-500 group-hover:text-indigo-600'
                  }`}
                  strokeWidth={isActive ? 2.4 : 1.8} 
                  aria-hidden
                />
                <span className="truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section: AI Assistant & Settings */}
      <div className="mt-auto pt-3 border-t border-slate-200/70 space-y-1">
        <NavLink
          to="/ai-assistant"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-[13px] transition-colors cursor-pointer group border ${
              isActive
                ? 'gradient-plum text-white border-transparent shadow-sm shadow-violet-500/25'
                : 'bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-200/70'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Bot size={18} className={isActive ? 'text-amber-200' : 'text-violet-700'} aria-hidden />
              <span className="truncate flex-1">AI Assistant</span>
              <Sparkles size={13} className={isActive ? 'text-amber-300' : 'text-indigo-500'} aria-hidden />
            </>
          )}
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-colors cursor-pointer border ${
              isActive
                ? 'bg-violet-50 text-violet-700 font-bold border-violet-200/70'
                : 'text-slate-600 font-medium hover:text-slate-900 hover:bg-slate-100/80 border-transparent'
            }`
          }
        >
          <Settings size={17} className="text-slate-500" aria-hidden />
          <span>Settings</span>
        </NavLink>

        <div className="flex items-center justify-between pt-1 px-1">
          <a
            href="#help"
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-600 transition-colors py-1 px-1.5 rounded-lg cursor-pointer"
          >
            <HelpCircle size={14} aria-hidden />
            <span>Help</span>
          </a>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-rose-600 transition-colors py-1 px-1.5 rounded-lg cursor-pointer"
          >
            <LogOut size={14} aria-hidden />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
