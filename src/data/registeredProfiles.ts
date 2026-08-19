import { ClientProfile } from '../types/auth';

/**
 * PAW GROOMING — MASTER CLIENT PROFILES REPOSITORY
 * Code-level persistent registry containing all client profiles.
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
      colorTheme: 'emerald'
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
  },
  {
    profileId: 'PG004',
    businessName: 'Velvet Paws Spa',
    ownerName: 'Jessica Reynolds',
    email: 'jessica@velvetpaws.com',
    password: 'password123',
    phoneNumber: '+1 (555) 567-8901',
    plan: 'Premium',
    createdAt: '2026-02-15',
    expiryDate: '2027-02-15',
    status: 'active',
    customSettings: {
      salonName: 'Velvet Paws Spa',
      name: 'Velvet Paws Salon',
      email: 'jessica@velvetpaws.com',
      phone: '(555) 567-8901',
      address: '502 Sunset Blvd, Los Angeles, CA 90028',
      website: 'www.velvetpawsspa.com',
      colorTheme: 'lavender'
    }
  },
  {
    profileId: 'PG005',
    businessName: 'Royal Canine Grooming',
    ownerName: 'David Sterling',
    email: 'david@royalcanine.com',
    password: 'password123',
    phoneNumber: '+1 (555) 678-9012',
    plan: 'Enterprise',
    createdAt: '2026-03-01',
    expiryDate: '2027-03-01',
    status: 'active',
    customSettings: {
      salonName: 'Royal Canine Grooming Club',
      name: 'Royal Canine Club',
      email: 'david@royalcanine.com',
      phone: '(555) 678-9012',
      address: '120 Madison Ave, New York, NY 10016',
      website: 'www.royalcaninegroom.com',
      colorTheme: 'emerald'
    }
  },
  {
    profileId: 'PG006',
    businessName: 'Bark & Bubbles Boutique',
    ownerName: 'Olivia Martinez',
    email: 'olivia@barkbubbles.com',
    password: 'password123',
    phoneNumber: '+1 (555) 789-0123',
    plan: 'Starter',
    createdAt: '2026-03-10',
    expiryDate: '2027-03-10',
    status: 'active',
    customSettings: {
      salonName: 'Bark & Bubbles Boutique',
      name: 'Bark & Bubbles Studio',
      email: 'olivia@barkbubbles.com',
      phone: '(555) 789-0123',
      address: '742 Evergreen Terrace, Seattle, WA 98101',
      website: 'www.barkbubblesboutique.com',
      colorTheme: 'bubblegum'
    }
  },
  {
    profileId: 'PG007',
    businessName: 'The Furry Tail Lounge',
    ownerName: 'Alexander Hayes',
    email: 'alex@furrytaillounge.com',
    password: 'password123',
    phoneNumber: '+1 (555) 890-1234',
    plan: 'Premium',
    createdAt: '2026-04-05',
    expiryDate: '2027-04-05',
    status: 'active',
    customSettings: {
      salonName: 'The Furry Tail Lounge',
      name: 'Furry Tail Studio',
      email: 'alex@furrytaillounge.com',
      phone: '(555) 890-1234',
      address: '88 Lincoln Park W, Chicago, IL 60614',
      website: 'www.furrytaillounge.com',
      colorTheme: 'blueberry'
    }
  },
  {
    profileId: 'PG008',
    businessName: 'Golden Paws Wellness & Spa',
    ownerName: 'Sophia Chang',
    email: 'sophia@goldenpawsspa.com',
    password: 'password123',
    phoneNumber: '+1 (555) 901-2345',
    plan: 'Enterprise',
    createdAt: '2026-04-18',
    expiryDate: '2027-04-18',
    status: 'active',
    customSettings: {
      salonName: 'Golden Paws Wellness & Spa',
      name: 'Golden Paws Pro',
      email: 'sophia@goldenpawsspa.com',
      phone: '(555) 901-2345',
      address: '2150 Colorado Blvd, Denver, CO 80205',
      website: 'www.goldenpawsspa.com',
      colorTheme: 'amber'
    }
  },
  {
    profileId: 'PG009',
    businessName: 'Posh Pooch Parlor',
    ownerName: 'Marcus Bennett',
    email: 'marcus@poshpooch.com',
    password: 'password123',
    phoneNumber: '+1 (555) 012-3456',
    plan: 'Starter',
    createdAt: '2026-05-02',
    expiryDate: '2027-05-02',
    status: 'active',
    customSettings: {
      salonName: 'Posh Pooch Parlor',
      name: 'Posh Pooch Care',
      email: 'marcus@poshpooch.com',
      phone: '(555) 012-3456',
      address: '304 Biscayne Blvd, Miami, FL 33132',
      website: 'www.poshpoochparlor.com',
      colorTheme: 'terracotta'
    }
  },
  {
    profileId: 'PG010',
    businessName: 'Tail Waggers Grooming Bar',
    ownerName: 'Chloe Dupont',
    email: 'chloe@tailwaggersbar.com',
    password: 'password123',
    phoneNumber: '+1 (555) 123-7890',
    plan: 'Premium',
    createdAt: '2026-05-20',
    expiryDate: '2027-05-20',
    status: 'active',
    customSettings: {
      salonName: 'Tail Waggers Grooming Bar',
      name: 'Tail Waggers Bar',
      email: 'chloe@tailwaggersbar.com',
      phone: '(555) 123-7890',
      address: '910 Newbury St, Boston, MA 02115',
      website: 'www.tailwaggersbar.com',
      colorTheme: 'mint'
    }
  },
  {
    profileId: 'PG011',
    businessName: 'Whisker & Woof Studio',
    ownerName: 'Ethan Walker',
    email: 'ethan@whiskerwoof.com',
    password: 'password123',
    phoneNumber: '+1 (555) 234-8901',
    plan: 'Starter',
    createdAt: '2026-06-01',
    expiryDate: '2027-06-01',
    status: 'active',
    customSettings: {
      salonName: 'Whisker & Woof Studio',
      name: 'Whisker & Woof',
      email: 'ethan@whiskerwoof.com',
      phone: '(555) 234-8901',
      address: '412 Peachtree St, Atlanta, GA 30308',
      website: 'www.whiskerwoofstudio.com',
      colorTheme: 'blueberry'
    }
  },
  {
    profileId: 'PG012',
    businessName: 'Luxe Hound Grooming Co.',
    ownerName: 'Rachel Adams',
    email: 'rachel@luxehound.com',
    password: 'password123',
    phoneNumber: '+1 (555) 345-9012',
    plan: 'Enterprise',
    createdAt: '2026-06-15',
    expiryDate: '2027-06-15',
    status: 'active',
    customSettings: {
      salonName: 'Luxe Hound Grooming Co.',
      name: 'Luxe Hound Co.',
      email: 'rachel@luxehound.com',
      phone: '(555) 345-9012',
      address: '1550 5th Ave, San Diego, CA 92101',
      website: 'www.luxehoundco.com',
      colorTheme: 'emerald'
    }
  },
  {
    profileId: 'PG013',
    businessName: 'Cozy Canine Care',
    ownerName: 'Daniel Kim',
    email: 'daniel@cozycanine.com',
    password: 'password123',
    phoneNumber: '+1 (555) 456-0123',
    plan: 'Premium',
    createdAt: '2026-07-01',
    expiryDate: '2027-07-01',
    status: 'active',
    customSettings: {
      salonName: 'Cozy Canine Care Sanctuary',
      name: 'Cozy Canine Spa',
      email: 'daniel@cozycanine.com',
      phone: '(555) 456-0123',
      address: '620 South Congress Ave, Austin, TX 78704',
      website: 'www.cozycaninecare.com',
      colorTheme: 'terracotta'
    }
  }
];
