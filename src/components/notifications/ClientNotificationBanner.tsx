import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, X, AlertTriangle, Info, Sparkles, Flame, CheckCircle2 } from 'lucide-react';

export const ClientNotificationBanner: React.FC = () => {
  const { activeBannersForCurrentProfile, dismissPopupNotification } = useAuth();

  if (!activeBannersForCurrentProfile || activeBannersForCurrentProfile.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-2 mb-3">
      {activeBannersForCurrentProfile.map((banner) => {
        return (
          <div 
            key={banner.id}
            className="w-full max-w-[1600px] px-4 py-2.5 bg-[#240C0B] text-white rounded-2xl border border-[#FF6B00]/40 shadow-lg flex items-center justify-between gap-3 text-xs animate-fadeIn"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="p-1 rounded-lg bg-[#FF6B00] text-white shrink-0">
                <Bell className="w-3.5 h-3.5" />
              </span>
              <div className="min-w-0 truncate">
                <span className="font-black text-[#FF6B00] mr-2 uppercase tracking-wide text-[10px]">
                  {banner.title}:
                </span>
                <span className="text-[#FAF8F5] text-xs font-medium">
                  {banner.message}
                </span>
              </div>
            </div>

            <button
              onClick={() => dismissPopupNotification(banner.id)}
              className="p-1 rounded-full hover:bg-white/10 text-[#A08E8B] hover:text-white transition-colors cursor-pointer shrink-0"
              title="Dismiss announcement"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
