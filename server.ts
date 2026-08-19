import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Enable CORS and JSON parsing
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Persistent database file paths on server and in public directory
const DATA_DIR = path.join(process.cwd(), 'data');
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const DB_FILE = path.join(DATA_DIR, 'auth_db.json');
const PUBLIC_DB_FILE = path.join(PUBLIC_DIR, 'auth_db.json');

// Default initial database configuration
const DEFAULT_AUTH_DB = {
  admin: {
    id: 'adm_01',
    name: 'Paw SuperAdmin',
    email: 'admin@parkgrooming.com',
    password: 'admin123',
    role: 'super_admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    lastLogin: '2026-08-19'
  },
  profiles: [
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
  ],
  version: '1.4.0',
  lastUpdated: new Date().toISOString()
};

// Ensure directories exist
[DATA_DIR, PUBLIC_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (e) {
      console.error(`Failed to create directory ${dir}:`, e);
    }
  }
});

// Helper: Read DB from disk
function readServerAuthDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.profiles)) {
        return parsed;
      }
    } else if (fs.existsSync(PUBLIC_DB_FILE)) {
      const content = fs.readFileSync(PUBLIC_DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.profiles)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read auth_db.json, using default:', err);
  }
  // Initialize files
  writeServerAuthDb(DEFAULT_AUTH_DB);
  return DEFAULT_AUTH_DB;
}

// Helper: Write DB to disk and public folder for direct universal access
function writeServerAuthDb(data: any) {
  const jsonStr = JSON.stringify(data, null, 2);
  try {
    fs.writeFileSync(DB_FILE, jsonStr, 'utf-8');
  } catch (err) {
    console.error('Failed to write data/auth_db.json:', err);
  }
  try {
    fs.writeFileSync(PUBLIC_DB_FILE, jsonStr, 'utf-8');
  } catch (err) {
    console.error('Failed to write public/auth_db.json:', err);
  }
}

// In-memory reference initialized from disk
let currentDb = readServerAuthDb();

// -------------------------------------------------------------
// REST API ROUTES FOR WORLDWIDE GLOBAL CROSS-DEVICE AUTH
// -------------------------------------------------------------

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// 2. Fetch full global Auth Database
app.get('/api/auth/db', (req, res) => {
  res.json(currentDb);
});

// 3. Client login verification
app.post('/api/auth/client-login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanPass = String(password).trim();

  const matched = currentDb.profiles.find(
    (p: any) => p.email.toLowerCase() === cleanEmail && p.password === cleanPass
  );

  if (!matched) {
    return res.status(401).json({
      success: false,
      status: 'invalid',
      error: 'Invalid email or password.'
    });
  }

  if (matched.status === 'inactive') {
    return res.status(403).json({
      success: false,
      status: 'inactive',
      error: 'Your account is currently inactive. Please contact support.',
      profile: matched
    });
  }

  res.json({
    success: true,
    status: 'active',
    profile: matched,
    token: `token_${matched.profileId}_${Date.now()}`
  });
});

// 4. Admin login verification
app.post('/api/auth/admin-login', (req, res) => {
  const { email, password } = req.body || {};
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPass = String(password || '').trim();

  if (
    cleanEmail === currentDb.admin.email.toLowerCase() &&
    cleanPass === currentDb.admin.password
  ) {
    return res.json({
      success: true,
      admin: currentDb.admin,
      token: `admin_token_${Date.now()}`
    });
  }

  res.status(401).json({
    success: false,
    error: 'Invalid admin credentials. Please verify your email and password.'
  });
});

// 5. Create new client profile (accessible from any device in the world)
app.post('/api/auth/profiles', (req, res) => {
  try {
    const newProfileData = req.body;
    if (!newProfileData || !newProfileData.businessName || !newProfileData.email || !newProfileData.password) {
      return res.status(400).json({ error: 'Missing required profile fields.' });
    }

    // Generate next Profile ID if not provided
    let profileId = newProfileData.profileId;
    if (!profileId) {
      const existingNums = currentDb.profiles
        .map((p: any) => {
          const match = p.profileId.match(/^PG(\d+)$/i);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((n: number) => !isNaN(n));
      const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
      profileId = `PG${String(maxNum + 1).padStart(3, '0')}`;
    }

    const today = new Date().toISOString().split('T')[0];
    const newProfile = {
      ...newProfileData,
      profileId,
      createdAt: newProfileData.createdAt || today,
      status: newProfileData.status || 'active',
      plan: newProfileData.plan || 'Premium',
      customSettings: newProfileData.customSettings || {
        salonName: newProfileData.businessName,
        name: `${newProfileData.businessName} Studio`,
        email: newProfileData.email,
        phone: newProfileData.phoneNumber || '(555) 000-0000',
        colorTheme: 'terracotta'
      }
    };

    // Prepend new profile
    currentDb = {
      ...currentDb,
      profiles: [newProfile, ...currentDb.profiles.filter((p: any) => p.profileId !== profileId)],
      lastUpdated: new Date().toISOString()
    };

    writeServerAuthDb(currentDb);
    res.status(201).json({ success: true, profile: newProfile, database: currentDb });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to create profile on server.' });
  }
});

// 6. Update existing client profile
app.put('/api/auth/profiles/:profileId', (req, res) => {
  const { profileId } = req.params;
  const updates = req.body;

  let found = false;
  currentDb = {
    ...currentDb,
    profiles: currentDb.profiles.map((p: any) => {
      if (p.profileId === profileId) {
        found = true;
        const updated = { ...p, ...updates };
        if (updates.businessName && updated.customSettings) {
          updated.customSettings.salonName = updates.businessName;
        }
        return updated;
      }
      return p;
    }),
    lastUpdated: new Date().toISOString()
  };

  if (!found) {
    return res.status(404).json({ error: `Profile ${profileId} not found.` });
  }

  writeServerAuthDb(currentDb);
  res.json({ success: true, database: currentDb });
});

// 7. Toggle Profile status (active/inactive)
app.patch('/api/auth/profiles/:profileId/toggle-status', (req, res) => {
  const { profileId } = req.params;
  let nextStatus = 'active';

  let found = false;
  currentDb = {
    ...currentDb,
    profiles: currentDb.profiles.map((p: any) => {
      if (p.profileId === profileId) {
        found = true;
        nextStatus = p.status === 'active' ? 'inactive' : 'active';
        return { ...p, status: nextStatus };
      }
      return p;
    }),
    lastUpdated: new Date().toISOString()
  };

  if (!found) {
    return res.status(404).json({ error: `Profile ${profileId} not found.` });
  }

  writeServerAuthDb(currentDb);
  res.json({ success: true, newStatus: nextStatus, database: currentDb });
});

// 8. Delete Profile
app.delete('/api/auth/profiles/:profileId', (req, res) => {
  const { profileId } = req.params;
  currentDb = {
    ...currentDb,
    profiles: currentDb.profiles.filter((p: any) => p.profileId !== profileId),
    lastUpdated: new Date().toISOString()
  };

  writeServerAuthDb(currentDb);
  res.json({ success: true, database: currentDb });
});

// 9. Reset database
app.post('/api/auth/reset', (req, res) => {
  currentDb = {
    ...DEFAULT_AUTH_DB,
    lastUpdated: new Date().toISOString()
  };
  writeServerAuthDb(currentDb);
  res.json({ success: true, database: currentDb });
});

// -------------------------------------------------------------
// VITE MIDDLEWARE & STATIC ASSET SERVING
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Paw Grooming Server running globally on port ${PORT}`);
  });
}

startServer();
