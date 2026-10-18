import { useState } from 'react';
import { Search, Bell, Bot, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  onMenuClick?: () => void;
  onSearch?: (query: string) => void;
}

export default function TopBar({ onMenuClick, onSearch }: TopBarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header className="bg-background sticky top-0 z-30 flex justify-between items-center h-14 px-4 md:px-6 border-b border-surface-container-highest md:border-none">
      {/* Mobile menu + brand */}
      <div className="md:hidden flex items-center gap-2">
        <button 
          onClick={onMenuClick}
          className="text-primary hover:text-primary-light transition-colors focus:ring-2 ring-primary outline-none rounded p-1 cursor-pointer"
        >
          <Menu size={22} />
        </button>
        <span className="font-bold text-[17px] text-primary">AchieverOS</span>
      </div>

      {/* Search bar (desktop) */}
      <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md bg-surface-container rounded-full px-3.5 py-1.5 focus-within:ring-2 ring-primary transition-all">
        <Search size={16} className="text-on-surface-variant mr-2 shrink-0" />
        <input
          className="bg-transparent border-none outline-none w-full text-body-md text-on-surface placeholder:text-outline"
          placeholder="Search tasks, goals, documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/ai-assistant')}
          className="text-on-surface-variant hover:text-primary transition-colors focus:ring-2 ring-primary outline-none rounded-full p-1 relative cursor-pointer"
          title="AI Assistant"
        >
          <Bot size={20} />
        </button>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="text-on-surface-variant hover:text-primary transition-colors focus:ring-2 ring-primary outline-none rounded-full p-1 relative cursor-pointer"
          title="Notifications"
        >
          <Bell size={20} />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-primary rounded-full" />
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="focus:ring-2 ring-primary outline-none rounded-full cursor-pointer"
          title="Profile"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-[13px] font-semibold border border-outline-variant">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
        </button>
      </div>
    </header>
  );
}
