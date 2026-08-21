import { ClientPermissions, ScreenPermissions, ScreenSectionPermissions, FeaturePermissions, NotificationType, NotificationPriority } from '../types/auth';
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

export interface SectionDefinition {
  id: string;
  screenId: ViewMode;
  label: string;
  description: string;
}

export const ALL_SCREEN_SECTIONS: Record<ViewMode, SectionDefinition[]> = {
  dashboard: [
    { id: 'kpiCards', screenId: 'dashboard', label: 'Key Metric Stat Cards', description: 'Total Revenue, Appointments Count, Active Clients, Grooming Rating' },
    { id: 'quickActions', screenId: 'dashboard', label: 'Quick Action Command Buttons', description: 'New Appointment, Quick Invoice, Add Pet Owner, Send WhatsApp' },
    { id: 'todaySchedule', screenId: 'dashboard', label: "Today's Appointment Schedule", description: 'Live dog lineup, appointment status toggles, time slots' },
    { id: 'stationOccupancy', screenId: 'dashboard', label: 'Grooming Station & Staff Load', description: 'Bathing tub, scissoring tables, drying station occupancy monitors' },
    { id: 'petSummaryTable', screenId: 'dashboard', label: 'Pet Directory & Medical Overview', description: 'Quick search, rabies expiration tags, VIP client markers' },
    { id: 'revenueMiniChart', screenId: 'dashboard', label: 'Monthly Revenue Matrix Mini-Chart', description: 'Daily earnings histogram with interactive tooltip breakdowns' },
    { id: 'vaccineAlertsCard', screenId: 'dashboard', label: 'Health & Vaccine Expiry Warning Banner', description: 'Top emergency banner for upcoming rabies/distemper renewals' },
  ],
  calendar: [
    { id: 'viewControls', screenId: 'calendar', label: 'Calendar View Switcher', description: 'Day / Week / Month / Agenda / Groomer multi-column views' },
    { id: 'addBookingBtn', screenId: 'calendar', label: 'New Booking Action Button', description: 'Primary action to create and schedule grooming sessions' },
    { id: 'calendarGrid', screenId: 'calendar', label: 'Interactive Booking Grid', description: 'Drag-and-drop slots, time markers, and live bookings' },
    { id: 'groomerFilters', screenId: 'calendar', label: 'Groomer Staff Filter Bar', description: 'Filter appointments by assigned stylist or assistant' },
    { id: 'appointmentModal', screenId: 'calendar', label: 'Appointment Details & Reschedule Modal', description: 'Inspect coat notes, add services, cancel or reschedule' },
  ],
  invoices: [
    { id: 'summaryKpis', screenId: 'invoices', label: 'Financial Billing Summary KPIs', description: 'Unpaid balances, Paid total, Average ticket amount' },
    { id: 'searchFilters', screenId: 'invoices', label: 'Invoice Search & Status Filters', description: 'Filter by paid/pending status, client name, and date range' },
    { id: 'createInvoiceBtn', screenId: 'invoices', label: 'New Invoice & POS Checkout Button', description: 'Action button to build manual invoice or retail cart' },
    { id: 'invoicesTable', screenId: 'invoices', label: 'Invoices History & Customer Ledger Table', description: 'Detailed invoice rows, status badges, and payment methods' },
    { id: 'qrPaymentModal', screenId: 'invoices', label: 'QR Code Instant Payment Modal', description: 'Customer scan-to-pay QR generator for Apple Pay/Google Pay' },
    { id: 'pdfExportAction', screenId: 'invoices', label: 'PDF Invoice & Print Receipts', description: 'Download branded printable receipts with tax breakdowns' },
  ],
  clients: [
    { id: 'metricsBar', screenId: 'clients', label: 'Client CRM Statistics Bar', description: 'Total pets, VIP accounts, rabies expiring, new clients' },
    { id: 'searchFilterBar', screenId: 'clients', label: 'Client Search & Breed Filter Bar', description: 'Keyword search across pet names, phone numbers, and breeds' },
    { id: 'addClientBtn', screenId: 'clients', label: 'Register New Pet Owner Button', description: 'Action to create new client files and pet profiles' },
    { id: 'clientCardsList', screenId: 'clients', label: 'Client & Pet Directory List', description: 'Expandable client cards, appointment history, VIP status' },
    { id: 'medicalHistory', screenId: 'clients', label: 'Rabies Expiry & Medical Alerts', description: 'Veterinary certificates, allergies, aggression warning flags' },
    { id: 'whatsappReminders', screenId: 'clients', label: '1-Click WhatsApp Client Reminder', description: 'Direct chat trigger to send client reminders' },
  ],
  services: [
    { id: 'categoryTabs', screenId: 'services', label: 'Service Category Filter Tabs', description: 'Full Groom, Bath & Tidy, Spa Treatments, Add-ons' },
    { id: 'servicesCatalog', screenId: 'services', label: 'Services Menu Catalog', description: 'Core grooming packages, descriptions, and duration badges' },
    { id: 'pricingTable', screenId: 'services', label: 'Breed Size Pricing Matrix', description: 'Small, Medium, Large, Giant tier-based pricing rates' },
    { id: 'addServiceBtn', screenId: 'services', label: 'Add New Service Action', description: 'Button to introduce custom grooming packages or treatments' },
    { id: 'packageAddons', screenId: 'services', label: 'Spa Extras & Add-on Products', description: 'Teeth brushing, deshedding, blueberry facials, paw balm' },
  ],
  staff: [
    { id: 'staffSummaryKpis', screenId: 'staff', label: 'Staff Roster & Performance Overview', description: 'Active stylists, top performer, monthly payroll estimates' },
    { id: 'addStaffBtn', screenId: 'staff', label: 'Onboard New Staff Member Button', description: 'Action button to register groomers and assistants' },
    { id: 'staffRoster', screenId: 'staff', label: 'Stylist Roster & Profiles Cards', description: 'Groomer specialties, working shifts, and contact details' },
    { id: 'commissionCalculator', screenId: 'staff', label: 'Groomer Commission & Payroll Calculator', description: 'Automatic commission calculation based on service revenue' },
    { id: 'skillsCapacity', screenId: 'staff', label: 'Skills & Daily Pet Capacity Manager', description: 'Breed specialties, scissoring mastery, max daily pets' },
  ],
  loyalty: [
    { id: 'loyaltyKpis', screenId: 'loyalty', label: 'VIP Loyalty Program Statistics', description: 'Points in circulation, VIP members, lifetime discount rewards' },
    { id: 'tierStructure', screenId: 'loyalty', label: 'Membership Tier Definitions', description: 'Bronze, Silver, Gold, VIP Platinum threshold configurations' },
    { id: 'pointsRules', screenId: 'loyalty', label: 'Point Accumulation & Redeem Rules', description: 'Points per dollar spent, birthday bonuses, reward rules' },
    { id: 'clientBalances', screenId: 'loyalty', label: 'Client Points Ledger & History', description: 'Client point balances, redemption records, voucher statuses' },
    { id: 'redeemVoucher', screenId: 'loyalty', label: 'Redeem Points & Issue Voucher Action', description: 'Convert points to salon discounts and grooming vouchers' },
  ],
  alerts: [
    { id: 'criticalSummary', screenId: 'alerts', label: 'Critical Compliance Summary Banner', description: 'Total urgent rabies warnings, overdue pets, health holds' },
    { id: 'alertFilterTabs', screenId: 'alerts', label: 'Alert Type Filter Tabs', description: 'Filter by Rabies, Health Conditions, Behavioral Caution' },
    { id: 'alertsList', screenId: 'alerts', label: 'Active Alerts & Pet Directory Table', description: 'Detailed list of pets with expired records or cautions' },
    { id: 'whatsappNotice', screenId: 'alerts', label: 'Send Automated WhatsApp Warning', description: 'Trigger compliance notification directly to owner' },
    { id: 'certificateUpload', screenId: 'alerts', label: 'Renew & Verify Vaccine Certificate', description: 'Update rabies expiration dates with vet certificate logs' },
  ],
  revenue: [
    { id: 'financialKpis', screenId: 'revenue', label: 'Financial Summary KPI Strip', description: 'Gross Revenue, Net Income, Tax Collected, Tips Payouts' },
    { id: 'revenueTrends', screenId: 'revenue', label: 'Interactive Revenue Trend Chart', description: 'Daily, weekly, monthly revenue visualizations' },
    { id: 'serviceBreakdown', screenId: 'revenue', label: 'Service vs Retail Revenue Share', description: 'Percentage breakdown of grooming cuts vs retail sales' },
    { id: 'paymentMethods', screenId: 'revenue', label: 'Payment Channel Distribution', description: 'Credit Card, Cash, QR Pay, Bank Transfer proportions' },
    { id: 'exportCsv', screenId: 'revenue', label: 'Export Financial Audit & Tax CSV', description: 'Download spreadsheet audit reports for bookkeeping' },
  ],
  business: [
    { id: 'retailKpis', screenId: 'business', label: 'Retail Store Inventory Metrics', description: 'Total SKU count, stock valuation, low stock warnings' },
    { id: 'productCatalog', screenId: 'business', label: 'Retail Pet Products Catalog', description: 'Shampoos, brushes, treats, accessories inventory list' },
    { id: 'addProductBtn', screenId: 'business', label: 'Add New Retail Product Action', description: 'Create new inventory items, set barcode/price' },
    { id: 'activityStream', screenId: 'business', label: 'Studio Live Activity & Audit Stream', description: 'Real-time timeline of appointments, payments, and updates' },
  ],
  gallery: [
    { id: 'transformationsGrid', screenId: 'gallery', label: 'Transformations Photo Showcase Grid', description: 'Before & After grooming transformations cards' },
    { id: 'uploadPhotoBtn', screenId: 'gallery', label: 'Upload Transformation Photos Button', description: 'Attach Before/After dog images and tag groomers' },
    { id: 'categoryFilters', screenId: 'gallery', label: 'Breed & Styling Category Filters', description: 'Filter gallery by Doodles, Teddy Bears, Deshedding' },
    { id: 'portfolioShare', screenId: 'gallery', label: 'Social Media Export & Download', description: 'Export transformation photos for Instagram Stories' },
  ],
  settings: [
    { id: 'studioProfile', screenId: 'settings', label: 'Salon Identity & Contact Profile', description: 'Business name, owner, phone, email, address, logo' },
    { id: 'operatingHours', screenId: 'settings', label: 'Salon Business Hours & Slot Sizing', description: 'Opening/closing times, appointment slot duration' },
    { id: 'taxAndCurrency', screenId: 'settings', label: 'Tax Rates, Currency & Pricing Defaults', description: 'Currency symbol, sales tax %, invoice numbering' },
    { id: 'colorThemes', screenId: 'settings', label: 'Studio Color Palette Customizer', description: 'Terracotta, Sage Green, Ocean Teal, Berry, Sunset themes' },
    { id: 'backupExport', screenId: 'settings', label: 'Studio Data Backup & Security', description: 'Export JSON data backup and reset configurations' },
  ],
};

export const FULL_ACCESS_SECTIONS: ScreenSectionPermissions = {
  dashboard: {
    kpiCards: true,
    quickActions: true,
    todaySchedule: true,
    stationOccupancy: true,
    petSummaryTable: true,
    revenueMiniChart: true,
    vaccineAlertsCard: true,
  },
  calendar: {
    viewControls: true,
    addBookingBtn: true,
    calendarGrid: true,
    groomerFilters: true,
    appointmentModal: true,
  },
  invoices: {
    summaryKpis: true,
    searchFilters: true,
    createInvoiceBtn: true,
    invoicesTable: true,
    qrPaymentModal: true,
    pdfExportAction: true,
  },
  clients: {
    metricsBar: true,
    searchFilterBar: true,
    addClientBtn: true,
    clientCardsList: true,
    medicalHistory: true,
    whatsappReminders: true,
  },
  services: {
    categoryTabs: true,
    servicesCatalog: true,
    pricingTable: true,
    addServiceBtn: true,
    packageAddons: true,
  },
  staff: {
    staffSummaryKpis: true,
    addStaffBtn: true,
    staffRoster: true,
    commissionCalculator: true,
    skillsCapacity: true,
  },
  loyalty: {
    loyaltyKpis: true,
    tierStructure: true,
    pointsRules: true,
    clientBalances: true,
    redeemVoucher: true,
  },
  alerts: {
    criticalSummary: true,
    alertFilterTabs: true,
    alertsList: true,
    whatsappNotice: true,
    certificateUpload: true,
  },
  revenue: {
    financialKpis: true,
    revenueTrends: true,
    serviceBreakdown: true,
    paymentMethods: true,
    exportCsv: true,
  },
  business: {
    retailKpis: true,
    productCatalog: true,
    addProductBtn: true,
    activityStream: true,
  },
  gallery: {
    transformationsGrid: true,
    uploadPhotoBtn: true,
    categoryFilters: true,
    portfolioShare: true,
  },
  settings: {
    studioProfile: true,
    operatingHours: true,
    taxAndCurrency: true,
    colorThemes: true,
    backupExport: true,
  },
};

export const DEFAULT_CLIENT_PERMISSIONS: ClientPermissions = {
  isTrialMode: false,
  trialTierName: 'Standard',
  trialMessage: '',
  screens: { ...FULL_ACCESS_SCREENS },
  sections: { ...FULL_ACCESS_SECTIONS },
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
  sections?: ScreenSectionPermissions;
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

// Helper: Check if a specific section of a screen is allowed for a profile
export function isSectionAllowed(
  permissions: ClientPermissions | undefined, 
  screen: ViewMode, 
  sectionKey: string
): boolean {
  if (!permissions) return true;
  // If the whole screen is disabled, its sections are disabled
  if (permissions.screens && permissions.screens[screen] === false) return false;
  if (!permissions.sections || !permissions.sections[screen]) return true; // Default true if unspecified
  const screenSections = permissions.sections[screen] as Record<string, boolean | undefined>;
  return screenSections[sectionKey] !== false;
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
    type: 'spotlight_card',
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
    type: 'modal_takeover',
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
    type: 'ticker',
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
    type: 'drawer',
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
    type: 'floating_badge',
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
    type: 'toast_stack',
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
    type: 'drawer',
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
    type: 'ticker',
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
    type: 'spotlight_card',
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
    type: 'floating_badge',
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
    type: 'modal_takeover',
    priority: 'urgent',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
    title: '⏳ Trial Account Status: 3 Days Remaining',
    message: 'Your 14-day web trial will conclude in 3 days. Upgrade your license today to preserve all your pet records, appointments, groomer rosters, and custom theme settings.',
    actionLabel: 'Upgrade License Plan Now',
    actionUrl: 'https://pawbookpro.com/upgrade',
    actionTarget: '_blank',
  },
  // 16 NEW HIGH-IMPACT READY-MADE TEMPLATES
  {
    id: 'tmpl-16',
    category: 'Alert & Maintenance',
    type: 'sms_text',
    priority: 'urgent',
    title: '📱 [SMS Alert] Unrecognized Device Login Detected',
    message: 'Security Alert: A new login to your Paw Grooming account was detected from an unrecognized device (Safari on iOS). If this was not you, ban this device immediately from your admin console.',
    actionLabel: 'Review Device Sessions',
    actionUrl: 'settings',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-17',
    category: 'Feature Release',
    type: 'whatsapp_msg',
    priority: 'update',
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
    title: '💬 Automated WhatsApp 24-Hr Grooming Reminders',
    message: 'Your clients now automatically receive a branded WhatsApp message 24 hours prior to their grooming slot with 1-click confirmation and directions to your studio.',
    actionLabel: 'Configure WhatsApp Bot',
    actionUrl: 'calendar',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-18',
    category: 'Tips & Guides',
    type: 'email_digest',
    priority: 'info',
    title: '📧 Weekly Studio Performance Digest & Groomer Leaderboard',
    message: 'Your weekly recap is ready: 48 appointments completed, $4,850 in grooming revenue, 98% 5-star satisfaction rating. Stylist of the week: Rachel Adams (18 grooms).',
    actionLabel: 'View Detailed Revenue Breakdown',
    actionUrl: 'revenue',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-19',
    category: 'Alert & Maintenance',
    type: 'system_tray_fcm',
    priority: 'warning',
    imageUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80',
    title: '🔔 6 Overdue Invoices Requiring Follow-Up',
    message: '6 client invoices remain unpaid past the 7-day payment window. Send automated payment links and QR codes to client phones in 1 tap.',
    actionLabel: 'Open Invoices Manager',
    actionUrl: 'invoices',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-20',
    category: 'Promotion',
    type: 'floating_dock',
    priority: 'promotion',
    imageUrl: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&w=800&q=80',
    title: '🌟 Spring Shedding Special: De-Shedding Treatment Campaign',
    message: 'Launch a Spring Fur Shedding blast to your top 100 Golden Retriever and Husky clients. Earn an extra $2,400 in high-margin add-ons this month.',
    actionLabel: 'Launch Client SMS Blast',
    actionUrl: 'clients',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-21',
    category: 'Alert & Maintenance',
    type: 'slack_webhook',
    priority: 'urgent',
    title: '💼 [Slack Roster] Groomer Sick Leave & Auto-Reassignment',
    message: 'Stylist Jordan Vance called in sick for Friday. 7 pet bookings have been flagged for rebooking or assignment to Senior Stylist Maya.',
    actionLabel: 'Reassign Appointments',
    actionUrl: 'calendar',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-22',
    category: 'Milestone',
    type: 'discord_webhook',
    priority: 'update',
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=80',
    title: '🏆 Studio VIP Tier Unlocked: Diamond Salon Badge',
    message: 'Your salon has processed over $50,000 in appointments this quarter. You have unlocked priority 24/7 dedicated support and custom branding themes.',
    actionLabel: 'Explore Custom Themes',
    actionUrl: 'settings',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-23',
    category: 'Feature Release',
    type: 'matrix_teams',
    priority: 'update',
    title: '🏢 Microsoft Teams / Multi-Location Sync Enabled',
    message: 'Manage your secondary salon branch from the same unified dashboard. Seamlessly transfer pet medical files and customer loyalty balances between studios.',
    actionLabel: 'View Salon Locations',
    actionUrl: 'business',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-24',
    category: 'Tips & Guides',
    type: 'telegram_bot',
    priority: 'info',
    title: '🤖 Telegram Daily Grooming Schedule Dispatch',
    message: 'Each morning at 07:30, your groomers can receive their daily dog lineup, coat notes, breed cuts, and special handling instructions right on Telegram.',
    actionLabel: 'Enable Staff Telegram Bot',
    actionUrl: 'staff',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-25',
    category: 'Alert & Maintenance',
    type: 'voice_tts',
    priority: 'urgent',
    title: '🔊 Voice Call & Audio Alert: Emergency Studio Weather Closure',
    message: 'Severe weather alert issued for your area. Notify all today booked clients via automated voice calls and reschedule appointments without penalties.',
    actionLabel: 'Send Studio Closure Alert',
    actionUrl: 'calendar',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-26',
    category: 'Feature Release',
    type: 'inbox_badge_modal',
    priority: 'update',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
    title: '📬 Studio Inbox: Client Photo Transformation Uploads',
    message: 'Clients can now view high-definition Before & After grooming transformation photos on their private invoice link and share them directly to Instagram Stories.',
    actionLabel: 'Open Transformation Gallery',
    actionUrl: 'gallery',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-27',
    category: 'Promotion',
    type: 'spotlight_card',
    priority: 'promotion',
    imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80',
    title: '🎁 Paws VIP Loyalty: Double Points Weekend Campaign',
    message: 'Activate double points weekend on all full grooming packages to fill Monday and Tuesday morning slots. Boost off-peak occupancy by 45%.',
    actionLabel: 'Activate Loyalty Promotion',
    actionUrl: 'loyalty',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-28',
    category: 'Alert & Maintenance',
    type: 'ticker',
    priority: 'warning',
    title: '⚠️ 12 Pet Rabies Certificates Expiring Next Week',
    message: 'Automated compliance reminder: 12 registered dogs require updated rabies vaccination records before their next scheduled bath or haircut.',
    actionLabel: 'Review Medical Alerts',
    actionUrl: 'alerts',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-29',
    category: 'Tips & Guides',
    type: 'drawer',
    priority: 'info',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
    title: '💡 Smart Pricing Guide: Doodles & Double Coats',
    message: 'Matting fees and blow-dry surcharge guidelines based on real data from 500+ top-earning salons. Download our free pricing worksheet.',
    actionLabel: 'Update Grooming Services',
    actionUrl: 'services',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-30',
    category: 'Milestone',
    type: 'toast_stack',
    priority: 'update',
    title: '🎉 100% 5-Star Google Review Streak Reached!',
    message: 'Your salon has earned 25 consecutive 5-star reviews this month. Your studio profile is now featured at the top of local pet searches.',
    actionLabel: 'View Client CRM',
    actionUrl: 'clients',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-31',
    category: 'Alert & Maintenance',
    type: 'banner',
    priority: 'urgent',
    title: '🔒 Single-Device Security Mode Activated for Your Profile',
    message: 'Your account is configured for strict single-device access. Any new login on a separate browser or mobile will safely terminate prior active sessions.',
    actionLabel: 'Security Settings',
    actionUrl: 'settings',
    actionTarget: '_self',
  }
];
