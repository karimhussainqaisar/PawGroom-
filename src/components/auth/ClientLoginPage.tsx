import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Scissors, 
  ShieldCheck, 
  ArrowRight, 
  Dog, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Store,
  Layers,
  Heart
} from 'lucide-react';
import { InactiveAccountModal } from './InactiveAccountModal';

export const ClientLoginPage: React.FC = () => {
  const { loginClient, setAuthView, authDatabase } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShake, setIsShake] = useState(false);

  // Email format validator
  const isValidEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email.trim()) {
      triggerError('Please enter your account email address.');
      return;
    }
    if (!isValidEmail(email)) {
      triggerError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      triggerError('Please enter your account password.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await loginClient(email, password, rememberMe);
      if (!res.success) {
        triggerError(res.error || 'Invalid email or password.');
      }
    } catch (err) {
      triggerError('An unexpected authentication error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setIsShake(true);
    setTimeout(() => setIsShake(false), 600);
  };

  const fillQuickDemo = (profileEmail: string, profilePass: string) => {
    setEmail(profileEmail);
    setPassword(profilePass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#180504] overflow-hidden selection:bg-[#FF6B00] selection:text-white">
      {/* Background Animated Gradient Mesh */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#FF6B00]/25 via-[#E8734A]/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-[#2E8A81]/25 via-[#173E39]/15 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#FF6B00]/5 blur-[160px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px' 
        }} 
      />

      {/* Main SaaS Auth Frame (Split Layout on Desktop) */}
      <div className="relative z-10 w-full max-w-5xl rounded-[32px] sm:rounded-[40px] border border-white/15 bg-[#240C0B]/85 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* Left Col: Brand & Pet Grooming Experience Visuals (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#2B100F] via-[#240C0B] to-[#1A0605] p-8 sm:p-10 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden">
          {/* Subtle Graphic Accents */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#FF6B00]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-4 right-4 opacity-10 pointer-events-none">
            <Dog className="w-64 h-64 text-white -rotate-12 translate-x-10 translate-y-10" />
          </div>

          {/* Brand Header */}
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FFA052] flex items-center justify-center text-white shadow-lg shadow-[#FF6B00]/30 transform hover:rotate-6 transition-transform">
                <Scissors className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest text-[#FF6B00] uppercase block">
                  SaaS Multi-Tenant Cloud
                </span>
                <h1 className="font-display font-black text-xl text-white tracking-wide">
                  Park Grooming Dashboard
                </h1>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="space-y-3 pt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-white font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>Next-Gen Pet Studio Management</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white leading-tight">
                All-in-One Grooming & Client Experience.
              </h2>
              <p className="text-xs text-[#C5B7B4] leading-relaxed">
                Seamless scheduling, instant A4 & QR invoices, client pet profiles, vaccine alert monitors, and automated loyalty rewards.
              </p>
            </div>

            {/* Feature Highlights with icons */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-white/90">
                <div className="w-5 h-5 rounded-full bg-[#2E8A81]/30 border border-[#2E8A81] flex items-center justify-center text-[#2E8A81] shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Isolated Multi-Tenant Business Stores</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-white/90">
                <div className="w-5 h-5 rounded-full bg-[#FF6B00]/30 border border-[#FF6B00] flex items-center justify-center text-[#FF6B00] shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Automated WhatsApp & QR Receipt Sharing</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-white/90">
                <div className="w-5 h-5 rounded-full bg-[#8B6D9C]/30 border border-[#8B6D9C] flex items-center justify-center text-[#8B6D9C] shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Real-Time Vaccine Expiry Tracking</span>
              </div>
            </div>
          </div>

          {/* Bottom Security Badge */}
          <div className="pt-8 relative z-10">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#2E8A81]" />
                <div className="text-left">
                  <p className="text-[11px] font-bold text-white leading-tight">256-Bit Encrypted Session</p>
                  <p className="text-[10px] text-[#A08E8B]">Protected Tenant Sandbox</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#A08E8B] bg-white/5 px-2 py-1 rounded-md">v1.4.0</span>
            </div>
          </div>
        </div>

        {/* Right Col: Interactive SaaS Login Form (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between bg-white/[0.02]">
          <div className="max-w-md w-full mx-auto space-y-7">
            
            {/* Header Form Title */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FF6B00]">
                  Client Portal
                </span>
                <span className="text-xs text-[#A08E8B] flex items-center gap-1">
                  <Store className="w-3.5 h-3.5" /> Business Sign In
                </span>
              </div>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                Welcome Back
              </h3>
              <p className="text-xs text-[#A08E8B] mt-1">
                Enter your registered business email and password to access your studio.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className={`p-3.5 rounded-2xl bg-[#FEF2F2]/10 border border-[#C9503A]/40 text-[#FFA494] text-xs flex items-start gap-2.5 ${isShake ? 'animate-shake' : ''}`}>
                <AlertCircle className="w-4 h-4 text-[#C9503A] shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#E6DFD5]">
                  Business Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A08E8B] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Enter your email"
                    required
                    className="w-full bg-white/5 border border-white/15 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/30 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-[#7A6865] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#E6DFD5]">
                    Password
                  </label>
                  <span className="text-[11px] text-[#A08E8B] cursor-default">
                    Case-sensitive
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A08E8B] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-white/5 border border-white/15 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/30 rounded-2xl pl-11 pr-11 py-3.5 text-sm text-white placeholder-[#7A6865] outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A08E8B] hover:text-white transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Toggle */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md accent-[#FF6B00] cursor-pointer"
                  />
                  <span className="text-xs text-[#C5B7B4] group-hover:text-white transition-colors">
                    Keep me signed in
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => fillQuickDemo('happy@email.com', 'password123')}
                  className="text-xs font-bold text-[#FF6B00] hover:text-[#FFA052] transition-colors cursor-pointer"
                >
                  Quick Demo Login
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#E55C00] hover:from-[#E55C00] hover:to-[#CC4F00] text-white font-display font-bold text-sm tracking-wide shadow-lg shadow-[#FF6B00]/30 hover:shadow-xl hover:shadow-[#FF6B00]/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed group mt-2"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating Studio...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Fast Demo Accounts Picker (Tabs/Pills for Testing Multi-Tenant Profiles) */}
            <div className="pt-2 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-[#A08E8B]">
                <span className="font-bold uppercase tracking-wider">Quick Profile Switcher (Demo)</span>
                <span>{authDatabase.profiles.length} Available</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {authDatabase.profiles.map((p) => {
                  const isActive = p.status === 'active';
                  return (
                    <button
                      key={p.profileId}
                      type="button"
                      onClick={() => fillQuickDemo(p.email, p.password)}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-bold text-[#FF6B00]">{p.profileId}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase ${
                          isActive ? 'bg-[#2E8A81]/20 text-[#2E8A81]' : 'bg-[#C9503A]/20 text-[#C9503A]'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white truncate group-hover:text-[#FFA052]">
                        {p.businessName}
                      </p>
                      <p className="text-[10px] text-[#A08E8B] truncate font-mono">
                        {p.email}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Footer Admin Switcher Gateway */}
          <div className="pt-6 mt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#A08E8B]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2E8A81] animate-pulse" />
              <span>Multi-Tenant Auth Engine Active</span>
            </div>

            <button
              type="button"
              onClick={() => setAuthView('admin_login')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white font-bold text-xs transition-all cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Admin Management Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inactive Profile Alert Modal Popup */}
      <InactiveAccountModal />
    </div>
  );
};
