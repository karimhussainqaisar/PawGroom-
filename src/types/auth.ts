export type SubscriptionPlan = 'Starter' | 'Pro' | 'Premium' | 'Enterprise';
export type AccountStatus = 'active' | 'inactive';

export interface ScreenPermissions {
  dashboard?: boolean;
  calendar?: boolean;
  invoices?: boolean;
  clients?: boolean;
  services?: boolean;
  alerts?: boolean;
  loyalty?: boolean;
  staff?: boolean;
  revenue?: boolean;
  business?: boolean;
  gallery?: boolean;
  settings?: boolean;
}

export interface FeaturePermissions {
  allowBooking?: boolean; // Can book new grooming appointments
  allowCheckout?: boolean; // POS & retail checkout
  allowClientEdit?: boolean; // Add/edit client & pet records
  allowPdfExport?: boolean; // Download invoices as PDF
  allowReportExport?: boolean; // Export revenue & reports as CSV
  allowWhatsApp?: boolean; // Send WhatsApp client reminders
  allowLoyalty?: boolean; // Redeem & assign loyalty points
  allowVaccineAlerts?: boolean; // Vaccine & health alerts system
  allowStaffPayroll?: boolean; // Groomer commission & payroll calculator
  allowCustomThemes?: boolean; // Customize studio color themes
  allowAiAssistant?: boolean; // AI Grooming Assistant & smart notes
}

export interface ClientPermissions {
  isTrialMode?: boolean;
  trialTierName?: string;
  trialMessage?: string;
  screens?: ScreenPermissions;
  features?: FeaturePermissions;
}

export interface ClientProfile {
  profileId: string; // e.g. "PG001"
  businessName: string; // e.g. "Happy Paws Grooming"
  ownerName: string; // e.g. "Sarah Jenkins"
  email: string; // e.g. "happy@email.com"
  password: string; // e.g. "password123"
  phoneNumber?: string;
  plan: SubscriptionPlan;
  createdAt: string; // 'YYYY-MM-DD'
  expiryDate: string; // 'YYYY-MM-DD'
  status: AccountStatus;
  permissions?: ClientPermissions; // Feature & Screen granular permissions for demo & trials
  customSettings?: {
    salonName?: string;
    name?: string;
    phone?: string;
    address?: string;
    email?: string;
    website?: string;
    open?: number;
    close?: number;
    slot?: number;
    currency?: string;
    taxRate?: number;
    colorTheme?: string;
    photo?: string;
    logoUrl?: string;
    tagline?: string;
    ppd?: number;
    redeem?: number;
    bday?: number;
  };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin';
  avatar?: string;
  lastLogin?: string;
}

export interface AuthSession {
  userType: 'client' | 'admin';
  profile?: ClientProfile;
  admin?: AdminUser;
  token: string;
  loginTime: string;
  rememberMe: boolean;
}

export interface AuthDatabase {
  admin: AdminUser;
  profiles: ClientProfile[];
  version: string;
  lastUpdated: string;
}

export type NotificationType = 
  | 'popup' 
  | 'banner' 
  | 'push' 
  | 'ticker' 
  | 'drawer' 
  | 'floating_badge' 
  | 'spotlight_card' 
  | 'toast_stack' 
  | 'sidebar_alert' 
  | 'modal_takeover' 
  | 'message';
export type NotificationPriority = 'info' | 'warning' | 'urgent' | 'promotion' | 'update';

export interface AdminNotification {
  id: string;
  targetType: 'all' | 'specific';
  targetProfileId?: string; // profileId or 'all'
  targetBusinessName?: string;
  type: NotificationType; // 'popup' modal on client screen, 'banner', or 'push'
  priority: NotificationPriority;
  title: string;
  message: string;
  imageUrl?: string; // Optional image URL for modern visuals
  actionLabel?: string; // Clickable button label
  actionUrl?: string; // URL (opens in new tab) or internal screen mode (e.g. 'calendar')
  actionTarget?: '_blank' | '_self'; // '_blank' opens in new browser tab
  createdAt: string; // ISO string
  expiresAt?: string;
  createdBy: string;
  readBy: string[]; // profileIds that have read this
  dismissedBy: string[]; // profileIds that have dismissed the popup/banner
  isActive: boolean;
}

