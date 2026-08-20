import React, { useState, useEffect } from 'react';
import { ClientProfile, ClientPermissions, ScreenPermissions, FeaturePermissions } from '../../types/auth';
import { 
  DEFAULT_CLIENT_PERMISSIONS, 
  PERMISSION_PRESETS, 
  PermissionPreset,
  ALL_SCREENS,
  ALL_FEATURES,
  FULL_ACCESS_SCREENS,
  FULL_ACCESS_FEATURES
} from '../../data/permissionPresets';
import { 
  Sliders, 
  Shield, 
  X, 
  Check, 
  Lock, 
  Unlock, 
  Sparkles, 
  Calendar, 
  Receipt, 
  Dog, 
  Scissors, 
  UserCheck, 
  Award, 
  AlertTriangle, 
  TrendingUp, 
  Store, 
  Settings, 
  Download, 
  Printer, 
  Trash2, 
  Share2, 
  QrCode, 
  DollarSign, 
  Info,
  Clock,
  Palette,
  Bot,
  FileText
} from 'lucide-react';

interface ClientPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ClientProfile | null;
  onSave: (profileId: string, permissions: ClientPermissions) => Promise<void>;
}

export const ClientPermissionsModal: React.FC<ClientPermissionsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave
}) => {
  const [permissions, setPermissions] = useState<ClientPermissions>(DEFAULT_CLIENT_PERMISSIONS);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'screens' | 'features' | 'trial'>('screens');

  useEffect(() => {
    if (profile) {
      setPermissions({
        isTrialMode: profile.permissions?.isTrialMode ?? false,
        trialTierName: profile.permissions?.trialTierName || (profile.plan ? `${profile.plan} Tier` : 'Standard'),
        trialMessage: profile.permissions?.trialMessage || '',
        screens: {
          ...FULL_ACCESS_SCREENS,
          ...(profile.permissions?.screens || {})
        },
        features: {
          ...FULL_ACCESS_FEATURES,
          ...(profile.permissions?.features || {})
        }
      });
    }
  }, [profile]);

  if (!isOpen || !profile) return null;

  const handleApplyPreset = (preset: PermissionPreset) => {
    setPermissions({
      isTrialMode: preset.isTrial,
      trialTierName: preset.name,
      trialMessage: preset.trialMessage || '',
      screens: { ...FULL_ACCESS_SCREENS, ...preset.screens },
      features: { ...FULL_ACCESS_FEATURES, ...preset.features },
    });
  };

  const handleToggleScreen = (screenKey: keyof ScreenPermissions) => {
    setPermissions(prev => {
      const currentScreens = { ...FULL_ACCESS_SCREENS, ...(prev.screens || {}) };
      const currentVal = currentScreens[screenKey] !== false;
      return {
        ...prev,
        screens: {
          ...currentScreens,
          [screenKey]: !currentVal
        }
      };
    });
  };

  const handleToggleFeature = (featureKey: keyof FeaturePermissions) => {
    setPermissions(prev => {
      const currentFeatures = { ...FULL_ACCESS_FEATURES, ...(prev.features || {}) };
      const currentVal = currentFeatures[featureKey] !== false;
      return {
        ...prev,
        features: {
          ...currentFeatures,
          [featureKey]: !currentVal
        }
      };
    });
  };

  const handleToggleAllScreens = (allow: boolean) => {
    const updatedScreens: ScreenPermissions = {
      dashboard: allow,
      calendar: allow,
      invoices: allow,
      clients: allow,
      services: allow,
      staff: allow,
      loyalty: allow,
      alerts: allow,
      revenue: allow,
      business: allow,
      gallery: allow,
      settings: allow
    };
    setPermissions(prev => ({ ...prev, screens: updatedScreens }));
  };

  const handleToggleAllFeatures = (allow: boolean) => {
    const updatedFeatures: FeaturePermissions = {
      allowBooking: allow,
      allowCheckout: allow,
      allowClientEdit: allow,
      allowPdfExport: allow,
      allowReportExport: allow,
      allowWhatsApp: allow,
      allowLoyalty: allow,
      allowVaccineAlerts: allow,
      allowStaffPayroll: allow,
      allowCustomThemes: allow,
      allowAiAssistant: allow,
    };
    setPermissions(prev => ({ ...prev, features: updatedFeatures }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(profile.profileId, permissions);
      onClose();
    } catch (err) {
      console.error('Failed to update permissions:', err);
      alert('Failed to save permissions. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const screenItems: { key: keyof ScreenPermissions; label: string; desc: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard & Overview', desc: 'Main business metrics and quick actions', icon: <Sliders className="w-4 h-4" /> },
    { key: 'calendar', label: 'Appointments Calendar', desc: 'Bookings, scheduling and time slots', icon: <Calendar className="w-4 h-4" /> },
    { key: 'invoices', label: 'Invoices & Billing', desc: 'Invoices, POS receipts, and QR payments', icon: <Receipt className="w-4 h-4" /> },
    { key: 'clients', label: 'Pet & Client Records', desc: 'Client database, pets and rabies certificates', icon: <Dog className="w-4 h-4" /> },
    { key: 'services', label: 'Grooming Services', desc: 'Service menu, pricing and add-ons', icon: <Scissors className="w-4 h-4" /> },
    { key: 'staff', label: 'Groomers & Staff', desc: 'Staff profiles, schedules and commissions', icon: <UserCheck className="w-4 h-4" /> },
    { key: 'loyalty', label: 'Paws Loyalty & Rewards', desc: 'Points system, stamps and client perks', icon: <Award className="w-4 h-4" /> },
    { key: 'alerts', label: 'Health & Vaccine Alerts', desc: 'Medical alerts and expiration warnings', icon: <AlertTriangle className="w-4 h-4" /> },
    { key: 'revenue', label: 'Revenue & Analytics', desc: 'Financial charts and sales breakdowns', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'business', label: 'Activity & Store', desc: 'Retail store inventory and activity logs', icon: <Store className="w-4 h-4" /> },
    { key: 'gallery', label: 'Transformations Gallery', desc: 'Before/after pet photography showcase', icon: <Sparkles className="w-4 h-4" /> },
    { key: 'settings', label: 'Studio Settings', desc: 'Business profile, themes and configurations', icon: <Settings className="w-4 h-4" /> },
  ];

  const featureItems: { key: keyof FeaturePermissions; label: string; desc: string; icon: React.ReactNode }[] = [
    { key: 'allowBooking', label: 'Appointment Booking', desc: 'Create and edit grooming appointments', icon: <Calendar className="w-4 h-4" /> },
    { key: 'allowCheckout', label: 'Retail & POS Checkout', desc: 'Process invoices and sell retail items', icon: <DollarSign className="w-4 h-4" /> },
    { key: 'allowClientEdit', label: 'Add/Edit Client & Pet CRM', desc: 'Manage pet owner profiles & rabies dates', icon: <Dog className="w-4 h-4" /> },
    { key: 'allowPdfExport', label: 'PDF Invoice Downloads', desc: 'Generate printable receipts and invoices', icon: <Printer className="w-4 h-4" /> },
    { key: 'allowReportExport', label: 'Export Reports & CSV', desc: 'Download revenue and appointment reports', icon: <Download className="w-4 h-4" /> },
    { key: 'allowWhatsApp', label: 'WhatsApp Reminders', desc: 'Automated 1-click WhatsApp client alerts', icon: <Share2 className="w-4 h-4" /> },
    { key: 'allowLoyalty', label: 'Loyalty Points System', desc: 'Award and redeem VIP reward points', icon: <Award className="w-4 h-4" /> },
    { key: 'allowVaccineAlerts', label: 'Vaccine & Health Monitor', desc: '30-day automated rabies expiry warnings', icon: <AlertTriangle className="w-4 h-4" /> },
    { key: 'allowStaffPayroll', label: 'Groomer Commission Calc', desc: 'Calculate staff payouts and commissions', icon: <UserCheck className="w-4 h-4" /> },
    { key: 'allowCustomThemes', label: 'Custom Studio Branding', desc: 'Customize salon colors and styling theme', icon: <Palette className="w-4 h-4" /> },
    { key: 'allowAiAssistant', label: 'AI Grooming Assistant', desc: 'Coat notes & rebooking recommendations', icon: <Bot className="w-4 h-4" /> },
  ];

  const currentScreens = permissions.screens || FULL_ACCESS_SCREENS;
  const currentFeatures = permissions.features || FULL_ACCESS_FEATURES;

  const enabledScreenCount = Object.values(currentScreens).filter(Boolean).length;
  const enabledFeatureCount = Object.values(currentFeatures).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1C0908] text-white rounded-3xl border border-white/20 shadow-2xl max-w-3xl w-full p-6 space-y-5 animate-fadeIn my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg text-white">
                  Client Feature & Screen Access Controls
                </h3>
                {permissions.isTrialMode && (
                  <span className="px-2 py-0.5 rounded-full bg-[#FF6B00]/20 text-[#FF8833] text-[10px] font-black uppercase border border-[#FF6B00]/40">
                    Trial Mode Active
                  </span>
                )}
              </div>
              <p className="text-xs text-[#A08E8B]">
                Configure permissions for <strong className="text-white">{profile.businessName}</strong> ({profile.profileId})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-[#A08E8B] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ready-made Presets Selector */}
        <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#A08E8B] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Quick Permission Presets (Demo / Trial / Tier)</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PERMISSION_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="p-2 text-left bg-white/5 hover:bg-[#FF6B00]/20 hover:border-[#FF6B00]/40 border border-white/5 rounded-xl transition-all cursor-pointer group"
              >
                <p className="text-xs font-bold text-white group-hover:text-[#FF6B00] truncate">
                  {preset.name}
                </p>
                <p className="text-[10px] text-[#A08E8B] truncate">
                  {preset.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('screens')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'screens' 
                ? 'bg-[#FF6B00] text-white shadow-md' 
                : 'text-[#A08E8B] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Screen Access ({enabledScreenCount}/12)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'features' 
                ? 'bg-[#FF6B00] text-white shadow-md' 
                : 'text-[#A08E8B] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Feature Actions ({enabledFeatureCount}/11)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('trial')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'trial' 
                ? 'bg-[#FF6B00] text-white shadow-md' 
                : 'text-[#A08E8B] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Trial & Demo Mode</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* TAB 1: SCREEN PERMISSIONS */}
          {activeTab === 'screens' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-[#A08E8B]">
                  Toggle on/off individual website screens. Locked screens render the upgrade banner and lock state.
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleAllScreens(true)}
                    className="text-[11px] text-[#4ECDC4] hover:underline"
                  >
                    Enable All
                  </button>
                  <span className="text-white/20">|</span>
                  <button
                    type="button"
                    onClick={() => handleToggleAllScreens(false)}
                    className="text-[11px] text-[#C9503A] hover:underline"
                  >
                    Disable All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {screenItems.map((item) => {
                  const isAllowed = currentScreens[item.key] !== false;
                  return (
                    <div
                      key={item.key}
                      onClick={() => handleToggleScreen(item.key)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                        isAllowed 
                          ? 'bg-white/5 border-white/10 hover:border-[#2E8A81]/50' 
                          : 'bg-[#140606] border-white/5 opacity-60 hover:opacity-80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-xl shrink-0 ${
                          isAllowed ? 'bg-[#2E8A81]/20 text-[#4ECDC4]' : 'bg-white/5 text-[#7A6865]'
                        }`}>
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isAllowed ? 'text-white' : 'text-[#7A6865] line-through'}`}>
                            {item.label}
                          </p>
                          <p className="text-[10px] text-[#A08E8B] truncate">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <div className={`w-10 h-6 rounded-full p-1 transition-colors flex items-center shrink-0 ${
                        isAllowed ? 'bg-[#2E8A81] justify-end' : 'bg-white/10 justify-start'
                      }`}>
                        <div className="w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center text-[8px]">
                          {isAllowed ? <Check className="w-2.5 h-2.5 text-[#2E8A81]" /> : <Lock className="w-2.5 h-2.5 text-[#7A6865]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: FEATURE PERMISSIONS */}
          {activeTab === 'features' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-[#A08E8B]">
                  Control specific interactive capabilities like PDF export, reports, WhatsApp notifications, or staff payroll.
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleAllFeatures(true)}
                    className="text-[11px] text-[#4ECDC4] hover:underline"
                  >
                    Enable All
                  </button>
                  <span className="text-white/20">|</span>
                  <button
                    type="button"
                    onClick={() => handleToggleAllFeatures(false)}
                    className="text-[11px] text-[#C9503A] hover:underline"
                  >
                    Disable All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {featureItems.map((item) => {
                  const isAllowed = currentFeatures[item.key] !== false;
                  return (
                    <div
                      key={item.key}
                      onClick={() => handleToggleFeature(item.key)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                        isAllowed 
                          ? 'bg-white/5 border-white/10 hover:border-[#FF6B00]/50' 
                          : 'bg-[#140606] border-white/5 opacity-60 hover:opacity-80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-xl shrink-0 ${
                          isAllowed ? 'bg-[#FF6B00]/20 text-[#FF8833]' : 'bg-white/5 text-[#7A6865]'
                        }`}>
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isAllowed ? 'text-white' : 'text-[#7A6865] line-through'}`}>
                            {item.label}
                          </p>
                          <p className="text-[10px] text-[#A08E8B] truncate">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <div className={`w-10 h-6 rounded-full p-1 transition-colors flex items-center shrink-0 ${
                        isAllowed ? 'bg-[#FF6B00] justify-end' : 'bg-white/10 justify-start'
                      }`}>
                        <div className="w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center text-[8px]">
                          {isAllowed ? <Check className="w-2.5 h-2.5 text-[#FF6B00]" /> : <Lock className="w-2.5 h-2.5 text-[#7A6865]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: TRIAL SETTINGS */}
          {activeTab === 'trial' && (
            <div className="space-y-4 p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Trial / Demo Mode Status</h4>
                  <p className="text-xs text-[#A08E8B]">
                    Flag this client account as a live Trial or Demo. Shows Trial badges and upgrade notices on locked views.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPermissions(prev => ({ ...prev, isTrialMode: !prev.isTrialMode }))}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    permissions.isTrialMode 
                      ? 'bg-[#FF6B00] text-white shadow-md' 
                      : 'bg-white/10 text-[#A08E8B] hover:text-white'
                  }`}
                >
                  {permissions.isTrialMode ? '● Trial Mode ON' : 'Trial Mode OFF'}
                </button>
              </div>

              {permissions.isTrialMode && (
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <div>
                    <label className="text-[11px] font-bold text-[#A08E8B] uppercase tracking-wider block mb-1">
                      Trial Tier Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 14-Day Free Trial, Web Demo, Front-Desk Evaluation"
                      value={permissions.trialTierName || ''}
                      onChange={(e) => setPermissions(prev => ({ ...prev, trialTierName: e.target.value }))}
                      className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#7A6865] focus:border-[#FF6B00] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#A08E8B] uppercase tracking-wider block mb-1">
                      Custom Upgrade Lock Notice
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. This screen is locked in the 14-day web trial. Contact sales@parkgrooming.com to unlock full access."
                      value={permissions.trialMessage || ''}
                      onChange={(e) => setPermissions(prev => ({ ...prev, trialMessage: e.target.value }))}
                      className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#7A6865] focus:border-[#FF6B00] outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#A08E8B]">
            <Info className="w-4 h-4 text-[#4ECDC4]" />
            <span>Changes persist immediately to client's live session in Firestore.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#A08E8B] hover:text-white bg-white/5 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black bg-[#FF6B00] hover:bg-[#E55C00] text-white shadow-lg shadow-[#FF6B00]/30 active:scale-95 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Saving Permissions...' : 'Save & Enforce Permissions'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
