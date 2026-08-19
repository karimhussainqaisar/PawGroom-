import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClientProfile, SubscriptionPlan, AccountStatus } from '../../types/auth';
import { generateNextProfileId, generateSuggestedPassword } from '../../data/initialAuthData';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  Key, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  LogOut, 
  DollarSign, 
  Layers, 
  RefreshCw, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight, 
  Store, 
  Sliders, 
  Moon, 
  Sun,
  Lock,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  FileText
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    authDatabase, 
    logout, 
    createClientProfile, 
    updateClientProfile, 
    toggleProfileStatus, 
    deleteClientProfile, 
    impersonateClient,
    resetAuthDatabase
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'profiles' | 'plans' | 'logs' | 'settings'>('profiles');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | SubscriptionPlan>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ClientProfile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Stats computation
  const today = new Date().toISOString().split('T')[0];

  const stats = useMemo(() => {
    const total = authDatabase.profiles.length;
    const active = authDatabase.profiles.filter(p => p.status === 'active').length;
    const inactive = authDatabase.profiles.filter(p => p.status === 'inactive').length;
    const expired = authDatabase.profiles.filter(p => p.expiryDate < today).length;
    
    // Estimate MRR ($49 Starter, $99 Pro, $189 Premium, $349 Enterprise)
    const mrr = authDatabase.profiles.reduce((acc, p) => {
      if (p.status !== 'active') return acc;
      switch (p.plan) {
        case 'Starter': return acc + 49;
        case 'Pro': return acc + 99;
        case 'Premium': return acc + 189;
        case 'Enterprise': return acc + 349;
        default: return acc + 99;
      }
    }, 0);

    return { total, active, inactive, expired, mrr };
  }, [authDatabase.profiles, today]);

  // Filtered Profiles
  const filteredProfiles = useMemo(() => {
    return authDatabase.profiles.filter(p => {
      const matchSearch = 
        p.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.profileId.toLowerCase().includes(searchTerm.toLowerCase());

      const isExpired = p.expiryDate < today;
      let matchStatus = true;
      if (statusFilter === 'active') matchStatus = p.status === 'active';
      if (statusFilter === 'inactive') matchStatus = p.status === 'inactive';
      if (statusFilter === 'expired') matchStatus = isExpired;

      let matchPlan = true;
      if (planFilter !== 'all') matchPlan = p.plan === planFilter;

      return matchSearch && matchStatus && matchPlan;
    });
  }, [authDatabase.profiles, searchTerm, statusFilter, planFilter, today]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(`Copied ${text} to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleStatus = async (profile: ClientProfile) => {
    await toggleProfileStatus(profile.profileId);
    showToast(`Profile ${profile.profileId} (${profile.businessName}) status updated.`);
  };

  const handleDeleteProfile = async (profile: ClientProfile) => {
    if (confirm(`Are you sure you want to permanently delete profile "${profile.businessName}" (${profile.profileId})?`)) {
      await deleteClientProfile(profile.profileId);
      showToast(`Deleted ${profile.businessName} successfully.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0505] text-[#FAF8F5] flex flex-col antialiased selection:bg-[#FF6B00] selection:text-white">
      {/* Toast Bar */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#240C0B] border border-[#FF6B00] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[#FF6B00]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Navbar */}
      <header className="sticky top-0 z-30 bg-[#1C0908]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2E8A81] to-[#4ECDC4] flex items-center justify-center text-white shadow-md shadow-[#2E8A81]/30">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-base text-white tracking-wide">
                Park Grooming SaaS
              </h1>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-[#2E8A81] text-white">
                Admin Console
              </span>
            </div>
            <p className="text-[11px] text-[#A08E8B]">
              Multi-Client Profile & Authentication Manager
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Create Account Button */}
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FF6B00] hover:bg-[#E55C00] text-white rounded-xl text-xs font-bold shadow-md shadow-[#FF6B00]/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Client</span>
          </button>

          {/* Admin Profile Pill & Logout */}
          <div className="flex items-center gap-2 pl-3 border-l border-white/10">
            <div className="hidden sm:block text-right text-xs leading-tight">
              <span className="font-bold text-white block">{authDatabase.admin.name}</span>
              <span className="text-[10px] text-[#A08E8B] font-mono">{authDatabase.admin.email}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-[#A08E8B] hover:text-white transition-colors cursor-pointer"
              title="Logout from Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Total Profiles */}
          <div className="p-4 rounded-2xl bg-[#1C0908] border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#A08E8B] uppercase tracking-wider">Total Clients</p>
              <p className="text-2xl font-black text-white font-display mt-0.5">{stats.total}</p>
              <p className="text-[10px] text-[#2E8A81] mt-0.5">Registered Studios</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 text-[#FFA052]">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Active Accounts */}
          <div className="p-4 rounded-2xl bg-[#1C0908] border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#A08E8B] uppercase tracking-wider">Active Studios</p>
              <p className="text-2xl font-black text-[#2E8A81] font-display mt-0.5">{stats.active}</p>
              <p className="text-[10px] text-[#A08E8B] mt-0.5">{Math.round((stats.active / (stats.total || 1)) * 100)}% active rate</p>
            </div>
            <div className="p-3 rounded-xl bg-[#2E8A81]/15 text-[#2E8A81]">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Inactive Accounts */}
          <div className="p-4 rounded-2xl bg-[#1C0908] border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#A08E8B] uppercase tracking-wider">Inactive Accounts</p>
              <p className="text-2xl font-black text-[#C9503A] font-display mt-0.5">{stats.inactive}</p>
              <p className="text-[10px] text-[#A08E8B] mt-0.5">Access locked</p>
            </div>
            <div className="p-3 rounded-xl bg-[#C9503A]/15 text-[#C9503A]">
              <UserX className="w-5 h-5" />
            </div>
          </div>

          {/* Expired / Due Soon */}
          <div className="p-4 rounded-2xl bg-[#1C0908] border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#A08E8B] uppercase tracking-wider">Expired Passes</p>
              <p className="text-2xl font-black text-[#FFB703] font-display mt-0.5">{stats.expired}</p>
              <p className="text-[10px] text-[#A08E8B] mt-0.5">Needs renewal</p>
            </div>
            <div className="p-3 rounded-xl bg-[#FFB703]/15 text-[#FFB703]">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* Estimated MRR */}
          <div className="p-4 rounded-2xl bg-[#1C0908] border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#A08E8B] uppercase tracking-wider">Est. Monthly Rev</p>
              <p className="text-2xl font-black text-white font-display mt-0.5">${stats.mrr}</p>
              <p className="text-[10px] text-[#2E8A81] mt-0.5">Active tiers total</p>
            </div>
            <div className="p-3 rounded-xl bg-[#FF6B00]/15 text-[#FF6B00]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Navigation & Search Bar */}
        <div className="bg-[#1C0908] p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profiles')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'profiles' 
                  ? 'bg-[#FF6B00] text-white shadow-sm' 
                  : 'text-[#A08E8B] hover:bg-white/5 hover:text-white'
              }`}
            >
              Client Accounts ({authDatabase.profiles.length})
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'plans' 
                  ? 'bg-[#FF6B00] text-white shadow-sm' 
                  : 'text-[#A08E8B] hover:bg-white/5 hover:text-white'
              }`}
            >
              Subscription Tiers
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'settings' 
                  ? 'bg-[#FF6B00] text-white shadow-sm' 
                  : 'text-[#A08E8B] hover:bg-white/5 hover:text-white'
              }`}
            >
              System & Database
            </button>
          </div>

          {/* Search & Quick Filters */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-[#A08E8B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search studio, owner, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#7A6865] focus:border-[#FF6B00] outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 text-white text-xs rounded-xl px-2.5 py-1.5 outline-none font-bold"
            >
              <option value="all" className="bg-[#1C0908]">All Statuses</option>
              <option value="active" className="bg-[#1C0908]">Active Only</option>
              <option value="inactive" className="bg-[#1C0908]">Inactive Only</option>
              <option value="expired" className="bg-[#1C0908]">Expired</option>
            </select>

            {/* Plan Filter */}
            <select
              value={planFilter}
              onChange={(e: any) => setPlanFilter(e.target.value)}
              className="bg-white/5 border border-white/10 text-white text-xs rounded-xl px-2.5 py-1.5 outline-none font-bold"
            >
              <option value="all" className="bg-[#1C0908]">All Plans</option>
              <option value="Starter" className="bg-[#1C0908]">Starter ($49)</option>
              <option value="Pro" className="bg-[#1C0908]">Pro ($99)</option>
              <option value="Premium" className="bg-[#1C0908]">Premium ($189)</option>
              <option value="Enterprise" className="bg-[#1C0908]">Enterprise ($349)</option>
            </select>
          </div>
        </div>

        {/* Tab 1: Client Profiles Table */}
        {activeTab === 'profiles' && (
          <div className="bg-[#1C0908] rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-[#A08E8B] font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Profile ID</th>
                    <th className="py-3.5 px-4">Business & Owner</th>
                    <th className="py-3.5 px-4">Credentials & Contact</th>
                    <th className="py-3.5 px-4">Subscription Plan</th>
                    <th className="py-3.5 px-4">Expiry Date</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white">
                  {filteredProfiles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#7A6865]">
                        <Store className="w-10 h-10 mx-auto text-[#7A6865]/40 mb-2" />
                        <p className="font-bold text-sm">No client profiles found</p>
                        <p className="text-xs text-[#7A6865] mt-1">Try adjusting your filters or create a new client account.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProfiles.map((p) => {
                      const isActive = p.status === 'active';
                      const isExpired = p.expiryDate < today;

                      return (
                        <tr key={p.profileId} className="hover:bg-white/[0.02] transition-colors">
                          {/* Profile ID */}
                          <td className="py-3.5 px-4 font-mono font-bold text-[#FF6B00]">
                            <div className="flex items-center gap-1.5">
                              <span>{p.profileId}</span>
                              <button
                                onClick={() => handleCopy(p.profileId, `id_${p.profileId}`)}
                                className="text-[#A08E8B] hover:text-white p-1 rounded"
                                title="Copy ID"
                              >
                                {copiedId === `id_${p.profileId}` ? <Check className="w-3 h-3 text-[#2E8A81]" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </td>

                          {/* Business & Owner */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white text-sm">
                              {p.businessName}
                            </div>
                            <div className="text-[11px] text-[#A08E8B]">
                              Owner: {p.ownerName}
                            </div>
                          </td>

                          {/* Credentials & Contact */}
                          <td className="py-3.5 px-4 space-y-0.5">
                            <div className="flex items-center gap-1.5 font-mono text-[#E6DFD5]">
                              <Mail className="w-3 h-3 text-[#FF6B00]" />
                              <span>{p.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-[#A08E8B] font-mono">
                              <Lock className="w-3 h-3 text-[#2E8A81]" />
                              <span>{p.password}</span>
                            </div>
                            {p.phoneNumber && (
                              <div className="text-[10px] text-[#7A6865]">
                                Tel: {p.phoneNumber}
                              </div>
                            )}
                          </td>

                          {/* Subscription Plan */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              p.plan === 'Enterprise' ? 'bg-[#8B6D9C]/20 text-[#C49BDB] border border-[#8B6D9C]/40' :
                              p.plan === 'Premium' ? 'bg-[#FF6B00]/20 text-[#FF8E3C] border border-[#FF6B00]/40' :
                              p.plan === 'Pro' ? 'bg-[#2E8A81]/20 text-[#4ECDC4] border border-[#2E8A81]/40' :
                              'bg-white/10 text-white border border-white/20'
                            }`}>
                              ● {p.plan}
                            </span>
                          </td>

                          {/* Expiry Date */}
                          <td className="py-3.5 px-4">
                            <div className="text-xs font-mono font-medium">
                              {p.expiryDate}
                            </div>
                            {isExpired ? (
                              <span className="text-[9px] font-bold text-[#C9503A] uppercase block">Expired</span>
                            ) : (
                              <span className="text-[9px] text-[#2E8A81] block">Active Valid</span>
                            )}
                          </td>

                          {/* Status & Quick Toggle */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(p)}
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95 border ${
                                isActive 
                                  ? 'bg-[#2E8A81]/20 text-[#2E8A81] border-[#2E8A81]/40 hover:bg-[#C9503A]/20 hover:text-[#C9503A] hover:border-[#C9503A]/40' 
                                  : 'bg-[#C9503A]/20 text-[#C9503A] border-[#C9503A]/40 hover:bg-[#2E8A81]/20 hover:text-[#2E8A81] hover:border-[#2E8A81]/40'
                              }`}
                              title="Click to toggle Active / Inactive status"
                            >
                              {isActive ? '● Active' : '● Inactive'}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Impersonate / Preview Dashboard */}
                              <button
                                onClick={() => impersonateClient(p.profileId)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-[#FF6B00] text-white transition-all cursor-pointer"
                                title={`Launch ${p.businessName} Dashboard`}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit Profile */}
                              <button
                                onClick={() => {
                                  setSelectedProfile(p);
                                  setEditModalOpen(true);
                                }}
                                className="p-2 rounded-xl bg-white/5 hover:bg-[#2E8A81] text-white transition-all cursor-pointer"
                                title="Edit Profile Details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Profile */}
                              <button
                                onClick={() => handleDeleteProfile(p)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-[#C9503A] text-[#A08E8B] hover:text-white transition-all cursor-pointer"
                                title="Delete Profile"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Subscription Plans Overview */}
        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { name: 'Starter', price: 49, color: 'border-white/20', badge: 'bg-white/10 text-white', features: ['Up to 100 Pets', 'Standard Invoicing', '1 Staff Groomer', 'Standard Analytics'] },
              { name: 'Pro', price: 99, color: 'border-[#2E8A81]/40', badge: 'bg-[#2E8A81]/20 text-[#2E8A81]', features: ['Up to 500 Pets', 'QR Invoicing & WhatsApp', '5 Staff Groomers', 'Vaccine Alert Monitor'] },
              { name: 'Premium', price: 189, color: 'border-[#FF6B00]/40', badge: 'bg-[#FF6B00]/20 text-[#FF6B00]', features: ['Unlimited Pets', 'A4 Standalone Receipts', 'Unlimited Staff', 'Loyalty Rewards Program', 'Before/After Showcase'] },
              { name: 'Enterprise', price: 349, color: 'border-[#8B6D9C]/40', badge: 'bg-[#8B6D9C]/20 text-[#8B6D9C]', features: ['Multi-Branch Studios', 'Custom Domain Branding', 'Dedicated Support 24/7', 'VIP Account Manager'] }
            ].map((plan) => {
              const count = authDatabase.profiles.filter(p => p.plan === plan.name).length;
              return (
                <div key={plan.name} className={`p-6 rounded-3xl bg-[#1C0908] border ${plan.color} space-y-4`}>
                  <div className="flex justify-between items-start">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${plan.badge}`}>
                      {plan.name}
                    </span>
                    <span className="text-xs font-bold text-[#A08E8B]">{count} Active Studios</span>
                  </div>
                  <div>
                    <span className="text-3xl font-display font-black text-white">${plan.price}</span>
                    <span className="text-xs text-[#A08E8B]"> / month</span>
                  </div>
                  <ul className="space-y-2 pt-2 border-t border-white/10 text-xs text-[#C5B7B4]">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#2E8A81] shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: System & Database */}
        {activeTab === 'settings' && (
          <div className="bg-[#1C0908] p-6 rounded-3xl border border-white/10 space-y-6 max-w-3xl">
            <div>
              <h3 className="font-display font-black text-lg text-white">Centralized Profile Database</h3>
              <p className="text-xs text-[#A08E8B] mt-0.5">
                Authentication schema is prepared for seamless 1-click migration to Firebase Auth & Firestore.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#A08E8B]">Database Version:</span>
                <span className="font-mono font-bold text-white">{authDatabase.version}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#A08E8B]">Last Synchronized:</span>
                <span className="font-mono text-white">{authDatabase.lastUpdated}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#A08E8B]">Total Registered Profiles:</span>
                <span className="font-mono font-bold text-[#FF6B00]">{authDatabase.profiles.length}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Reset Demo Auth Profiles</p>
                <p className="text-[11px] text-[#A08E8B]">Restore default PG001, PG002, PG003 accounts</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset authentication database to factory demo defaults?')) {
                    resetAuthDatabase();
                    showToast('Authentication database reset to initial state.');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Reset Database
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Modal 1: Create New Client Account */}
      {createModalOpen && (
        <CreateClientModal 
          onClose={() => setCreateModalOpen(false)} 
          onCreate={async (data) => {
            const newP = await createClientProfile(data);
            setCreateModalOpen(false);
            showToast(`Created client account for ${newP.businessName} (${newP.profileId})!`);
          }}
          existingProfiles={authDatabase.profiles}
        />
      )}

      {/* Modal 2: Edit Client Profile */}
      {editModalOpen && selectedProfile && (
        <EditClientModal 
          profile={selectedProfile}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedProfile(null);
          }}
          onSave={async (updates) => {
            await updateClientProfile(selectedProfile.profileId, updates);
            setEditModalOpen(false);
            setSelectedProfile(null);
            showToast(`Updated profile for ${selectedProfile.businessName}!`);
          }}
        />
      )}
    </div>
  );
};

// Sub-Component: Create Client Account Modal
interface CreateModalProps {
  onClose: () => void;
  onCreate: (profile: Omit<ClientProfile, 'profileId' | 'createdAt'> & { profileId?: string }) => Promise<void>;
  existingProfiles: ClientProfile[];
}

const CreateClientModal: React.FC<CreateModalProps> = ({ onClose, onCreate, existingProfiles }) => {
  const nextId = useMemo(() => generateNextProfileId(existingProfiles), [existingProfiles]);
  const defaultPass = useMemo(() => generateSuggestedPassword(), []);

  const [profileId, setProfileId] = useState(nextId);
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(defaultPass);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [plan, setPlan] = useState<SubscriptionPlan>('Premium');
  const [status, setStatus] = useState<AccountStatus>('active');
  
  // Default expiry 1 year ahead
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !ownerName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onCreate({
        profileId,
        businessName,
        ownerName,
        email,
        password,
        phoneNumber,
        plan,
        status,
        expiryDate
      });
    } catch (err) {
      setError('Failed to create client account.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#1C0908] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6B00] flex items-center justify-center text-white shadow-md">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-white">
                Create New Client Account
              </h3>
              <p className="text-xs text-[#A08E8B]">
                Auto-provisioned login credentials for tenant
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#A08E8B] hover:text-white text-xs font-bold">
            Cancel
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#FEF2F2]/10 border border-[#C9503A]/40 text-[#FFA494] text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Row 1: Profile ID & Plan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Profile ID (Auto)</label>
              <input
                type="text"
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Subscription Plan</label>
              <select
                value={plan}
                onChange={(e: any) => setPlan(e.target.value)}
                className="w-full bg-[#240C0B] border border-white/15 rounded-xl px-3 py-2 text-white font-bold outline-none"
              >
                <option value="Starter">Starter ($49/mo)</option>
                <option value="Pro">Pro ($99/mo)</option>
                <option value="Premium">Premium ($189/mo)</option>
                <option value="Enterprise">Enterprise ($349/mo)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Business Name & Owner Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Business Name *</label>
              <input
                type="text"
                placeholder="e.g. Royal Fur Care"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-[#FF6B00]"
                required
              />
            </div>
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Owner Name *</label>
              <input
                type="text"
                placeholder="e.g. Rachel Adams"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-[#FF6B00]"
                required
              />
            </div>
          </div>

          {/* Row 3: Email & Password */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Login Email *</label>
              <input
                type="email"
                placeholder="rachel@royalfur.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-[#FF6B00]"
                required
              />
            </div>
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Generated Password *</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-[#FF6B00]"
                required
              />
            </div>
          </div>

          {/* Row 4: Phone & Expiry & Status */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="(555) 000-0000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Initial Status</label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full bg-[#240C0B] border border-white/15 rounded-xl px-3 py-2 text-white font-bold outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E55C00] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-[#FF6B00]/30"
            >
              {isLoading ? 'Creating...' : 'Provision Account'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

// Sub-Component: Edit Client Profile Modal
interface EditModalProps {
  profile: ClientProfile;
  onClose: () => void;
  onSave: (updates: Partial<ClientProfile>) => Promise<void>;
}

const EditClientModal: React.FC<EditModalProps> = ({ profile, onClose, onSave }) => {
  const [businessName, setBusinessName] = useState(profile.businessName);
  const [ownerName, setOwnerName] = useState(profile.ownerName);
  const [email, setEmail] = useState(profile.email);
  const [password, setPassword] = useState(profile.password);
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber || '');
  const [plan, setPlan] = useState<SubscriptionPlan>(profile.plan);
  const [status, setStatus] = useState<AccountStatus>(profile.status);
  const [expiryDate, setExpiryDate] = useState(profile.expiryDate);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onSave({
      businessName,
      ownerName,
      email,
      password,
      phoneNumber,
      plan,
      status,
      expiryDate
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#1C0908] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2E8A81] flex items-center justify-center text-white">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-white">
                Edit Profile: {profile.profileId}
              </h3>
              <p className="text-xs text-[#A08E8B]">{profile.businessName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#A08E8B] hover:text-white text-xs font-bold">
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Owner Name</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Login Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Subscription Plan</label>
              <select
                value={plan}
                onChange={(e: any) => setPlan(e.target.value)}
                className="w-full bg-[#240C0B] border border-white/15 rounded-xl px-3 py-2 text-white font-bold"
              >
                <option value="Starter">Starter</option>
                <option value="Pro">Pro</option>
                <option value="Premium">Premium</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Status</label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full bg-[#240C0B] border border-white/15 rounded-xl px-3 py-2 text-white font-bold"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-[#2E8A81] hover:bg-[#236F68] text-white rounded-xl font-bold"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
