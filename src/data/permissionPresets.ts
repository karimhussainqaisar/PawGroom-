import { ClientPermissions, ScreenPermissions, FeaturePermissions, NotificationType, NotificationPriority } from '../types/auth';
import { ViewMode } from '../types';

export interface ScreenDefinition {
  id: ViewMode;
  label: string;
  category: 'core' | 'operations' | 'finance' | 'studio';
  description: string;
  iconName: string;
}

export const ALL_SCREENS: ScreenDefinition[] = [
  { id: 'dashboard', label: 'Dashboard & Quick Stats', category: 'core', description: 'Studio overview, metrics, today appointments and live status', iconName: 'LayoutDashboard' },
  { id: 'calendar', label: 'Appointments & Booking Calendar', category: 'core', description: 'Interactive appointment scheduling, time slots and groomer assignment', iconName: 'Calendar' },
  { id: 'invoices', label: 'Invoices, Billing & QR Pay', category: 'finance', description: 'Digital invoices, checkout receipts, tips, and QR payment generation', iconName: 'Receipt' },
  { id: 'clients', label: 'Client & Pet Records (CRM)', category: 'core', description: 'Pet profiles, breed notes, rabies dates, and owner emergency contacts', iconName: 'Dog' },
  { id: 'services', label: 'Grooming Services & Add-ons', category: 'operations', description: 'Service catalog, breed sizing pricing, duration and spa add-ons', iconName: 'Scissors' },
  { id: 'alerts', label: 'Health & Vaccine Compliance', category: 'operations', description: 'Automated 30-day rabies expiration trackers and health flags', iconName: 'AlertTriangle' },
  { id: 'loyalty', label: 'Paws Loyalty & VIP Rewards', category: 'operations', description: 'Tiered client loyalty points, redeemable grooming discounts and rewards', iconName: 'Award' },
  { id: 'staff', label: 'Groomers & Stylists Roster', category: 'operations', description: 'Staff profiles, specialization, working hours, and commission tracker', iconName: 'UserCheck' },
  { id: 'revenue', label: 'Revenue, Analytics & Tax', category: 'finance', description: 'Financial analytics, payment distribution, tips and service revenue charts', iconName: 'TrendingUp' },
  { id: 'business', label: 'Salon Activity & Retail Store', category: 'studio', description: 'Retail product inventory, stock levels, sales checkout and activity log', iconName: 'Store' },
  { id: 'gallery', label: 'Transformation Photo Gallery', category: 'studio', description: 'Before & After grooming photo showcase and portfolio', iconName: 'Sparkles' },
  { id: 'settings', label: 'Studio Settings & Branding', category: 'studio', description: 'Salon branding, color themes, logo upload, and business hours', iconName: 'Settings' },
];

export interface FeatureDefinition {
  key: keyof FeaturePermissions;
  label: string;
  description: string;
  category: 'booking' | 'sales' | 'communication' | 'advanced';
}

export const ALL_FEATURES: FeatureDefinition[] = [
  { key: 'allowBooking', label: 'Appointment Booking & Creation', description: 'Allow creating and modifying customer grooming appointments', category: 'booking' },
  { key: 'allowCheckout', label: 'POS & Retail Store Checkout', description: 'Allow completing sales and charging retail pet products', category: 'sales' },
  { key: 'allowClientEdit', label: 'Add & Edit Client/Pet Profiles', description: 'Allow registering new pet owners and editing medical notes', category: 'booking' },
  { key: 'allowPdfExport', label: 'PDF Invoice & Receipt Download', description: 'Allow generating printable and downloadable PDF invoices', category: 'sales' },
  { key: 'allowReportExport', label: 'Financial Reports & CSV Export', description: 'Allow exporting salon revenue and appointment history to CSV', category: 'advanced' },
  { key: 'allowWhatsApp', label: 'WhatsApp Automated Reminders', description: 'Allow sending 1-click WhatsApp appointment reminders to clients', category: 'communication' },
  { key: 'allowLoyalty', label: 'Loyalty Points Redemption', description: 'Allow awarding and redeeming VIP loyalty rewards', category: 'sales' },
  { key: 'allowVaccineAlerts', label: 'Vaccine & Health Expiry System', description: 'Enable medical alerts and vaccination compliance tracking', category: 'advanced' },
  { key: 'allowStaffPayroll', label: 'Groomer Commission & Payroll', description: 'Enable commission calculations and staff payroll reports', category: 'advanced' },
  { key: 'allowCustomThemes', label: 'Custom Studio Color Themes', description: 'Allow changing salon palette and branding theme', category: 'advanced' },
  { key: 'allowAiAssistant', label: 'AI Grooming Assistant & Smart Notes', description: 'Enable AI coat suggestions and auto-generated rebooking recommendations', category: 'advanced' },
];

export const FULL_ACCESS_SCREENS: ScreenPermissions = {
  dashboard: true,
  calendar: true,
  invoices: true,
  clients: true,
  services: true,
  alerts: true,
  loyalty: true,
  staff: true,
  revenue: true,
  business: true,
  gallery: true,
  settings: true,
};

export const FULL_ACCESS_FEATURES: FeaturePermissions = {
  allowBooking: true,
  allowCheckout: true,
  allowClientEdit: true,
  allowPdfExport: true,
  allowReportExport: true,
  allowWhatsApp: true,
  allowLoyalty: true,
  allowVaccineAlerts: true,
  allowStaffPayroll: true,
  allowCustomThemes: true,
  allowAiAssistant: true,
};

export const DEFAULT_CLIENT_PERMISSIONS: ClientPermissions = {
  isTrialMode: false,
  trialTierName: 'Standard',
  trialMessage: '',
  screens: { ...FULL_ACCESS_SCREENS },
  features: { ...FULL_ACCESS_FEATURES },
};

export interface PermissionPreset {
  id: string;
  name: string;
  description: string;
  badgeColor: string;
  isTrial: boolean;
  trialMessage?: string;
  screens: ScreenPermissions;
  features: FeaturePermissions;
}

export const PERMISSION_PRESETS: PermissionPreset[] = [
  {
    id: 'full_enterprise',
    name: '🌟 Full Enterprise / All Features',
    description: 'Complete unrestricted access to all 12 screens and 11 features.',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    isTrial: false,
    screens: { ...FULL_ACCESS_SCREENS },
    features: { ...FULL_ACCESS_FEATURES },
  },
  {
    id: 'standard_pro',
    name: '⚡ Studio Pro (Standard)',
    description: 'All core grooming operations, CRM, and invoices. Advanced custom themes restricted.',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    isTrial: false,
    screens: { ...FULL_ACCESS_SCREENS, settings: true },
    features: {
      ...FULL_ACCESS_FEATURES,
      allowCustomThemes: false,
    },
  },
  {
    id: 'trial_booking_crm',
    name: '📅 14-Day Trial: Booking & CRM Demo',
    description: 'Perfect for evaluating scheduling and pet client records. Financial analytics & payroll locked.',
    badgeColor: 'bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/30',
    isTrial: true,
    trialMessage: '⚡ You are currently exploring the PawBook Booking & CRM Trial. Contact admin@parkgrooming.com to unlock full financial analytics & staff payroll.',
    screens: {
      dashboard: true,
      calendar: true,
      invoices: true,
      clients: true,
      services: true,
      alerts: true,
      loyalty: true,
      staff: false,
      revenue: false,
      business: false,
      gallery: true,
      settings: false,
    },
    features: {
      allowBooking: true,
      allowCheckout: true,
      allowClientEdit: true,
      allowPdfExport: true,
      allowReportExport: false,
      allowWhatsApp: true,
      allowLoyalty: true,
      allowVaccineAlerts: true,
      allowStaffPayroll: false,
      allowCustomThemes: false,
      allowAiAssistant: true,
    },
  },
  {
    id: 'trial_frontdesk_demo',
    name: '📋 Trial: Front-Desk & Checkout Demo',
    description: 'Focused on appointment reception, dog check-in, and invoice QR generation.',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    isTrial: true,
    trialMessage: '🐾 Front-Desk Reception Demo Active. Upgrade your license to enable revenue reporting and team management.',
    screens: {
      dashboard: true,
      calendar: true,
      invoices: true,
      clients: true,
      services: true,
      alerts: false,
      loyalty: false,
      staff: false,
      revenue: false,
      business: false,
      gallery: true,
      settings: false,
    },
    features: {
      allowBooking: true,
      allowCheckout: true,
      allowClientEdit: true,
      allowPdfExport: true,
      allowReportExport: false,
      allowWhatsApp: false,
      allowLoyalty: false,
      allowVaccineAlerts: false,
      allowStaffPayroll: false,
      allowCustomThemes: false,
      allowAiAssistant: false,
    },
  },
  {
    id: 'trial_view_only',
    name: '👁️ Web Demo: View-Only Showcase',
    description: 'Safe preview for prospective clients. All screens visible for browsing, creation/modification locked.',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    isTrial: true,
    trialMessage: '🔒 Interactive Showcase Mode. Data creation and exports are disabled in this preview.',
    screens: { ...FULL_ACCESS_SCREENS },
    features: {
      allowBooking: false,
      allowCheckout: false,
      allowClientEdit: false,
      allowPdfExport: false,
      allowReportExport: false,
      allowWhatsApp: false,
      allowLoyalty: false,
      allowVaccineAlerts: false,
      allowStaffPayroll: false,
      allowCustomThemes: false,
      allowAiAssistant: false,
    },
  },
];

// Helper: Check if screen is allowed for a profile
export function isScreenAllowed(permissions: ClientPermissions | undefined, screen: ViewMode): boolean {
  if (!permissions || !permissions.screens) return true; // Default true if unspecified
  return permissions.screens[screen] !== false;
}

// Helper: Check if feature is allowed for a profile
export function isFeatureAllowed(permissions: ClientPermissions | undefined, feature: keyof FeaturePermissions): boolean {
  if (!permissions || !permissions.features) return true; // Default true if unspecified
  return permissions.features[feature] !== false;
}

// ==========================================
// 15 PRE-MADE PREMIUM MODERN UI NOTIFICATION TEMPLATES
// ==========================================
export interface NotificationTemplate {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  category: 'Feature Release' | 'Promotion' | 'Alert & Maintenance' | 'Tips & Guides' | 'Milestone';
  imageUrl?: string;
  actionLabel?: string;
  actionUrl?: string;
  actionTarget?: '_blank' | '_self';
}

export const READY_MADE_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'tmpl-01',
    category: 'Feature Release',
    type: 'popup',
    priority: 'update',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
    title: '✨ AI Smart Grooming Assistant & Coat Notes',
    message: 'We have enabled automated grooming coat notes, smart service recommendations, and 4-week rebooking suggestions. Speed up appointment check-ins by 35%!',
    actionLabel: 'Open Appointments Calendar',
    actionUrl: 'calendar',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-02',
    category: 'Promotion',
    type: 'popup',
    priority: 'promotion',
    imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80',
    title: '🔥 Special Partner Offer: 40% Off Annual Upgrade',
    message: 'Upgrade to our Annual Studio Enterprise Plan today and unlock unlimited staff seats, automated WhatsApp reminders, and multi-location cloud sync at our lowest rate of the year.',
    actionLabel: 'Claim 40% Discount Online',
    actionUrl: 'https://pawbookpro.com/pricing',
    actionTarget: '_blank',
  },
  {
    id: 'tmpl-03',
    category: 'Alert & Maintenance',
    type: 'banner',
    priority: 'warning',
    title: '⚠️ Scheduled Cloud Server Maintenance: Sunday at 02:00 UTC',
    message: 'Our cloud database will undergo routine performance optimization for 15 minutes this Sunday. Local appointment records remain safe and auto-synced.',
    actionLabel: 'View Live Server Status',
    actionUrl: 'https://status.pawbookpro.com',
    actionTarget: '_blank',
  },
  {
    id: 'tmpl-04',
    category: 'Alert & Maintenance',
    type: 'popup',
    priority: 'urgent',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    title: '💳 Monthly Studio Pro Subscription Renewal',
    message: 'Your monthly PawBook Pro plan has renewed successfully. You can download and print your official tax invoice directly in the billing tab.',
    actionLabel: 'View Invoices & Billing',
    actionUrl: 'invoices',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-05',
    category: 'Promotion',
    type: 'popup',
    priority: 'promotion',
    imageUrl: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=800&q=80',
    title: '🎁 Free Holiday Client Booking & Marketing Toolkit',
    message: 'Get your holiday season fully booked! Download our pre-built Instagram graphics, client SMS templates, and holiday package pricing guides designed by master groomers.',
    actionLabel: 'Download Free Marketing Kit',
    actionUrl: 'https://pawbookpro.com/resources/holiday-kit',
    actionTarget: '_blank',
  },
  {
    id: 'tmpl-06',
    category: 'Feature Release',
    type: 'push',
    priority: 'update',
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
    title: '📱 PawBook Mobile Companion App Now Available',
    message: 'Your bathers and stylists can now review their daily dog schedules, view coat notes, and snap before/after transformation photos directly on iOS and Android.',
    actionLabel: 'Download on App Store',
    actionUrl: 'https://apps.apple.com',
    actionTarget: '_blank',
  },
  {
    id: 'tmpl-07',
    category: 'Alert & Maintenance',
    type: 'banner',
    priority: 'urgent',
    title: '🛡️ Security Notice: Review Staff Access Roles',
    message: 'We recommend reviewing employee permissions to ensure checkout registers and financial exports are only accessible to senior team members.',
    actionLabel: 'Manage Groomers & Roles',
    actionUrl: 'staff',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-08',
    category: 'Milestone',
    type: 'popup',
    priority: 'info',
    imageUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
    title: '🎉 Studio Milestone: 1,000+ Happy Paws Groomed!',
    message: 'Congratulations on reaching 1,000 completed grooming appointments! Your salon is among the top 5% of thriving pet studios on the PawBook platform.',
    actionLabel: 'View Studio Analytics',
    actionUrl: 'revenue',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-09',
    category: 'Tips & Guides',
    type: 'push',
    priority: 'info',
    title: '📊 Month-End Financial Audit & Tax CSV Ready',
    message: 'Your monthly revenue breakdown, groomer commission totals, and retail product sales are reconciled. Export your CSV report for accounting with 1 click.',
    actionLabel: 'Open Revenue & Stats',
    actionUrl: 'revenue',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-10',
    category: 'Alert & Maintenance',
    type: 'popup',
    priority: 'warning',
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=80',
    title: '💉 Upcoming Rabies Vaccine Expirations Detected',
    message: 'Several client pets on your schedule have rabies certificates expiring within 14 days. Review your compliance dashboard to dispatch automated reminder alerts.',
    actionLabel: 'Open Vaccine Alerts',
    actionUrl: 'alerts',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-11',
    category: 'Tips & Guides',
    type: 'push',
    priority: 'info',
    title: '💡 Salon Growth Tip: Blueberry Facials & Paw Balms',
    message: 'Salons offering blueberry facial add-ons and paw balm treatments report an average $18 higher ticket average per appointment. Add them to your menu!',
    actionLabel: 'Configure Services Menu',
    actionUrl: 'services',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-12',
    category: 'Promotion',
    type: 'banner',
    priority: 'promotion',
    title: '🎁 2-Minute Feedback Survey: Win 3 Months Free Studio Pro',
    message: 'Tell us what features you want next (multi-location sync, cat grooming tiers, or client portal) and get entered to win 3 months of free subscription.',
    actionLabel: 'Take Quick 2-Min Survey',
    actionUrl: 'https://pawbookpro.com/survey',
    actionTarget: '_blank',
  },
  {
    id: 'tmpl-13',
    category: 'Promotion',
    type: 'popup',
    priority: 'promotion',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
    title: '✂️ Masterclass: Asian Fusion & Teddy Bear Heads',
    message: 'Join Master Stylist Elena Vance this Thursday for a free live masterclass on speed scissoring and modern teddy bear styling. Free for all PawBook studios.',
    actionLabel: 'Reserve Free Masterclass Seat',
    actionUrl: 'https://pawbookpro.com/masterclass',
    actionTarget: '_blank',
  },
  {
    id: 'tmpl-14',
    category: 'Feature Release',
    type: 'popup',
    priority: 'update',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67e557b649?auto=format&fit=crop&w=800&q=80',
    title: '💳 Dynamic QR Invoicing & Tap-to-Pay Ready',
    message: 'Show instant payment QR codes on your salon tablet or phone. Customers can scan to pay tips and invoices via Apple Pay, Google Pay, and cards with zero hardware cost.',
    actionLabel: 'Explore Invoices & QR',
    actionUrl: 'invoices',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-15',
    category: 'Alert & Maintenance',
    type: 'popup',
    priority: 'urgent',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
    title: '⏳ Trial Account Status: 3 Days Remaining',
    message: 'Your 14-day web trial will conclude in 3 days. Upgrade your license today to preserve all your pet records, appointments, groomer rosters, and custom theme settings.',
    actionLabel: 'Upgrade License Plan Now',
    actionUrl: 'https://pawbookpro.com/upgrade',
    actionTarget: '_blank',
  },
];
