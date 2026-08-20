import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { AdminNotification, NotificationPriority } from '../../types/auth';
import { 
  Bell, 
  X, 
  Sparkles, 
  Flame, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const ClientNotificationPopup: React.FC = () => {
  const { activePopupsForCurrentProfile, dismissPopupNotification } = useAuth();
  const { setView } = useApp();
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  // If no popups active for this client, render nothing
  if (!activePopupsForCurrentProfile || activePopupsForCurrentProfile.length === 0) {
    return null;
  }

  // Show the most recent undismissed popup modal
  const currentPopup: AdminNotification = activePopupsForCurrentProfile[0];

  const handleDismiss = async () => {
    setDismissingId(currentPopup.id);
    await dismissPopupNotification(currentPopup.id);
    setDismissingId(null);
  };

  const handleActionClick = async () => {
    if (currentPopup.actionUrl) {
      if (['dashboard', 'calendar', 'clients', 'services', 'staff', 'loyalty', 'alerts', 'revenue', 'invoices', 'business', 'gallery', 'settings'].includes(currentPopup.actionUrl)) {
        setView(currentPopup.actionUrl as any);
      }
    }
    await handleDismiss();
  };

  const getPriorityTheme = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return {
          icon: <Flame className="w-6 h-6 text-white animate-bounce" />,
          bg: 'bg-red-500',
          badgeBg: 'bg-red-100 text-red-700 border-red-200',
          badgeText: 'URGENT ANNOUNCEMENT',
          buttonBg: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-white" />,
          bg: 'bg-amber-500',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
          badgeText: 'IMPORTANT NOTICE',
          buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white'
        };
      case 'promotion':
        return {
          icon: <Sparkles className="w-6 h-6 text-white" />,
          bg: 'bg-purple-600',
          badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
          badgeText: 'EXCLUSIVE OFFER',
          buttonBg: 'bg-purple-600 hover:bg-purple-700 text-white'
        };
      case 'update':
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-white" />,
          bg: 'bg-emerald-600',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          badgeText: 'FEATURE UPDATE',
          buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white'
        };
      default:
        return {
          icon: <Info className="w-6 h-6 text-white" />,
          bg: 'bg-[#FF6B00]',
          badgeBg: 'bg-orange-100 text-[#FF6B00] border-orange-200',
          badgeText: 'STUDIO ANNOUNCEMENT',
          buttonBg: 'bg-[#FF6B00] hover:bg-[#E55C00] text-white'
        };
    }
  };

  const theme = getPriorityTheme(currentPopup.priority);

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#FAF8F5] text-[#240C0B] rounded-3xl border border-black/10 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-scaleUp relative overflow-hidden my-6">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#FF6B00]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${theme.badgeBg}`}>
            {theme.badgeText}
          </span>

          <button
            onClick={handleDismiss}
            disabled={dismissingId === currentPopup.id}
            className="p-1.5 rounded-full bg-[#E6DFD5]/60 hover:bg-[#E6DFD5] text-[#7A6865] hover:text-[#240C0B] transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Center Content */}
        <div className="text-center pt-1 pb-2">
          <div className={`w-14 h-14 rounded-2xl ${theme.bg} flex items-center justify-center mx-auto mb-4 shadow-lg shadow-black/10`}>
            {theme.icon}
          </div>

          <h3 className="font-display font-black text-xl text-[#240C0B] mb-2.5 px-2">
            {currentPopup.title}
          </h3>

          <div className="text-xs text-[#5C4A47] leading-relaxed max-h-60 overflow-y-auto px-2 py-1 bg-white/70 rounded-2xl border border-[#E6DFD5] whitespace-pre-line text-left">
            {currentPopup.message}
          </div>

          <p className="text-[10px] text-[#A08E8B] mt-2.5">
            Broadcasted by SuperAdmin • {new Date(currentPopup.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="space-y-2 pt-1">
          {currentPopup.actionLabel && (
            <button
              type="button"
              onClick={handleActionClick}
              className={`w-full py-3 px-5 rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 ${theme.buttonBg}`}
            >
              <span>{currentPopup.actionLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={handleDismiss}
            disabled={dismissingId === currentPopup.id}
            className="w-full py-2.5 px-4 bg-[#E6DFD5]/70 hover:bg-[#E6DFD5] text-[#240C0B] font-bold text-xs rounded-2xl transition-colors cursor-pointer"
          >
            {dismissingId === currentPopup.id ? 'Acknowledging...' : 'Acknowledge & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
