export type SubscriptionPlan = 'Starter' | 'Pro' | 'Premium' | 'Enterprise';
export type AccountStatus = 'active' | 'inactive';

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
  customSettings?: {
    salonName?: string;
    name?: string;
    phone?: string;
    address?: string;
    email?: string;
    website?: string;
    colorTheme?: string;
    logoUrl?: string;
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

export type NotificationType = 'popup' | 'banner' | 'push' | 'message';
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
  actionLabel?: string;
  actionUrl?: string;
  createdAt: string; // ISO string
  expiresAt?: string;
  createdBy: string;
  readBy: string[]; // profileIds that have read this
  dismissedBy: string[]; // profileIds that have dismissed the popup
  isActive: boolean;
}

