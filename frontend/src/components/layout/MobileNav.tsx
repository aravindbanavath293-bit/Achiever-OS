import { NavLink } from 'react-router-dom';
import { X, LayoutDashboard, CheckSquare, Calendar, CalendarDays, ClipboardList, Trophy, StickyNote, BarChart3, Settings, Bot, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/daily-planner', label: 'Daily Planner', icon: Calendar },
  { to: '/weekly-timetable', label: 'Weekly Timetable', icon: CalendarDays },
  { to: '/weekly-todo', label: 'Weekly To-Do', icon: ClipboardList },
  { to: '/goals', label: 'Goals', icon: Trophy },
  { to: '/sticky-notes', label: 'Sticky Notes', icon: StickyNote },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/ai-assistant', label: 'AI Assistant', icon: Bot },
  { to: '/settings', label: 'Settings', icon: Settings },
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { logout } = useAuth();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-50 md:hidden" onClick={onClose} />
      
      {/* Drawer */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white z-50 md:hidden shadow-lg animate-slide-in-left flex flex-col py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <img src="/assets/achieveros-logo.png" alt="AchieverOS" className="w-8 h-8 rounded-lg object-contain"
                 onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span className="font-bold text-[17px] text-primary">AchieverOS</span>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-[14px] transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-primary font-semibold bg-surface-container-high'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-3 border-t border-outline-variant space-y-0.5">
          <a href="#help" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant font-medium text-[14px] hover:bg-surface-container-low cursor-pointer">
            <HelpCircle size={20} />
            <span>Help</span>
          </a>
          <button
            onClick={() => { logout(); onClose(); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant font-medium text-[14px] hover:bg-surface-container-low hover:text-danger transition-all w-full text-left cursor-pointer"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
