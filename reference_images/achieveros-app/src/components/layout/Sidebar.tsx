import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Calendar, CalendarDays, ClipboardList,
  Trophy, StickyNote, BarChart3, Settings, Plus, HelpCircle, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/logo.png';

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
    <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 py-8 px-4 bg-surface-container-low dark:bg-surface-container-lowest border-r border-outline-variant z-40">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-6 px-2">
        <img src={logoImg} alt="AchieverOS" className="w-10 h-10 rounded-lg object-contain" />
        <span className="font-bold text-[20px] leading-[28px] tracking-[-0.01em] text-primary">AchieverOS</span>
      </div>

      {/* Create Task CTA */}
      <button
        onClick={onCreateTask}
        className="mb-6 w-full bg-primary text-on-primary py-2 px-4 rounded-lg font-medium text-[16px] leading-[24px] flex items-center justify-center gap-2 hover:bg-surface-tint transition-colors shadow-sm cursor-pointer"
      >
        <Plus size={18} />
        Create New Task
      </button>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto scrollbar-hide">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-[16px] leading-[24px] transition-all duration-200 group cursor-pointer ${
                isActive
                  ? 'text-primary font-bold border-r-2 border-primary bg-surface-container'
                  : 'text-secondary hover:bg-surface-container-high'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto pt-4 border-t border-outline-variant space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-[16px] leading-[24px] transition-all duration-200 cursor-pointer ${
              isActive
                ? 'text-primary font-bold border-r-2 border-primary bg-surface-container-high'
                : 'text-secondary hover:bg-surface-container-high'
            }`
          }
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
        <a
          href="mailto:support@achieveros.com"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary font-medium text-[16px] leading-[24px] hover:bg-surface-container-high transition-all duration-200 cursor-pointer"
        >
          <HelpCircle size={20} />
          <span>Help</span>
        </a>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary font-medium text-[16px] leading-[24px] hover:bg-surface-container-high hover:text-error transition-all duration-200 cursor-pointer w-full text-left"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
