import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { Toast } from './components/Toast';
import { ModalContainer } from './components/modals/ModalContainer';

import { DashboardView } from './components/views/DashboardView';
import { CalendarView } from './components/views/CalendarView';
import { ClientsView } from './components/views/ClientsView';
import { ServicesView } from './components/views/ServicesView';
import { StaffView } from './components/views/StaffView';
import { LoyaltyView } from './components/views/LoyaltyView';
import { AlertsView } from './components/views/AlertsView';
import { RevenueView } from './components/views/RevenueView';
import { BusinessView } from './components/views/BusinessView';
import { GalleryView } from './components/views/GalleryView';
import { SettingsView } from './components/views/SettingsView';

const MainLayout: React.FC = () => {
  const { view, settings } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Apply theme to html root element
  useEffect(() => {
    const themeName = settings.colorTheme || 'terracotta';
    document.documentElement.setAttribute('data-theme', themeName);
  }, [settings.colorTheme]);

  // Retract sidebar on view change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [view]);

  // Retract sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <DashboardView />;
      case 'calendar':
        return <CalendarView />;
      case 'clients':
        return <ClientsView />;
      case 'services':
        return <ServicesView />;
      case 'staff':
        return <StaffView />;
      case 'loyalty':
        return <LoyaltyView />;
      case 'alerts':
        return <AlertsView />;
      case 'revenue':
        return <RevenueView />;
      case 'business':
        return <BusinessView />;
      case 'gallery':
        return <GalleryView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div 
      data-theme={settings.colorTheme || 'terracotta'} 
      className="min-h-screen p-2 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center antialiased selection:bg-[#FF6B00] selection:text-white transition-colors duration-300"
      style={{ backgroundColor: 'var(--studio-canvas, #F8A838)' }}
    >
      {/* Toast Notification Container */}
      <Toast />

      {/* Main Floating Studio Card Frame */}
      <div 
        id="main-app-container"
        className="w-full max-w-[1600px] min-h-[92vh] text-[#240C0B] rounded-[28px] sm:rounded-[36px] shadow-2xl border border-white/40 overflow-hidden flex flex-col md:flex-row relative transition-colors duration-300 print:hidden"
        style={{ backgroundColor: 'var(--app-bg, #FAF8F5)' }}
      >
        {/* Side Navigation Bar */}
        <Sidebar mobileOpen={isSidebarOpen} setMobileOpen={setIsSidebarOpen} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-full pb-20 lg:pb-0 lg:pl-[240px]">
          <Header 
            onMenuClick={() => setIsSidebarOpen((prev) => !prev)} 
            isSidebarOpen={isSidebarOpen}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {renderView()}
          </main>
        </div>

        {/* Mobile & Tablet Quick Bottom Navigation */}
        <MobileNav 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />
      </div>

      {/* Global Modals Container */}
      <ModalContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
