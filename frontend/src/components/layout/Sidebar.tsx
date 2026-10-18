import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Calendar, CalendarDays, ClipboardList,
  Trophy, StickyNote, BarChart3, Settings, Plus, HelpCircle, LogOut, Bot
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/daily-planner', label: 'Daily Planner', icon: Calendar },
  { to: '/weekly-timetable', label: 'Weekly Timetable', icon: CalendarDays },
  { to: '/weekly-todo', label: 'Weekly To-Do List', icon: ClipboardList },
  { to: '/goals', label: 'Goals', icon: Trophy },
  { to: '/sticky-notes', label: 'Sticky Notes', icon: StickyNote },
  { to: '/analytics', label: 'Progress & Analytics', icon: BarChart3 },
];

interface SidebarProps {
  onCreateTask?: () => void;
}

export default function Sidebar({ onCreateTask }: SidebarProps) {
  const { logout } = useAuth();

  return (
    <aside className="hidden md:flex flex-col h-screen w-[180px] fixed left-0 top-0 py-6 px-3 bg-white border-r border-outline-variant z-40">
      {/* Brand */}
      <div className="flex items-center gap-2.5 mb-5 px-1.5">
        <img src="/assets/achieveros-logo.png" alt="AchieverOS" className="w-9 h-9 rounded-lg object-contain" 
             onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        <span className="font-bold text-[17px] leading-[24px] tracking-[-0.01em] text-primary">AchieverOS</span>
      </div>

      {/* Create Task CTA */}
      <button
        onClick={onCreateTask}
        className="mb-4 w-full bg-primary text-on-primary py-2 px-3 rounded-lg font-medium text-[13px] leading-[20px] flex items-center justify-center gap-1.5 hover:bg-primary-light transition-colors shadow-sm cursor-pointer"
      >
        <Plus size={16} />
        Create New Task
      </button>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 overflow-y-auto scrollbar-hide">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-2 rounded-lg font-medium text-[13px] leading-[20px] transition-all duration-200 group cursor-pointer ${
                isActive
                  ? 'text-primary font-semibold border-r-[3px] border-primary bg-surface-container-high'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto pt-3 border-t border-outline-variant space-y-0.5">
        <NavLink
          to="/ai-assistant"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-2.5 py-2 rounded-lg font-medium text-[13px] leading-[20px] transition-all duration-200 cursor-pointer ${
              isActive
                ? 'text-primary font-semibold border-r-[3px] border-primary bg-surface-container-high'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`
          }
        >
          <Bot size={18} />
          <span>AI Assistant</span>
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-2.5 py-2 rounded-lg font-medium text-[13px] leading-[20px] transition-all duration-200 cursor-pointer ${
              isActive
                ? 'text-primary font-semibold border-r-[3px] border-primary bg-surface-container-high'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`
          }
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
        <a
          href="#help"
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-on-surface-variant font-medium text-[13px] leading-[20px] hover:bg-surface-container-low transition-all duration-200 cursor-pointer"
        >
          <HelpCircle size={18} />
          <span>Help</span>
        </a>
        <button
          onClick={logout}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-on-surface-variant font-medium text-[13px] leading-[20px] hover:bg-surface-container-low hover:text-danger transition-all duration-200 cursor-pointer w-full text-left"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
