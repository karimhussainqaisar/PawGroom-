import React from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, Calendar, Dog, Scissors, Menu, X } from 'lucide-react';
import { ViewMode } from '../types';

interface MobileNavProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { view, setView } = useApp();

  const navItems: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-5 h-5" /> },
    { id: 'clients', label: 'Pets', icon: <Dog className="w-5 h-5" /> },
    { id: 'services', label: 'Services', icon: <Scissors className="w-5 h-5" /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#184540]/95 backdrop-blur-md border-t border-[#235852] text-[#AEC6C0] z-40 flex items-center justify-around px-2 py-2 shadow-2xl">
      {navItems.map((item) => {
        const isActive = view === item.id && !isSidebarOpen;
        return (
          <button
            key={item.id}
            onClick={() => {
              setView(item.id);
              setIsSidebarOpen(false);
            }}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-3 rounded-xl transition-all ${
              isActive
                ? 'text-white bg-[#E8734A] shadow-md'
                : 'hover:text-white hover:bg-white/5'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}

      <button
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-3 rounded-xl transition-all ${
          isSidebarOpen
            ? 'text-white bg-[#CB5A34] shadow-md ring-2 ring-white/30'
            : 'hover:text-white hover:bg-white/5'
        }`}
        aria-label={isSidebarOpen ? "Retract Menu" : "Expand Menu"}
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        <span>{isSidebarOpen ? 'Close' : 'Menu'}</span>
      </button>
    </nav>
  );
};
