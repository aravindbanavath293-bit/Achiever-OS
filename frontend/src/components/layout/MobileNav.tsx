import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  X, LayoutDashboard, CheckSquare, Calendar, CalendarDays, ClipboardList, 
  Trophy, StickyNote, BarChart3, Settings, Bot, HelpCircle, LogOut, Sparkles 
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

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { logout } = useAuth();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 md:hidden transition-opacity" 
        onClick={onClose} 
        aria-hidden
      />
      
      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="fixed left-0 top-0 h-full w-72 max-w-[85vw] bg-white dark:bg-slate-900 z-50 md:hidden shadow-xl animate-slide-in-left flex flex-col py-5 px-4 border-r border-slate-200 dark:border-slate-800 rounded-r-3xl"
      >
        <div className="flex items-center justify-between mb-5 px-1">
          <NavLink to="/dashboard" onClick={onClose} className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full overflow-hidden shadow-xs border border-amber-300/70 dark:border-amber-500/40 bg-white dark:bg-slate-800 shrink-0">
              <img 
                src={logoImg} 
                alt="AchieverOS" 
                className="w-full h-full object-cover rounded-full"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight leading-tight">
                AchieverOS
              </span>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                Workspace
              </span>
            </div>
          </NavLink>
          <button 
            type="button"
            onClick={onClose} 
            aria-label="Close navigation menu"
            className="text-slate-500 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        <nav aria-label="Main" className="flex-1 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-violet-50 text-violet-700 font-bold border border-violet-200/70'
                    : 'text-slate-600 font-medium hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full bg-gradient-to-b from-violet-700 to-indigo-500" aria-hidden />}
                  <Icon size={19} className={isActive ? 'text-violet-700' : 'text-slate-500'} aria-hidden />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-3 border-t border-slate-100 space-y-1">
          <NavLink
            to="/ai-assistant"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-violet-50 text-violet-700 border border-violet-200 font-semibold text-[13px] cursor-pointer"
          >
            <Bot size={18} className="text-violet-600" />
            <span className="flex-1">AI Assistant</span>
            <Sparkles size={14} className="text-violet-500" />
          </NavLink>

          <NavLink
            to="/settings"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-[13px] font-medium cursor-pointer"
          >
            <Settings size={18} className="text-slate-400" />
            <span>Settings</span>
          </NavLink>

          <div className="flex items-center justify-between pt-2 px-1">
            <a 
              href="#help" 
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 cursor-pointer"
            >
              <HelpCircle size={14} />
              <span>Help</span>
            </a>
            <button
              onClick={() => { logout(); onClose(); }}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
