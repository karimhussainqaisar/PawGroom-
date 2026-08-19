import { ClientProfile } from '../types/auth';

/**
 * PARK GROOMING — MASTER CLIENT PROFILES REPOSITORY
 * This file serves as the code-level fallback and sync registry for client profiles.
 * Any profile created or updated is persisted to the server database and synced here.
 */
export const DEFAULT_REGISTERED_PROFILES: ClientProfile[] = [
  {
    profileId: 'PG001',
    businessName: 'Happy Paws Grooming',
    ownerName: 'Sarah Jenkins',
    email: 'happy@email.com',
    password: 'password123',
    phoneNumber: '+1 (555) 234-5678',
    plan: 'Premium',
    createdAt: '2026-01-10',
    expiryDate: '2027-01-01',
    status: 'active',
    customSettings: {
      salonName: 'Happy Paws Grooming Studio',
      name: 'Happy Paws Pro Care',
      email: 'contact@happypawsgroom.com',
      phone: '(555) 234-5678',
      address: '142 Market St, Suite 2B, San Francisco, CA 94105',
      website: 'www.happypawsgroom.com',
      colorTheme: 'terracotta'
    }
  },
  {
    profileId: 'PG002',
    businessName: 'Luxury Pets Care',
    ownerName: 'Michael Vance',
    email: 'luxury@email.com',
    password: 'password123',
    phoneNumber: '+1 (555) 345-6789',
    plan: 'Enterprise',
    createdAt: '2026-02-01',
    expiryDate: '2027-02-01',
    status: 'active',
    customSettings: {
      salonName: 'Luxury Pets Care & Spa',
      name: 'Luxury Pets Haute Salon',
      email: 'vip@luxurypetscare.com',
      phone: '(555) 345-6789',
      address: '880 Ocean Blvd, Penthouse Suite, Santa Monica, CA 90401',
      website: 'www.luxurypetscare.com',
      colorTheme: 'emerald'
    }
  },
  {
    profileId: 'PG003',
    businessName: 'Pawfect Bark Studio',
    ownerName: 'Emily Davis',
    email: 'pawfect@email.com',
    password: 'password123',
    phoneNumber: '+1 (555) 456-7890',
    plan: 'Starter',
    createdAt: '2025-11-15',
    expiryDate: '2026-03-01',
    status: 'inactive',
    customSettings: {
      salonName: 'Pawfect Bark Studio',
      name: 'Pawfect Bark Spa',
      email: 'hello@pawfectbark.com',
      phone: '(555) 456-7890',
      address: '320 Pine Valley Rd, Austin, TX 78701',
      website: 'www.pawfectbark.com',
      colorTheme: 'blueberry'
    }
  }
];
