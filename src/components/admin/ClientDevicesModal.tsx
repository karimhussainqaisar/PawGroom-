import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClientProfile, ClientDeviceSession } from '../../types/auth';
import { 
  Laptop, 
  Smartphone, 
  Tablet, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Power, 
  Ban, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Globe, 
  LogOut, 
  X, 
  Check, 
  RefreshCw,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface ClientDevicesModalProps {
  isOpen: boolean;
  profile: ClientProfile | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const ClientDevicesModal: React.FC<ClientDevicesModalProps> = ({
  isOpen,
  profile,
  onClose,
  onSuccess
}) => {
  const { 
    logoutClientFromAdmin, 
    terminateDeviceSession, 
    toggleBanDevice, 
    toggleEnforceSingleDevice,
    authDatabase
  } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !profile) return null;

  // Retrieve freshest profile data from authDatabase
  const freshProfile = authDatabase.profiles.find(p => p.profileId === profile.profileId) || profile;
  const sessions: ClientDeviceSession[] = Array.isArray(freshProfile.activeSessions) ? freshProfile.activeSessions : [];
  const bannedList: string[] = Array.isArray(freshProfile.bannedDevices) ? freshProfile.bannedDevices : [];
  const activeSessionsCount = sessions.filter(s => s.status === 'active').length;

  const handleRemoteLogoutAll = async () => {
    if (confirm(`Terminate all active login sessions and log out ${freshProfile.businessName} across all devices?`)) {
      setIsProcessing(true);
      try {
        await logoutClientFromAdmin(freshProfile.profileId);
        onSuccess(`Logged out client ${freshProfile.businessName} from all devices.`);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleTerminateSession = async (sessionId: string, deviceName: string) => {
    setIsProcessing(true);
    try {
      await terminateDeviceSession(freshProfile.profileId, sessionId);
      onSuccess(`Terminated session on ${deviceName}.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleBan = async (deviceId: string, isCurrentlyBanned: boolean) => {
    const action = isCurrentlyBanned ? 'unban' : 'ban and restrict';
    if (confirm(`Are you sure you want to ${action} this device ID (${deviceId})?`)) {
      setIsProcessing(true);
      try {
        await toggleBanDevice(freshProfile.profileId, deviceId);
        onSuccess(isCurrentlyBanned ? `Device unbanned.` : `Device credential banned and session terminated.`);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleToggleSingleDevice = async () => {
    setIsProcessing(true);
    try {
      await toggleEnforceSingleDevice(freshProfile.profileId);
      onSuccess(
        freshProfile.enforceSingleDeviceLogin 
          ? `Single-Device Restriction Disabled.` 
          : `Single-Device Restriction Activated! Only 1 device can remain active at a time.`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-5 h-5 text-indigo-400" />;
      case 'tablet': return <Tablet className="w-5 h-5 text-cyan-400" />;
      default: return <Laptop className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 text-white rounded-3xl border border-slate-700/80 shadow-2xl max-w-2xl w-full p-6 space-y-6 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg text-white">
                  Device Logins & Session Security
                </h3>
                {freshProfile.isCurrentlyLoggedIn ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE ONLINE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    OFFLINE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Client: <strong className="text-white">{freshProfile.businessName}</strong> ({freshProfile.profileId}) • {freshProfile.ownerName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats & Security Policies */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
          {/* Enforce Single Device Toggle */}
          <div className={`p-4 rounded-2xl border transition-all ${
            freshProfile.enforceSingleDeviceLogin 
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-200' 
              : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Single-Device Strict Mode
              </span>
              <button
                type="button"
                onClick={handleToggleSingleDevice}
                disabled={isProcessing}
                className="text-xl hover:opacity-80 transition-opacity cursor-pointer"
              >
                {freshProfile.enforceSingleDeviceLogin ? (
                  <ToggleRight className="w-8 h-8 text-amber-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-500" />
                )}
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              {freshProfile.enforceSingleDeviceLogin 
                ? 'Active: If this client logs in on another device, all previous device sessions are automatically terminated.' 
                : 'Disabled: Multi-device concurrent logins allowed.'}
            </p>
          </div>

          {/* Active Devices Overview & Remote Logout */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Device Sessions</span>
                <p className="text-xl font-display font-black text-white">
                  {activeSessionsCount} <span className="text-xs font-normal text-slate-400">of {sessions.length} recorded</span>
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                activeSessionsCount > 1 && !freshProfile.enforceSingleDeviceLogin
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-indigo-500/20 text-indigo-300'
              }`}>
                {activeSessionsCount > 1 ? 'Multiple Devices' : 'Single Session'}
              </span>
            </div>

            <button
              onClick={handleRemoteLogoutAll}
              disabled={isProcessing || activeSessionsCount === 0}
              className="w-full py-2 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Remote Logout All Devices</span>
            </button>
          </div>
        </div>

        {/* Device Sessions List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Registered Devices & Login History ({sessions.length})
          </h4>

          {sessions.length === 0 ? (
            <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-slate-800">
              <Laptop className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">
                No device login sessions recorded yet. Device metadata will be registered automatically upon client sign-in.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {sessions.map((sess) => {
                const isBanned = bannedList.includes(sess.deviceId);
                const isActive = sess.status === 'active' && !isBanned;

                return (
                  <div 
                    key={sess.sessionId}
                    className={`p-4 rounded-2xl border transition-all ${
                      isActive 
                        ? 'bg-slate-800/90 border-slate-700 hover:border-indigo-500/40' 
                        : isBanned 
                          ? 'bg-red-950/20 border-red-800/40' 
                          : 'bg-slate-800/30 border-slate-800/60 opacity-70'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`p-2.5 rounded-xl border shrink-0 ${
                          isActive 
                            ? 'bg-indigo-500/20 border-indigo-500/30' 
                            : isBanned 
                              ? 'bg-red-500/20 border-red-500/30 text-red-400'
                              : 'bg-slate-800 border-slate-700 text-slate-500'
                        }`}>
                          {getDeviceIcon(sess.deviceType)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="text-sm font-bold text-white truncate">
                              {sess.deviceName}
                            </h5>
                            {isActive && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                ACTIVE NOW
                              </span>
                            )}
                            {isBanned && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-red-500/20 text-red-400 border border-red-500/30">
                                <Ban className="w-2.5 h-2.5" />
                                CREDENTIAL BANNED
                              </span>
                            )}
                            {sess.status === 'terminated' && !isBanned && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                Session Ended
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3 text-slate-500" />
                              {sess.browser} • {sess.os}
                            </span>
                            {sess.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-500" />
                                {sess.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              Login: {new Date(sess.loginAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
                            Device ID: {sess.deviceId}
                          </div>
                        </div>
                      </div>

                      {/* Device Row Control Actions */}
                      <div className="flex items-center gap-2 shrink-0 sm:self-center">
                        {isActive && (
                          <button
                            type="button"
                            onClick={() => handleTerminateSession(sess.sessionId, sess.deviceName)}
                            disabled={isProcessing}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                            title="End active session on this device"
                          >
                            <LogOut className="w-3.5 h-3.5 inline mr-1" />
                            Log Out Device
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleToggleBan(sess.deviceId, isBanned)}
                          disabled={isProcessing}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            isBanned 
                              ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40' 
                              : 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/40'
                          }`}
                          title={isBanned ? "Unban device credential" : "Ban device credential"}
                        >
                          {isBanned ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                              Unban Device
                            </>
                          ) : (
                            <>
                              <Ban className="w-3.5 h-3.5 inline mr-1" />
                              Ban Device
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Universal Cloud Firestore Device Authorization</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Done & Close
          </button>
        </div>

      </div>
    </div>
  );
};
