import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Menu, 
  Search, 
  X, 
  Bell, 
  LogOut, 
  ShieldCheck, 
  Sparkles, 
  Palette, 
  CalendarDays,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { ClientNotificationDrawer } from './notifications/ClientNotificationDrawer';
import { ColorTheme } from '../types';

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
    updateSettings,
    clients,
    appointments,
    showToast
  } = useApp();

  const { currentProfile, isAdmin, logout, returnToAdmin, unreadNotificationsCount } = useAuth();
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const healthAlertsCount = React.useMemo(() => {
    const today = new Date(2026, 7, 12);
    return clients.filter((c) => {
      if (!c.rabiesExpiry) return false;
      const exp = new Date(c.rabiesExpiry);
      const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return diff <= 30;
    }).length;
  }, [clients]);

  // Today's appointments count
  const todayBookingsCount = React.useMemo(() => {
    const todayStr = '2026-08-12';
    return appointments.filter(a => a.date === todayStr && a.status !== 'cancelled').length;
  }, [appointments]);

  const totalBadges = healthAlertsCount + unreadNotificationsCount;

  const quickThemes: { id: ColorTheme; label: string; color: string }[] = [
    { id: 'terracotta', label: 'Terracotta', color: '#FF6B00' },
    { id: 'emerald', label: 'Emerald', color: '#059669' },
    { id: 'ocean', label: 'Ocean', color: '#2563EB' },
    { id: 'plum', label: 'Plum', color: '#9333EA' },
    { id: 'coral', label: 'Coral', color: '#EA580C' },
    { id: 'slate', label: 'Slate', color: '#D97706' },
    { id: 'nordic', label: 'Nordic', color: '#0D9488' },
    { id: 'lavender', label: 'Lavender', color: '#7C3AED' },
    { id: 'rose', label: 'Rose', color: '#E11D48' },
    { id: 'gold', label: 'Gold', color: '#B45309' },
    { id: 'crimson', label: 'Crimson', color: '#DC2626' },
    { id: 'monochrome', label: 'Obsidian', color: '#18181B' },
  ];

  const handleQuickTheme = (themeId: ColorTheme) => {
    updateSettings({ ...settings, colorTheme: themeId });
    document.documentElement.setAttribute('data-theme', themeId);
    setThemeDropdownOpen(false);
    showToast(`Switched theme to ${themeId.toUpperCase()}`, 'success');
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-[#E6DFD5] transition-all py-2.5 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
          {/* Left Section: Mobile Toggle & Universal Search */}
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            {/* Mobile Navigation Menu Toggle */}
            <button
              onClick={onMenuClick}
              className={`lg:hidden flex items-center justify-center p-2 rounded-2xl border text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0 ${
                isSidebarOpen 
                  ? 'bg-theme-sidebar text-white border-transparent' 
                  : 'bg-white border-[#E6DFD5] text-[#240C0B] hover:bg-[#F1EEE6]'
              }`}
              aria-label={isSidebarOpen ? "Close navigation" : "Open navigation"}
            >
              {isSidebarOpen ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4 text-[#240C0B]" />}
            </button>

            {/* Premium Rounded Search Bar */}
            <div className="relative w-full max-w-xs sm:max-w-sm group">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A08E8B] group-focus-within:text-theme-primary transition-colors" />
              <input
                type="text"
                placeholder="Quick search pets, clients, services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-14 py-2 text-xs bg-white/90 border border-[#E6DFD5] rounded-full focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none text-[#240C0B] placeholder-[#A08E8B] shadow-2xs transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-[#A08E8B] hover:text-[#240C0B] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#FAF8F5] text-[#A08E8B] border border-[#E6DFD5]">
                    ⌘K
                  </span>
                )}
              </div>
            </div>

            {/* Live Studio Status Pill */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-theme-light border border-theme-subtle text-[11px] font-bold text-theme-primary shrink-0 animate-fadeIn">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{todayBookingsCount} Groomings Today</span>
            </div>
          </div>

          {/* Right Section: Theme Selector, Notifications, User Badge & Action */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Theme Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setThemeDropdownOpen(prev => !prev)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white border border-[#E6DFD5] hover:border-theme-primary text-xs font-bold text-[#240C0B] shadow-2xs cursor-pointer transition-all active:scale-95"
                title="Switch Color Theme"
              >
                <Palette className="w-3.5 h-3.5 text-theme-primary" />
                <span className="w-2.5 h-2.5 rounded-full bg-theme-primary shrink-0 shadow-2xs" />
                <span className="hidden md:inline capitalize text-[11px]">
                  {settings.colorTheme || 'Theme'}
                </span>
                <ChevronDown className="w-3 h-3 text-[#A08E8B]" />
              </button>

              {themeDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setThemeDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-white border border-[#E6DFD5] shadow-2xl z-50 animate-scaleUp">
                    <div className="px-2.5 py-1.5 mb-1 border-b border-[#F1EEE6] flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-[#A08E8B] tracking-wider">
                        12 Synchronized Themes
                      </span>
                      <button 
                        onClick={() => {
                          setThemeDropdownOpen(false);
                          setView('settings');
                        }}
                        className="text-[10px] font-bold text-theme-primary hover:underline"
                      >
                        All Themes
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1 max-h-60 overflow-y-auto">
                      {quickThemes.map(t => (
                        <button
                          key={t.id}
                          onClick={() => handleQuickTheme(t.id)}
                          className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                            (settings.colorTheme || 'terracotta') === t.id
                              ? 'bg-theme-light text-theme-primary ring-1 ring-theme-primary/30'
                              : 'hover:bg-[#FAF8F5] text-[#240C0B]'
                          }`}
                        >
                          <span 
                            className="w-3.5 h-3.5 rounded-full shrink-0 border border-white shadow-2xs"
                            style={{ backgroundColor: t.color }}
                          />
                          <span className="truncate text-[11px]">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Admin Preview Return Banner Button */}
            {isAdmin && (
              <button
                onClick={returnToAdmin}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#2E8A81] hover:bg-[#236F68] text-white rounded-full text-[11px] font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
                title="Return to SuperAdmin Control Center"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </button>
            )}

            {/* Interactive Notifications Bell Button with glowing gradient counter */}
            <button
              onClick={() => setNotificationDrawerOpen(true)}
              className="relative w-9 h-9 rounded-full bg-white border border-[#E6DFD5] hover:border-theme-primary flex items-center justify-center text-[#240C0B] hover:text-theme-primary transition-all cursor-pointer shadow-2xs group"
              title={`${totalBadges} Notifications & Broadcasts`}
            >
              <Bell className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {totalBadges > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-theme-primary text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse shadow-md">
                  {totalBadges}
                </span>
              )}
            </button>

            {/* User Badge Pill - Shop & Owner Display */}
            <div 
              onClick={() => setView('settings')}
              className="hidden sm:flex items-center gap-2.5 bg-white border border-[#E6DFD5] hover:border-theme-primary py-1 px-2.5 rounded-full shadow-2xs cursor-pointer transition-all hover:scale-[1.01]"
              title="Open Studio Settings"
            >
              <div className="relative">
                <img 
                  src={settings.photo || "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=120&q=80"} 
                  alt={settings.name || "Clinic Profile"} 
                  className="w-7 h-7 rounded-full object-cover border border-[#E6DFD5]"
                />
                <span className="w-2 h-2 rounded-full bg-emerald-500 border border-white absolute -bottom-0.5 -right-0.5" />
              </div>
              <div className="text-left leading-tight pr-1">
                <span className="text-[9px] text-[#A08E8B] font-bold block uppercase tracking-wider truncate max-w-[110px]">
                  {currentProfile?.businessName || settings.salonName || 'Park Studio'}
                </span>
                <span className="text-xs font-extrabold text-[#240C0B] font-display truncate max-w-[110px] block">
                  {currentProfile?.ownerName || settings.name || 'Master Stylist'}
                </span>
              </div>
            </div>

            {/* Book Grooming Primary Button */}
            <button
              onClick={() => openModal('appointmentForm')}
              className="btn-primary flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Book Grooming</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="w-9 h-9 rounded-full bg-white border border-[#E6DFD5] hover:bg-[#FEF2F2] hover:border-red-300 text-[#7A6865] hover:text-red-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              title="Sign out of Studio"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Push Notification Center */}
      <ClientNotificationDrawer 
        isOpen={notificationDrawerOpen} 
        onClose={() => setNotificationDrawerOpen(false)} 
      />
    </>
  );
};




