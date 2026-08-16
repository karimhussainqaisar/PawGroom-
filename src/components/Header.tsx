import React from 'react';
import { useApp } from '../context/AppContext';
import { Plus, UserPlus, Menu, Search, X, Bell } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, isSidebarOpen = false }) => {
  const { 
    view, 
    setView,
    openModal, 
    searchQuery, 
    setSearchQuery, 
    settings,
    clients 
  } = useApp();

  const healthAlertsCount = React.useMemo(() => {
    const today = new Date(2026, 7, 12);
    return clients.filter((c) => {
      if (!c.rabiesExpiry) return false;
      const exp = new Date(c.rabiesExpiry);
      const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return diff <= 30;
    }).length;
  }, [clients]);

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md transition-all py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Section: Mobile Toggle & Universal Search */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          {/* Mobile Navigation Menu Toggle */}
          <button
            onClick={onMenuClick}
            className={`lg:hidden flex items-center justify-center p-2 rounded-2xl border text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0 ${
              isSidebarOpen 
                ? 'bg-[#240C0B] text-white border-[#240C0B]' 
                : 'bg-white border-[#E6DFD5] text-[#240C0B] hover:bg-[#F1EEE6]'
            }`}
            aria-label={isSidebarOpen ? "Close navigation" : "Open navigation"}
          >
            {isSidebarOpen ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4 text-[#240C0B]" />}
          </button>

          {/* Rounded Search Bar */}
          <div className="relative w-full max-w-xs sm:max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A08E8B]" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-[#E6DFD5] rounded-full focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 outline-none text-[#240C0B] placeholder-[#A08E8B] shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A08E8B] hover:text-[#240C0B]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Notifications Bell & User Badge */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Health / Vaccine Alerts Button */}
          <button
            onClick={() => setView('alerts')}
            className="relative w-9 h-9 rounded-full bg-white border border-[#E6DFD5] flex items-center justify-center text-[#240C0B] hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all cursor-pointer shadow-2xs"
            title={`${healthAlertsCount} Notifications & Alerts`}
          >
            <Bell className="w-4 h-4" />
            {healthAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF6B00] text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                {healthAlertsCount}
              </span>
            )}
          </button>

          {/* User Badge Pill - Shop & Owner Display */}
          <div 
            onClick={() => setView('settings')}
            className="hidden sm:flex items-center gap-2.5 bg-[#FFF8E7] border border-[#FFE7B3] py-1 px-2.5 rounded-full shadow-2xs cursor-pointer hover:border-[#FF6B00] transition-colors"
            title="Open Clinic Settings"
          >
            <img 
              src={settings.photo || "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=120&q=80"} 
              alt={settings.name || "Clinic Profile"} 
              className="w-7 h-7 rounded-full object-cover border border-[#FF6B00]"
            />
            <div className="text-left leading-tight pr-1">
              <span className="text-[9px] text-[#A08E8B] font-bold block uppercase tracking-wider truncate max-w-[120px]">
                {settings.salonName || 'PawBook Studio'}
              </span>
              <span className="text-xs font-extrabold text-[#240C0B] font-display truncate max-w-[120px] block">
                {settings.name || 'PawBook Pro Studio'}
              </span>
            </div>
          </div>

          {/* Book Grooming Primary Button */}
          <button
            onClick={() => openModal('appointmentForm')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FF6B00] hover:bg-[#E55C00] text-white rounded-full text-xs font-bold shadow-md shadow-[#FF6B00]/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Book Grooming</span>
          </button>
        </div>
      </div>
    </header>
  );
};


