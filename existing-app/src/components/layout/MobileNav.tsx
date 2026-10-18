import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Calendar, CalendarDays, Trophy } from 'lucide-react';

export default function MobileNav() {
  const items = [
    { to: '/dashboard', label: 'Dash', icon: LayoutDashboard },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/daily-planner', label: 'Daily', icon: Calendar },
    { to: '/weekly-timetable', label: 'Weekly', icon: CalendarDays },
    { to: '/goals', label: 'Goals', icon: Trophy },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-low border-t border-outline-variant px-4 py-2 flex justify-between z-40 pb-safe">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[64px] ${
              isActive
                ? 'text-primary font-medium'
                : 'text-secondary hover:bg-surface-container-high'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`px-4 py-1 rounded-full ${isActive ? 'bg-primary-fixed' : ''}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-on-primary-fixed' : ''} />
              </div>
              <span className="text-[11px] leading-[16px]">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
