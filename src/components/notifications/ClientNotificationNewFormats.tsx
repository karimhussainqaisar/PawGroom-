import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Volume2, 
  Bot, 
  Hash, 
  Bell, 
  ExternalLink, 
  X, 
  Check, 
  Sparkles,
  Smartphone,
  Play,
  Pause,
  Layers,
  Inbox
} from 'lucide-react';
import { AdminNotification } from '../../types/auth';

export const ClientNotificationNewFormats: React.FC = () => {
  const { clientNotifications, markNotificationAsRead, dismissPopupNotification } = useAuth();
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  if (!clientNotifications || clientNotifications.length === 0) return null;

  // Filter formats
  const emailNotifs = clientNotifications.filter(n => n.type === 'email_digest' && !(n.dismissedBy || []).includes('current'));
  const smsNotifs = clientNotifications.filter(n => n.type === 'sms_text');
  const whatsappNotifs = clientNotifications.filter(n => n.type === 'whatsapp_msg');
  const telegramNotifs = clientNotifications.filter(n => n.type === 'telegram_bot');
  const discordNotifs = clientNotifications.filter(n => n.type === 'discord_webhook');
  const slackNotifs = clientNotifications.filter(n => n.type === 'slack_webhook');
  const voiceNotifs = clientNotifications.filter(n => n.type === 'voice_tts');
  const dockNotifs = clientNotifications.filter(n => n.type === 'floating_dock');
  const teamsNotifs = clientNotifications.filter(n => n.type === 'matrix_teams');
  const fcmNotifs = clientNotifications.filter(n => n.type === 'system_tray_fcm');

  const handleActionClick = (notif: AdminNotification) => {
    markNotificationAsRead(notif.id);
    if (notif.actionUrl) {
      if (notif.actionTarget === '_blank') {
        window.open(notif.actionUrl, '_blank', 'noopener,noreferrer');
      } else {
        const event = new CustomEvent('navigate_screen', { detail: notif.actionUrl });
        window.dispatchEvent(event);
      }
    }
  };

  const handlePlayVoice = (notifId: string, text: string) => {
    if (isPlayingAudio === notifId) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(null);
      return;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(null);
      utterance.onerror = () => setIsPlayingAudio(null);
      setIsPlayingAudio(notifId);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(notifId);
      setTimeout(() => setIsPlayingAudio(null), 4000);
    }
  };

  return (
    <>
      {/* 1. FLOATING DYNAMIC ISLAND / PILL DOCK */}
      {dockNotifs.slice(0, 1).map((notif) => (
        <div 
          key={notif.id}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[92%] sm:w-auto animate-bounce-subtle"
        >
          <div className="bg-slate-900/95 backdrop-blur-xl border border-indigo-500/30 rounded-full py-2.5 px-4 sm:px-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="text-xs font-black text-indigo-400 uppercase tracking-widest shrink-0">
                Dock Island
              </span>
              <p className="text-xs font-semibold text-slate-200 truncate">
                {notif.title}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {notif.actionLabel && (
                <button
                  onClick={() => handleActionClick(notif)}
                  className="px-3 py-1 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
                >
                  {notif.actionLabel}
                </button>
              )}
              <button
                onClick={() => dismissPopupNotification(notif.id)}
                className="w-6 h-6 rounded-full hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* 2. WHATSAPP BUSINESS BUBBLE SIMULATION (Bottom Left) */}
      {whatsappNotifs.slice(0, 1).map((notif) => (
        <div 
          key={notif.id}
          className="fixed bottom-20 left-4 z-45 max-w-sm w-[92%] sm:w-80 bg-[#128C7E] text-white rounded-2xl p-4 shadow-2xl border border-emerald-400/40 animate-slideUp"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center font-black text-xs">
                WA
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Paw Grooming Official</p>
                <span className="text-[9px] text-emerald-100 flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" /> Verified Business Account
                </span>
              </div>
            </div>
            <button 
              onClick={() => dismissPopupNotification(notif.id)}
              className="text-emerald-200 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-[#075E54] p-3 rounded-xl text-xs text-white/95 space-y-2">
            <p className="font-bold text-emerald-200">{notif.title}</p>
            <p className="text-[11px] leading-relaxed">{notif.message}</p>
          </div>
          {notif.actionLabel && (
            <button
              onClick={() => handleActionClick(notif)}
              className="w-full mt-2 py-2 rounded-xl bg-white text-[#075E54] hover:bg-emerald-50 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{notif.actionLabel}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}

      {/* 3. VOICE TTS AUDIO ALERT FLOATING CARD */}
      {voiceNotifs.slice(0, 1).map((notif) => (
        <div 
          key={notif.id}
          className="fixed bottom-20 right-4 z-45 max-w-xs w-full bg-slate-900/95 border border-purple-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-white space-y-3 animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-purple-600 flex items-center justify-center text-white">
                <Volume2 className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-black text-purple-400 uppercase tracking-wide">
                Voice Audio Dispatch
              </span>
            </div>
            <button 
              onClick={() => dismissPopupNotification(notif.id)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white">{notif.title}</h4>
            <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">{notif.message}</p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => handlePlayVoice(notif.id, `${notif.title}. ${notif.message}`)}
              className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {isPlayingAudio === notif.id ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Audio</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Listen Voice Note</span>
                </>
              )}
            </button>
            {notif.actionLabel && (
              <button
                onClick={() => handleActionClick(notif)}
                className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
              >
                {notif.actionLabel}
              </button>
            )}
          </div>
        </div>
      ))}
    </>
  );
};
